(function () {
    "use strict";

    var appData = Windows.Storage.ApplicationData.current;
    var localSettings = appData.localSettings;

    WinJS.UI.Pages.define("/pages/admin/admin.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
                       
                id("greetings").innerHTML = "Hi! Welcome to Administrator's Page.";

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


                id("userStatus").innerHTML = "Please Sign in to see the control panel";
                id('sid').value = "";
                id('pass').value = "";
                id("logindiv").style.display = "block";
                id("controlpanel").style.visibility = "hidden";
            
            id('login').addEventListener("click", LogIn, false);

            get_all_users().then(function () {                
                id('search_sid_txt').addEventListener("keyup", search_students, false);
                id('students_select').addEventListener("click", function () { load_student(this.options[this.selectedIndex]._sid); }, false);
                id('add_user_btn').addEventListener("click", add_student, false);
                id('update_user_btn').addEventListener("click", update_student, false);
                id('delete_user_btn').addEventListener("click", delete_student, false);
            });            
        }
    });

    function LogIn() {
        if (id('sid').value == id('pass').value) {
            id("greetings").innerHTML = "Hi! Welcome to Admininstrator's Page.";
            id("userStatus").innerHTML = "You are in the control panel";
            id("logindiv").style.display = "none";        
            id("controlpanel").style.visibility = "visible";
        } else {
            id("greetings").innerHTML = "Login Failed!";                      
            id("userStatus").innerHTML = "Please enter the right username and password";
        }
    }

    var student_array, sid_array;
    function get_all_users() {
        student_array = new Array();
        sid_array = new Array();
        var row = 0;
        var dbPath = appData.localFolder.path + '\\db.sqlite';
        return SQLite3JS.openAsync(dbPath)
        .then(function (db) {
            return db.eachAsync('SELECT sid, username FROM Users ORDER BY username ASC', function (row_content) {
                student_array[row] = row_content.username;
                sid_array[row] = row_content.sid;
                //console.log('Get a ' + student_array[row] + ' for $' + sid_array[row]);
                row++;
            }).then(function () {
                id("students_select").innerHTML = "";
                for (var i = 0; i < student_array.length; i++) {
                    var option = document.createElement("option");
                    //console.log(student_array[i]);
                    option.innerHTML = student_array[i];
                    option._sid = sid_array[i];
                    id('students_select').appendChild(option);
                }
                var option = document.createElement("option");
                option.innerHTML = "Add new Student";
                option._sid = "";
                id('students_select').appendChild(option);
                id('query_status').innerText = "Students array successfully retrieved";
                db.close();
            });
        });
    }

    function search_students() {
        id("students_select").innerHTML = "";
        for (var i = 0; i < student_array.length; i++) {
            if (student_array[i].search(this.value.toLowerCase()) == 0) {
                var option = document.createElement("option");
                option.innerHTML = student_array[i];
                option._sid = sid_array[i];
                id('students_select').appendChild(option);
            }
        }
        var option = document.createElement("option");
        option.innerHTML = "Add new Student";
        option._sid = "";
        id('students_select').appendChild(option);
    }

    function load_student(sid) {
        if (sid != "") {
            var dbPath = appData.localFolder.path + '\\db.sqlite';
            SQLite3JS.openAsync(dbPath)
            .then(function (db) {
                return db.eachAsync('SELECT * FROM Users WHERE sid="' + sid + '"', function (row_content) {
                    id('new_sid').value = row_content.sid;
                    id('new_name').value = row_content.username;
                    id('new_pass').value = row_content.password;
                    id('new_level').value = row_content.level;
                }).then(function () {
                    show_score_table(sid);
                    id('new_sid').disabled = true;
                    id('add_user_btn').disabled = true;
                    id('update_user_btn').removeAttribute('disabled');
                    id('delete_user_btn').removeAttribute('disabled');
                    id('query_status').innerText = "Student details successfully loaded";
                    db.close();
                });
            });
        } else {
            id('new_sid').removeAttribute('disabled');
            id('new_sid').value = id('search_sid_txt').value;
            id('new_name').value = "";
            id('new_pass').value = "";
            id('new_level').value = "";
            id('add_user_btn').removeAttribute('disabled');
            id('update_user_btn').disabled = true;
            id('delete_user_btn').disabled = true;
        }
    }

    function add_student() {
        if (id('new_sid').value && id('new_name').value && id('new_pass').value && id('new_level').value) {
            var is_already_in_table = false;
            for (var i = 0; i < student_array.length; i++) {
                if (student_array[i].search(id('new_sid').value.toLowerCase()) == 0) {
                    is_already_in_table = true;
                    break;
                }
            }

            if (!is_already_in_table) {
                sqlite_add_user([id('new_sid').value, id('new_name').value, id('new_pass').value, id('new_level').value]).then(function () {
                    get_all_users().then(function () {
                        id('query_status').innerText = "Student successfully added";
                    });
                });
            } else {
                id('query_status').innerText = "An entry already exists with this Student id. Please try again, with a different student id";
            }
        } else {
            id('query_status').innerText = "All the fields are mandatory. Please complete all the fields before adding student.";
        }
    }

    function update_student() {
        if (id('new_sid').value) {
            sqlite_update_user([id('new_sid').value, id('new_name').value, id('new_pass').value, id('new_level').value]).then(function () {
                get_all_users().then(function () {
                    id('query_status').innerText = "Student successfully Updated";
                });
            });
        }
    }

    function delete_student() {
        if (id('new_sid').value) {
            sqlite_del_user(id('new_sid').value).then(function () {
                get_all_users().then(function () {
                    id('query_status').innerText = "Student successfully deleted";
                    id('new_sid').value = "";
                    id('new_name').value = "";
                    id('new_pass').value = "";
                    id('new_level').value = "";
                });
            });
        }
    }

    function id(element) {
        return document.getElementById(element);
    }
    
    function show_score_table(sid) {
        var levelArray = Array("blank", "1 - 3", "1 - 5", "1 - 5+", "6 - 10", "6 - 10+", "1 - 10", "1 - 10+",
                "11 - 15", "11 - 15+", "1 - 15+", "16 - 20", "16 - 20+", "11 - 20+", "1 - 20+",
                "21 - 25", "21 - 25+", "1 - 25+", "26 - 30", "26 - 30+", "21 - 30+", "1 - 30", "1 - 50", "1 - 100");

        var highscore_table = document.getElementById("scoretable");
        highscore_table.innerHTML = "<tr><th>Date</th><th>Level</th><th>Mistakes (Pawn > Board)</th><th>Number of Mistakes</th><th>Timetaken</th></tr>";
        var row = 0;
        var totalTimeTaken = 0, totalMistakeCount = 0, lastLevel = 0; //lastDate

        var dbPath = appData.localFolder.path + '\\db.sqlite';
        SQLite3JS.openAsync(dbPath)
        .then(function (db) {
            return db.eachAsync('SELECT * FROM Scores WHERE sid="' + sid + '"', function (row_content) {
                var row_html = document.createElement("tr");

                var date = document.createElement("td");
                date.innerText = row_content.date;
                row_html.appendChild(date);

                var level = document.createElement("td");
                level.innerText = levelArray[row_content.level];
                row_html.appendChild(level);
                if (parseInt(row_content.level) > lastLevel) lastLevel = parseInt(row_content.level);

                var mistakes = document.createElement("td");
                mistakes.innerText = "";
                var mistakes_array = row_content.mistakes.split(",");
                for (var i = 0; i < mistakes_array.length; i++) {
                    mistakes.innerHTML += mistakes_array[i] + ", ";
                    if (i % 6 == 5) mistakes.innerHTML += "<br />";
                }
                row_html.appendChild(mistakes);

                var mistakecount = document.createElement("td");
                mistakecount.innerText = row_content.mistakecount;
                row_html.appendChild(mistakecount);
                totalMistakeCount += parseInt(row_content.mistakecount);

                var timetaken = document.createElement("td");
                timetaken.innerText = "";
                totalTimeTaken += parseInt(row_content.timetaken);
                var hours_taken = Math.floor(row_content.timetaken / 3600);
                var mins_taken = (Math.floor(row_content.timetaken / 60)) % 60;
                var secs_taken = row_content.timetaken % 60;
                if (hours_taken) {
                    timetaken.innerText += hours_taken + "h "; //highscore_list[row].timetaken;//highscore_list[row].hours * 3600 + highscore_list[row].mins * 60 + highscore_list[row].secs;
                }
                if (mins_taken) {
                    timetaken.innerText += mins_taken + "m "; //highscore_list[row].timetaken;//highscore_list[row].hours * 3600 + highscore_list[row].mins * 60 + highscore_list[row].secs;
                }
                if (secs_taken) {
                    timetaken.innerText += secs_taken + "s"; //highscore_list[row].timetaken;//highscore_list[row].hours * 3600 + highscore_list[row].mins * 60 + highscore_list[row].secs;
                }
                row_html.appendChild(timetaken);

                highscore_table.appendChild(row_html);
                row++;
            }).then(function () {
                db.close();

                var hours_taken = Math.floor(totalTimeTaken / 3600);
                var mins_taken = (Math.floor(totalTimeTaken / 60)) % 60;
                var secs_taken = totalTimeTaken % 60;
                var textTimeTaken = "";
                if (hours_taken) {
                    textTimeTaken += hours_taken + "h "; //highscore_list[row].timetaken;//highscore_list[row].hours * 3600 + highscore_list[row].mins * 60 + highscore_list[row].secs;
                }
                if (mins_taken) {
                    textTimeTaken += mins_taken + "m "; //highscore_list[row].timetaken;//highscore_list[row].hours * 3600 + highscore_list[row].mins * 60 + highscore_list[row].secs;
                }
                if (secs_taken) {
                    textTimeTaken += secs_taken + "s"; //highscore_list[row].timetaken;//highscore_list[row].hours * 3600 + highscore_list[row].mins * 60 + highscore_list[row].secs;
                }

                var stats_table = document.getElementById("statstable");
                stats_table.innerHTML = "<tr><th>Last Played Date</th><th>Highest Level Attained</th><th>Total Number of Mistakes done</th><th>Total Play Time</th></tr>";
                stats_table.innerHTML += "<tr><td></td><td>" + levelArray[lastLevel] + "</td><td>" + totalMistakeCount + "</td><td>" + textTimeTaken + "</td></tr>";
            });
        });
    }


})();