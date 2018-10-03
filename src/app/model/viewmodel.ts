import { Settings } from "./settings";
import { Connection } from "./connection";

export class ViewModel {
    settings : Settings;
    selectedConnection : Connection;
    connections : Connection[];
}