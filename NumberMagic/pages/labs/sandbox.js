(function () {
    "use strict";

    var NUM_PAWNS, NUM_ROWS = 2, NUM_COLS = 5, MISTAKE_THRESHOLD = 5;//, indexSelected;
    var numGrid = null;

    WinJS.UI.Pages.define("/pages/labs/sandbox.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            
            //indexSelected = parseInt(options.toString());
                        
            NUM_PAWNS = 5;
            
            window.addEventListener("dragstart", function (e) { e.preventDefault(); }, false);

            numGrid = document.getElementById("numGrid");
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

                    var idNumber = row * NUM_COLS + col + 1;
                    numContainer.setAttribute("id", "numBox" + idNumber);
                    //numContainer.innerHTML = idNumber;
                    numContainer.background = "images/tables/blank.jpg";

                    numContainer.setAttribute("ondragover", "return false;");

                    numrow.appendChild(numContainer);
                }
                numGrid.appendChild(numrow);
            }

            populateArray();
            for (var idnum = 1; idnum <= NUM_PAWNS; idnum++) {
                var circle = document.createElement("img");
                circle.src = "/images/pawns/small/" + numArray[idnum - 1] + ".jpg";
                circle.setAttribute("alt", "pawn" + numArray[idnum - 1]);

                circle.setAttribute("id", "pawn" + numArray[idnum - 1]);

                circle._gesture = new MSGesture();
                circle._gesture.target = circle;
                circle.addEventListener("MSPointerDown", setupPGesture, false);
                circle.addEventListener("MSGestureStart", startGesture, false);
                circle.addEventListener("MSGestureHold", holdGesture, false);
                circle.addEventListener("MSGestureChange", manipulateElement, false);
                circle.addEventListener("MSGestureEnd", checkpawnpos, false);

                //id('pawnHeap' + randint(1, 2)).appendChild(circle);
                //id('pawnHeap' + ((idnum % 2)+1)).appendChild(circle);

                //circle.addEventListener("mousedown", updateHandStatus, false);

                circle.className = "pawnHeap" + ((idnum % 2) + 1);
                id('sec').appendChild(circle);
            }
            placePawns();

            numpawnsleft = NUM_PAWNS;
            enableRightHeap = false;
            toggleHeap(enableRightHeap);            
            
            id('reset').addEventListener("click", resetPawns, false);
            timeCtrl = setInterval(timer, 1000);

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
        var heapid = parseInt(this.id.replace("pawnHeap", "")) - 1;
        if (!(heapid ^ enableRightHeap)) {
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
        var elesleft = document.getElementsByClassName("pawnHeap1");
        var elesright = document.getElementsByClassName("pawnHeap2");

        if (!elesleft.length) enableRight = true;
        if (!elesright.length) enableRight = false;

        if (enableRight) {
            for (var i = 0; i < elesleft.length; i++) {
                if (!elesleft[i]._set) {
                    elesleft[i]._pinned = true;
                    elesleft[i].style.opacity = 0.45;
                    //elesleft[i].addEventListener("MSPointerDown", setupPGesture, false);
                }
            }
            for (var i = 0; i < elesright.length; i++) {
                if (!elesright[i]._set) {
                    elesright[i]._pinned = false;
                    elesright[i].style.opacity = 1;
                    //elesright[i].removeEventListener("MSPointerDown", setupPGesture, false);
                }
            }
            enableRightHeap = false;
        } else {
            for (var i = 0; i < elesleft.length; i++) {
                if (!elesleft[i]._set) {
                    elesleft[i]._pinned = false;
                    elesleft[i].style.opacity = 1;
                    //elesleft[i].addEventListener("MSPointerDown", setupPGesture, false);
                }
            }
            for (var i = 0; i < elesright.length; i++) {
                if (!elesright[i]._set) {
                    elesright[i]._pinned = true;
                    elesright[i].style.opacity = 0.45; 
                    //elesright[i].removeEventListener("MSPointerDown", setupPGesture, false);
                }
            }
            enableRightHeap = true;
        }
        //console.log(id('numGrid').style.left);
        //console.log(window.innerWidth);
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
                    break;
                }
            }
        }
    }

    function checkShape(e1, e2) {
        // Remove the 'numBox' and 'pawn' part of the id's and compare the rest of the strings. 
        var target = e1.id.replace("numBox", "");
        var elt = e2.id.replace("pawn", "");
        if (true) {  // This is a blank board, the child can place the pawn anywhere on the board.
            var pawn = e2;
            var pawn_rect = pawn.getClientRects()[0];
            var container_rect = e1.getClientRects()[0];
            var cssMatrix = new MSCSSMatrix(pawn.style.msTransform);
            pawn.style.msTransform = cssMatrix.translate(container_rect.left + container_rect.width / 2 - pawn_rect.left - pawn_rect.width / 2, container_rect.top + container_rect.height / 2 - pawn_rect.top - pawn_rect.height / 2);
            pawn._pinned = true;
            pawn.setAttribute("class", "set");
            //pawn.removeEventListener("mousedown");
            pawn._set = true;
            id('numGrid')._pinned = true;

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
                    message += "You've been upgraded to the next level!!!";
                    //upgradeLevel();
                }
                var msgBox = new Windows.UI.Popups.MessageDialog(message);
                msgBox.showAsync();
            }
        }
        else {
            // Display the number of mistakes so far
            mistakeCount++;
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
        id('numGrid').style.msTransform = "none";
        id('numGrid')._pinned = false
        populateArray();
        for (var idnum = 1; idnum <= NUM_PAWNS; idnum++) {
            var pawn = id("pawn" + numArray[idnum - 1]);
            pawn.style.msTransform = "none";
            pawn.className = 'pawnHeap' + randint(1, 2);
            pawn._gesture = new MSGesture();// is this required?
            pawn._gesture.target = pawn;// is this required?
            pawn._pinned = false;
            pawn._set = false;
        }
        placePawns();

        for (var row = 0; row < NUM_ROWS; row++) {
            for (var col = 0; col < NUM_COLS; col++) {
                var idNumber = row * NUM_COLS + col + 1;
                var numContainer = document.getElementById("numBox" + idNumber);
                //numContainer.innerHTML = idNumber;
            }
        }

        toggleHeap(enableRightHeap);
        id('guide').innerHTML = "Board Reset!";
        id('guide').style.textAlign = "center";

        mistakeCount = 0;
        numpawnsleft = NUM_PAWNS;
        clearInterval(timeCtrl);
        hours = 0, mins = 0, secs = 0;
        timeCtrl = setInterval(timer, 1000);
    }

    function placePawns() {
        var elesleft = document.getElementsByClassName("pawnHeap1");
        if (elesleft) {
            for (var i = 0; i < elesleft.length; i++) {
                elesleft[i].style.position = "absolute";
                elesleft[i].style.zindex = 0;
                elesleft[i].style.left = randint(6,24)+"%";//Math.floor(Math.random()* 291) + 6;//(randint(6, 300 - 3));
                //console.log(parseInt(elesleft[i].style.left));
                elesleft[i].style.top = randint(36, 90)+"%";
                //console.log(elesleft[i].style.top);
                //elesleft[i].style.display = "none";
            }
        }

        var elesright = document.getElementsByClassName("pawnHeap2");
        if (elesright) {
            for (var i = 0; i < elesright.length; i++) {
                elesright[i].style.position = "absolute";
                elesright[i].style.zindex = 0;
                elesright[i].style.left = randint(75, 93) + "%";
                elesright[i].style.top = randint(36, 90) + "%";
            }
        }
        //console.log(id('numGrid').style.left);
        //console.log(window.innerWidth);
    }

    var hours = 0, mins = 0, secs = 0;
    function timer() {        
        ++secs;
        (secs == 60) ? (++mins, secs = 0) : true;
        (mins == 60) ? (++hours, mins = 0) : true;               
        id('timeCounter').innerHTML = (hours < 10 ? "0" : "") + hours + ":" + (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
    }

    var numArray;
    function populateArray() {
        numArray = new Array();
        var populated_count = 0;
        while (populated_count < NUM_PAWNS) {
            numArray[populated_count] = ++populated_count;
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
        var new_level = 1;
        if (new_level > localSettings.values["level"])
            localSettings.values["level"] = new_level;
    }
})();
