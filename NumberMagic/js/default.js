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

            if (localSettings.values["volume"]) {
                id('volume').value = localSettings.values["volume"] * 100;
            }
            else {
                id('volume').value = 50;
                localSettings.values["volume"] = 0.5;
            }

            id('home').addEventListener("click", homeBoard, false);
            id('selectkidspage').addEventListener("click", changekidspage, false);
            id('selectpacerpage').addEventListener("click", changepacerpage, false);
            id('selectadvpage').addEventListener("click", changeadvpage, false);
            id('graph').addEventListener("click", renderGraph, false);
            id('highscores').addEventListener("click", showScores, false);
            id('labbtn').addEventListener("click", showlabs, false);
            id('volume').addEventListener("change", changeVolume, false);

            //localSettings.values.remove("highscores");
            id('appbar').addEventListener("beforeshow", updatelevel, false);

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
        document.getElementById('appbar').winControl.hide();
    }

    function renderGraph(eventInfo) {
        eventInfo.preventDefault();
        WinJS.Navigation.navigate("/pages/graph/graph.html");
        document.getElementById('appbar').winControl.hide();
    }

    function showScores(eventInfo) {
        eventInfo.preventDefault();
        WinJS.Navigation.navigate("/pages/highscores/highscore.html");
        document.getElementById('appbar').winControl.hide();
    }

    function changeVolume(eventInfo) {
        localSettings.values["volume"] = id('volume').value / 100;//eventInfo.srcElement.nodeValue;
    }    

    function changekidspage(eventInfo) {
        var selected_level = id('selectkidspage').options.selectedIndex;

        if (selected_level == 0) {
            WinJS.Navigation.navigate("/pages/blank/blank.html", selected_level);
        } else if (selected_level < 8) {
            WinJS.Navigation.navigate("/pages/110/110.html", selected_level);
        }

        document.getElementById('appbar').winControl.hide();
    }

    function changepacerpage(eventInfo) {
        var selected_level = id('selectpacerpage').options.selectedIndex + 8;

        if (selected_level == 10 || selected_level == 14) {
            WinJS.Navigation.navigate("/pages/more/more.html", selected_level);
        } else if (selected_level <= 13) {
            WinJS.Navigation.navigate("/pages/1120/1120.html", selected_level);
        }

        document.getElementById('appbar').winControl.hide();
    }

    function changeadvpage(eventInfo) {
        var selected_level = id('selectadvpage').options.selectedIndex + 15;

        if (selected_level == 17) {
            WinJS.Navigation.navigate("/pages/more/more.html", selected_level);
        } else if (selected_level <= 20) {
            WinJS.Navigation.navigate("/pages/2130/2130.html", selected_level);
        } else if (selected_level == 21) {
            WinJS.Navigation.navigate("/pages/301/301.html", selected_level);
        } else if (selected_level == 22) {
            WinJS.Navigation.navigate("/pages/150/150.html", selected_level);
        } else if (selected_level == 23) {
            WinJS.Navigation.navigate("/pages/1100/1100.html", selected_level);
        }

        document.getElementById('appbar').winControl.hide();
    }

    function updatelevel(eventInfo) {
        var MAX_LEVEL = 23;
        var level = parseInt(localSettings.values["level"]);

        if (level > MAX_LEVEL) {
            level = MAX_LEVEL;
        }

        if (level >= 0) {
            id('kidflybtn').removeAttribute('disabled')
            id('graph').removeAttribute("disabled");
            id('highscores').removeAttribute("disabled");
            id('labbtn').removeAttribute("disabled");

            for (var num = 0; num <= level; num++) {
                var option = id('L' + num);
                option.removeAttribute("disabled");
            }
            for (var num = level + 1; num <= MAX_LEVEL; num++) {
                var option = id('L' + num);
                option.setAttribute("disabled");
            }

            if (level >= 8) {
                id('pacerflybtn').removeAttribute('disabled');

                if (level >= 15) {
                    id('advflybtn').removeAttribute('disabled');
                } else {
                    id('advflybtn').setAttribute('disabled');
                }
            } else {
                id('pacerflybtn').setAttribute('disabled');
            }

        } else {
            id('kidflybtn').setAttribute('disabled');
            id('pacerflybtn').setAttribute('disabled');
            id('advflybtn').setAttribute('disabled');
            id('graph').setAttribute("disabled");
            id('highscores').setAttribute("disabled");
            id('labbtn').setAttribute("disabled");
        }
    }
    
    function showlabs(eventInfo) {
        eventInfo.preventDefault();
        WinJS.Navigation.navigate("/pages/labs/sandbox.html");
        document.getElementById('appbar').winControl.hide();
    }
})();
