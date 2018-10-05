import { enableProdMode, ReflectiveInjector } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import * as $ from 'jquery';
// import { ViewModel } from './app/model/viewmodel';
// import { ModelConverter } from './app/model-converter';
// import { ElectronService } from "ngx-electron";

// var ipc = ReflectiveInjector.resolveAndCreate([ElectronService]).get(ElectronService).ipcRenderer;
// var viewModel : ViewModel;

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

$(document)
  .one('focus.autoExpand', 'textarea.autoExpand', (event) => {
    let target : any = event.target;
    let savedValue = target.value;

    target.value = '';
    target.baseScrollHeight = target.scrollHeight;
    target.value = savedValue;
  })
  .on('input.autoExpand', 'textarea.autoExpand', (event) => {
    let target : any = event.target;
    let minRows = target.getAttribute('data-min-rows')|0, rows;
    target.rows = minRows;
    rows = Math.ceil((target.scrollHeight - target.baseScrollHeight) / 33);
    target.rows = rows + minRows;
  });