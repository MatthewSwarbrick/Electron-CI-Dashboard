const TfsApi = require("./tfsApi");
const moment = require("moment");
const remote  = require('electron').remote;
const path = require('path');
const url = require('url');
const Q = require("Q");

var projects = [];

var projectHTML = (project) => `
    <div id="${project.name}" class="project col-sm-4">
        <div class="card card-inverse ${project.status == 'building' ? 'card-warning building-card' : project.status == 'succeeded' ? 'card-success' : 'card-danger'}">
            <div class="card-header">${project.name}</div>
            <div class="card-block">
                <p class="card-text">Started by: ${project.requestedFor}</p>
                <p class="card-text">${moment(project.time).format("YYYY-MM-DD HH:mm")}</p>
            </div>
        </div>
    </div>`;

function setLastUpdatedToView() {
    var element = document.getElementById("last-updated-text");
    var lastUpdatedText = `Last updated at: ${moment().format("DD MMM HH:mm")}`;
    element.innerHTML = lastUpdatedText;
};

function setProjectsToView() {
    
    if(this.projects.some(p => p)) {
        var orderedProjects = this.projects.sort(this.compare);
        orderedProjects.forEach(op => {
            var existingProjectElement = document.getElementById(op.name);
            if(existingProjectElement) {
                existingProjectElement.parentNode.replaceChild(document.createRange().createContextualFragment(projectHTML(op)), existingProjectElement);
            }
            else {
                
            var projectList = document.getElementById("project-list");
                projectList.appendChild(document.createRange().createContextualFragment(projectHTML(op)));
            }
        });

        return;
    }

    var projectList = document.getElementById("project-list");
    projectList.innerHTML = `<p class="text-center col-md-12">There are no projects to display</p>`;
};

function setSettingsButton() {
    var tfsUrl = localStorage.getItem("tfsUrl");
    var html = `
        <span>${tfsUrl}</span>[<a id="change-settings-link" href="#">change</a>]
    `;
    var settingsButton = document.getElementById("settings-button");
    settingsButton.innerHTML = html;
};

function isProjectBuildOlderThanAYear(queueTime) {
    return moment.duration(moment().diff(moment(queueTime))).asYears() > 1;
};

function compare(a, b) {
  if (a.name.toLowerCase() < b.name.toLowerCase())
    return -1;
  if (a.name.toLowerCase() > b.name.toLowerCase())
    return 1;
  return 0;
};

this.setSettingsButton();

var settingsButton = document.getElementById("change-settings-link");
settingsButton.addEventListener("click", () => {
    localStorage.removeItem("tfsUrl");
    remote.getCurrentWindow().loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
});

function getProjects() {
    this.projects = [];
    var parentPromises = [];
    var childPromises = [];
    var tfsApiCall = TfsApi.getTfsProjects();
    tfsApiCall
    .then(response => response.json())
    .then(json => {
        json.value.forEach(function(project) {
            var parentDeferred = Q.defer();
            TfsApi.getBuildDefinitionsForProject(project.name)
                .then(response => response.json())
                .then(json => {
                    json.value.forEach(function(definition) {
                        var deferred = Q.defer();
                        TfsApi.getQueuedBuildFromProject(project.name, definition.id)
                         .then(response => response.json())
                         .then(json => {
                            if(json.count != 0)
                            {
                                if(!this.isProjectBuildOlderThanAYear(json.value[0].queueTime)) {
                                    this.projects.push({
                                        name: `${project.name} | ${definition.name}`,
                                        status: "building",
                                        requestedFor: json.value[0].requestedFor.displayName,
                                        time: json.value[0].queueTime
                                    });
                                }
                                deferred.resolve();
                            }
                            else
                            {
                                return TfsApi.getLatestBuildFromProject(project.name, definition.id)
                                .then(response => response.json())
                                .then(json => {
                                    if(json.count != 0)
                                    {
                                        if(!this.isProjectBuildOlderThanAYear(json.value[0].queueTime)) {
                                            this.projects.push({
                                                name: `${project.name} | ${definition.name}`,
                                                status: json.value[0].result,
                                                requestedFor: json.value[0].requestedFor.displayName,
                                                time: json.value[0].queueTime
                                            });
                                        }
                                    }
                                    deferred.resolve();
                                });
                            }
                        });
                        childPromises.push(deferred.promise);
                    });
                    parentDeferred.resolve();
                });
                
            parentPromises.push(parentDeferred.promise);
        });
    })
    .then(() => {
        Q.all(parentPromises).then(() => {
            Q.all(childPromises).then(() => {
                this.setProjectsToView();
                this.setLastUpdatedToView();
            });
        });
    });

    tfsApiCall.catch(() => this.setProjectsToView());
}

this.getProjects();
setInterval(this.getProjects, 30000);