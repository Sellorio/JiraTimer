export class WorklogHistory {
    worklogIds : number[];
    startedAt : Date;
    pausedDuration : number; // in seconds
    endedAt : Date;
    description : string;
    isInEditMode : boolean;
}