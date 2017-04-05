var TfsSettings =  (function() {
    return {
        storeTfsUrl: function (url) {
            localStorage.setItem("tfsUrl", url);
        },

        getTfsUrl: function() {
            return localStorage.getItem("tfsUrl");
        }
    }
})();

module.exports = TfsSettings;