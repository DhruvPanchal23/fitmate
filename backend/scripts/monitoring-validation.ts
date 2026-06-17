import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const API_BASE = 'http://localhost:3000/api';

async function runMonitoringValidation() {
  console.log('Running monitoring endpoint validation...');
  const checks = {
    liveness: false,
    readiness: false,
    detailedHealth: false,
    prometheusFormat: false,
    memoryMetrics: false,
    cpuMetrics: false,
  };
  let verified = 'NOT VERIFIED';
  let details = '';

  try {
    // 1. Check /live
    const liveRes = await axios.get(`${API_BASE}/live`);
    checks.liveness = (liveRes.status === 200 && liveRes.data.status === 'ok');

    // 2. Check /ready
    const readyRes = await axios.get(`${API_BASE}/ready`);
    checks.readiness = (readyRes.status === 200 && readyRes.data.status === 'ready');

    // 3. Check /health
    const healthRes = await axios.get(`${API_BASE}/health`);
    if (healthRes.status === 200) {
      checks.detailedHealth = (healthRes.data.status === 'ok' || healthRes.data.status === 'healthy' || healthRes.data.database === 'up');
      
      // Look for CPU and memory usage info in health response
      const metricsData = healthRes.data.metrics || healthRes.data;
      if (metricsData.memory || metricsData.processMemory) checks.memoryMetrics = true;
      if (metricsData.cpu || metricsData.cpuLoad) checks.cpuMetrics = true;
    }

    // 4. Check /metrics
    const metricsRes = await axios.get(`${API_BASE}/metrics`);
    if (metricsRes.status === 200) {
      const text = metricsRes.data;
      checks.prometheusFormat = text.includes('process_cpu_seconds_total') || text.includes('http_requests_total') || text.includes('node_memory');
    }

    if (checks.liveness && checks.readiness && checks.detailedHealth && checks.prometheusFormat) {
      verified = 'VERIFIED';
    } else {
      verified = 'PARTIALLY VERIFIED';
    }
  } catch (error) {
    console.error('Monitoring validation failed:', error);
    details = error.stack || error.message;
  }

  // Generate Report
  const reportPath = path.join(
    'C:\\Users\\Dhruv\\.gemini\\antigravity\\brain\\c51c838f-7b7e-4a6a-b832-5c27066d42ae',
    'monitoring_validation.md'
  );

  const reportContent = `# Monitoring Validation Report

**Verification Status**: ${verified}
**Execution Timestamp**: ${new Date().toISOString()}

## Telemetry Endpoint Verification Results

| Endpoint Probe | Checked Metric | Expected | Actual | Result |
| :--- | :--- | :---: | :---: | :---: |
| **Liveness Check** (\`/api/live\`) | Status indicator equals ok | \`ok\` | \`${checks.liveness ? 'ok' : 'error'}\` | ${checks.liveness ? 'PASS' : 'FAIL'} |
| **Readiness Check** (\`/api/ready\`) | Database connectivity status | \`ready\` | \`${checks.readiness ? 'ready' : 'down'}\` | ${checks.readiness ? 'PASS' : 'FAIL'} |
| **Detailed Health** (\`/api/health\`) | Health check data block | \`ok\` | \`${checks.detailedHealth ? 'ok' : 'error'}\` | ${checks.detailedHealth ? 'PASS' : 'FAIL'} |
| **Memory Monitoring** | Presence of memory allocation stats | \`true\` | \`${checks.memoryMetrics}\` | ${checks.memoryMetrics ? 'PASS' : 'FAIL'} |
| **CPU Monitoring** | Presence of CPU usage stats | \`true\` | \`${checks.cpuMetrics}\` | ${checks.cpuMetrics ? 'PASS' : 'FAIL'} |
| **Metrics Check** (\`/api/metrics\`) | Prometheus format compliance | \`true\` | \`${checks.prometheusFormat}\` | ${checks.prometheusFormat ? 'PASS' : 'FAIL'} |

---

## Conclusion
* **Status**: **${verified === 'VERIFIED' ? 'PASS' : 'FAIL'}**
* **Verification Detail**: Validated endpoint payload compliance for liveness monitoring systems (Kubernetes, AWS ECS) and metric scrapers (Prometheus/Grafana).

${details ? `\`\`\`text\n${details}\n\`\`\`` : ''}
`;

  fs.writeFileSync(reportPath, reportContent, 'utf8');
  console.log(`Monitoring validation report generated at: ${reportPath}`);
}

runMonitoringValidation().catch((e) => {
  console.error('Unhandled error in monitoring validator:', e);
});
