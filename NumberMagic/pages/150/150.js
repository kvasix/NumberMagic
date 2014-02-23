﻿(function () {
    "use strict";

    var NUM_PAWNS, NUM_START, NUM_ROWS = 5, NUM_COLS = 10, this_level, MISTAKE_THRESHOLD = 5;
    var numGrid = null;

    WinJS.UI.Pages.define("/pages/150/150.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.

            this_level = parseInt(options.toString());

            NUM_START = 1;
            NUM_PAWNS = 50;

            window.addEventListener("dragstart", function (e) { e.preventDefault(); }, false);

            numGrid = document.getElementById("numGrid50");
            numGrid._gesture = new MSGesture();
            numGrid._gesture.target = numGrid;
            numGrid.addEventListener("MSPointerDown", setupGesture, false);
            numGrid.addEventListener("MSGestureStart", startGesture, false);
            numGrid.addEventListener("MSGestureHold", holdGesture, false);
            numGrid.addEventListener("MSGestureChange", rotateElement, false);
            //console.log("gesture event listeners setup");

            for (var row = 0; row < NUM_ROWS; row++) {
                var numrow = document.createElement("tr");
                for (var col = 0; col < NUM_COLS; col++) {
                    var numContainer = document.createElement("td");
                    numContainer.setAttribute("class", "numContainer");

                    var idNumber = row * NUM_COLS + col + NUM_START;
                    numContainer.setAttribute("id", "numBox" + idNumber);
                    //numContainer.innerHTML = idNumber;
                    numContainer.background = "images/tables/" + idNumber + ".jpg";//"images/tables/blank.jpg"; //

                    numContainer.setAttribute("ondragover", "return false;");

                    numrow.appendChild(numContainer);
                }
                numGrid.appendChild(numrow);
            }

            populateArray();
            for (var idnum = NUM_START; idnum < NUM_START + NUM_PAWNS; idnum++) {
                var circle = document.createElement("img");
                circle.src = "/images/pawns/" + numArray[idnum - NUM_START] + ".jpg";
                circle.setAttribute("alt", "pawn" + numArray[idnum - NUM_START]);

                circle.setAttribute("id", "pawn" + numArray[idnum - NUM_START]);

                circle._gesture = new MSGesture();
                circle._gesture.target = circle;
                circle.addEventListener("MSPointerDown", setupPGesture, false);
                circle.addEventListener("MSGestureStart", startGesture, false);
                circle.addEventListener("MSGestureHold", holdGesture, false);
                circle.addEventListener("MSGestureChange", manipulateElement, false);
                circle.addEventListener("MSGestureEnd", checkpawnpos, false);

                //id('pawnHeap50' + randint(1, 2)).appendChild(circle);
                //id('pawnHeap50' + ((idnum % 2)+1)).appendChild(circle);

                circle.className = "pawnHeap50" + ((idnum % 2) + 1);
                id('sec').appendChild(circle);
            }
            placePawns();

            numpawnsleft = NUM_PAWNS;
            enableRightHeap = true;
            toggleHeap(enableRightHeap);

            //id('pawnHeap501').addEventListener("mousedown", updateHandStatus, false);
            //id('pawnHeap502').addEventListener("mousedown", updateHandStatus, false);

            id('reset').addEventListener("click", resetPawns, false);
            timeCtrl = setInterval(timer, 500);

            gotRightAudio = new Audio("/sounds/right.wma");
            gotRightAudio.load();
            gotWrongAudio = new Audio("/sounds/wrong.wma");
            gotWrongAudio.load();
            applaudAudio = new Audio("/sounds/applause.wma");
            applaudAudio.load();
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
            clearInterval(timeCtrl);
            hours = 0, mins = 0, secs = 0;
        }
    });

    function updateHandStatus(eventInfo) {
        var heapid = parseInt(this.id.replace("pawnHeap50", "")) - 1;
        if (heapid ^ enableRightHeap) {
            if (enableRightHeap) {
                id('guide').innerHTML = "Use your right hand --->";
                id('guide').style.textAlign = "right";
            } else {
                id('guide').innerHTML = "<--- Use your left hand";
                id('guide').style.textAlign = "left";
            }
        } else {
            id('guide').innerHTML = "";
        }
    }

    // Restore the user's volume
    var appData = Windows.Storage.ApplicationData.current;
    var localSettings = appData.localSettings;

    var timeCtrl = null;
    var mistakeCount = 0;
    var numpawnsleft;
    var gotRightAudio, gotWrongAudio, applaudAudio;
    var enableRightHeap;
    function toggleHeap(enableRight) {
    }

    function checkpawnpos(e) {
        // Don't manipulate the object if it is pinned
        if (e.currentTarget._pinned) {
            return;
        }

        var elements = document.msElementsFromPoint(e.clientX, e.clientY);
        if (elements) {
            for (var i = elements.length - 1; i >= 0; i--) {
                //console.log(elements[i].tagName);
                if (elements[i].tagName === "td" || elements[i].tagName === "TD") {
                    checkShape(elements[i], this);
                }
            }
        }
    }

    function checkShape(e1, e2) {
        //console.log(e1.id);
        //console.log(e2.id);
        // Remove the 'numBox' and 'pawn' part of the id's and compare the rest of the strings. 
        var target = e1.id.replace("numBox", "");
        var elt = e2.id.replace("pawn", "");
        if (target == elt) {  // if we have a match, fill the numBox with white and show the status.
            var pawn = e2;
            pawn._pinned = true;
            id('numGrid50')._pinned = true;

            gotRightAudio.volume = localSettings.values["volume"];
            gotRightAudio.play();

            toggleHeap(enableRightHeap);

            if (!(--numpawnsleft)) {
                clearInterval(timeCtrl);
                applaudAudio.volume = localSettings.values["volume"];
                applaudAudio.play();
                var message = "Good Job, " + localSettings.values["usrName"] + "!!! You've completed the game in " +
                    (hours < 10 ? "0" : "") + hours + ":" + (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs +
                     " with " + mistakeCount + " mistakes. ";
                if (mistakeCount > MISTAKE_THRESHOLD) {
                    message += "Why don't you try it again?";
                }
                else {
                    message += upgradeLevel();
                }
                var msgBox = new Windows.UI.Popups.MessageDialog(message);
                msgBox.showAsync();

                var score_post_string = "sid=" + localSettings.values["sid"] + "&date=" + 12 + "&level=" + this_level;
                score_post_string += "&mistakes=" + mistakeCount + "&timetaken=" + ((hours * 60 + mins) * 60 + secs);
                WinJS.xhr({
                    type: "post",
                    url: "http://www.kumonivanhoe.com.au/NumberMagic/scoreupdate.php",
                    responseType: 'json',
                    headers: { "Content-type": "application/x-www-form-urlencoded" },
                    data: score_post_string
                }).done(   //
                  function complete(result) {
                      if (result.status === 200) {
                          console.log(result.responseText);
                          var jsonContent = JSON.parse(result.responseText);//eval('(' + result.responseText + ')');//result.responseJSON; //
                          console.log(jsonContent);
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
            id("mistakeCount").innerHTML = mistakeCount;
        }
        else {
            // Display the number of mistakes so far
            mistakeCount++;
            id("mistakeCount").innerHTML = mistakeCount + ": Pieces don't match!";
            gotWrongAudio.volume = localSettings.values["volume"];
            gotWrongAudio.play();
        }
    }


    function id(elementId) {
        return document.getElementById(elementId);
    }

    function min(x, y) {
        if (x < y)
            return x;
        else
            return y;
    }

    function resetPawns() {
        id('numGrid50').style.msTransform = "none";
        id('numGrid50')._pinned = false;
        populateArray();

        //console.log(NUM_START);
        for (var idnum = NUM_START; idnum < NUM_START + NUM_PAWNS; idnum++) {
            //console.log(NUM_START);
            var pawn = id("pawn" + numArray[idnum - NUM_START]);
            //console.log(pawn.id);
            pawn.style.msTransform = "none";
            pawn.className = 'pawnHeap50' + randint(1, 2);
            pawn._gesture = new MSGesture();// is this required?
            pawn._gesture.target = pawn;// is this required?
            pawn._pinned = false;
        }
        placePawns();
        /*
                for (var row = 0; row < NUM_ROWS; row++) {
                    for (var col = 0; col < NUM_COLS; col++) {
                        var idNumber = row * NUM_COLS + col + NUM_START;
                        var numContainer = document.getElementById("numBox" + idNumber);
                        numContainer.innerHTML = idNumber;
                    }
                }
        */
        toggleHeap(enableRightHeap);
        id('guide').innerHTML = "Board Reset!";
        id('guide').style.textAlign = "center";

        mistakeCount = 0;
        numpawnsleft = NUM_PAWNS;
        id("mistakeCount").innerHTML = 0;
        clearInterval(timeCtrl);
        hours = 0, mins = 0, secs = 0;
        timeCtrl = setInterval(timer, 500);
    }

    function placePawns() {
        var elesleft = document.getElementsByClassName("pawnHeap501");
        if (elesleft) {
            for (var i = 0; i < elesleft.length; i++) {
                elesleft[i].style.position = "absolute";
                elesleft[i].style.zindex = 0;
                elesleft[i].style.left = randint(0, 9) + "%";//Math.floor(Math.random()* 291) + 6;//(randint(6, 300 - 3));
                //console.log(parseInt(elesleft[i].style.left));
                elesleft[i].style.top = randint(18, 90) + "%";
                //console.log(elesleft[i].style.top);
                //elesleft[i].style.display = "none";
            }
        }

        var elesright = document.getElementsByClassName("pawnHeap502");
        if (elesright) {
            for (var i = 0; i < elesright.length; i++) {
                elesright[i].style.position = "absolute";
                elesright[i].style.zindex = 0;
                elesright[i].style.left = randint(81, 93) + "%";
                elesright[i].style.top = randint(27, 90) + "%";
            }
        }
        //console.log(id('numGrid').style.left);
        //console.log(window.innerWidth);
    }

    var hours = 0, mins = 0, secs = 0;
    var blink = true;
    var separator = ":";
    function timer() {
        blink ? (++secs, separator = " ", blink = false) : (separator = ":", blink = true);
        (secs == 60) ? (++mins, secs = 0) : true;
        (mins == 60) ? (++hours, mins = 0) : true;
        id('timeCounter').innerHTML = (hours < 10 ? "0" : "") + hours + separator + (mins < 10 ? "0" : "") + mins + separator + (secs < 10 ? "0" : "") + secs;
    }

    var numArray;
    function populateArray() {
        numArray = new Array();
        var populated_count = 0;
        while (populated_count < NUM_PAWNS) {
            numArray[populated_count] = NUM_START + populated_count;
            populated_count++;
        }

        for (var i = numArray.length - 1; i > 0; i--) {
            var j = randint(0, i);

            // Swap the elements at positions i and j.
            var temp = numArray[i];
            numArray[i] = numArray[j];
            numArray[j] = temp;
        }
    }

    function randint(l, u)
        // Returns an integer uniformly distributed over l..u.
    {
        return l + Math.floor(Math.random() * (u + 1 - l));
    }

    function upgradeLevel() {
        var new_level = this_level + 1;
        if (new_level > localSettings.values["level"]) {
            var upgradelevel_post_string = "sid=" + localSettings.values["sid"] + "&level=" + new_level;
            WinJS.xhr({
                type: "post",
                url: "http://www.kumonivanhoe.com.au/NumberMagic/upgradelevel.php",
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
})();
