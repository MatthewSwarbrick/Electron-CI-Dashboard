const TfsApi = require("./tfsApi");
const TfsSettings = require("./tfsSettings");
const moment = require("moment");
const remote  = require('electron').remote;
const shell = require('electron').shell;
const path = require('path');
const url = require('url');
const Q = require("Q");
const NProgress = require("nprogress");
const $ = require("jquery");
const Notifier = require("./notifier");
const { ipcRenderer } = require('electron');

var projects = [];
var previousBuildStatuses = [];

var projectHTML = (project) => `
        <div id="${project.name}" class="project col-sm-4">
            <div class="card card-inverse ${project.status == 'building' ? 'card-warning building-card' : project.status == 'succeeded' ? 'card-success' : 'card-danger'}">
                <div class="card-header">
                    <span>${project.name}</span>
                    <i id="${project.name}-close" class="fa fa-close project-close-icon"></i>
                </div>
                <div class="card-block">
                    <p class="card-text">Started by: ${project.requestedFor}</p>
                    <p class="card-text">${moment(project.time).format("YYYY-MM-DD HH:mm")}</p>
                    <a class="build-details-link" href="${project.link}">
                        <span>View details <i class="fa fa-eye"></i><span>
                    </a>
                </div>
            </div>
        </div>`;

var hiddenProjectHTML = (projectName) => `
    <div id="${projectName}-hidden-element">
        <div class="hidden-project-element">
            <span>${projectName}</span>
            <a id="${projectName}-show" class="show-build-link pull-right">
                <span>Show build <i class="fa fa-eye"></i><span>
            </a>
        </div>
        <div class="clearfix"></div>
        <hr />
    <div>
`;

function setLastUpdatedToView() {
    var element = document.getElementById("last-updated-text");
    var lastUpdatedText = `Last updated at: ${moment().format("DD MMM HH:mm")}`;
    element.innerHTML = lastUpdatedText;
    this.removeLoadingOverlay();
};

function setProjectsToView() {
    var noProjectsToDisplayErrorMessage = document.getElementById("noProjectsErrorMessage");
    if(noProjectsToDisplayErrorMessage) {
        noProjectsToDisplayErrorMessage.parentNode.removeChild(noProjectsToDisplayErrorMessage);
    }

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

            var previousStatus = this.previousBuildStatuses.find(s => s.name == op.name);
            if(previousStatus && previousStatus.status != op.status) {
                Notifier.notify(op);
            }
        });

        this.setBuildSummaries();
        this.previousBuildStatuses = this.projects.map(p => { return { name: p.name, status: p.status} });
        this.subscribeToHideProjectButtonClickEvents();
        return;
    }

    var projectList = document.getElementById("project-list");
    projectList.innerHTML = `<p id="noProjectsErrorMessage" class="text-center col-md-12">There are no projects to display</p>`;
    this.setBuildSummaries();
    this.previousBuildStatuses = this.projects.map(p => { return { name: p.name, status: p.status} });
};

function setBuildSummaries() {
    var ignoredProjectNames = TfsSettings.getIgnoredProjects();
    if(!ignoredProjectNames) {
        ignoredProjectNames = [];
    }

    var projectsToInclude = this.projects.filter(p => !ignoredProjectNames.some(ip => ip == p.name));

    var successfulBuildCount = projectsToInclude.filter(p => p.status == "succeeded").length;
    var queuedBuildCount = projectsToInclude.filter(p => p.status == "building").length;
    var failedBuildCount = projectsToInclude.filter(p => p.status == "failed" || p.status == "canceled").length;

    var buildSummaryElement = document.getElementById("build-summary-text");
    buildSummaryElement.innerHTML = `
        <span class="badge badge-success">${successfulBuildCount} successful build${successfulBuildCount != 1 ? 's': ''}</span>
        <span class="badge badge-warning">${queuedBuildCount} building</span>
        <span class="badge badge-danger">${failedBuildCount} failed build${failedBuildCount != 1 ? 's': ''}</span>
    `;

    if(queuedBuildCount > 0) {
        ipcRenderer.send("set-icon-orange");
        return;
    }

    if(failedBuildCount > 0) {
        ipcRenderer.send("set-icon-red");
        return;
    }

    ipcRenderer.send("set-icon-green");
}

function subscribeToHideProjectButtonClickEvents() {
    this.projects.forEach(p => {
        var closeButtonForProject = document.getElementById(`${p.name}-close`);
        closeButtonForProject.addEventListener('click', event => {
            event.preventDefault();
            TfsSettings.addProjectToIgnore(p.name);
            this.hideProject(p.name);
            this.setBuildSummaries();
        });
    });
}

function hideProject(projectName) {
    var existingProjectElement = document.getElementById(projectName);
    existingProjectElement.parentNode.removeChild(existingProjectElement);

    this.addProjectToHiddenProjectList(projectName);
}

function addProjectToHiddenProjectList(projectName) {
    var hiddenProjectList = document.getElementById("hidden-project-list");
    hiddenProjectList.appendChild(document.createRange().createContextualFragment(hiddenProjectHTML(projectName)));

    var showButtonForProject = document.getElementById(`${projectName}-show`);
    showButtonForProject.addEventListener('click', event => {
        event.preventDefault();
        TfsSettings.removeProjectFromIgnoreList(projectName);
        this.removeProjectFromHiddenProjects(projectName);
        this.getProjects();
    });
}

function removeProjectFromHiddenProjects(projectName) {
    var existingProjectElement = document.getElementById(`${projectName}-hidden-element`);
    existingProjectElement.parentNode.removeChild(existingProjectElement);
}

function setSettingsButton() {
    var tfsUrl = localStorage.getItem("tfsUrl");
    var settingsButton = document.getElementById("settings-button");
    settingsButton.innerHTML = `
        <span>${tfsUrl}</span>[<a id="change-settings-link" href="#">change</a>]
    `;
};

function setLoadingOverlay() {
    NProgress.start();
    var overlayContainer = document.getElementById("loading-container");
    overlayContainer.innerHTML = `
        <div class="faded-overlay"></div>
    `;
}

function removeLoadingOverlay() {
    NProgress.done();
    var overlayContainer = document.getElementById("loading-container");
    overlayContainer.innerHTML = "";
}

function isProjectBuildOlderThanAYear(queueTime) {
    return moment.duration(moment().diff(moment(queueTime))).asYears() > 1;
};

function displayHiddenProjects() {
    TfsSettings.getIgnoredProjects().forEach(ip => {
        this.addProjectToHiddenProjectList(ip);
    });
}

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
    this.setLoadingOverlay();
    this.projects = [];
    var parentPromises = [];
    var childPromises = [];
    var ignoredProjects = TfsSettings.getIgnoredProjects();
    if(!ignoredProjects) {
        ignoredProjects = [];
    }

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
                        if(ignoredProjects.some(ip => ip == project.name + " | " + definition.name)) {
                            return;
                        }

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
                                        time: json.value[0].queueTime,
                                        link: json.value[0]._links.web.href
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
                                                time: json.value[0].queueTime,
                                                link: json.value[0]._links.web.href
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
this.displayHiddenProjects();

setInterval(this.getProjects, 30000);

$(document).on('click', 'a[href^="http"]', function(event) {
        event.preventDefault();
        shell.openExternal(this.href);
    }
);

$('.collapse').on('shown.bs.collapse', function() {
    $(this).parent().find(".fa-plus").removeClass("fa-plus").addClass("fa-minus");
    }).on('hidden.bs.collapse', function(){
    $(this).parent().find(".fa-minus").removeClass("fa-minus").addClass("fa-plus");
});