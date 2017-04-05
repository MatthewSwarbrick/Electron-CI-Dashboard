const TfsSettings = require("./tfsSettings.js");

var submitTfsButton = document.getElementById("enterTfsUrlButton");
submitTfsButton.addEventListener("click", () => {
    console.log("clicked button");
    var tfsUrl = document.getElementById("enterTfsUrlInput").value;
    if(!tfsUrl) {
        return;
    }

    TfsSettings.storeTfsUrl(tfsUrl);
});