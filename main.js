const electron = require("electron")
const fs = require("fs")
const os = require("os")
const crypto = require("crypto")
const path = require("path")
const ipc = electron.ipcMain;

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
			settings: {
				startOnStartup : false,
				keepOpenInTray: true,
				openInBackground: false,
				startTimerOnStartup: false,
			},
			selectedConnection: -1, // index of selected connection
			connections: [] // { hostname, icon, username, password, history }
				// history : { worklogId, startedAt, pausedDuration, endedAt, description }
		};

		saveUserData();
	}
}

function saveUserData() {
	let dataPath = path.join(electron.app.getPath("appData"), "JiraTimer", "userdata"); // do i need to put app name in user data file name?
	console.log("User data path: " + dataPath);
	let decrypted = JSON.stringify(userData);
	let cipher = crypto.createCipher("aes-256-ctr", "c187a809b");
	let encrypted = cipher.update(decrypted, "utf8", "hex") + cipher.final("hex");

	if (!fs.existsSync(path.dirname(dataPath))) {
		fs.mkdirSync(path.dirname(dataPath)); 
	}

	fs.writeFile(dataPath, encrypted, () => {}); // callback required but we don't have any use for it
}

function createWindow() {
	let window = new electron.BrowserWindow({ width: 1400, height: 750 });
	window.loadFile("dist/index.html");
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
	tray = new electron.Tray("dist/assets/clock-outline.png");
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
	
	tray.on("double-click", () => mainWindow.show());
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

// todo: set different tray icons based on timer running/not running/paused
ipc.on("timerStarted", () => {
	tray.setToolTip("Keeping track of your time...");
	tray.setImage("dist/assets/clock-fill.png");
});

ipc.on("timerPaused", () => {
	tray.setToolTip("Timer is paused.");
	tray.setImage("dist/assets/clock-outline.png");
});

ipc.on("timerResumed", () => {
	tray.setToolTip("Keeping track of your time...");
	tray.setImage("dist/assets/clock-fill.png");
});

ipc.on("timerEnded", () => {
	tray.setToolTip("Timer is stopped.");
	tray.setImage("dist/assets/clock-outline.png");
});

ipc.on("userDataRequest", e => {
	e.sender.send('userData', userData);
});

ipc.on("userData", (e, arg) => {
	userData = arg;
	saveUserData();
});

ipc.on("openUrl", (_, url) => {
	electron.shell.openExternal(url);
});