const { app, BrowserWindow, session, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
const TrayHelper = require('./trayHelper');

let win;
let appIcon;

function createWindow () {
  win = new BrowserWindow({icon: 'content/images/vslogo-green-icon.ico', width: 1000, height: 800, resizable: false});

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
  ipcMain.on("set-icon-green", (event, arg) => {
    TrayHelper.setTrayIconToPassed(appIcon);
  });

  ipcMain.on("set-icon-orange", (event, arg) => {
    TrayHelper.setTrayIconToBuilding(appIcon);
  });

  ipcMain.on("set-icon-red", (event, arg) => {
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