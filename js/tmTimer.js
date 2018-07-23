var audioElement;
var counter = 1,
    selected = -1,
    minimum = 0,
    average = 0,
    maximum = 0,
    selectedColor = 0,
    green = 0,
    yellow = 0,
    red = 0;
var lastColor = "white",
    isBeepEnabled = "false",
    isVibrateEnabled = "false";
var isPaused = false,
    isStarted = false,
    isCustom = false;
	hasVibrator = true;
var bColors = ["white", "black"];
var supportsOrientationChange = "onorientationchange" in window,
    orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";
var os = getMobileOperatingSystem();
if (os == "iOS" || os == "Android") $("#btnBeep").hide();

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

function getTime() {
    return (new Date).clearTime().addSeconds(counter).toString("H:mm:ss");
}

function enableVibrator() {
	navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
	if (navigator.vibrate) {
		hasVibrator = true;
        $("#btnVibrate").show();
	}
}

function btnStopClick(isAdded) {
    if (isStarted && isAdded) addNewTime($("#txtMember").val(), $("#selectTimes").find(":selected").text(), getTime(), lastColor);

    $("#btnPause").hide();
    $("#btnPlay").show();

    lastColor = bColors[selectedColor];
    $("body,#divCurrentTime,#timeContent").css("background-color", lastColor);
    $("#pTime").text("0:00:00");
    $("#txtMember").val("");
    selected = -1;
    counter = 1;
    isPaused = true;
    isStarted = false;
    if (selectedColor === 0) {
        $("#pTime,.lblFooter").css('color', "black");
        changeImages("-gray");
    } else {
        $("#pTime,.lblFooter").css('color', "white");
        changeImages("");
    }
    $("#selectTimes,#btnRestart").prop("disabled", false);
    green = 0;
    red = 0;
    yellow = 0;
}

function startBeep() {
    if (isBeepEnabled === "true") {
        if (green === 1 || yellow === 1 || red === 1) {
            audioElement.play();
            setTimeout(function() {
                audioElement.pause();
            }, 500);
        } else {
            audioElement.pause();
        }
    }
}

function startVibrate() {
    if (isVibrateEnabled === "true")
        if (green === 1 || yellow === 1 || red === 1)
			if (hasVibrator)
                navigator.vibrate(1000);
}

function getBeep() {
    if (localStorage.getItem("myBeep") !== null)
        isBeepEnabled = localStorage.getItem("myBeep");
    else
        setBeep(isBeepEnabled);
}

function getVibrate() {
    if (localStorage.getItem("myVibrate") !== null)
        isVibrateEnabled = localStorage.getItem("myVibrate");
    else
        setVibrate(isVibrateEnabled);
}

function getCurrentColor() {
    if (localStorage.getItem("myPreferedColor") !== null)
        selectedColor = parseInt(localStorage.getItem("myPreferedColor"));
    else
        setColor(selectedColor);
}

function setBeep(beep) {
    if (localStorage.getItem("myBeep") !== null)
        localStorage.removeItem("myBeep");
    localStorage.setItem("myBeep", beep);
}

function setVibrate(vibrate) {
    if (localStorage.getItem("myVibrate") !== null)
        localStorage.removeItem("myVibrate");
    localStorage.setItem("myVibrate", vibrate);
}

function setColor(color) {
    if (localStorage.getItem("myPreferedColor") !== null)
        localStorage.removeItem("myPreferedColor");
    localStorage.setItem("myPreferedColor", color);
}

function btnStartClick() {
    if (isStarted) return;
    isStarted = true;
    isPaused = false;
    selected = $("#selectTimes").val();

    if (selected === "" || selected === null) return;

    if (!isCustom) {
        minimum = times[selected][0];
        average = times[selected][1];
        maximum = times[selected][2];
    }
    startTimer();
    $("#selectTimes,#btnRestart").prop("disabled", "disabled");
    if (selectedColor === 0)
        changeImages("-gray");
    else
        changeImages("");
}

function startTimer() {
    var setTime = setInterval(function() {
        if (isPaused)
            clearInterval(setTime);
        else {
            $("#pTime").text(getTime());
            if (counter >= minimum && counter < average) {
                changeImages("");
                lastColor = "green";
                $("#pTime,.lblFooter").css('color', "white");
                green++;
                startBeep();
                startVibrate();
            } else if (counter >= average && counter < maximum) {
                changeImages("-gray");
                lastColor = "yellow";
                $("#pTime,.lblFooter").css('color', "black");
                yellow++;
                startBeep();
                startVibrate();
            } else if (counter >= maximum) {
                changeImages("");
                lastColor = "red";
                $("#pTime,.lblFooter").css('color', "white");
                red++;
                startBeep();
                startVibrate();
            } else
                lastColor = bColors[selectedColor];
            $("body,#timeContent,#divCurrentTime").css("background-color", lastColor);
            counter++;
        }
    }, 1000);
}

function changeImages(extra) {
    $("#btnPlay").attr("src", `images/play${extra}.png`);
    $("#btnPause").attr("src", `images/pause${extra}.png`);
    $("#btnStop").attr("src", `images/stop${extra}.png`);
    if (!isPaused && isStarted) {
        $("#btnRestart").attr("src", `images/restart${extra}-dis.png`);
        setTimeout(function() {
            $("#btnRestart").attr("title", currentTranslation.titleRestart2);
        }, 150);
    } else {
        $("#btnRestart").attr("src", `images/restart${extra}.png`);
        setTimeout(function() {
            $("#btnRestart").attr("title", currentTranslation.titleRestart);
        }, 150);
    }
    $("#btnTable").attr("src", `images/table${extra}.png`);
    $("#btnTimer").attr("src", `images/timer${extra}.png`);
    $("#btnInvert").attr("src", `images/invert-colors${extra}.png`);
    if (isBeepEnabled === "true")
        $("#btnBeep").attr("src", `images/volume${extra}.png`);
    else
        $("#btnBeep").attr("src", `images/volume-off${extra}.png`);
    if (isVibrateEnabled === "true")
        $("#btnVibrate").attr("src", `images/vibrate${extra}.png`);
    else
        $("#btnVibrate").attr("src", `images/vibrate-off${extra}.png`);
}

function setVolumeImg() {
    setBeep(isBeepEnabled);
    if (selectedColor === 0 && (lastColor === "white" || lastColor === "yellow")) {
        if (isBeepEnabled === "false")
            $("#btnBeep").attr('src', "images/volume-off-gray.png");
        else
            $("#btnBeep").attr('src', "images/volume-gray.png");
    } else {
        if (isBeepEnabled === "false")
            $("#btnBeep").attr('src', "images/volume-off.png");
        else
            $("#btnBeep").attr('src', "images/volume.png");
    }
}

function setVibrateImg() {
    setVibrate(isVibrateEnabled);
    if (selectedColor === 0 && (lastColor === "white" || lastColor === "yellow")) {
        if (isVibrateEnabled === "false")
            $("#btnVibrate").attr("src", `images/vibrate-off-gray.png`);
        else
            $("#btnVibrate").attr("src", `images/vibrate-gray.png`);
    } else {
        if (isVibrateEnabled === "false")
            $("#btnVibrate").attr("src", `images/vibrate-off.png`);
        else
            $("#btnVibrate").attr("src", `images/vibrate.png`);
    }
}

function changeImagesByColor() {
    if (selectedColor === 0 && (lastColor === "white" || lastColor === "yellow"))
        changeImages("-gray");
    else
        changeImages("");
}

function resizeDivImage() {
    $(".divImage,#tblControls,#tdMiddle").height($(window).height() - $(".bottom-footer").height() - $("#options").height());
}

function setImgAndBng() {
    if (selectedColor === 1) {
        changeImages("");
        $("#pTime,.lblFooter").css('color', "white");
    } else {
        changeImages("-gray");
        $("#pTime,.lblFooter").css('color', "black");
    }
    setColor(selectedColor);
    lastColor = bColors[selectedColor];
    $("body,#timeContent,#divCurrentTime").css("background-color", lastColor);
}

function setObjTranslations() {
    setTimeout(function() {
        $("#cTopic").html(`<b>${currentTranslation.meetingAt} ${(new Date).toString('dd/MM/yyyy')}</b>`);
    }, 150);
    if ($(window).width() > 800) {
        $("head").append("<link href='css/select2.min.css' rel='stylesheet' />");
        $.getScript("js/select2.min.js", function() {});
        setTimeout(function() {
            $("#selectTimes").addClass("js-example-basic-single");
            $("#selectTimes").select2({
                placeholder: currentTranslation.chooseTime
            });
        }, 150);
    } else {
        $("#selectTimes").addClass("form-control");
        $("#emptyOption").text(currentTranslation.chooseTime);
        $('#emptyOption').prop("disabled", true);
        $('#emptyOption').attr("value", "");
    }
    $("#selectTimes").on('change', function() {
        if ($(this).val() === "11")
            $("#divCustomTime").modal();
        else
            isCustom = false;
    })
}

window.addEventListener(orientationEvent, function() {
    resizeDivImage();
}, false);

function resizeModal() {
    if ($("#divContent").height() > $(window).height()) {
        $("#divTable").height($(window).height() * 0.75);
        $("#divTable").css("overflow-y", "auto");
    } else {
        $("#divTable").css("height", "");
        $("#divTable").css("overflow-y", "");
    }
}

function showSnackBar(msg) {
    $("#spanMsg").text(msg);
    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function() {
        x.className = x.className.replace("show", "");
    }, 3000);
}

$(function() {
    $("[data-toggle=confirmation]").confirmation({
        rootSelector: "[data-toggle=confirmation]",
        popout: true,
        onConfirm: function() {
            isStarted = false;
            btnStopClick(false);
            clearTimetable();
            $("#hNoResults").show();
            $("#tblResults,#btnDelete,#linkDownload").hide();
            resizeModal();
        }
    });

    audioElement = document.createElement('audio');
    audioElement.setAttribute('src', 'sounds/beep.mp3');

    audioElement.addEventListener('ended', function() {
        this.play();
    }, false);

    audioElement.addEventListener("canplay", function() {});

    audioElement.addEventListener("timeupdate", function() {});

    initializeDB();
	enableVibrator();
    setTimeout(function() {
        resizeDivImage();
    }, 50);
    $(".timing").timingfield();
    $("[data-toggle='tooltip']").tooltip();
    if (errorLng) {
        setTimeout(function() {
            setObjTranslations();
        }, 150);
    } else {
        setObjTranslations();
    }
    $("#linkResults").click(function() {
        countTimetable();
        printTable();
        $("#divResults").modal();
        setTimeout(function() {
            resizeModal();
        }, 250);
    });
    $("#btnPlay").click(function() {
        var state = $("#selectTimes").val();
        if (state === "" || state === null) {
            showSnackBar(currentTranslation.chooseSpeech);
            return;
        }
        if ((isCustom || state === "11") && (minimum + average + maximum) === 0) {
            showSnackBar(currentTranslation.emptyCustom);
            return;
        }
        isStarted = false;
        btnStartClick();
        $(this).hide();
        $("#btnPause").show();
        changeImagesByColor();
    });
    $("#btnPause").click(function() {
        btnPauseClick();
        isPaused = true;
        $(this).hide();
        $("#btnPlay").show();
        changeImagesByColor();
    });
    $("#btnStop").click(function() {
        btnStopClick(true);
    });
    $("#btnBeep").click(function() {
        if (isBeepEnabled === "true")
            isBeepEnabled = "false";
        else
            isBeepEnabled = "true";
        setVolumeImg();
    });
    $("#btnVibrate").click(function() {
        if (isVibrateEnabled === "true")
            isVibrateEnabled = "false";
        else
            isVibrateEnabled = "true";
        setVibrateImg();
    });
    $("#btnRestart").click(function() {
        if (isStarted) return;
        btnStopClick(false);
        isCustom = false;
        minimum = 0;
        average = 0;
        maximum = 0;
        if ($(window).width() > 800)
            $("#selectTimes").select2({
                placeholder: currentTranslation.chooseTime
            }).val("").trigger("change");
        else
            $("#selectTimes").val("");
    });

    $("#btnSave").click(function() {
		var option = "input[type=text]";
		if (os == "iOS" || os == "Android")
			option = "input[type=number]";
        var minTime = parseInt($(option)[0].value * 3600) + parseInt($(option)[1].value * 60) + parseInt($(option)[2].value);
        var avgTime = parseInt($(option)[3].value * 3600) + parseInt($(option)[4].value * 60) + parseInt($(option)[5].value);
        var maxTime = parseInt($(option)[6].value * 3600) + parseInt($(option)[7].value * 60) + parseInt($(option)[8].value);

        if (minTime >= avgTime)
            showSnackBar(currentTranslation.errorMin);
        else if (minTime >= maxTime)
            showSnackBar(currentTranslation.errorHalf);
        else if (avgTime >= maxTime)
            showSnackBar(currentTranslation.errorMax);
        else {
            isCustom = true;
            minimum = minTime;
            average = avgTime;
            maximum = maxTime;
            $("#divCustomTime").modal("toggle");
        }
    });

    $("#btnInvert").click(function() {
        if (selectedColor === 0)
            selectedColor = 1;
        else
            selectedColor = 0;
        setImgAndBng();
    });

    $("[data-toggle]").click(function() {
        var _this = this;
        setTimeout(function() {
            $(_this).tooltip("hide");
        }, 1500);
    });

    $("#linkDownload").click(function(e) {
        showSnackBar(currentTranslation.lblExportMsg);
        setTimeout(function() {
			var doc = new jsPDF('l', 'pt', 'a4');
			var res = doc.autoTableHtmlToJson(document.getElementById("tblResults"));
			doc.autoTable(res.columns, res.data, {
			  startY: 60
			});
			doc.save();
		}, 250);
    });

    $.fn.hideKeyboard = function() {
        var inputs = this.filter("input").attr('readonly', 'readonly'); // Force keyboard to hide on input field.
        setTimeout(function() {
            inputs.blur().removeAttr('readonly'); //actually close the keyboard and remove attributes
        }, 100);
        return this;
    };

    $("#txtMember,input[type=number]").on('keyup', function(e) {
        if (e.keyCode === 13)
            $(this).hideKeyboard();
    });

    getCurrentColor();
    getBeep();
    getVibrate();
    setImgAndBng();
    setVolumeImg();
});
