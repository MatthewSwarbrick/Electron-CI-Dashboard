var Notifier =  (function() {
    return {
        notify: function(project) {
            var iconColour = project.status == "succeeded" ? "green" : project.status == "building" ? "orange" : "red";
            new Notification(`${project.name}`, {
                body: `${project.status}`,
                icon: `content/images/vslogo-${iconColour}.ico`
            });
        }
    }
})();

module.exports = Notifier;