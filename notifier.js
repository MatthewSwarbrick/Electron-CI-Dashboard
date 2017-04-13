var Notifier =  (function() {
    return {
        notify: function(project) {
            new Notification(`${project.name}`, {
                body: `${project.status}`
            });
        }
    }
})();

module.exports = Notifier;