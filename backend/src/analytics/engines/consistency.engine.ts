import { Injectable } from '@nestjs/common';

@Injectable()
export class ConsistencyEngine {
  calculateConsistency(
    logs: {
      hasMealLog: boolean;
      hasWaterLog: boolean;
      hasExerciseLog: boolean;
    }[]
  ): number {
    if (logs.length === 0) return 0;

    let consistentDays = 0;
    logs.forEach((log) => {
      // A day is consistent if they logged at least two items or a meal log
      const loggedCount = (log.hasMealLog ? 1 : 0) + (log.hasWaterLog ? 1 : 0) + (log.hasExerciseLog ? 1 : 0);
      if (log.hasMealLog || loggedCount >= 2) {
        consistentDays++;
      }
    });

    return Math.round((consistentDays / logs.length) * 100);
  }
}
export default ConsistencyEngine;
