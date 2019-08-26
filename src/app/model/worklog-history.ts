import { Jira } from './jira';

export class WorklogHistory {
  worklogIds: number[];
  jiras: Jira[];
  startedAt: Date;
  pausedDuration: number; // in seconds
  endedAt: Date;
  description: string;
  isInEditMode: boolean;
}
