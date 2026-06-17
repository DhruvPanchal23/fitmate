import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api-client';

export interface QueuedRequest {
  id: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  timestamp: number;
  retries: number;
}

class SyncService {
  private readonly QUEUE_KEY = '@fitmate_sync_queue';
  private readonly FAILED_KEY = '@fitmate_failed_requests';
  private isReplaying = false;

  async queueRequest(method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', url: string, data?: any) {
    try {
      const queue = await this.getQueue();
      const newRequest: QueuedRequest = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
        method,
        url,
        data,
        timestamp: Date.now(),
        retries: 0,
      };
      queue.push(newRequest);
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
      console.log(`[SyncService] Queued offline request for ${method} ${url}`);
    } catch (err) {
      console.error('[SyncService] Failed to queue request', err);
    }
  }

  async getQueue(): Promise<QueuedRequest[]> {
    try {
      const data = await AsyncStorage.getItem(this.QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async getFailedRequests(): Promise<QueuedRequest[]> {
    try {
      const data = await AsyncStorage.getItem(this.FAILED_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async replayQueue() {
    if (this.isReplaying) return;
    this.isReplaying = true;
    console.log('[SyncService] Starting sync queue replay...');

    try {
      const queue = await this.getQueue();
      const failedQueue = await this.getFailedRequests();
      const remainingQueue: QueuedRequest[] = [];

      for (const req of queue) {
        try {
          console.log(`[SyncService] Replaying ${req.method} ${req.url}`);
          if (req.method === 'POST') {
            await apiClient.post(req.url, req.data);
          } else if (req.method === 'PATCH') {
            await apiClient.patch(req.url, req.data);
          } else if (req.method === 'DELETE') {
            await apiClient.delete(req.url, req.data);
          }
          console.log(`[SyncService] Successfully synchronized request ${req.id}`);
        } catch (err: any) {
          const isNetworkError = !err.response || err.message === 'Network Error' || err.code === 'ECONNABORTED';
          if (isNetworkError && req.retries < 3) {
            req.retries++;
            remainingQueue.push(req);
            console.log(`[SyncService] Network error on retry. Will retry request ${req.id} later.`);
          } else {
            failedQueue.push(req);
            console.log(`[SyncService] Request ${req.id} failed permanently. Moved to failed/conflict queue.`);
          }
        }
      }

      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(remainingQueue));
      await AsyncStorage.setItem(this.FAILED_KEY, JSON.stringify(failedQueue));
    } catch (err) {
      console.error('[SyncService] Error during queue replay', err);
    } finally {
      this.isReplaying = false;
      console.log('[SyncService] Sync queue replay finished.');
    }
  }

  async resolveFailedRequest(requestId: string, action: 'retry' | 'delete', modifiedData?: any) {
    try {
      const failed = await this.getFailedRequests();
      const reqIndex = failed.findIndex(r => r.id === requestId);
      if (reqIndex === -1) return;

      const req = failed[reqIndex];
      failed.splice(reqIndex, 1);
      await AsyncStorage.setItem(this.FAILED_KEY, JSON.stringify(failed));

      if (action === 'retry') {
        const data = modifiedData !== undefined ? modifiedData : req.data;
        await this.queueRequest(req.method, req.url, data);
        this.replayQueue().catch(() => {});
      }
    } catch (err) {
      console.error('[SyncService] Error resolving failed request', err);
    }
  }

  async clearQueue() {
    try {
      await AsyncStorage.removeItem(this.QUEUE_KEY);
      await AsyncStorage.removeItem(this.FAILED_KEY);
    } catch (err) {
      console.error('[SyncService] Error clearing sync queues', err);
    }
  }
}

export const syncService = new SyncService();
export default syncService;
