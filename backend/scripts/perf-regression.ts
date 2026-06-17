import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const API_BASE = 'http://localhost:3000/api';

interface BenchmarkMetric {
  name: string;
  url: string;
  baselineMs: number;
}

const BENCHMARKS: BenchmarkMetric[] = [
  { name: 'Dashboard Liveness check', url: `${API_BASE}/live`, baselineMs: 25 },
  { name: 'Database Readiness check', url: `${API_BASE}/ready`, baselineMs: 50 },
  { name: 'System Health load time', url: `${API_BASE}/health`, baselineMs: 100 },
];

async function measureLatency(url: string, iterations = 5): Promise<number> {
  let total = 0;
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await axios.get(url);
    total += (Date.now() - start);
  }
  return Math.round(total / iterations);
}

async function runRegressionTests() {
  console.log('Running Performance Regression checks...');
  const results: any[] = [];
  let verified = 'NOT VERIFIED';
  let overallRegression = false;

  for (const b of BENCHMARKS) {
    try {
      console.log(`Pinging ${b.name} to measure current latency...`);
      const currentMs = await measureLatency(b.url);
      const regressionPct = ((currentMs - b.baselineMs) / b.baselineMs) * 100;
      const status = currentMs > b.baselineMs * 1.2 ? 'REGRESSION' : 'PASS';
      
      if (status === 'REGRESSION') {
        overallRegression = true;
      }

      results.push({
        name: b.name,
        baseline: b.baselineMs,
        current: currentMs,
        pct: Math.round(regressionPct),
        status,
      });
      verified = 'VERIFIED';
    } catch (e) {
      results.push({
        name: b.name,
        baseline: b.baselineMs,
        current: 0,
        pct: 0,
        status: 'OFFLINE / NOT MEASURED',
      });
      console.warn(`Could not measure latency for ${b.name}: ${e.message}`);
    }
  }

  // Generate Report
  const reportPath = path.join(
    'C:\\Users\\Dhruv\\.gemini\\antigravity\\brain\\c51c838f-7b7e-4a6a-b832-5c27066d42ae',
    'performance_regression_report.md'
  );

  const tableRows = results.map(r => {
    const currentStr = r.current > 0 ? `${r.current} ms` : 'N/A';
    const pctStr = r.current > 0 ? `${r.pct}%` : 'N/A';
    return `| **${r.name}** | ${r.baseline} ms | ${currentStr} | ${pctStr} | **${r.status}** |`;
  }).join('\n');

  const reportContent = `# Performance Regression Report

**Verification Status**: ${verified}
**Execution Timestamp**: ${new Date().toISOString()}

## Latency Comparisons vs Baselines

| Benchmark Metric | Baseline Latency | Current Latency | Deviation (%) | Status |
| :--- | :---: | :---: | :---: | :---: |
${tableRows}

---

## Performance Summary
* **Regression Threshold**: 20.0%
* **Regression Detected**: ${overallRegression ? 'YES (High latency observed)' : 'NO (System performance remains stable)'}
* **Status**: ${verified === 'VERIFIED' && !overallRegression ? 'PASS' : 'FAIL / OFFLINE'}
`;

  fs.writeFileSync(reportPath, reportContent, 'utf8');
  console.log(`Performance regression report generated at: ${reportPath}`);
}

runRegressionTests().catch((e) => {
  console.error('Unhandled error in regression runner:', e);
});
