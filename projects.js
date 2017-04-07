const TfsApi = require("./tfsApi");

var projects = [];

TfsApi.getTfsProjects()
            .then(response => response.json())
            .then(json => {
                json.value.forEach(function(project) {
                    TfsApi.getQueuedBuildFromProject(project.name)
                        .then(response => response.json())
                        .then(json => {
                            if(json.count != 0)
                            {
                                this.projects.push({
                                    name: project.name,
                                    status: "building",
                                    requestedFor: json.value[0].requestedFor.displayName,
                                    time: json.value[0].queueTime
                                });
                            }
                            else
                            {
                                return TfsApi.getLatestBuildFromProject(project.name)
                                .then(response => response.json())
                                .then(json => {
                                    if(json.count != 0)
                                    {
                                        this.projects.push({
                                            name: project.name,
                                            status: json.value[0].result,
                                            requestedFor: json.value[0].requestedFor.displayName,
                                            time: json.value[0].queueTime
                                        });
                                    }
                                });
                            }
                        })
                });
                console.log(this.projects);
            });