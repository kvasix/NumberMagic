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
                id("signout").style.display = "none";
                id("controlpanel").style.visibility = "hidden";
            
            id('login').addEventListener("click", LogIn, false);
            id("signout").addEventListener("click", SignOut, false);

            get_all_users().then(function () {                
                id('search_sid_txt').addEventListener("keyup", search_students, false);
                id('students_select').addEventListener("click", function () { load_student(this.options[this.selectedIndex]._sid); }, false);
                id('add_upd_user_btn').addEventListener("click", add_student, false);
            });            
        }
    });

    function LogIn() {
        if (id('sid').value == "staff" && id('pass').value == "staff"
            || id('sid').value == id('pass').value) {
            id("greetings").innerHTML = "Hi! Welcome to Admininstrator's Page.";
            id("userStatus").innerHTML = "You are in the control panel";
            id("logindiv").style.display = "none";
            id("signout").style.display = "block";            
            id("controlpanel").style.visibility = "visible";
        } else {
            id("greetings").innerHTML = "Login Failed!";                      
            id("userStatus").innerHTML = "Please enter the right username and password";
        }
    }

    function SignOut() {
        id("greetings").innerHTML = "Hi! Welcome to Administrator's page";
        id("userStatus").innerHTML = "Please Sign in to see the control panel";
        id('sid').value = "";
        id('pass').value = "";
        id("logindiv").style.display = "block";
        id("signout").style.display = "none";
        id("controlpanel").style.visibility = "hidden";
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
                    id('query_status').innerText = "Student details successfully loaded";
                    db.close();
                });
            });
            id('add_upd_user_btn').innerText = "Update Student";
        } else {
            id('new_sid').value = id('search_sid_txt').value;
            id('new_name').value = "";
            id('new_pass').value = "";
            id('new_level').value = "";
            id('add_upd_user_btn').innerText = "Add Student";
        }
    }

    function add_student() {
        if (id('new_sid').value) {
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
        }
    }    

    function id(element) {
        return document.getElementById(element);
    }
    
    function changeusrName(eventInfo) {
        id('login_success').style.visibility = "visible";
    }
})();