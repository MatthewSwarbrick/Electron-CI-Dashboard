class Notifier
{
    notify(build: IBuild) 
    {
        var iconColour = build.status == "succeeded" ? "green" : build.status == "building" ? "orange" : "red";
        new Notification(`${build.name}`, {
            body: `${build.status} \n${build.requestedFor}`,
            icon: `content/images/vslogo-${iconColour}.ico`
        });
    }
}

export default new Notifier();