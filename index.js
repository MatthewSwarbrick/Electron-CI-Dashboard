"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = require("path");
const url = require("url");
const tfsSettings_1 = require("./tfsSettings");
if (tfsSettings_1.default.getTfsUrl()) {
    navigationToBuilds();
}
var submitTfsButton = document.getElementById("enterTfsUrlButton");
submitTfsButton.addEventListener("click", () => {
    var tfsUrl = document.getElementById("enterTfsUrlInput").value;
    if (!tfsUrl) {
        return;
    }
    tfsSettings_1.default.storeTfsUrl(tfsUrl);
    navigationToBuilds();
});
function navigationToBuilds() {
    electron_1.remote.getCurrentWindow().loadURL(url.format({
        pathname: path.join(__dirname, 'builds.html'),
        protocol: 'file:',
        slashes: true
    }));
}
//# sourceMappingURL=index.js.map