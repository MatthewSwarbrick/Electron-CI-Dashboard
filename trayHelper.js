"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = require("path");
class TrayHelper {
    initialiseSystemTrayIcon() {
        var appIcon = new electron_1.Tray(path.join(__dirname, 'content/images/vslogo-green.ico'));
        const contextMenu = electron_1.Menu.buildFromTemplate([
            { label: 'Exit', type: 'normal', click() { electron_1.app.exit(); } }
        ]);
        appIcon.setToolTip('TFS CI Dashboard - all builds are passing');
        appIcon.setContextMenu(contextMenu);
        return appIcon;
    }
    setTrayIconToBuilding(appIcon) {
        appIcon.setImage(path.join(__dirname, 'content/images/vslogo-orange.ico'));
        appIcon.setToolTip('TFS CI Dashboard - building');
    }
    setTrayIconToPassed(appIcon) {
        appIcon.setImage(path.join(__dirname, 'content/images/vslogo-green.ico'));
        appIcon.setToolTip('TFS CI Dashboard - all builds are passing');
    }
    setTrayIconToFailed(appIcon) {
        appIcon.setImage(path.join(__dirname, 'content/images/vslogo-red.ico'));
        appIcon.setToolTip('TFS CI Dashboard - failed builds');
    }
}
exports.default = new TrayHelper();
//# sourceMappingURL=trayHelper.js.map