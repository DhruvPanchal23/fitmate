import { Injectable } from '@nestjs/common';
import * as os from 'os';

@Injectable()
export class MetricsEngineService {
  private totalRequests = 0;
  private totalErrors = 0;
  private latencies: number[] = [];
  private dbQueriesCount = 0;
  private cacheHits = 0;
  private cacheMisses = 0;

  // AI metrics
  private aiInvocations = 0;
  private aiLatencies: number[] = [];
  private aiTotalCost = 0.0;
  private providerShare: Record<string, number> = {};

  trackRequest(latencyMs: number, isError = false) {
    this.totalRequests++;
    if (isError) this.totalErrors++;
    
    this.latencies.push(latencyMs);
    // Limit array to last 1000 items to prevent memory leak
    if (this.latencies.length > 1000) {
      this.latencies.shift();
    }
  }

  trackDbQuery() {
    this.dbQueriesCount++;
  }

  trackCache(hit: boolean) {
    if (hit) this.cacheHits++;
    else this.cacheMisses++;
  }

  trackAiCall(provider: string, latencyMs: number, cost: number) {
    this.aiInvocations++;
    this.aiTotalCost += cost;
    this.aiLatencies.push(latencyMs);
    if (this.aiLatencies.length > 500) {
      this.aiLatencies.shift();
    }
    
    const prov = provider.toLowerCase();
    this.providerShare[prov] = (this.providerShare[prov] || 0) + 1;
  }

  getMetricsSummary() {
    const sorted = [...this.latencies].sort((a, b) => a - b);
    const avgLatency = sorted.length > 0 ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0.0;
    const p95Latency = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] : 0.0;

    const cacheTotal = this.cacheHits + this.cacheMisses;
    const cacheHitRatio = cacheTotal > 0 ? this.cacheHits / cacheTotal : 1.0;

    const sortedAi = [...this.aiLatencies].sort((a, b) => a - b);
    const avgAiLatency = sortedAi.length > 0 ? sortedAi.reduce((a, b) => a + b, 0) / sortedAi.length : 0.0;

    return {
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      avgLatency,
      p95Latency,
      dbQueriesCount: this.dbQueriesCount,
      cacheHitRatio,
      aiInvocations: this.aiInvocations,
      avgAiLatency,
      aiTotalCost: this.aiTotalCost,
      providerShare: this.providerShare,
    };
  }

  getPrometheusFormat(): string {
    const summary = this.getMetricsSummary();
    const mem = process.memoryUsage();
    const cpus = os.cpus();
    const cpuUsage = os.loadavg()[0];

    const lines = [
      '# HELP fitmate_http_requests_total Total number of HTTP requests processed.',
      `# TYPE fitmate_http_requests_total counter`,
      `fitmate_http_requests_total ${summary.totalRequests}`,
      '',
      '# HELP fitmate_http_errors_total Total number of failed HTTP requests.',
      `# TYPE fitmate_http_errors_total counter`,
      `fitmate_http_errors_total ${summary.totalErrors}`,
      '',
      '# HELP fitmate_http_latency_average_ms Average HTTP request latency in milliseconds.',
      `# TYPE fitmate_http_latency_average_ms gauge`,
      `fitmate_http_latency_average_ms ${summary.avgLatency.toFixed(2)}`,
      '',
      '# HELP fitmate_http_latency_p95_ms 95th percentile HTTP request latency in milliseconds.',
      `# TYPE fitmate_http_latency_p95_ms gauge`,
      `fitmate_http_latency_p95_ms ${summary.p95Latency.toFixed(2)}`,
      '',
      '# HELP fitmate_db_queries_total Total number of database queries executed.',
      `# TYPE fitmate_db_queries_total counter`,
      `fitmate_db_queries_total ${summary.dbQueriesCount}`,
      '',
      '# HELP fitmate_cache_hit_ratio Percentage of successful prompt cache lookups.',
      `# TYPE fitmate_cache_hit_ratio gauge`,
      `fitmate_cache_hit_ratio ${summary.cacheHitRatio.toFixed(4)}`,
      '',
      '# HELP fitmate_ai_invocations_total Total number of LLM API requests generated.',
      `# TYPE fitmate_ai_invocations_total counter`,
      `fitmate_ai_invocations_total ${summary.aiInvocations}`,
      '',
      '# HELP fitmate_ai_cost_total Estimated LLM usage cost in USD.',
      `# TYPE fitmate_ai_cost_total counter`,
      `fitmate_ai_cost_total ${summary.aiTotalCost.toFixed(6)}`,
      '',
      '# HELP fitmate_process_memory_bytes Memory usage of the Node.js process.',
      `# TYPE fitmate_process_memory_bytes gauge`,
      `fitmate_process_memory_bytes{type="rss"} ${mem.rss}`,
      `fitmate_process_memory_bytes{type="heapTotal"} ${mem.heapTotal}`,
      `fitmate_process_memory_bytes{type="heapUsed"} ${mem.heapUsed}`,
      '',
      '# HELP fitmate_system_cpu_load System CPU load average (1m).',
      `# TYPE fitmate_system_cpu_load gauge`,
      `fitmate_system_cpu_load ${cpuUsage.toFixed(2)}`
    ];

    // Append provider breakdown
    for (const [provider, count] of Object.entries(summary.providerShare)) {
      lines.push(`fitmate_ai_provider_invocations_total{provider="${provider}"} ${count}`);
    }

    return lines.join('\n');
  }
}
export default MetricsEngineService;
