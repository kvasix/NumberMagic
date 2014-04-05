(function () {
    "use strict";

    var appData = Windows.Storage.ApplicationData.current;
    var localSettings = appData.localSettings;

    WinJS.UI.Pages.define("/pages/home/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.

            create_sqlite_tables();

            if (!localSettings.values["level"]) {
                localSettings.values["level"] = -1;
                localSettings.values["usrName"] = "Anonymous";
                localSettings.values["sid"] = "unknown1";
            }

            if (localSettings.values["level"] >= 0) {
                id("greetings").innerHTML = "Hi " + localSettings.values["usrName"] + "! Welcome to Number Magic.";
                id("userStatus").innerHTML = "You are in Level: " + localSettings.values["level"];
                id("remoteUpdatesArea").innerHTML = localSettings.values["remoteUpdate"];
                id("logindiv").style.display = "none";
                id("signout").style.display = "block";
                id("remoteUpdatesArea").style.visibility = "visible";
            }
            else {
                id("greetings").innerHTML = "Hi! Welcome to Number Magic.";

                var packageSpecificToken;
                var nonce = null;
                packageSpecificToken =  Windows.System.Profile.HardwareIdentification.getPackageSpecificToken(nonce);
                // hardware id, signature, certificate IBuffer objects 
                // that can be accessed through properties.
                var hardwareId = packageSpecificToken.id;
                var signature = packageSpecificToken.signature;
                var certificate = packageSpecificToken.certificate;

                var dataReader = Windows.Storage.Streams.DataReader.fromBuffer(hardwareId);
                var identifier = new Array(hardwareId.length);
                dataReader.readBytes(identifier);


                id("userStatus").innerHTML = "Please Sign in to proceed playing...";
                id('sid').value = "";
                id('pass').value = "";
                id("logindiv").style.display = "block";
                id("signout").style.display = "none";
                id("remoteUpdatesArea").style.visibility = "hidden";
            }
            
            id('login').addEventListener("click", LogIn, false);
            id("signout").addEventListener("click", SignOut, false);
        }
    });

    function LogIn() {
        if (id('sid').value == "staff" && id('pass').value == "staff"
            || id('sid').value == id('pass').value) {
            localSettings.values["sid"] = "staff";
            localSettings.values["usrName"] = "Kumon";
            localSettings.values["level"] = 23;//get from server
            id("greetings").innerHTML = "Hi " + localSettings.values["usrName"] + "! Welcome to Number Magic.";
            id("userStatus").innerHTML = "You are in Level: " + localSettings.values["level"];
            id("logindiv").style.display = "none";
            id("signout").style.display = "block";
            localSettings.values["remoteUpdate"] = "You are in luck! We have added a labs page, where we test new features, depending on your feedback we will add it to the next software build";
            id("remoteUpdatesArea").innerHTML = localSettings.values["remoteUpdate"];
            id("remoteUpdatesArea").style.visibility = "visible";
        } else {
            id("greetings").innerHTML = "Login Failed!";                      
            id("userStatus").innerHTML = "Please enter the right username and password";
        }
    }

    function SignOut() {
        appData.clearAsync();
        localSettings.values["level"] = -1;
        localSettings.values["usrName"] = "Anonymous";
        localSettings.values["volume"] = 1.0;
        localSettings.values["remoteUpdate"] = "";
        id("greetings").innerHTML = "Hi! Welcome to Number Magic.";
        id("userStatus").innerHTML = "Please Sign in to proceed playing...";
        id('sid').value = "";
        id('pass').value = "";
        id("logindiv").style.display = "block";
        id("signout").style.display = "none";
        id("remoteUpdatesArea").style.visibility = "hidden";
    }

    function id(element) {
        return document.getElementById(element);
    }
    
    function changeusrName(eventInfo) {
        id('login_success').style.visibility = "visible";
    }
})();