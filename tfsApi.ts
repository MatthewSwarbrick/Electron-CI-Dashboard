class TfsApi
{
    tfsUrl = localStorage.getItem("tfsUrl")

    getTfsProjects() 
    {
        return fetch(this.tfsUrl + "/_apis/projects", 
        {
            method: "GET",
            credentials: "include"
        });
    }

    getQueuedBuildFromProject(project: string, definitionId: string) 
    {
        return fetch(
            this.tfsUrl + "/"+ project + "/_apis/build/builds?$top=1&statusFilter=41&definitions=" + definitionId, 
            {
                method: "GET",
                credentials: "include"
            });
    }

    getLatestBuildFromProject(project: string, definitionId: string) 
    {
        return fetch(
            this.tfsUrl + "/"+ project + "/_apis/build/builds?$top=1&statusFilter=2&definitions=" + definitionId, 
            {
                method: "GET",
                credentials: "include"
            });
    }

    getBuildDefinitionsForProject(project: string) 
    {
        return fetch(
            this.tfsUrl + "/"+ project + "/_apis/build/definitions", 
            {
                method: "GET",
                credentials: "include"
            });
    }
};

export default new TfsApi();