import { enableProdMode, ReflectiveInjector } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
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

// ipc.on("userData", (_, arg) => {
//   viewModel = ModelConverter.toModel(arg);
// });

// function saveUserData() {
//   ipc.send("userData", ModelConverter.toUserData(viewModel));
// }