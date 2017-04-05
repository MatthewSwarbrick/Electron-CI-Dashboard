var TfsSettings =  (function() {
    return {
        storeTfsUrl: function (url) {
            console.log("storing url");
            sessionStorage.setItem("tfsUrl", url);
        }
    }
})();

module.exports = TfsSettings;