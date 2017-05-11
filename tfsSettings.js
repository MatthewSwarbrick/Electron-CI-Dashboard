"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TfsSettings {
    storeTfsUrl(url) {
        localStorage.setItem("tfsUrl", url);
    }
    getTfsUrl() {
        return localStorage.getItem("tfsUrl");
    }
    addBuildToIgnore(name) {
        var existingIgnoredBuilds = JSON.parse(localStorage.getItem("ignoredBuilds"));
        if (existingIgnoredBuilds) {
            existingIgnoredBuilds.push(name);
        }
        else {
            existingIgnoredBuilds = [name];
        }
        localStorage.setItem("ignoredBuilds", JSON.stringify(existingIgnoredBuilds));
    }
    removeBuildFromIgnoreList(name) {
        var existingIgnoredBuilds = JSON.parse(localStorage.getItem("ignoredBuilds"));
        var indexOfBuildToRemove = existingIgnoredBuilds.findIndex((ip) => ip == name);
        existingIgnoredBuilds.splice(indexOfBuildToRemove, 1);
        localStorage.setItem("ignoredBuilds", JSON.stringify(existingIgnoredBuilds));
    }
    getIgnoredBuilds() {
        var ignoredBuilds = JSON.parse(localStorage.getItem("ignoredBuilds"));
        if (!ignoredBuilds) {
            ignoredBuilds = [];
        }
        return ignoredBuilds;
    }
}
;
exports.default = new TfsSettings();
//# sourceMappingURL=tfsSettings.js.map