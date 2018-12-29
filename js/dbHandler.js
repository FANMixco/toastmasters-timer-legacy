var db;
var results = [];
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

function dbConn() {
    //Request db creation if it doesn't exist
    let request = window.indexedDB.open("tmTimerDB", 1);
    request.onerror = function (evt) {
        console.log("Database error code: " + evt.target.errorCode);
    };
    request.onsuccess = function (evt) {
        db = request.result;
        //Clear all data from the previous meeting
        if (isNewMeeting())
            clearTimetable();
        else {
            let transaction = db.transaction(["timeTable"], "readonly").objectStore("timeTable").count();
            transaction.onsuccess = function () {
                if (transaction.result === 0)
                    restoreData();
            };
        }
    };

    //Create tables
    request.onupgradeneeded = function (evt) {
        var objectStore = evt.currentTarget.result.createObjectStore("timeTable", { keyPath: "id", autoIncrement: true });
        objectStore.createIndex("member", "member", { unique: false });
        objectStore.createIndex("role", "role", { unique: false });
        objectStore.createIndex("min", "min", { unique: false });
        objectStore.createIndex("opt", "opt", { unique: false });
        objectStore.createIndex("max", "max", { unique: false });
        objectStore.createIndex("time", "time", { unique: false });
        objectStore.createIndex("lastColor", "lastColor", { unique: false });
        objectStore.createIndex("disqualified", "disqualified", { unique: false });
    };
}

function initializeDB(currentVersion, latestVersion) {
    if (latestVersion !== currentVersion) {
        try { window.indexedDB.deleteDatabase("tmTimerDB"); }
        catch (e) { }
    }
    dbConn();
}

function deleteByIDs(ids) {
    let transaction = db.transaction(["timeTable"], "readwrite");
    for (i = 0; i < ids.length; i++) {
        transaction.objectStore("timeTable").delete(ids[i]);
        $(`#tr${ids[i]}`).hide();
    }
    saveData();
    return transaction.objectStore("timeTable").count();
}

function clearTimetable() {
    db.transaction(["timeTable"], "readwrite").objectStore("timeTable").clear();
    saveData();
}

//This function is for verifying if it's the current meeting or a new one
function isNewMeeting() {
    let currentDate = (new Date).toString("yyyy/MM/dd");
    if (localStorage.getItem("meetingDate") === null) {
        localStorage.setItem("meetingDate", currentDate);
        return true;
    }
    else if (localStorage.getItem("meetingDate") !== currentDate) {
        localStorage.removeItem("meetingDate");
        localStorage.setItem("meetingDate", currentDate);
        return true;
    }
    return false;
}

function addNewTime(member, role, min, opt, max, time, lastColor, disqualified) {
    db.transaction(["timeTable"], "readwrite").objectStore("timeTable").add({ member: member, role: role, min: min, opt: opt, max: max, time: time, lastColor: lastColor, disqualified: disqualified });
    saveData();
}

function restoreData() {
    if ((new Date).toString("yyyy/MM/dd") === localStorage.getItem("backUpDate")) {
        $.each(JSON.parse("[" + localStorage.getItem("backUpTT") + "]"), function (i, item) {
            addNewTime(item.member, item.role, item.min, item.opt, item.max, item.time, item.lastColor, item.disqualified);
        });
    }
}

function saveData() {
    let transaction = db.transaction(["timeTable"], "readwrite").objectStore("timeTable").openCursor();

    var data = [];
    transaction.onsuccess = function (evt) {
        let cursor = evt.target.result;
        if (cursor) {
            data.push(JSON.stringify(cursor.value));
            cursor.continue();
        } else {
            setLocalStorage("backUpDate", (new Date).toString("yyyy/MM/dd"));
            setLocalStorage("backUpTT", data);
        }
    };
}

function countTimetable() {
    let transaction = db.transaction(["timeTable"], "readonly").objectStore("timeTable").count();
    transaction.onsuccess = function () {
        if (transaction.result > 0) {
            $("#hNoResults").hide();
            $("#tblResults,#footerResult").show();
        }
        else {
            $("#hNoResults").show();
            $("#tblResults,#footerResult").hide();
        }
    };
}

function getSeconds(hms) {
    var a = hms.split(':'); // split it at the colons

    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
}

function printTable() {
    $("#tBodyResults").empty();
    results = [];

    let transaction = db.transaction(["timeTable"], "readwrite").objectStore("timeTable").openCursor();

    transaction.onsuccess = function (evt) {
        let cursor = evt.target.result;
        if (cursor) {
            let defaultColor = "white";
            if (cursor.value.lastColor === "yellow" || cursor.value.lastColor === "black" || cursor.value.lastColor === "white")
                defaultColor = "black";

            let tempColor = cursor.value.lastColor;
            if (tempColor === "black")
                tempColor = "white";

            var fT = getSeconds(cursor.value.time);
            var mT = getSeconds(cursor.value.min);

            if (mT - 30 <= fT && fT < mT) {
                tempColor = "#CCFFCC";
                defaultColor = "black";
            }

            if (cursor.value.disqualified) {
                tempColor = "black";
                defaultColor = "white";
            }

            results.push({ member: cursor.value.member, role: cursor.value.role, min: cursor.value.min, opt: cursor.value.opt, max: cursor.value.max, time: cursor.value.time, lastColor: cursor.value.lastColor, disqualified: cursor.value.disqualified });

            $("#tBodyResults").append(`<tr id="tr${cursor.value.id}" style="background:${tempColor};color:${defaultColor}"><td class="tdDel" style="display:none"><input id="chk${cursor.value.id}" class="chkDel" type="checkbox" /></td><td>${cursor.value.member}</td><td>${cursor.value.role}</td><td style="text-align:center">${cursor.value.time}</td></tr>`);
            cursor.continue();
        } else {
            $("#divResults").modal().on('shown.bs.modal', function (w) {
                resizeModal();
                w.stopPropagation();
            });
        }
    };
}