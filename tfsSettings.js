var TfsSettings =  (function() {
    return {
        storeTfsUrl: function (url) {
            sessionStorage.setItem("tfsUrl", url);
        },

        getTfsUrl: function() {
            return sessionStorage.getItem("tfsUrl");
        }
    }
})();

module.exports = TfsSettings;