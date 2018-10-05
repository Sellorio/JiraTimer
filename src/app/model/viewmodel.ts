import { Settings } from "./settings";
import { Connection } from "./connection";
import { Timer } from "./timer";

export class ViewModel {
    settings : Settings;
    selectedConnection : Connection;
    connections : Connection[];
    selectedTimer : Timer;
    timers : Timer[];
}