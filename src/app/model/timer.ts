import { Connection } from './connection';
import { Jira } from './jira';

export class Timer {
  connection: Connection;
  startedAt: Date;
  pausedDuration: number;
  pauseStartedAt: Date;
  description: string;
  jiras: Jira[];
  currentDuration: string;
}
