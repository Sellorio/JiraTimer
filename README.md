# Jira Timer

This is a tool to trac time against jiras by using one or more timers. It features:

- Multiple timers
- Pausing
- Multiple jiras per timer
- Manually entering jira keys (in addition to the provided Assigned To Me and Recently Viewed jira lists)
- opening a jira in the browser by clicking on it
- Connections to more than 1 jira instance

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

`npm run electron-build`

This will build angular and then run Electron in the current directory.

## Packaging

You will need to install the electron-packager package to run this.

`npm install electron-packager -g`

Below are a set of example commands you can use when packaging the Jira Timer. Linux platforms should also work.

#### Windows

`electron-packager . --plat="win32" --icon ./src/assets/icon.ico`

#### MacOS

`electron-packager . --plat="darwin" --icon ./src/assets/icon.icns`

Copy the `dist` folder from `resources/app` to the package's root folder. This will allow electron to access the assets contained within. For some reason it doesn't use the
resources/app directory some times. You can delete everything except for the assets folder from the `dist` folder copy.

In order to make package sizes resonable, delete the following folders from the `resources/app` folder:

- .vs
- .vscode
- e2e
- src

You can also safely delete the following files:

- .editorconfig
- .gitignore
- Icon.pdn
- License
- readme.md
- tsconfig.json
- tslint.json