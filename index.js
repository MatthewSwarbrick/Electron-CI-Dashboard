const TfsSettings = require("./tfsSettings.js");
const remote  = require('electron').remote;
const path = require('path');
const url = require('url');

if(TfsSettings.getTfsUrl())
{
    navigationToBuilds();
}

var submitTfsButton = document.getElementById("enterTfsUrlButton");
submitTfsButton.addEventListener("click", () => {
    var tfsUrl = document.getElementById("enterTfsUrlInput").value;
    if(!tfsUrl) {
        return;
    }

    TfsSettings.storeTfsUrl(tfsUrl);
    navigationToBuilds();
});

function navigationToBuilds() {
    remote.getCurrentWindow().loadURL(url.format({
        pathname: path.join(__dirname, 'builds.html'),
        protocol: 'file:',
        slashes: true
    }));
}
