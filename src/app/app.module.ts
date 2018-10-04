import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HttpClientModule } from "@angular/common/http";
import { NgxElectronModule } from "ngx-electron";

import { AppComponent } from './app.component';
import { ConnectionsComponent } from './connections/connections.component';
import { LoginComponent } from './login/login.component';
import { JiraListComponent } from './jira-list/jira-list.component';

@NgModule({
  declarations: [
    AppComponent,
    ConnectionsComponent,
    LoginComponent,
    JiraListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgxElectronModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }