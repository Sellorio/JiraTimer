import { WorklogHistory } from './worklog-history';
import { TimeSpan } from '../time-span';

export class GroupedHistory {
  date: Date;
  totalDuration: string;
  items: WorklogHistory[];

  private constructor(date: Date, totalDuration: string, items: WorklogHistory[]) {
    this.date = date;
    this.totalDuration = totalDuration;
    this.items = items;
  }

  public static create(fullHistory: WorklogHistory[]): GroupedHistory[] {
    const grouped = this.groupHistoryItems(fullHistory);
    const result: GroupedHistory[] = [];

    grouped.forEach((history, date) => {
      let duration = 0;

      for (const historyItem of history) {
        duration += historyItem.endedAt.getTime() - historyItem.startedAt.getTime() - historyItem.pausedDuration * 1000;
      }

      result.push(new GroupedHistory(date, TimeSpan.fromTime(duration).toString(), history));
    });

    return result;
  }

  private static groupHistoryItems(history: WorklogHistory[]): Map<Date, WorklogHistory[]> {
    const result = new Map<Date, WorklogHistory[]>();
    const keys = [];

    for (const historyItem of history) {
      let wasMatched = false;

      for (const key of keys) {
        if (historyItem.startedAt.toDateString() === key.toDateString()) {
          const array = result.get(key);
          array.push(historyItem);
          wasMatched = true;
          break;
        }
      }

      if (wasMatched === false) {
        result.set(historyItem.startedAt, [ historyItem ]);
        keys.push(historyItem.startedAt);
      }
    }

    return result;
  }
}
