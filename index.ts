import { remote } from "electron";
import * as path from "path";
import * as url from "url";
import TfsSettings from "./tfsSettings"

if(TfsSettings.getTfsUrl())
{
    navigationToBuilds();
}

var submitTfsButton = document.getElementById("enterTfsUrlButton");
submitTfsButton.addEventListener("click", () => 
{
    var tfsUrl = (<HTMLInputElement>document.getElementById("enterTfsUrlInput")).value;
    if(!tfsUrl) 
    {
        return;
    }

    TfsSettings.storeTfsUrl(tfsUrl);
    navigationToBuilds();
});

function navigationToBuilds() 
{
    remote.getCurrentWindow().loadURL(url.format({
        pathname: path.join(__dirname, 'builds.html'),
        protocol: 'file:',
        slashes: true
    }));
}
