import { Component, OnInit, Input } from '@angular/core';
import { Connection } from '../model/connection';
import { GroupedHistory } from '../model/grouped-history';
import { ViewModel } from '../model/viewmodel';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  @Input() viewModel : ViewModel;
  @Input() connection : Connection;
  private _historyConnection : Connection;
  private _groupedHistory : GroupedHistory[]

  constructor() { }

  ngOnInit() {
  }

  public getGroupedHistoryItems() : GroupedHistory[] {
    if (this.connection.historyChanged === true || this._historyConnection !== this.connection) {
      this._groupedHistory = GroupedHistory.create(this.connection.history);
      this._historyConnection = this.connection;
      this.connection.historyChanged = false;
    }
    
    return this._groupedHistory;
  }
}
