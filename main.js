const { app, BrowserWindow, session, Tray, Menu } = require('electron')
const path = require('path')
const url = require('url')

let win
let appIcon = null;

function createWindow () {
  win = new BrowserWindow({width: 1000, height: 800, resizable: false});

  // win.webContents.toggleDevTools();

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  win.on('closed', () => {
    win = null
  })

  appIcon = new Tray(path.join('content/images/vslogo-green.ico'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Exit', type: 'normal', click() { app.quit() }}
  ]);
  appIcon.setToolTip('TFS CI Dashboard - all builds are passing');
  appIcon.setContextMenu(contextMenu);
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})