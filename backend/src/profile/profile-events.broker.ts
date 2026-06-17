import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfileEventsBroker {
  private readonly listeners = new Map<string, Array<(event: any) => Promise<void>>>();

  subscribe(event: string, callback: (event: any) => Promise<void>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  async emit(event: string, payload: any) {
    const list = this.listeners.get(event) || [];
    // Trigger callbacks asynchronously to decouple thread execution
    for (const callback of list) {
      callback(payload).catch((err) => {
        console.error(`Error in event listener for ${event}:`, err);
      });
    }
  }
}
export default ProfileEventsBroker;
