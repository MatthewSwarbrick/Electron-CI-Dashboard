"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TfsApi {
    constructor() {
        this.tfsUrl = localStorage.getItem("tfsUrl");
    }
    getTfsProjects() {
        return fetch(this.tfsUrl + "/_apis/projects", {
            method: "GET",
            credentials: "include"
        });
    }
    getQueuedBuildFromProject(project, definitionId) {
        return fetch(this.tfsUrl + "/" + project + "/_apis/build/builds?$top=1&statusFilter=41&definitions=" + definitionId, {
            method: "GET",
            credentials: "include"
        });
    }
    getLatestBuildFromProject(project, definitionId) {
        return fetch(this.tfsUrl + "/" + project + "/_apis/build/builds?$top=1&statusFilter=2&definitions=" + definitionId, {
            method: "GET",
            credentials: "include"
        });
    }
    getBuildDefinitionsForProject(project) {
        return fetch(this.tfsUrl + "/" + project + "/_apis/build/definitions", {
            method: "GET",
            credentials: "include"
        });
    }
}
;
exports.default = new TfsApi();
//# sourceMappingURL=tfsApi.js.map