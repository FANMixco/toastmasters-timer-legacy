var counter = 1;
var selected = -1;
var minimum = 0;
var average = 0;
var maximum = 0;
var lastColor = "white";
var isPaused = false;
var isStarted = false;
var isCustom = false;
var bColors = ["white", "black"];
var selectedColor = 0;

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

function btnStopClick(isAdded){
	var member = $("#txtMember").val();
	var currentTime = getTime();

	if (isStarted && isAdded){
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
}

function btnStartClick(){
	if (isStarted){
		return;
	}
	isStarted = true;
	isPaused = false;
	selected = $("#selectTimes").val();
	
	if (selected == "" || selected == null){
		return;
	}
	
	if (!isCustom){
		minimum = times[selected][0];
		average = times[selected][1];
		maximum = times[selected][2];
	}
	startTimer();
	$('#selectTimes').prop('disabled', 'disabled');
	$('#btnRestart').prop('disabled', 'disabled');
	if (selectedColor == 0){
		changeImages("-gray");
	}
	else{
		changeImages("");
	}
}

function btnPauseClick(){
	isPaused = true;
}

function startTimer(){
	var setTime = setInterval( function ( ) { 
		if (isPaused) {
			clearInterval(setTime);
		}
		else {
			$("#pTime").text(getTime());
			if (counter >= minimum && counter < average) {
				changeImages("");
				lastColor = "green";
				$("#pTime,.lblFooter").css('color', "white");
			}
			else if (counter >= average && counter < maximum) {
				changeImages("-gray");
				lastColor = "yellow";
				$("#pTime,.lblFooter").css('color', "black");
			}
			else if (counter >= maximum){
				changeImages("");
				lastColor = "red";
				$("#pTime,.lblFooter").css('color', "white");
			}
			else{
				lastColor = bColors[selectedColor];
			}
            document.body.style.backgroundColor = lastColor;
            $('#timeContent').css('background-color', lastColor);
            $('#divCurrentTime').css('background-color', lastColor);
            counter++;
		}
	}, 1000 );
}

function changeImages(extra){
	$("#btnPlay").attr('src', "images/play" + extra + ".png");
	$("#btnPause").attr('src', "images/pause" + extra + ".png");
	$("#btnStop").attr('src', "images/stop" + extra + ".png");
	if (!isPaused && isStarted){
		$("#btnRestart").attr('src', "images/restart" + extra + "-dis.png");
		$("#btnRestart").attr('title', "You must stop the timer in order to restart.");
	}
	else{
		$("#btnRestart").attr('src', "images/restart" + extra + ".png");	
		$("#btnRestart").attr('title', "To restart and start from scratch (it doesn't store the speaker's time)");
	}
	$("#btnTable").attr('src', "images/table" + extra + ".png");
	$("#btnTimer").attr('src', "images/timer" + extra + ".png");
	$("#btnInvert").attr('src', "images/invert-colors" + extra + ".png");
}

function changeImagesByColor(){
	if (selectedColor == 0 && (lastColor == "white" || lastColor == "yellow")){
		changeImages("-gray");			
	}
	else{
		changeImages("");
	}
}

$(function(){
	initializeDB();
	$('[data-toggle="tooltip"]').tooltip();
	$(".timing").timingfield();
	$("#cTopic").html("<div><div style='float:left'><b>Meeting at " + (new Date).toString('dd/MM/yyyy') + "</b></div>" + '<div style="float:right"><a href="#divConfirm" data-toggle="modal" data-target="#divConfirm"><span class="glyphicon glyphicon-trash"></span></a></div></div>');
	$('#selectTimes').select2({
		placeholder: "Choose a time"
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
		if (state == "" || state == null){
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
	$("#btnRestart").click(function(){
		btnStopClick(false);
        isCustom = false
        minimum = 0;
        average = 0;
        maximum = 0;
        $("#selectTimes").select2({
			placeholder: "Choose a time"
        }).val("").trigger("change");
	});
	
	$("#btnSave").click(function(){
		var minTime = parseInt($("input[type=text]")[2].value * 360 + $("input[type=text]")[3].value * 60 + $("input[type=text]")[4].value);
		var avgTime = parseInt($("input[type=text]")[6].value * 360 + $("input[type=text]")[7].value * 60 + $("input[type=text]")[8].value);
		var maxTime = parseInt($("input[type=text]")[10].value * 360 + $("input[type=text]")[11].value * 60 + $("input[type=text]")[12].value);

		if (minTime >= avgTime){
			$("#pError").html("The minimum time cannot be greater or equal than the average time.<br/>");
		}
		else if (minTime >= maxTime){
			$("#pError").html("The minimum time cannot be greater or equal than the maximum time.<br/>");
		}
		else if (avgTime >= maxTime){
			$("#pError").html("The average time cannot be greater or equal than the maximum time.<br/>");
		}
		else {
			isCustom = true;
			minimum = minTime;
			average = avgTime;
			maximum = maxTime;
			$('#divCustomTime').modal('toggle');
		}
	});
	
	$("#btnInvert").click(function(){
		if (selectedColor == 0){
			selectedColor = 1;
			changeImages("");
			$("#pTime,.lblFooter").css('color', "white");
		}
		else{
			selectedColor = 0;
			changeImages("-gray");
            $("#pTime,.lblFooter").css('color', "black");
		}
		lastColor = bColors[selectedColor];
		document.body.style.backgroundColor = lastColor;
		$('#timeContent').css('background-color', lastColor);
		$('#divCurrentTime').css('background-color', lastColor);
    });
	
	$("#btnConfirm").click(function(e){
		e.preventDefault();
		isStarted = false;
		btnStopClick(false);
		clearTimetable();
		$("#hNoResults").show();
		$("#tblResults").hide();
	});
	
	$("[data-toggle]").click(function () {
		var _this = this;
		setTimeout(function () {
			$(_this).tooltip('hide');
		}, 3000);
	});
});
