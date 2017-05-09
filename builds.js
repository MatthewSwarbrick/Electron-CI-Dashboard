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

var builds = [];
var previousBuildStatuses = [];

var buildHTML = (build) => `
        <div id="${build.name}" class="build col-sm-4">
            <div class="card card-inverse ${build.status == 'building' ? 'card-warning building-card' : build.status == 'succeeded' ? 'card-success' : 'card-danger'}">
                <div class="card-header">
                    <span>${build.name}</span>
                    <i id="${build.name}-close" class="fa fa-close build-close-icon"></i>
                </div>
                <div class="card-block">
                    <p class="card-text">Started by: ${build.requestedFor}</p>
                    <p class="card-text">${moment(build.time).format("YYYY-MM-DD HH:mm")}</p>
                    <a class="build-details-link" href="${build.link}">
                        <span>View details <i class="fa fa-eye"></i><span>
                    </a>
                </div>
            </div>
        </div>`;

var hiddenBuildHTML = (buildName) => `
    <div id="${buildName}-hidden-element">
        <div class="hidden-build-element">
            <span>${buildName}</span>
            <a id="${buildName}-show" class="show-build-link pull-right">
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
    NProgress.done();
};

function setBuildsToView() {
    var noBuildsToDisplayErrorMessage = document.getElementById("noBuildsErrorMessage");
    if(noBuildsToDisplayErrorMessage) {
        noBuildsToDisplayErrorMessage.parentNode.removeChild(noBuildsToDisplayErrorMessage);
    }

    if(this.builds.some(p => p)) {
        var orderedBuilds = this.builds.sort(this.compare);

        orderedBuilds.forEach(op => {
            var existingBuildElement = document.getElementById(op.name);
            if(existingBuildElement) {
                existingBuildElement.parentNode.replaceChild(document.createRange().createContextualFragment(buildHTML(op)), existingBuildElement);
            }
            else {
                var buildList = document.getElementById("build-list");
                buildList.appendChild(document.createRange().createContextualFragment(buildHTML(op)));
            }

            var previousStatus = this.previousBuildStatuses.find(s => s.name == op.name);
            if(previousStatus && previousStatus.status != op.status) {
                Notifier.notify(op);
            }
        });

        this.setBuildSummaries();
        this.previousBuildStatuses = this.builds.map(p => { return { name: p.name, status: p.status} });
        this.subscribeToHideBuildButtonClickEvents();
        return;
    }

    var buildList = document.getElementById("build-list");
    buildList.innerHTML = `<p id="noBuildsErrorMessage" class="text-center col-md-12">There are no builds to display</p>`;
    this.setBuildSummaries();
    this.previousBuildStatuses = this.builds.map(p => { return { name: p.name, status: p.status} });
};

function setBuildSummaries() {
    var ignoredBuildNames = TfsSettings.getIgnoredBuilds();
    if(!ignoredBuildNames) {
        ignoredBuildNames = [];
    }

    var buildsToInclude = this.builds.filter(p => !ignoredBuildNames.some(ip => ip == p.name));

    var successfulBuildCount = buildsToInclude.filter(p => p.status == "succeeded").length;
    var queuedBuildCount = buildsToInclude.filter(p => p.status == "building").length;
    var failedBuildCount = buildsToInclude.filter(p => p.status == "failed" || p.status == "canceled").length;

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

function subscribeToHideBuildButtonClickEvents() {
    this.builds.forEach(p => {
        var closeButtonForBuild = document.getElementById(`${p.name}-close`);
        closeButtonForBuild.addEventListener('click', event => {
            event.preventDefault();
            TfsSettings.addBuildToIgnore(p.name);
            this.hideBuild(p.name);
            this.setBuildSummaries();
        });
    });
}

function hideBuild(buildName) {
    var existingBuildElement = document.getElementById(buildName);
    existingBuildElement.parentNode.removeChild(existingBuildElement);

    this.addBuildToHiddenBuildList(buildName);
}

function addBuildToHiddenBuildList(buildName) {
    var hiddenBuildList = document.getElementById("hidden-build-list");
    hiddenBuildList.appendChild(document.createRange().createContextualFragment(hiddenBuildHTML(buildName)));

    var showButtonForBuild = document.getElementById(`${buildName}-show`);
    showButtonForBuild.addEventListener('click', event => {
        event.preventDefault();
        TfsSettings.removeBuildFromIgnoreList(buildName);
        this.removeBuildFromHiddenBuilds(buildName);
        this.getBuilds();
    });
}

function removeBuildFromHiddenBuilds(buildName) {
    var existingBuildElement = document.getElementById(`${buildName}-hidden-element`);
    existingBuildElement.parentNode.removeChild(existingBuildElement);
}

function setSettingsButton() {
    var tfsUrl = localStorage.getItem("tfsUrl");
    var settingsButton = document.getElementById("settings-button");
    settingsButton.innerHTML = `
        <span>${tfsUrl}</span>[<a id="change-settings-link" href="#">change</a>]
    `;
};

function isProjectBuildOlderThanAYear(queueTime) {
    return moment.duration(moment().diff(moment(queueTime))).asYears() > 1;
};

function displayHiddenBuilds() {
    TfsSettings.getIgnoredBuilds().forEach(ip => {
        this.addBuildToHiddenBuildList(ip);
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

function getBuilds() {
    NProgress.start();
    this.builds = [];
    var parentPromises = [];
    var childPromises = [];
    var ignoredBuilds = TfsSettings.getIgnoredBuilds();
    if(!ignoredBuilds) {
        ignoredBuilds = [];
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
                        if(ignoredBuilds.some(ip => ip == project.name + " | " + definition.name)) {
                            return;
                        }

                        var deferred = Q.defer();
                        TfsApi.getQueuedBuildFromProject(project.name, definition.id)
                         .then(response => response.json())
                         .then(json => {
                            if(json.count != 0)
                            {
                                if(!this.isProjectBuildOlderThanAYear(json.value[0].queueTime)) {
                                    this.builds.push({
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
                                            this.builds.push({
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
                this.setBuildsToView();
                this.setLastUpdatedToView();
            });
        });
    });

    tfsApiCall.catch(() => this.setBuildsToView());
}

this.getBuilds();
this.displayHiddenBuilds();

setInterval(this.getBuilds, 30000);

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