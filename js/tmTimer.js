var audioElement;
var counter = 1;
var selected = -1;
var minimum = 0;
var average = 0;
var maximum = 0;
var selectedColor = 0;
var green = 0;
var yellow = 0;
var red = 0;
var isBeepEnabled = "false";
var lastColor = "white";
var isPaused = false;
var isStarted = false;
var isCustom = false;
var bColors = ["white", "black"];
var supportsOrientationChange = "onorientationchange" in window, orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

var times = [
				//QA (30s)
				[10, 20, 30],
				//Ice-breaker
				[240, 300, 360],
				//1-9 (5 to 7)
				[300, 360, 420],
				//10 (8 to 10)
				[480, 540, 600],
				//Evaluator intro
				[60, 75, 90],
				//Evaluator
				[120, 150, 180],
				//General Evaluator
				[300, 330, 360],
				//TT
				[60, 90, 120],
				//12m
				[600, 660, 720],
				//15m
				[780, 840, 900],
				//20m
				[1080, 1170, 1200]
			];

function getTime(){
	return (new Date).clearTime().addSeconds(counter).toString('H:mm:ss');
}

/**
 * Determine the mobile operating system.
 * This function returns one of 'iOS', 'Android', 'Windows Phone', or 'unknown'.
 *
 * @returns {String}
 */
function getMobileOperatingSystem() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

      // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }

    return "unknown";
}

function btnStopClick(isAdded) {
	var member = $("#txtMember").val();
	var currentTime = getTime();

	if (isStarted && isAdded) {
		addNewTime(member, $("#selectTimes").find(":selected").text(), currentTime, lastColor);
	}
	
	$("#btnPause").hide();
	$("#btnPlay").show();

	lastColor = bColors[selectedColor];
	document.body.style.backgroundColor = lastColor;
	$('#divCurrentTime').css('background-color', lastColor);
    $('#timeContent').css('background-color', lastColor);
	$("#pTime").text("0:00:00");
	$("#txtMember").val("");
	selected = -1;
	counter = 1;
	isPaused = true;
	isStarted = false;
    if (selectedColor == 0) {
        $("#pTime,.lblFooter").css('color', "black");
        changeImages("-gray");
    } else {
        $("#pTime,.lblFooter").css('color', "white");
        changeImages("");
    }
	$('#selectTimes').prop('disabled', false);
	$('#btnRestart').prop('disabled', false);
	green = 0;
	red = 0;
	yellow = 0;
}

function btnStartClick(){
	if (isStarted) {
		return;
	}
	isStarted = true;
	isPaused = false;
	selected = $("#selectTimes").val();
	
	if (selected == "" || selected == null) {
		return;
	}
	
	if (!isCustom) {
		minimum = times[selected][0];
		average = times[selected][1];
		maximum = times[selected][2];
	}
	startTimer();
	$('#selectTimes').prop('disabled', 'disabled');
	$('#btnRestart').prop('disabled', 'disabled');
	if (selectedColor == 0) {
		changeImages("-gray");
	} else{
		changeImages("");
	}
}

function btnPauseClick(){
	isPaused = true;
}

function startBeep(){
	if (isBeepEnabled == "true") {
		if (green == 1 || yellow == 1 || red == 1) {
			audioElement.play();
			setTimeout(function(){ audioElement.pause(); }, 500);
		} else {
			audioElement.pause();
		}
	}
}

function startTimer(){
	var setTime = setInterval(function() { 
		if (isPaused) {
			clearInterval(setTime);
		} else {
			$("#pTime").text(getTime());
			if (counter >= minimum && counter < average) {
				changeImages("");
				lastColor = "green";
				$("#pTime,.lblFooter").css('color', "white");
				green++;
				startBeep();
			} else if (counter >= average && counter < maximum) {
				changeImages("-gray");
				lastColor = "yellow";
				$("#pTime,.lblFooter").css('color', "black");
				yellow++;
				startBeep();
			} else if (counter >= maximum){
				changeImages("");
				lastColor = "red";
				$("#pTime,.lblFooter").css('color', "white");
				red++;
				startBeep();
			} else{
				lastColor = bColors[selectedColor];
			}
            document.body.style.backgroundColor = lastColor;
            $('#timeContent').css('background-color', lastColor);
            $('#divCurrentTime').css('background-color', lastColor);
            counter++;
		}
	}, 1000 );
}

function changeImages(extra) {
	$("#btnPlay").attr('src', "images/play" + extra + ".png");
	$("#btnPause").attr('src', "images/pause" + extra + ".png");
	$("#btnStop").attr('src', "images/stop" + extra + ".png");
	if (!isPaused && isStarted){
		$("#btnRestart").attr('src', "images/restart" + extra + "-dis.png");
        $("#btnRestart").attr('title', currentTranslation.titleRestart2);
	}
	else{
		$("#btnRestart").attr('src', "images/restart" + extra + ".png");
        $("#btnRestart").attr('title', currentTranslation.titleRestart);
	}
	$("#btnTable").attr('src', "images/table" + extra + ".png");
	$("#btnTimer").attr('src', "images/timer" + extra + ".png");
	$("#btnInvert").attr('src', "images/invert-colors" + extra + ".png");
	if (isBeepEnabled == "true"){
		$("#btnBeep").attr('src', "images/volume" + extra + ".png");	
	} else {
		$("#btnBeep").attr('src', "images/volume-off" + extra + ".png");	
	}
}

function changeImagesByColor(){
	if (selectedColor == 0 && (lastColor == "white" || lastColor == "yellow")){
		changeImages("-gray");			
	} else{
		changeImages("");
	}
}

window.addEventListener(orientationEvent, function() {
    resizeDivImage();
}, false);

function resizeDivImage() {
    var newSize = $(window).height() - $(".bottom-footer").height() - $("#options").height();
    $(".divImage").height(newSize);
    if ($(window).width() >= 520) $("#btnPlay").width(newSize);
}

function setBeep(beep) {
    if (localStorage.getItem("myBeep") !== null) {
        localStorage.removeItem("myBeep");
    }
	localStorage.setItem("myBeep", beep);
}

function setColor(color) {
    if (localStorage.getItem("myPreferedColor") !== null) {
        localStorage.removeItem("myPreferedColor");
    }
	localStorage.setItem("myPreferedColor", color);
}

function getBeep() {
    if (localStorage.getItem("myBeep") !== null) {
		isBeepEnabled = localStorage.getItem("myBeep");
    } else {
		setBeep(isBeepEnabled);
	}
}

function getCurrentColor() {
    if (localStorage.getItem("myPreferedColor") !== null) {
		selectedColor = parseInt(localStorage.getItem("myPreferedColor"));
    } else {
		setColor(selectedColor);
	}
}

function setVolumeImg() {
	setBeep(isBeepEnabled);
	if (selectedColor == 0 && (lastColor == "white" || lastColor == "yellow")) {
		if (isBeepEnabled == "false") {
			$("#btnBeep").attr('src', "images/volume-off-gray.png");
		} else {
			$("#btnBeep").attr('src', "images/volume-gray.png");
		}
	}
	else {
		if (isBeepEnabled == "false") {
			$("#btnBeep").attr('src', "images/volume-off.png");
		} else {
			$("#btnBeep").attr('src', "images/volume.png");
		}
	}
}

function setImgAndBng() {
    if (selectedColor == 1) {
        changeImages("");
        $("#pTime,.lblFooter").css('color', "white");
    } else {
        changeImages("-gray");
        $("#pTime,.lblFooter").css('color', "black");
    }
    setColor(selectedColor);
    lastColor = bColors[selectedColor];
    document.body.style.backgroundColor = lastColor;
    $('#timeContent').css('background-color', lastColor);
    $('#divCurrentTime').css('background-color', lastColor);
}

$(function(){
	audioElement = document.createElement('audio');
    audioElement.setAttribute('src', 'sounds/beep.mp3');
    
    audioElement.addEventListener('ended', function() {
        this.play();
    }, false);
    
    audioElement.addEventListener("canplay",function(){});
    
    audioElement.addEventListener("timeupdate",function(){});
	
	initializeDB();
    setTimeout(function () {
        resizeDivImage();
    }, 50);
	$('[data-toggle="tooltip"]').tooltip();
	$(".timing").timingfield();
    $("#cTopic").html("<b>" + currentTranslation.meetingAt + " " + (new Date).toString('dd/MM/yyyy') + "</b>");
	$('#selectTimes').select2({
		placeholder: currentTranslation.chooseTime
	}).on('change', function() {
		if ($(this).val() == "11"){
			$("#divCustomTime").modal();
		} else{
			isCustom = false
		}
	});
	$("#linkResults").click(function(){
		countTimetable();
		printTable();
		$("#divResults").modal();
	});
	$("#btnPlay").click(function(){
		var state = $("#selectTimes").val();
		if (state == "" || state == null) {
			var x = document.getElementById("snackbar")
			x.className = "show";
			setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
			return;
		}
		isStarted = false;
		btnStartClick();
		$(this).hide();
		$("#btnPause").show();
		changeImagesByColor();
	});
	$("#btnPause").click(function(){
		btnPauseClick();
		$(this).hide();
		$("#btnPlay").show();
		changeImagesByColor();
	});
	$("#btnStop").click(function(){
		btnStopClick(true);
	});
	$("#btnBeep").click(function(){
		if (isBeepEnabled == "true"){
			isBeepEnabled = "false";
		} else {
			isBeepEnabled = "true";
		}
		setVolumeImg();
	});
	$("#btnRestart").click(function(){
		btnStopClick(false);
        isCustom = false
        minimum = 0;
        average = 0;
        maximum = 0;
        $("#selectTimes").select2({
            placeholder: currentTranslation.chooseTime
        }).val("").trigger("change");
	});
	
	$("#btnSave").click(function(){
		var minTime = parseInt($("input[type=text]")[2].value * 360) + parseInt($("input[type=text]")[3].value * 60) + parseInt($("input[type=text]")[4].value);
		var avgTime = parseInt($("input[type=text]")[6].value * 360) + parseInt($("input[type=text]")[7].value * 60) + parseInt($("input[type=text]")[8].value);
		var maxTime = parseInt($("input[type=text]")[10].value * 360) + parseInt($("input[type=text]")[11].value * 60) + parseInt($("input[type=text]")[12].value);

        if (minTime >= avgTime) {
            $("#pError").html(currentTranslation.errorMin + "<br/>");
        }
        else if (minTime >= maxTime) {
            $("#pError").html(currentTranslation.errorHalf + "<br/>");
        }
        else if (avgTime >= maxTime) {
            $("#pError").html(currentTranslation.errorMax + "<br/>");
        } else {
			isCustom = true;
			minimum = minTime;
			average = avgTime;
			maximum = maxTime;
			$('#divCustomTime').modal('toggle');
		}
	});
	
	$("#btnInvert").click(function(){
        if (selectedColor == 0) {
            selectedColor = 1;
        } else {
            selectedColor = 0;
        }
		setImgAndBng();
    });
	
	$("#btnConfirm").click(function(e){
		e.preventDefault();
		isStarted = false;
		btnStopClick(false);
		clearTimetable();
		$("#hNoResults").show();
        $("#btnDelete").hide();
		$("#tblResults").hide();
	});
	
	$("[data-toggle]").click(function () {
		var _this = this;
		setTimeout(function() { $(_this).tooltip('hide'); }, 1500);
	});
	
	getCurrentColor();
	getBeep();
	setImgAndBng();
	setVolumeImg();
	
	var os = getMobileOperatingSystem();
	if (os == "iOS" || os == "Android"){
		$("#btnBeep").hide();
	}
});
