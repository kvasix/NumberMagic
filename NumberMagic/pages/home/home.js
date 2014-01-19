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
                    context.beginPath();
                    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                    context.fillStyle = 'green';
                    context.fill();
                    context.lineWidth = "1em";
                    context.strokeStyle = '#003300';
                    context.stroke();

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
        }
    });

    
    var mistakeCount = 0;
    var numpawnsleft = 50;
    function checkShapeDrop(e) {
        // Remove the 'numBox' and 'pawn' part of the id's and compare the rest of the strings. 
        var target = this.id.replace("numBox", "");
        var elt = e.dataTransfer.getData('text').replace("pawn", "");
        if (target == elt) {  // if we have a match, fill the numBox with white and show the status.
            this.setAttribute('class', "numIn");            
            //  Remove the original image to give illusion that the image is now inside the numBox
            id('pawnHeap').removeChild(document.getElementById(e.dataTransfer.getData('text')));
            //document.getElementById(e.dataTransfer.getData('text')).style.display = "none";
            if (!(--numpawnsleft)) {
                document.getElementById("mistakeCount").innerHTML = "<span style='color: white;'>" + mistakeCount + ": Finished</span>";
            }
        }
        else {
            // Display the number of mistakes so far
            mistakeCount++;
            document.getElementById("mistakeCount").innerHTML = "<span style='color: red;'>" + mistakeCount + ": Pieces don't match!</span>";
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


})();
