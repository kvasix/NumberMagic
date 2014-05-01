(function () {
    "use strict";

    var NUM_PAWNS, NUM_START, NUM_ROWS = 6, NUM_COLS = 5, this_level, MISTAKE_THRESHOLD = 5;
    var numGrid = null;

    WinJS.UI.Pages.define("/pages/more/more.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.

            this_level = parseInt(options.toString());
           
            NUM_START = 1;

            if (this_level == 10) {
                NUM_PAWNS = 15;
            } else if (this_level == 14) {
                NUM_PAWNS = 20;
            } else if (this_level == 17) {
                NUM_PAWNS = 25;
            }

            window.addEventListener("dragstart", function (e) { e.preventDefault(); }, false);

            numGrid = document.getElementById("numGridm");
            numGrid._gesture = new MSGesture();
            numGrid._gesture.target = numGrid;
            numGrid.addEventListener("MSPointerDown", setupGesture, false);
            numGrid.addEventListener("MSGestureStart", startGesture, false);
            numGrid.addEventListener("MSGestureHold", holdGesture, false);
            numGrid.addEventListener("MSGestureChange", rotateElement, false);

            for (var row = 0; row < NUM_ROWS; row++) {
                var numrow = document.createElement("tr");
                for (var col = 0; col < NUM_COLS; col++) {
                    var numContainer = document.createElement("td");
                    numContainer.setAttribute("class", "numContainer");

                    var idNumber = row * NUM_COLS + col + NUM_START;
                    numContainer.setAttribute("id", "numBox" + idNumber);
                    //numContainer.innerHTML = idNumber;
                    numContainer.background = "images/tables/" + idNumber + ".jpg";

                    numContainer.setAttribute("ondragover", "return false;");

                    numrow.appendChild(numContainer);
                }
                numGrid.appendChild(numrow);
            }

            populateArray();
            for (var idnum = NUM_START; idnum < NUM_START + NUM_PAWNS; idnum++) {
                var circle = document.createElement("img");
                circle.src = "/images/pawns/small/" + numArray[idnum - NUM_START] + ".jpg";
                circle.setAttribute("alt", "pawn" + numArray[idnum - NUM_START]);

                circle.setAttribute("id", "pawn" + numArray[idnum - NUM_START]);

                circle._gesture = new MSGesture();
                circle._gesture.target = circle;
                circle.addEventListener("MSPointerDown", setupPGesture, false);
                //circle.addEventListener("MSGestureStart", startGesture, false);
                ////circle.addEventListener("MSGestureHold", holdGesture, false);
                //circle.addEventListener("MSGestureChange", manipulateElement, false);
                //circle.addEventListener("MSGestureEnd", checkpawnpos, false);

                //id('pawnHeap' + randint(1, 2)).appendChild(circle);
                //id('pawnHeap' + ((idnum % 2)+1)).appendChild(circle);

                circle._pinned = true;
                circle.className = "pawnHeap" + ((idnum % 2) + 1);
                id('sec').appendChild(circle);
            }
            placePawns();

            numpawnsleft = NUM_PAWNS;
            enableRightHeap = true;
            toggleHeap(enableRightHeap);            

            //id('pawnHeap1').addEventListener("mousedown", updateHandStatus, false);
            //id('pawnHeap2').addEventListener("mousedown", updateHandStatus, false);

            id('levelBox').innerText = this_level;
            id('start').addEventListener("click", function () {
                id('mGuide').style.visibility = 'hidden';
                id('blankDiv').style.visibility = 'hidden';
                id('greetDiv').style.visibility = 'hidden';

                timeCtrl = setInterval(timer, 1000);
                id('start').style.visibility = "hidden";
                for (var idnum = NUM_START; idnum < NUM_START + NUM_PAWNS; idnum++) {
                    var circle = id("pawn" + numArray[idnum - NUM_START]);
                    circle.addEventListener("MSGestureStart", startGesture, false);
                    //circle.addEventListener("MSGestureHold", holdGesture, false);
                    circle.addEventListener("MSGestureChange", manipulateElement, false);
                    circle.addEventListener("MSGestureEnd", checkpawnpos, false);
                    circle._pinned = false;
                }
            }, false);
            id('reset').addEventListener("click", resetPawns, false);

            //gotRightAudio = new Audio("/sounds/right.wma");
            //gotRightAudio.load();
            //gotWrongAudio = new Audio("/sounds/wrong.wma");
            //gotWrongAudio.load();
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
        var heapid = parseInt(this.id.replace("pawnHeap", "")) - 1;
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
                if (elements[i].tagName === "td" || elements[i].tagName === "TD") {
                    checkShape(elements[i], this);
                }
            }
        }
    }

    var mistakes = new Array();
    function checkShape(drop_target, pawn) {
        // Remove the 'numBox' and 'pawn' part of the id's and compare the rest of the strings. 
        var target_id = drop_target.id.replace("numBox", "");
        var pawn_id = pawn.id.replace("pawn", "");

        var pawn_rect = pawn.getClientRects()[0];
        var container_rect = drop_target.getClientRects()[0];
        var cssMatrix = new MSCSSMatrix(pawn.style.msTransform);
        pawn.style.msTransform = cssMatrix.translate(container_rect.left + container_rect.width / 2 - pawn_rect.left - pawn_rect.width / 2, container_rect.top + container_rect.height / 2 - pawn_rect.top - pawn_rect.height / 2);


        if (target_id == pawn_id) {  // if we have a match, fill the numBox with white and show the status.
            pawn._pinned = true;
            id('numGridm')._pinned = true;

            var elements = document.msElementsFromPoint(pawn_rect.left + pawn_rect.width / 2, pawn_rect.top + pawn_rect.height / 2);
            if (elements) {
                for (var i = 0; i < elements.length; i++) {
                    if ((elements[i].tagName === "img" || elements[i].tagName === "IMG") && elements[i] != pawn) {
                        var cssMatrix = new MSCSSMatrix(elements[i].style.msTransform);
                        elements[i].style.msTransform = cssMatrix.translate(9, 9);
                    }
                }
            }

            /*
            //gotRightAudio.volume = localSettings.values["volume"];
            //gotRightAudio.play();
            drop_target.background = "images/tables/" + target_id + ".jpg";
            //drop_target.class = "numContainer";
            drop_target.setAttribute("class", "numContainer");
            */

            toggleHeap(enableRightHeap);

            if (!(--numpawnsleft)) {
                var score_post_array = [localSettings.values["sid"], this_level, mistakeCount, JSON.stringify(mistakes), ((hours * 60 + mins) * 60 + secs)];
                score_post(score_post_array).then(function () {
                    clearInterval(timeCtrl);
                    applaudAudio.volume = localSettings.values["volume"];
                    applaudAudio.play();
                    var message = "Good Job, " + localSettings.values["usrName"] + "!!!<br><br><br> You've completed the game in <br><b style='color:black'>" +
                        (hours < 10 ? "0" : "") + hours + "h " + (mins < 10 ? "0" : "") + mins + "m " + (secs < 10 ? "0" : "") + secs + "s </b>" +
                         "<br> with " + mistakeCount + " mistakes. ";
                    if (mistakeCount > MISTAKE_THRESHOLD) {
                        message += "Why don't you try it again?";
                        //var msgBox = new Windows.UI.Popups.MessageDialog(message);
                        //msgBox.showAsync();
                    }
                    else {
                        message += upgradeLevel(this_level);
                        //var msgBox = new Windows.UI.Popups.MessageDialog(message);
                        //msgBox.showAsync();
                        //redirect_to_next_level(this_level);
                        id('nextLevelBtn').addEventListener("click", function () { redirect_to_next_level(this_level) }, false);
                        id('nextLevelBtn').style.visibility = 'visible';
                    }

                    id('msgBox').innerHTML = message;
                    id('replayBtn').addEventListener("click", function () { redirect_to_next_level(this_level - 1) }, false);
                    id('replayBtn').style.visibility = 'visible';
                    id('blankDiv').style.visibility = 'visible';
                    id('greetDiv').style.visibility = 'visible';
                });
            }
            id("mistakeCount").innerHTML = mistakeCount;
        }
        else {
            // Display the number of mistakes so far
            mistakes[mistakeCount] = pawn_id + ">" + target_id;
            mistakeCount++;
            id("mistakeCount").innerHTML = mistakeCount + ": Pieces don't match!";
            //gotWrongAudio.volume = localSettings.values["volume"];
            //gotWrongAudio.play();
            drop_target.background = "";
            //drop_target.class = "numContainer wrongpawn";
            drop_target.setAttribute("class", "numContainer wrongpawn");
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
        id('numGridm').style.msTransform = "none";
        id('numGridm')._pinned = false;
        for (var row = 0; row < NUM_ROWS; row++) {
            for (var col = 0; col < NUM_COLS; col++) {
                var idNumber = row * NUM_COLS + col + NUM_START;
                var numContainer = document.getElementById("numBox" + idNumber);
                numContainer.background = "images/tables/" + idNumber + ".jpg";
                numContainer.setAttribute("class", "numContainer");
            }
        }

        populateArray();
        for (var idnum = NUM_START; idnum < NUM_START + NUM_PAWNS; idnum++) {
            var pawn = id("pawn" + numArray[idnum - NUM_START]);
            pawn.style.msTransform = "none";
            pawn.className = 'pawnHeap' + randint(1, 2);
            pawn._gesture = new MSGesture();// is this required?
            pawn._gesture.target = pawn;// is this required?
            pawn._pinned = false;
        }
        placePawns();
        
        toggleHeap(enableRightHeap);
        id('guide').innerHTML = "Board Reset!";
        id('guide').style.textAlign = "center";

        mistakeCount = 0;
        numpawnsleft = NUM_PAWNS;
        id("mistakeCount").innerHTML = 0;        
        hours = 0, mins = 0, secs = 0; // timer reset
    }

    function placePawns() {
        var elesleft = document.getElementsByClassName("pawnHeap1");
        if (elesleft) {
            for (var i = 0; i < elesleft.length; i++) {
                elesleft[i].style.position = "absolute";
                elesleft[i].style.zindex = 0;
                elesleft[i].style.left = randint(0, 27) + "%";
                elesleft[i].style.top = randint(24, 90) + "%";
                //elesleft[i].style.display = "none";
            }
        }

        var elesright = document.getElementsByClassName("pawnHeap2");
        if (elesright) {
            for (var i = 0; i < elesright.length; i++) {
                elesright[i].style.position = "absolute";
                elesright[i].style.zindex = 0;
                elesright[i].style.left = randint(66, 90) + "%";
                elesright[i].style.top = randint(30, 90) + "%";
            }
        }
    }

    var hours = 0, mins = 0, secs = 0;
    var td_blink = true;
    function timer() {
        ++secs;
        (secs == 60) ? (++mins, secs = 0) : true;
        (mins == 60) ? (++hours, mins = 0) : true;
        id('timeCounter').innerHTML = (hours < 10 ? "0" : "") + hours + "h " + (mins < 10 ? "0" : "") + mins + "m " + (secs < 10 ? "0" : "") + secs + "s";

        var table_division_array = document.getElementsByClassName("numContainer wrongpawn");
        if (table_division_array) {
            if (td_blink) {
                for (var i = table_division_array.length - 1; i >= 0; i--) {
                    if (table_division_array[i].tagName === "td" || table_division_array[i].tagName === "TD") {
                        table_division_array[i].background = "images/tables/" + table_division_array[i].id.replace("numBox", "") + ".jpg";
                    }
                }
            } else {
                for (var i = table_division_array.length - 1; i >= 0; i--) {
                    if (table_division_array[i].tagName === "td" || table_division_array[i].tagName === "TD") {
                        table_division_array[i].background = "";
                    }
                }
            }
        }
        td_blink = !td_blink;
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
})();
