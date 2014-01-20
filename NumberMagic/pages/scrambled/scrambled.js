(function () {
    "use strict";

    var NUM_PAWNS = 50;

    WinJS.UI.Pages.define("/pages/scrambled/scrambled.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            
            populateArray();

            var numGrid = document.getElementById("numGrid");

            for (var row = 0; row < 5; row++) {
                var numrow = document.createElement("tr");
                for (var col = 0; col < 10; col++) {
                    var numContainer = document.createElement("td");
                    numContainer.setAttribute("class", "numContainer");

                    var idNumber = row * 10 + col
                    numContainer.setAttribute("id", "numBox" + idNumber);
                    numContainer.innerHTML = idNumber;

                    var circle = document.createElement("canvas")
                    circle.setAttribute("width", 100);
                    circle.setAttribute("height", 100);
                    var context = circle.getContext('2d');
                    var centerX = circle.width / 2;
                    var centerY = circle.height / 2;
                    var radius = min(centerX, centerY);

                    //document.getElementById("mistakeCount").innerHTML = circle.width;
                    context.fillStyle = 'green';
                    context.beginPath();
                    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                    context.fill();
                 
                    
                    context.fillStyle = "blue";
                    context.font = "bold 16px Arial";
                    context.textAlign = "center";
                    context.fillText(numArray[idNumber], 10, 10);

                    /*
                    var circle = document.createElement("img");
                    circle.src = "/images/circle.png";                    
                    circle.setAttribute("alt", "pawn" + idNumber);
                    */

                    circle.setAttribute("class", "freepawn");
                    circle.setAttribute("id", "pawn" + numArray[idNumber]);
                    circle.draggable = true;
                    circle.addEventListener('dragstart', startShapeDrag, false);
                    id('pawnHeap').appendChild(circle);

                    numContainer.setAttribute("ondragover", "return false;");
                    numContainer.addEventListener('drop', checkShapeDrop, false);

                    numrow.appendChild(numContainer);
                }
                numGrid.appendChild(numrow);
            }

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
        }
    });

    var timeCtrl = null;
    var mistakeCount = 0;
    var numpawnsleft = NUM_PAWNS;
    var gotRightAudio, gotWrongAudio, applaudAudio;
    function checkShapeDrop(e) {
        // Remove the 'numBox' and 'pawn' part of the id's and compare the rest of the strings. 
        var target = this.id.replace("numBox", "");
        var elt = e.dataTransfer.getData('text').replace("pawn", "");
        if (target == elt) {  // if we have a match, fill the numBox with white and show the status.
            this.innerHTML = "";

            //  Remove the original image to give illusion that the image is now inside the numBox
            var pawn = document.getElementById(e.dataTransfer.getData('text'))
            this.appendChild(pawn);
            //id('pawnHeap').removeChild(pawn);
            pawn.setAttribute("class", "setpawn");
            pawn.draggable = false;

            gotRightAudio.volume = localSettings.values["volume"];
            gotRightAudio.play();

            if (!(--numpawnsleft)) {                
                clearInterval(timeCtrl);
                applaudAudio.volume = localSettings.values["volume"];
                applaudAudio.play();
                var msgBox = new Windows.UI.Popups.MessageDialog("Good Job, " + localSettings.values["usrName"] + "!!! You've completed the game in " +
                    (hours < 10 ? "0" : "") + hours + ":" + (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs +
                     " with " + mistakeCount + " mistakes. Why don't you try it again?");
                msgBox.showAsync();

                if(localSettings.values["highscores"])
                    localSettings.values["highscores"] = localSettings.values["highscores"] + localSettings.values["usrName"] + "," + "Scrambled" + "," + mistakeCount + "," + hours + ":" + mins + ":" + secs + ".";
                else localSettings.values["highscores"] = localSettings.values["usrName"] + "," + "Scrambled" + "," + mistakeCount + "," + hours + ":" + mins + ":" + secs + ".";
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

    // When dragging starts, set dataTransfer's data to the element's id.
    function startShapeDrag(e) {
        e.dataTransfer.setData('text', this.id);
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
        populateArray();
        for (var row = 0; row < 5; row++) {
            for (var col = 0; col < 10; col++) {
                var idNumber = row * 10 + col
                var numContainer = document.getElementById("numBox" + idNumber);
                //id('pawnHeap').appendChild(numContainer.childNodes[0]);
                id('pawnHeap').appendChild(id("pawn" + numArray[idNumber]));
                id("pawn" + idNumber).setAttribute("class", "freepawn");
                id("pawn" + idNumber).draggable = true;
                numContainer.innerHTML = idNumber;
            }
        }
        mistakeCount = 0;
        numpawnsleft = NUM_PAWNS;
        id("mistakeCount").innerHTML = 0;
        hours = 0, mins = 0, secs = 0;
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

    var numArray = new Array();
    function populateArray() {
        var populated_count = 0;
        while (populated_count < NUM_PAWNS) {
            numArray[populated_count] = populated_count++;
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
