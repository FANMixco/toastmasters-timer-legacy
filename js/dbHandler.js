var db;
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || 	window.msIndexedDB;

function dbConn(){		
	//Request db creation if it doesn't exist
	var request = window.indexedDB.open("tmTimerDB", 1);
	request.onerror = function(evt) {
		console.log("Database error code: " + evt.target.errorCode);
	};
	request.onsuccess = function(evt) {
		db = request.result;
		//Clear all data from the previous meeting
		if (isNewMeeting()){
			clearTimetable();
		}
	};
	
	//Create tables
	request.onupgradeneeded = function (evt) {                   
		var objectStore = evt.currentTarget.result.createObjectStore("timeTable", { keyPath: "id", autoIncrement: true });
		objectStore.createIndex("member", "member", { unique: false });
		objectStore.createIndex("role", "role", { unique: false });
		objectStore.createIndex("time", "time", { unique: false });
		objectStore.createIndex("lastColor", "lastColor", { unique: false });
	};
}

function initializeDB(){
	dbConn();
}

function clearTimetable(){
	var transaction = db.transaction(["timeTable"], "readwrite");
	var objectStore = transaction.objectStore("timeTable");
	objectStore.clear();
}

//This function is for verifying if it's the current meeting or a new one
function isNewMeeting(){
	var currentDate = (new Date).toString('yyyy/MM/dd');
	if (localStorage.getItem("meetingDate") === null){
		localStorage.setItem("meetingDate", currentDate);
		return true;
	}
	else if (localStorage.getItem("meetingDate") !== currentDate){
		localStorage.removeItem("meetingDate");
		localStorage.setItem("meetingDate", currentDate);
		return true;
	}
	return false;
}

function addNewTime(member, role, time, lastColor){
	var transaction = db.transaction(["timeTable"], "readwrite");
	var objectStore = transaction.objectStore("timeTable");
	objectStore.add({ member: member, role: role, time: time, lastColor: lastColor });
}

function countTimetable(){
	var transaction = db.transaction(["timeTable"], 'readonly');
	var objectStore = transaction.objectStore("timeTable");
	var countRequest = objectStore.count();
	countRequest.onsuccess = function() {
		if (countRequest.result > 0){
			$("#hNoResults").hide();
			$("#tblResults").show();
			$("#tblActions").show();
		}
		else{
			$("#hNoResults").show();
			$("#tblResults").hide();
			$("#tblActions").hide();
		}
	}
}

function printTable(){
	$('#tBodyResults').empty();
	
	var transaction = db.transaction(["timeTable"], "readwrite");
	var objectStore = transaction.objectStore("timeTable");
	var request = objectStore.openCursor();

	request.onsuccess = function(evt) {  
		var cursor = evt.target.result;  
		if (cursor) {			
			var defaultColor = "white";	
			if (cursor.value.lastColor == "yellow" || cursor.value.lastColor == "black" || cursor.value.lastColor == "white"){
				defaultColor = "black";
			}
			
			var tempColor = cursor.value.lastColor;
			if (tempColor == "black"){
				tempColor = "white";
			}
			
			$('#tBodyResults').append('<tr style="background:'+tempColor+';color:'+defaultColor+'"><td>'+cursor.value.member+'</td><td>'+cursor.value.role+'</td><td style="text-align:center">'+cursor.value.time+'</td></tr>');
			cursor.continue();  
		}
	};
}
