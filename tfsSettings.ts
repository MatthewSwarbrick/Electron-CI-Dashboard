class TfsSettings 
{
    storeTfsUrl(url: string) 
    {
        localStorage.setItem("tfsUrl", url);
    }

    getTfsUrl() 
    {
        return localStorage.getItem("tfsUrl");
    }

    addBuildToIgnore(name: string)
    {
        var existingIgnoredBuilds = JSON.parse(localStorage.getItem("ignoredBuilds"));
        if(existingIgnoredBuilds) {
            existingIgnoredBuilds.push(name);
        }
        else{
            existingIgnoredBuilds = [ name ];
        }

        localStorage.setItem("ignoredBuilds", JSON.stringify(existingIgnoredBuilds));
    }

    removeBuildFromIgnoreList(name: string) 
    {
        var existingIgnoredBuilds = JSON.parse(localStorage.getItem("ignoredBuilds"));
        var indexOfBuildToRemove = existingIgnoredBuilds.findIndex((ip: string) => ip == name);
        existingIgnoredBuilds.splice(indexOfBuildToRemove, 1);

        localStorage.setItem("ignoredBuilds", JSON.stringify(existingIgnoredBuilds));
    }

    getIgnoredBuilds(): string[]
    {
        var ignoredBuilds = JSON.parse(localStorage.getItem("ignoredBuilds"));
        if(!ignoredBuilds) {
            ignoredBuilds = [];
        }
        return ignoredBuilds;
    }
};

export default new TfsSettings();    