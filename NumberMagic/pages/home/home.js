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
                for (var col = 0; col < 5; col++) {
                    var numContainer = document.createElement("td");
                    numContainer.setAttribute("class", "numContainer");

                    var circle = document.createElement("canvas")
                    circle.setAttribute("width", 100);
                    circle.setAttribute("height", 100);
                    var context = circle.getContext('2d');
                    var centerX = circle.width / 2;
                    var centerY = circle.height / 2;
                    var radius = min(centerX, centerY);

                    document.getElementById("mistakeCount").innerHTML = circle.width;
                    context.beginPath();
                    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                    context.fillStyle = 'green';
                    context.fill();
                    context.lineWidth = "1em";
                    context.strokeStyle = '#003300';
                    context.stroke();

                    numContainer.appendChild(circle);
                    numrow.appendChild(numContainer);
                }
                numGrid.appendChild(numrow);
            }
        }           
    });

    function min(x, y) {        
        if (x < y)
            return x;
        else
            return y;
    }
})();
