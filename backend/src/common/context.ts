import { AsyncLocalStorage } from 'async_hooks';

export interface RequestStore {
  requestId: string;
  userId?: string;
  sessionId?: string;
  startTime: number;
  dbQueriesCount: number;
  cacheHit?: boolean;
  aiProvider?: string;
  aiLatency?: number;
  aiTokens?: number;
  cacheMap: Map<string, any>;
}

export const contextStorage = new AsyncLocalStorage<RequestStore>();

export function getRequestContext(): RequestStore | undefined {
  return contextStorage.getStore();
}

export default contextStorage;
