﻿(function () {
    "use strict";

    var appData = Windows.Storage.ApplicationData.current;
    var localSettings = appData.localSettings;

    WinJS.UI.Pages.define("/pages/home/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.

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
        /*
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://www.kvasix.com/NumberMagic/user_login.php", true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status === 200) {
                    console.log(xhr.responseText);
                }
            }
        };
        xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xhr.send("sid=Gautam&pass=gautam");
        */
        var user_login_post_string = "sid=" + id('sid').value + "&pass=" + id('pass').value;
        WinJS.xhr({
            type: "post",
            url: "http://www.kvasix.com/NumberMagic/user_login.php",
            responseType: 'json',
            headers: { "Content-type": "application/x-www-form-urlencoded" },
            data: user_login_post_string
        }).done(   //
          function complete(result) {
              if (result.status === 200) {
                  var jsonContent = JSON.parse(result.responseText);

                  if (jsonContent['loginsuccess']) {
                      localSettings.values["sid"] = jsonContent['sid'];
                      localSettings.values["usrName"] = jsonContent['usrName'];//"Gautam";//get from server
                      localSettings.values["level"] = jsonContent['level'];//23;//get from server
                      id("greetings").innerHTML = "Hi " + localSettings.values["usrName"] + "! Welcome to Number Magic.";
                      id("userStatus").innerHTML = "You are in Level: " + localSettings.values["level"];
                      id("logindiv").style.display = "none";
                      id("signout").style.display = "block";
                      localSettings.values["remoteUpdate"] = jsonContent["remoteHTMLMsg"];
                      id("remoteUpdatesArea").innerHTML = localSettings.values["remoteUpdate"];
                      id("remoteUpdatesArea").style.visibility = "visible";
                  } else {
                      id("greetings").innerHTML = "Login Failed!";                      
                      id("userStatus").innerHTML = jsonContent["status"];//"Please enter the right username and password";
                  }
              }
          },
          function error(result) {
              id("greetings").innerHTML = "Connection Error!";
              id("userStatus").innerHTML = "Error connecting to Database! Please check your network.";
          },
          function progress(progress) {
          }
        );
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