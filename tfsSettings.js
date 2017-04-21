var TfsSettings =  (function() {
    return {
        storeTfsUrl: function (url) {
            localStorage.setItem("tfsUrl", url);
        },

        getTfsUrl: function() {
            return localStorage.getItem("tfsUrl");
        },

        addProjectToIgnore: function (name) {
            var existingIgnoredProjects = JSON.parse(localStorage.getItem("ignoredProjects"));
            if(existingIgnoredProjects) {
                existingIgnoredProjects.push(name);
            }
            else{
                existingIgnoredProjects = [ name ];
            }

            localStorage.setItem("ignoredProjects", JSON.stringify(existingIgnoredProjects));
        },

        removeProjectFromIgnoreList: function (name) {
            var existingIgnoredProjects = JSON.parse(localStorage.getItem("ignoredProjects"));
            var indexOfProjectToRemove = existingIgnoredProjects.findIndex(ip => ip == name);
            existingIgnoredProjects.splice(indexOfProjectToRemove, 1);

            localStorage.setItem("ignoredProjects", JSON.stringify(existingIgnoredProjects));
        },

        getIgnoredProjects: function() {
            return JSON.parse(localStorage.getItem("ignoredProjects"));
        }
    }
})();

module.exports = TfsSettings;