var TfsApi =  (function() {
    return {
        tfsUrl: localStorage.getItem("tfsUrl"),

        getTfsProjects: function() {
            return fetch(this.tfsUrl + "/_apis/projects", {
                method: "GET",
                credentials: "include"
            });
        },

        getQueuedBuildFromProject: function(project) {
            return fetch(this.tfsUrl + "/"+ project + "/_apis/build/builds?top=1&statusFilter=41", {
                method: "GET",
                credentials: "include"
            });
        },

        getLatestBuildFromProject: function(project) {
            return fetch(this.tfsUrl + "/"+ project + "/_apis/build/builds?top=1&statusFilter=2", {
                method: "GET",
                credentials: "include"
            });
        }
    }
})();

module.exports = TfsApi;