// For an introduction to the Navigation template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232506
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;

    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    return nav.navigate(Application.navigator.home);
                }
            }));

            if (localSettings.values["usrName"]) {
                id('usrName').value = localSettings.values["usrName"];
            } else {
                localSettings.values["usrName"] = id('usrName').value;
            }

            if (localSettings.values["volume"]) {
                id('volume').value = localSettings.values["volume"] * 100;
            }
            else {
                id('volume').value = 100;
                localSettings.values["volume"] = 1.0;
            }

            id('home').addEventListener("click", homeBoard, false);
            id('scramble').addEventListener("click", scrambleBoard, false);
            id('graph').addEventListener("click", renderGraph, false);
            id('highscores').addEventListener("click", showScores, false);
            id('volume').addEventListener("change", changeVolume, false);
            id('usrName').addEventListener("change", changeusrName, false);
            id('selectpage').addEventListener("click", changepage, false);
            id('loginflybtn').addEventListener("click", clearloginstatus, false);
            //localSettings.values.remove("highscores");
        }
    });

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        app.sessionState.history = nav.history;
    };     

    app.start();

    var appData = Windows.Storage.ApplicationData.current;
    var localSettings = appData.localSettings;
    function id(elementId) {
        return document.getElementById(elementId);
    }

    function homeBoard(eventInfo) {
        eventInfo.preventDefault();
        WinJS.Navigation.navigate("/pages/home/home.html");
    }

    function scrambleBoard(eventInfo) {
        eventInfo.preventDefault();
        WinJS.Navigation.navigate("/pages/scrambled/scrambled.html");
    }

    function renderGraph(eventInfo) {
        eventInfo.preventDefault();
        WinJS.Navigation.navigate("/pages/graph/graph.html");
    }

    function showScores(eventInfo) {
        eventInfo.preventDefault();
        WinJS.Navigation.navigate("/pages/highscores/highscore.html");
    }

    function changeVolume(eventInfo) {
        localSettings.values["volume"] = id('volume').value / 100;//eventInfo.srcElement.nodeValue;
    }

    function changeusrName(eventInfo) {
        localSettings.values["usrName"] = id('usrName').value;//eventInfo.srcElement.nodeValue;
        id('login_success').style.visibility = "visible";
    }

    var previousSelected = 5;
    function changepage(eventInfo) {
        if (previousSelected != id('selectpage').options.selectedIndex) {
            WinJS.Navigation.navigate("/pages/normal/" + id('selectpage').options.selectedIndex + ".html");
            previousSelected = id('selectpage').options.selectedIndex
        }
    }

    function clearloginstatus(eventInfo) {
        id('login_success').style.visibility = "hidden";
        id('login_failed').style.visibility = "hidden";
    }
})();
