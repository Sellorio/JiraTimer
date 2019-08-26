# Jira Timer

This is a tool to trac time against Jira issues by using one or more timers. It features:

- Multiple timers
- Pausing
- Multiple Jira issues per timer
- Manually entering Jira issue keys (in addition to the provided Assigned To Me and Recently Viewed Jira issue lists)
- opening a Jira in the browser by clicking on the summary
- Connections to more than 1 Jira instance

## Build

`npm run build`

This will build angular.

## Run

`npm start`

This will build angular and then start the application in Electron.

## Packaging

Jira Timer uses `electron-packager` to package the application into a deployable executable.
The following commands will let you do this:

#### Windows

`npm run package` or `npm run package:windows`

#### MacOS

`npm run package:mac`

#### Post packaging manual steps

**Copy** the `dist` folder from the package's `resources/app` to the package's root folder. This
will allow electron to access the assets contained within. For some reason it doesn't use the
resources/app directory some times. You can delete everything except for the assets folder
from the `dist` folder copy.

In order to make package sizes resonable, delete the following folders from the `resources/app` folder:

- .vs
- .vscode
- e2e
- src

You can also safely delete the following files:

- .editorconfig
- .gitignore
- browserslist
- Icon.pdn
- karma.conf.js
- LICENSE
- readme.md
- package-lock.json
- tsconfig.app.json
- tsconfig.json
- tsconfig.spec.json
- tslint.json
