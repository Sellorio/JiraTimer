const electron = require("electron")
const fs = require("fs")
const os = require("os")
const crypto = require("crypto")
const path = require("path")
const windowStateKeeper = require('electron-window-state');
const ipc = electron.ipcMain;
const isDev = require('electron-is-dev');
const applicationPath = isDev ? electron.app.getAppPath() : path.dirname(electron.app.getPath("exe"));

let userData = null;
let mainWindow = null;
let tray = null;

let isTimerRunning = false;

function initialiseUserData() {
	let dataPath = path.join(electron.app.getPath("appData"), "JiraTimer", "userdata"); // do i need to put app name in user data file name?

	if (fs.existsSync(dataPath)) {
		let decipher = crypto.createDecipher("aes-256-ctr", "c187a809b");
		let encrypted = fs.readFileSync(dataPath).toString();
		let decrypted = decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
		userData = JSON.parse(decrypted);
	}
	else {
		userData = {
			settings: {}, // defaults are handled in ModelConverterService
			selectedConnection: -1, // index of selected connection
			connections: [] // { hostname, icon, username, password, history }
				// history : { worklogIds, jiras, startedAt, pausedDuration, endedAt, description }
		};

		saveUserData();
	}
}

function saveUserData() {
	let dataPath = path.join(electron.app.getPath("appData"), "JiraTimer", "userdata"); // do i need to put app name in user data file name?
	let decrypted = JSON.stringify(userData);
	let cipher = crypto.createCipher("aes-256-ctr", "c187a809b");
	let encrypted = cipher.update(decrypted, "utf8", "hex") + cipher.final("hex");

	if (!fs.existsSync(path.dirname(dataPath))) {
		fs.mkdirSync(path.dirname(dataPath));
	}

	fs.writeFile(dataPath, encrypted, () => {}); // callback required but we don't have any use for it
}

function createWindow() {
	let windowState = windowStateKeeper({
		defaultWidth: 1400,
		defaultHeight: 800
	});

	let window =
		new electron.BrowserWindow({
			x: windowState.x,
			y: windowState.y,
			width: windowState.width,
			height: windowState.height
		});

	windowState.manage(window);

	window.webContents.setUserAgent("Mozilla/5.0 (Windows NT 6.3; Win64; x64; AppleWebKit-537.36; Chrome-45.0.2454.85; Electron-0.34.2; Safari-537.36) like Gecko");
	window.loadFile("dist/index.html");
	window.setIcon(path.join(applicationPath, "dist/assets/icon.ico"));

	window.on("ready-to-show", () => {
		if (userData.settings.openInBackground === false) {
			mainWindow.show();
		}
	});
	window.on("close", e => {
		e.preventDefault();

		if (os.platform() === "darwin") {
			mainWindow.hide();
			tray.destroy();
			tray = null;
		}
		else if (userData.settings.keepOpenInTray === true) {
			mainWindow.hide();
		}
		else {
			handleCloseRequest();
		}
	});
	mainWindow = window;
}

function createTray() {
	tray = new electron.Tray(path.join(applicationPath, "dist/assets/icon-stop.png"));
	tray.setToolTip("Timer is stopped."); // if timer is active "Keeping track of your time..." else "Timer is stopped."

	let contextMenu = new electron.Menu();
	contextMenu.append(new electron.MenuItem({
		id: "openWindow",
		label: "Open Window",
		click: () => mainWindow.show()
	}));
	contextMenu.append(new electron.MenuItem({
		label: "Exit",
		click: handleCloseRequest
	}));
	tray.setContextMenu(contextMenu);

	tray.on("click", () => mainWindow.show());
}

function handleCloseRequest() {
	if (isTimerRunning === true) {
		electron.dialog.showMessageBox(
			{
				type: "question",
				message: "You have a timer running. Are you sure you wish to quit?",
				buttons: ["Keep open", "Quit anyway"],
				defaultId: 0,
				cancelId: 0
			},
			() => {
				if (response === 1) {
					electron.app.quit();
				}
			});
	}
	else {
		electron.app.quit();
	}
}

electron.app.on("ready", () => {
	initialiseUserData();
	createTray();
	createWindow();
});

electron.app.on("activate", () => {
	mainWindow.show();

	if (tray === null) {
		createTray();
	}
});

electron.app.on('before-quit', () => {
	mainWindow.show();
	mainWindow.destroy();

	if (tray !== null) {
		tray.destroy();
	}
});

ipc.on("timerState", (_, state) => {
	switch (state) {
		case "running":
			tray.setToolTip("Keeping track of your time...");
			tray.setImage(path.join(applicationPath, "dist/assets/icon-play.png"));
			break;
		case "stopped":
			tray.setToolTip("Timer is stopped.");
			tray.setImage(path.join(applicationPath, "dist/assets/icon-stop.png"));
			break;
		case "paused":
			tray.setToolTip("Timer is paused.");
			tray.setImage(path.join(applicationPath, "dist/assets/icon-pause.png"));
			break;
	}
});

ipc.on("userDataRequest", e => {
	e.sender.send('userData', userData);
});

ipc.on("userData", (e, arg) => {
	if (arg.settings.startOnStartup !== userData.settings.startOnStartup) {
		electron.app.setLoginItemSettings({
			openAtLogin: arg.settings.startOnStartup,
			path: electron.app.getPath("exe")
		});
	}

	userData = arg;
	saveUserData();
});

ipc.on("openUrl", (_, url) => {
	electron.shell.openExternal(url);
});
