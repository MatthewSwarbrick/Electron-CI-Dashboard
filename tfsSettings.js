var TfsSettings =  (function() {
    return {
        storeTfsUrl: function (url) {
            localStorage.setItem("tfsUrl", url);
        },

        getTfsUrl: function() {
            return localStorage.getItem("tfsUrl");
        },

        addBuildToIgnore: function (name) {
            var existingIgnoredBuilds = JSON.parse(localStorage.getItem("ignoredBuilds"));
            if(existingIgnoredBuilds) {
                existingIgnoredBuilds.push(name);
            }
            else{
                existingIgnoredBuilds = [ name ];
            }

            localStorage.setItem("ignoredBuilds", JSON.stringify(existingIgnoredBuilds));
        },

        removeBuildFromIgnoreList: function (name) {
            var existingIgnoredBuilds = JSON.parse(localStorage.getItem("ignoredBuilds"));
            var indexOfBuildToRemove = existingIgnoredBuilds.findIndex(ip => ip == name);
            existingIgnoredBuilds.splice(indexOfBuildToRemove, 1);

            localStorage.setItem("ignoredBuilds", JSON.stringify(existingIgnoredBuilds));
        },

        getIgnoredBuilds: function() {
            var ignoredBuilds = JSON.parse(localStorage.getItem("ignoredBuilds"));
            if(!ignoredBuilds) {
                ignoredBuilds = [];
            }
            return ignoredBuilds;
        }
    }
})();

module.exports = TfsSettings;