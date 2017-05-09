var Notifier =  (function() {
    return {
        notify: function(build) {
            var iconColour = build.status == "succeeded" ? "green" : build.status == "building" ? "orange" : "red";
            new Notification(`${build.name}`, {
                body: `${build.status} \n${build.requestedFor}`,
                icon: `content/images/vslogo-${iconColour}.ico`
            });
        }
    }
})();

module.exports = Notifier;
