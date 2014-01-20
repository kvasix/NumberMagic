(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/normal/normal.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            for (var fnum = 0; fnum <= 10; fnum++) {
                var row = document.createElement("tr");

                var fixed = document.createElement("td");
                fixed.innerText = options.toString();

                var mult = document.createElement("td");
                mult.innerText = " x ";

                var numCol = document.createElement("td");
                numCol.innerText = fnum;
                
                var equals = document.createElement("td");
                equals.innerText = " = ";

                var result = document.createElement("td");
                result.innerText = fnum * fixed.innerText;

                row.appendChild(fixed);
                row.appendChild(mult);
                row.appendChild(numCol);
                row.appendChild(equals);
                row.appendChild(result);
                
                id('readTable').appendChild(row);
            }

            for (var fnum = 0; fnum <= 10; fnum++) {
                var row = document.createElement("tr");

                var fixed = document.createElement("td");
                fixed.innerText = options.toString();

                var mult = document.createElement("td");
                mult.innerText = " x ";

                var numCol = document.createElement("td");
                numCol.innerText = fnum;

                var equals = document.createElement("td");
                equals.innerText = " = ";

                var result = document.createElement("td");
                var resBox = document.createElement("input");
                resBox.id = fnum * fixed.innerText;
                resBox.addEventListener("change", checkResult, false);
                resBox.size = 3;
                result.appendChild(resBox);

                row.appendChild(fixed);
                row.appendChild(mult);
                row.appendChild(numCol);
                row.appendChild(equals);
                row.appendChild(result);

                id('testTable').appendChild(row);
            }
        }
    });

    function checkResult(eventInfo) {
        
    }

    function id(element) {
        return document.getElementById(element);
    }
})();
