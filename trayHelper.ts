import { app, Tray, Menu } from "electron"
import * as path from "path"

class TrayHelper
{
    initialiseSystemTrayIcon() 
    {
        var appIcon = new Tray(path.join(__dirname, 'content/images/vslogo-green.ico'));
        const contextMenu = Menu.buildFromTemplate([
            { label: 'Exit', type: 'normal', click() { app.exit() }}
        ]);
        appIcon.setToolTip('TFS CI Dashboard - all builds are passing');
        appIcon.setContextMenu(contextMenu);
        return appIcon;
    }
    
    setTrayIconToBuilding(appIcon: Electron.Tray) 
    {
        appIcon.setImage(path.join(__dirname, 'content/images/vslogo-orange.ico'));
        appIcon.setToolTip('TFS CI Dashboard - building');
    }

    setTrayIconToPassed(appIcon: Electron.Tray) 
    {
        appIcon.setImage(path.join(__dirname, 'content/images/vslogo-green.ico'));
        appIcon.setToolTip('TFS CI Dashboard - all builds are passing');
    }

    setTrayIconToFailed(appIcon: Electron.Tray) 
    {
        appIcon.setImage(path.join(__dirname, 'content/images/vslogo-red.ico'));
        appIcon.setToolTip('TFS CI Dashboard - failed builds');
    }
}

export default new TrayHelper();