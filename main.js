"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trayHelper_1 = require("./trayHelper");
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
let win;
let appIcon;
function createWindow() {
    win = new BrowserWindow({ icon: path.join(__dirname, 'content/images/vslogo-green-icon.ico'), width: 1000, height: 800, resizable: false });
    // win.webContents.toggleDevTools();
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    win.on('close', (event) => {
        event.preventDefault();
        win.hide();
    });
    win.on('closed', () => {
        win = null;
    });
    appIcon = trayHelper_1.default.initialiseSystemTrayIcon();
    ipcMain.on("set-icon-green", () => {
        trayHelper_1.default.setTrayIconToPassed(appIcon);
    });
    ipcMain.on("set-icon-orange", () => {
        trayHelper_1.default.setTrayIconToBuilding(appIcon);
    });
    ipcMain.on("set-icon-red", () => {
        trayHelper_1.default.setTrayIconToFailed(appIcon);
    });
    appIcon.on('click', () => {
        win.show();
    });
}
app.on('ready', createWindow);
app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});
//# sourceMappingURL=main.js.map