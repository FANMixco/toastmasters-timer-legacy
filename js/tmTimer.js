var counter = 1;
var selected = -1;
var minimum = 0;
var average = 0;
var maximum = 0;
var lastColor = "white";
var isPaused = false;
var isStarted = false;
var isCustom = false;
var finalTimes = [];

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
	return (new Date).clearTime()
		  .addSeconds(counter)
		  .toString('H:mm:ss');
}

function btnStopClick(isAdded){
	var defaultColor = "white";
	var member = $("#txtMember").val();
	var currentTime = getTime();
	if (lastColor == "yellow"){
		defaultColor = "black";
	}

	if (isStarted && isAdded){
		$("#hNoResults").hide();
		$("#tblResults").show();
		finalTimes.push([member, currentTime, lastColor]);
		$('#tBodyResults').append('<tr style="background:'+lastColor+';color:'+defaultColor+'"><td>'+member+'</td><td>'+$("#selectTimes").find(":selected").text()+'</td><td style="text-align:center">'+currentTime+'</td></tr>');
	}
	$("#btnPause").hide();
	$("#btnPlay").show();

	lastColor = "white";
	document.body.style.backgroundColor = lastColor;
	$('#divCurrentTime').css('background-color', lastColor);
	changeImages("-gray");
	$("#pTime").text("0:00:00");
	$("#pTime").css('color', "black");
	$("#txtMember").val("");
	selected = -1;
	counter = 1;
	isPaused = true;
	isStarted = false;
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
			if (counter == minimum) {
				changeImages("");
				lastColor = "green";
				document.body.style.backgroundColor = lastColor;
				$('#cboxContent').css('background-color', lastColor);
				$("#pTime").css('color', "white");
			}
			else if (counter == average) {
				changeImages("-gray");
				lastColor = "yellow";
				document.body.style.backgroundColor = lastColor;
				$('#cboxContent').css('background-color', lastColor);
				$("#pTime").css('color', "black");
			}
			else if (counter >= maximum){
				changeImages("");
				lastColor = "red";
				document.body.style.backgroundColor = lastColor;
				$('#cboxContent').css('background-color', lastColor);
				$("#pTime").css('color', "white");
			}
			counter++;
		}
	}, 1000 );
}

function changeImages(extra){
	$("#btnPlay").attr('src', "images/play" + extra + ".png");
	$("#btnPause").attr('src', "images/pause" + extra + ".png");
	$("#btnStop").attr('src', "images/stop" + extra + ".png");
	$("#btnRestart").attr('src', "images/restart" + extra + ".png");
	$("#btnTable").attr('src', "images/table" + extra + ".png");
	$("#btnTimer").attr('src', "images/timer" + extra + ".png");
}

$(function(){
	$('#selectTimes').select2({
		placeholder: "Choose a time (minutes)"
	}).on('change', function() {
		if ($(this).val() == "11"){
			$.colorbox({href:"#divCustomTime", inline:true, width:"70%", height:"80%", onComplete: function(){
				$('#cboxContent').css('background-color', "white");
			}});
		} else{
			isCustom = false
		}
	});
	$('.selectHours').select2({
		placeholder: "H"
	});
	$('.selectMin').select2({
		placeholder: "M"
	});
	$('.selectSec').select2({
		placeholder: "S"
	});
	$("#btnPlay").click(function(){
		var state = $("#selectTimes").val();
		if (state == "" || state == null){
			return;
		}
		btnStartClick();
		$(this).hide();
		$("#btnPause").show();
	});
	$("#btnPause").click(function(){
		btnPauseClick();
		$(this).hide();
		$("#btnPlay").show();
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
			placeholder: "Choose a time (minutes)"
        }).val("").trigger("change");
        
        $(".selectHours").select2({
			placeholder: "H"
        }).val("").trigger("change");
        
        $(".selectMin").select2({
			placeholder: "M"
        }).val("").trigger("change");
        
        $(".selectSec").select2({
			placeholder: "S"
        }).val("").trigger("change");
	});
	
	$("#inlineTimer").colorbox({inline:true, width:"50%", onComplete: function(){
        $('#cboxContent').css('background-color', lastColor);
    }});
	
	$("#inlineTimetable").colorbox({inline:true, width:"70%", onComplete: function(){
        $('#cboxContent').css('background', "white");
    }});
	
	$("#btnSave").click(function(){
		var minTime = parseInt($("#minH").val() * 360 + $("#minM").val() * 60 + $("#minS").val());
		var avgTime = parseInt($("#avgH").val() * 360 + $("#avgM").val() * 60 + $("#avgS").val());
		var maxTime = parseInt($("#maxH").val() * 360 + $("#maxM").val() * 60 + $("#maxS").val());

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
			$('#cboxClose').click();
		}
	});
});
