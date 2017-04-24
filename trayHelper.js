const { app, Tray, Menu } = require('electron')
const path = require('path')

var TrayHelper =  (function() {

    return {
        initialiseSystemTrayIcon: function () {
            appIcon = new Tray(path.join('content/images/vslogo-green.ico'));
            const contextMenu = Menu.buildFromTemplate([
                { label: 'Exit', type: 'normal', click() { app.quit() }}
            ]);
            appIcon.setToolTip('TFS CI Dashboard - all builds are passing');
            appIcon.setContextMenu(contextMenu);
            return appIcon;
        },
        
        setTrayIconToBuilding: function (appIcon) {
            appIcon.setImage(path.join('content/images/vslogo-orange.ico'));
            appIcon.setToolTip('TFS CI Dashboard - building');
        },

        setTrayIconToPassed: function (appIcon) {
            appIcon.setImage(path.join('content/images/vslogo-green.ico'));
            appIcon.setToolTip('TFS CI Dashboard - all builds are passing');
        },

        setTrayIconToFailed: function (appIcon) {
            appIcon.setImage(path.join('content/images/vslogo-red.ico'));
            appIcon.setToolTip('TFS CI Dashboard - failed builds');
        },
    }
})();

module.exports = TrayHelper;