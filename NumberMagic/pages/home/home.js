(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/home/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
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
                 
                    circle.setAttribute("class", "pawn");
                    circle.setAttribute("id", "pawn" + idNumber);
                    context.fillStyle = "blue";
                    context.font = "bold 16px Arial";
                    context.textAlign = "center";
                    context.fillText(idNumber, 10, 10);                    
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
        }
    });

    
    var mistakeCount = 0;
    var numpawnsleft = 50;
    function checkShapeDrop(e) {
        // Remove the 'numBox' and 'pawn' part of the id's and compare the rest of the strings. 
        var target = this.id.replace("numBox", "");
        var elt = e.dataTransfer.getData('text').replace("pawn", "");
        if (target == elt) {  // if we have a match, fill the numBox with white and show the status.
            //this.setAttribute('class', "numIn");
            this.innerHTML = "";

            //  Remove the original image to give illusion that the image is now inside the numBox            
            this.appendChild(document.getElementById(e.dataTransfer.getData('text')));
            //id('pawnHeap').removeChild(document.getElementById(e.dataTransfer.getData('text')));

            //document.getElementById(e.dataTransfer.getData('text')).style.display = "none";
            if (!(--numpawnsleft)) {
                document.getElementById("mistakeCount").innerHTML = "<span style='color: white;'>" + mistakeCount + ": Finished</span>";
            }
        }
        else {
            // Display the number of mistakes so far
            mistakeCount++;
            id("mistakeCount").innerHTML = "<span style='color: red;'>" + mistakeCount + ": Pieces don't match!</span>";
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
        for (var row = 0; row < 5; row++) {
            for (var col = 0; col < 10; col++) {
                var idNumber = row * 10 + col
                var numContainer = document.getElementById("numBox" + idNumber);
                //id('pawnHeap').appendChild(numContainer.childNodes[0]);
                id('pawnHeap').appendChild(id("pawn" + idNumber));
                numContainer.innerHTML = idNumber;
            }
        }
        mistakeCount = 0;
        numpawnsleft = 50;
        id("mistakeCount").innerHTML = 0;
    }

})();
