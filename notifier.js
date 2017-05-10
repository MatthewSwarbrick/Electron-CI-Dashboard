"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Notifier {
    notify(build) {
        var iconColour = build.status == "succeeded" ? "green" : build.status == "building" ? "orange" : "red";
        new Notification(`${build.name}`, {
            body: `${build.status} \n${build.requestedFor}`,
            icon: `content/images/vslogo-${iconColour}.ico`
        });
    }
}
exports.default = new Notifier();
//# sourceMappingURL=notifier.js.map