
var appData = Windows.Storage.ApplicationData.current;
var localSettings = appData.localSettings;

function score_post(score_post_string) {
    WinJS.xhr({
        type: "post",
        url: "http://www.kvasix.com/NumberMagic/scoreupdate.php",
        responseType: 'json',
        headers: { "Content-type": "application/x-www-form-urlencoded" },
        data: score_post_string
    }).done(   //
        function complete(result) {
            if (result.status === 200) {
                //console.log(result.responseText);
                var jsonContent = JSON.parse(result.responseText);//eval('(' + result.responseText + ')');//result.responseJSON; //
                //console.log(jsonContent);
                /*
                if (jsonContent['upgradesuccess']) {
                    localSettings.values["usrName"] = jsonContent['usrName'];//"Gautam";//get from server
                    localSettings.values["level"] = jsonContent['level'];//23;//get from server
                    id("greetings").innerHTML = "Hi " + localSettings.values["usrName"] + "! Welcome to Number Magic.";
                    id("userStatus").innerHTML = "You are in Level: " + localSettings.values["level"];
                    id("logindiv").style.display = "none";
                    id("signout").style.display = "block";
                } else {
                    id("greetings").innerHTML = "Login Failed!";
                    id("userStatus").innerHTML = "Please enter the right username and password";
                }
                */
            }
        },
        function error(result) {
            /*
            id("greetings").innerHTML = "Connection Error!";
            id("userStatus").innerHTML = "Error connecting to Database! Please check your network.";
            */
        },
        function progress(progress) {
        }
    );
}

function upgradeLevel(this_level) {
    var new_level = this_level + 1;
    if (new_level > localSettings.values["level"]) {
        var upgradelevel_post_string = "sid=" + localSettings.values["sid"] + "&level=" + new_level;
        WinJS.xhr({
            type: "post",
            url: "http://www.kvasix.com/NumberMagic/upgradelevel.php",
            responseType: 'json',
            headers: { "Content-type": "application/x-www-form-urlencoded" },
            data: upgradelevel_post_string
        }).done(   //
          function complete(result) {
              if (result.status === 200) {
                  //console.log(result.responseText);
                  var jsonContent = JSON.parse(result.responseText);//eval('(' + result.responseText + ')');//result.responseJSON; //
                  //console.log(jsonContent);

                  if (jsonContent['upgradesuccess']) {
                      localSettings.values["level"] = jsonContent['level'];//23;//get from server
                      return "You've been upgraded to the next level!!!";
                  } else {
                      return "Upgrade Failed! Database Error.";
                  }
              }
          },
          function error(result) {
              return "Upgrade Failed! Network Error.";
          },
          function progress(progress) {
          }
        );
    } else {
        return "Aren't you playing this level again?";
    }
}

function redirect_to_next_level(present_level) {
    var next_level = present_level + 1;
    if (next_level == 0) {
        WinJS.Navigation.navigate("/pages/blank/blank.html", next_level);
    } else if (next_level < 8) {
        WinJS.Navigation.navigate("/pages/110/110.html", next_level);
    } else if (next_level == 10 || next_level == 14) {
        WinJS.Navigation.navigate("/pages/more/more.html", next_level);
    } else if (next_level <= 13) {
        WinJS.Navigation.navigate("/pages/1120/1120.html", next_level);
    } else if (next_level == 17) {
        WinJS.Navigation.navigate("/pages/more/more.html", next_level);
    } else if (next_level <= 20) {
        WinJS.Navigation.navigate("/pages/2130/2130.html", next_level);
    } else if (next_level == 21) {
        WinJS.Navigation.navigate("/pages/301/301.html", next_level);
    } else if (next_level == 22) {
        WinJS.Navigation.navigate("/pages/150/150.html", next_level);
    } else if (next_level == 23) {
        WinJS.Navigation.navigate("/pages/1100/1100.html", next_level);
    }
}