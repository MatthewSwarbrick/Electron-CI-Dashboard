import TrayHelper from "./trayHelper";
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')

let win: Electron.BrowserWindow;
let appIcon: Electron.Tray;

function createWindow () 
{
  win = new BrowserWindow({icon: path.join(__dirname, 'content/images/vslogo-green-icon.ico'), width: 1000, height: 800, resizable: false});

  // win.webContents.toggleDevTools();

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  win.on('close', (event) => {
    event.preventDefault();
    win.hide();
  })

  win.on('closed', () => {
    win = null;
  })

  appIcon = TrayHelper.initialiseSystemTrayIcon(); 
  ipcMain.on("set-icon-green", () => 
  {
    TrayHelper.setTrayIconToPassed(appIcon);
  });

  ipcMain.on("set-icon-orange", () => {
    TrayHelper.setTrayIconToBuilding(appIcon);
  });

  ipcMain.on("set-icon-red", () => {
    TrayHelper.setTrayIconToFailed(appIcon);
  });

  appIcon.on('click', () => {
    win.show();
  })
}

app.on('ready', createWindow)

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})