const TfsApi = require("./tfsApi");
const moment = require("moment");

var projects = [];

var projectHTML = (project) => `
    <div class="project col-sm-4">
        <div class="card card-inverse ${project.status == 'building' ? 'card-warning' : project.status == 'succeeded' ? 'card-success' : 'card-danger'}">
            <div class="card-header">${project.name} | ${project.status}</div>
            <div class="card-block">
                <p class="card-text">Started by: ${project.requestedFor}</p>
                <p class="card-text">${moment(project.time).format("YYYY-MM-DD HH:mm")}</p>
            </div>
        </div>
    </div>`;

function setProjectsToView() {
    if(this.projects.some(p => p)) {
        var html = this.projects.map(projectHTML).join('');
        var projectList = document.getElementById("project-list");
        projectList.innerHTML = html;
        return;
    }

    var projectList = document.getElementById("project-list");
    projectList.innerHTML = `<p class="text-center col-md-12">There are no projects to display</p>`;
};

function setSettingsButton() {
    var tfsUrl = localStorage.getItem("tfsUrl");
    var html = `
        <span>${tfsUrl}</span>[<a href="#">change</a>]
    `;
    var settingsButton = document.getElementById("settings-button");
    settingsButton.innerHTML = html;
}

this.setSettingsButton();

var tfsApiCall = TfsApi.getTfsProjects();
tfsApiCall
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
        this.setProjectsToView();
    });

tfsApiCall.catch(() => this.setProjectsToView());