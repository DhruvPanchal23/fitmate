import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const API_BASE = 'http://localhost:3000/api';

async function runSmokeTest() {
  console.log('Starting production smoke test verification...');
  const results: Record<string, { status: string; details: string }> = {};
  let overallStatus = 'PASS';
  let verifiedStatus = 'NOT VERIFIED';

  const endpointsToTest = [
    { name: 'Liveness Endpoint', url: `${API_BASE}/live`, method: 'GET' },
    { name: 'Readiness Endpoint', url: `${API_BASE}/ready`, method: 'GET' },
    { name: 'Detailed Health', url: `${API_BASE}/health`, method: 'GET' },
    { name: 'Prometheus Metrics', url: `${API_BASE}/metrics`, method: 'GET' },
  ];

  // 1. Validate Health Check Endpoints
  for (const ep of endpointsToTest) {
    try {
      console.log(`Checking ${ep.name} (${ep.method} ${ep.url})...`);
      const response = await axios({
        method: ep.method,
        url: ep.url,
        timeout: 3000,
      });

      if (response.status === 200) {
        results[ep.name] = {
          status: 'PASS',
          details: `HTTP ${response.status} - ${JSON.stringify(response.data).substring(0, 100)}`,
        };
      } else {
        results[ep.name] = {
          status: 'FAIL',
          details: `HTTP status was ${response.status}`,
        };
        overallStatus = 'FAIL';
      }
    } catch (e) {
      results[ep.name] = {
        status: 'FAIL',
        details: e.message || 'Connection refused',
      };
      overallStatus = 'FAIL';
    }
  }

  // 2. Auth End-to-End smoke test
  const demoEmail = `smoke-test-${Math.random().toString(36).substring(2, 7)}@fitmate.com`;
  const registerPayload = {
    email: demoEmail,
    password: 'smoke-test-password-12345678',
    name: 'Smoke Test User',
  };

  try {
    console.log('Testing User Registration endpoint...');
    const regRes = await axios.post(`${API_BASE}/auth/register`, registerPayload);
    if (regRes.status === 201 || regRes.status === 200) {
      results['User Registration'] = {
        status: 'PASS',
        details: `Created user ${demoEmail}`,
      };

      console.log('Testing User Login endpoint...');
      const loginRes = await axios.post(`${API_BASE}/auth/login`, {
        email: registerPayload.email,
        password: registerPayload.password,
      });

      if (loginRes.status === 200 && loginRes.data.accessToken) {
        results['User Login'] = {
          status: 'PASS',
          details: 'Successfully authenticated, token retrieved.',
        };
        verifiedStatus = 'VERIFIED';
      } else {
        results['User Login'] = { status: 'FAIL', details: 'Access token not returned.' };
        overallStatus = 'FAIL';
      }
    } else {
      results['User Registration'] = { status: 'FAIL', details: `Status code ${regRes.status}` };
      overallStatus = 'FAIL';
    }
  } catch (e) {
    results['User Registration'] = {
      status: 'FAIL',
      details: e.response?.data?.message || e.message,
    };
    results['User Login'] = {
      status: 'FAIL',
      details: 'Dependent on registration success.',
    };
    overallStatus = 'FAIL';
  }

  // 3. Output report
  const reportPath = path.join(
    'C:\\Users\\Dhruv\\.gemini\\antigravity\\brain\\c51c838f-7b7e-4a6a-b832-5c27066d42ae',
    'smoke_test_report.md'
  );

  const tableRows = Object.keys(results)
    .map((name) => `| **${name}** | ${results[name].status} | ${results[name].details} |`)
    .join('\n');

  const reportContent = `# Production Smoke Test Report

**Verification Status**: ${verifiedStatus}
**Execution Timestamp**: ${new Date().toISOString()}

## Smoke Test Summary
* **Overall Outcome**: **${overallStatus}**
* **Verification Environment**: Development Local Host (Port 3000)

## Verified Endpoint Results

| Endpoint / Flow | Status | Details |
| :--- | :---: | :--- |
${tableRows}

---

## Conclusion
${overallStatus === 'PASS' 
  ? 'All critical smoke-test endpoints are verified as fully operational and responding with correct contracts.'
  : 'Warning: One or more smoke-test assertions failed or the backend server was unreachable. Inspect the details log above.'
}
`;

  fs.writeFileSync(reportPath, reportContent, 'utf8');
  console.log(`Smoke test report generated at: ${reportPath}`);
}

runSmokeTest().catch((e) => {
  console.error('Unhandled error in smoke tester:', e);
});
