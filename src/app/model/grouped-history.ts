import { WorklogHistory } from "./worklog-history";
import { TimeSpan } from "../time-span";

export class GroupedHistory {
    date : Date;
    totalDuration : string;
    items : WorklogHistory[];

    private constructor(date : Date, totalDuration : string, items : WorklogHistory[]) {
        this.date = date;
        this.totalDuration = totalDuration;
        this.items = items;
    }

    public static create(history : WorklogHistory[]) : GroupedHistory[] {
        let grouped = this.groupHistoryItems(history);
        let result : GroupedHistory[] = [];

        grouped.forEach((history, date) => {
            let duration = 0;

            for (let historyIndex = 0; historyIndex < history.length; historyIndex++) {
                const historyItem : WorklogHistory = history[historyIndex];

                duration += historyItem.endedAt.getTime() - historyItem.startedAt.getTime() - historyItem.pausedDuration * 1000;
            }

            result.push(new GroupedHistory(date, TimeSpan.fromTime(duration).toString(), history));
        });

        return result;
    }

    private static groupHistoryItems(history : WorklogHistory[]) : Map<Date, WorklogHistory[]> {
        let result = new Map<Date, WorklogHistory[]>();
        let keys = [];

        for (let i = 0; i < history.length; i++) {
            let wasMatched = false;

            for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
                if (history[i].startedAt.toDateString() === keys[keyIndex].toDateString()) {
                    let array = result.get(keys[keyIndex]);
                    array.push(history[i]);
                    wasMatched = true;
                    break;
                }
            }

            if (wasMatched === false) {
                result.set(history[i].startedAt, [ history[i] ]);
                keys.push(history[i].startedAt);
            }
        }

        return result;
    }
}