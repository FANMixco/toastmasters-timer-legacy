const DB_VERSION = "2.0";
var audioElement, audioElementClapping;
var counter = 1, selected = -1, minimum = 0, average = 0, maximum = 0, selectedColor = 0, green = 0, yellow = 0, red = 0;
var lastColor = "white", isBeepEnabled = "false", isVibrateEnabled = "false", isStickEnabled = "false", isClappingEnabled = "false", latestDB = "1.0", currentDB = "1.0";
var isPaused = false, isStarted = false, isCustom = false, isFirstTime = false, multipleEnabled = false, hasVibrator = true;
var dateFormat = "dd/MM/yyyy";
var bColors = ["white", "black"], countries = ["US", "FM", "MH", "PH"];
var supportsOrientationChange = "onorientationchange" in window, orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";
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

function setDateFormat() {
    try {
        if (countries.includes(navigator.language.split('-')[1]))
            dateFormat = "MM/dd/yyyy";
    }
    catch (e) {
        if (isValueInArray(countries, navigator.language.split('-')[1]))
            dateFormat = "MM/dd/yyyy";
    }
}

function setLocalStorage(key, val) {
    if (getLocalStorageValue(key) !== null)
        removeLocalStorage(key);
    localStorage.setItem(key, val);
}

function getLocalStorageValue(key) {
    return localStorage.getItem(key);
}

function removeLocalStorage(key) {
    localStorage.removeItem(key);
}

function getTimeStamp(time) {
    return (new Date).clearTime().addSeconds(time).toString("HH:mm:ss");
}

function getTime() {
    return getTimeStamp(counter);
}

function enableVibrator() {
	navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
	if (navigator.vibrate) {
		hasVibrator = true;
        $("#btnVibrate").show();
	}
}

function setDbConf() {
    currentDB = getLocalStorageValue("currentDB");

    if (currentDB !== getLocalStorageValue("latestDB") || currentDB === null) {
        setLocalStorage("currentDB", DB_VERSION);
        setLocalStorage("latestDB", DB_VERSION);
        latestDB = DB_VERSION;
    }
}

function verifyLastColor() {
    if (counter >= minimum && counter < average)
        lastColor = "green";
    else if (counter >= average && counter < maximum)
        lastColor = "yellow";
    else if (counter >= maximum)
        lastColor = "red";
    else
        lastColor = bColors[selectedColor];
}

function btnStopClick(isAdded) {
    stopClapping();

    if (isStarted && isAdded) {
        counter = counter - 1;
        verifyLastColor();
        addNewTime($("#txtMember").val(), $("#selectTimes").find(":selected").text(), getTimeStamp(minimum), getTimeStamp(average), getTimeStamp(maximum), getTime(), lastColor, ((counter > (maximum + 30)) || (counter < (minimum - 30))));
        showSnackBar(currentTranslation.recorded, true);
    }

    $("#btnPause,#btnRestart").hide();
    $("#btnPlay,#btnRestartBasic").show();
    $("#innerTime").text("00:00:00");
    $("#txtMember").val("");
    $("#selectTimes,#btnRestartBasic").prop("disabled", false);
    $(".externalLinks").removeClass("linkColG");
    $(".externalLinks").removeClass("linkCol");
    $(".externalLinks").removeClass("linkColY");

    counter = 1;
    isPaused = true;
    isStarted = false;
    green = 0;
    yellow = 0;
    red = 0;
    setImgAndBng();
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

function isStick() {
    if (getLocalStorageValue("isStick") === null)
        $("#divStickMsg").modal();
    else {
        isStickEnabled = getLocalStorageValue("isStick");
        if (isStickEnabled === "true") {
            $("#innerTime").show();

            if (errorLng) {
                setTimeout(function () {
                    setTimer("timer-off");
                }, 150);
            }
            else
                setTimer("timer-off");
        }
    }
}

function setTimer(loc) {
    if (selectedColor === 0 && (lastColor === "white" || lastColor === "yellow"))
        $("#btnVisibleTimer").attr("src", `images/${loc}-gray.png`);
    else
        $("#btnVisibleTimer").attr("src", `images/${loc}.png`);
}

function getVibrate() {
    if (getLocalStorageValue("myVibrate") !== null)
        isVibrateEnabled = getLocalStorageValue("myVibrate");
    else
        setVibrate(isVibrateEnabled);
}

function getClapping() {
    if (getLocalStorageValue("myClapping") !== null)
        isClappingEnabled = getLocalStorageValue("myClapping");
    else
        setClapping(isClappingEnabled);
}

function getCurrentColor() {
    if (getLocalStorageValue("myPreferedColor") !== null)
        selectedColor = parseInt(getLocalStorageValue("myPreferedColor"));
    else
        setColor(selectedColor);
}

function setBeep(beep) {
    setLocalStorage("myBeep", beep);
}

function setVibrate(vibrate) {
    setLocalStorage("myVibrate", vibrate);
}

function setClapping(clapping) {
    setLocalStorage("myClapping", clapping);
}

function setColor(color) {
    setLocalStorage("myPreferedColor", color);
}

function setSticky(sticky) {
    setLocalStorage("isStick", sticky);
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
    var clappingStarted = false;
    counter = counter || 1;
    var setTime = setInterval(function() {
        if (isPaused)
            clearInterval(setTime);
        else {
            $("#innerTime").text(getTime());
            if (counter >= minimum && counter < average) {
                changeImages("");
                lastColor = "green";
                $("#innerTime,.lblFooter").css("color", "white");
                $(".externalLinks").addClass("linkColY");
                green++;
                startBeep();
                startVibrate();
	    }
            else if (counter >= average && counter < maximum) {
                changeImages("-gray");
                lastColor = "yellow";
                $(".lblFooter").css("color", "black");
                $("#innerTime").css("color", "#757575");
                $(".externalLinks").removeClass("linkColY");
                $(".externalLinks").addClass("linkCol");
                yellow++;
                startBeep();
                startVibrate();
            }
            else if (counter >= maximum) {
                changeImages("");
                lastColor = "red";
                $("#innerTime,.lblFooter").css("color", "white");
                $(".externalLinks").removeClass("linkCol");
                $(".externalLinks").addClass("linkColY");
                red++;
                startBeep();
                startVibrate();
            }
            else {
                $(".externalLinks").removeClass("linkCol");
                $(".externalLinks").removeClass("linkColY");
                lastColor = bColors[selectedColor];
            }
            if (counter >= maximum + 30) {
                if (!clappingStarted)
                    startClapping();
                clappingStarted = true;
            }
            setBgnColor();
            counter++;
        }
    }, 1000);
}

function startClapping() {
    if (isClappingEnabled === "true")
    {
            audioElementClapping.play();
            setTimeout(function() {
                audioElementClapping.pause();
            }, 1500);
    }
}

function stopClapping() {
    audioElementClapping.pause();
}

function changeImages(extra) {
    if (isStickEnabled === "true")
        $("#btnVisibleTimer").attr("src", `images/timer-off${extra}.png`);
    else
        $("#btnVisibleTimer").attr("src", `images/timer${extra}.png`);
    $("#btnPlay").attr("src", `images/play${extra}.png`);
    $("#btnPause").attr("src", `images/pause${extra}.png`);
    $("#btnStop").attr("src", `images/stop${extra}.png`);
    if (!isPaused && isStarted)
        setRestartBtnImg(extra, "-dis", currentTranslation.titleRestart2);
    else
        setRestartBtnImg(extra, "", currentTranslation.titleRestart);
    $("#btnTable").attr("src", `images/table${extra}.png`);
    $("#btnInvert").attr("src", `images/invert-colors${extra}.png`);
    setVolumeBtnImg(extra);
    setVibrateBtnImg(extra);
    setClappingBtnImg(extra);
}

function setRestartBtnImg(extra, opt, title) {
    $("#btnRestartBasic,#btnRestart").attr("src", `images/restart${extra}${opt}.png`);
    $("#btnRestartBasic").attr("title", title).tooltip("fixTitle");
}

function setVolumeBtnImg(extra) {
    if (isBeepEnabled === "true")
        $("#btnBeep").attr("src", `images/volume${extra}.png`);
    else
        $("#btnBeep").attr("src", `images/volume-off${extra}.png`);
}

function setVibrateBtnImg(extra) {
    if (isVibrateEnabled === "false")
        $("#btnVibrate").attr("src", `images/vibrate-off${extra}.png`);
    else
        $("#btnVibrate").attr("src", `images/vibrate${extra}.png`);
}

function setClappingBtnImg(extra) {
    if (isClappingEnabled === "true")
        $("#btnClapping").attr("src", `images/clapping${extra}.png`);
    else
        $("#btnClapping").attr("src", `images/clapping-off${extra}.png`);
}

function setVolumeImg() {
    setBeep(isBeepEnabled);
    if (selectedColor === 0 && (lastColor === "white" || lastColor === "yellow"))
        setVolumeBtnImg("-gray");
    else
        setVolumeBtnImg("");
}

function setVibrateImg() {
    setVibrate(isVibrateEnabled);
    if (selectedColor === 0 && (lastColor === "white" || lastColor === "yellow"))
        setVibrateBtnImg("-gray");
    else
        setVibrateBtnImg("");
}

function setClappingImg() {
    setClapping(isClappingEnabled);
    if (selectedColor === 0 && (lastColor === "white" || lastColor === "yellow"))
        setClappingBtnImg("-gray");
    else
        setClappingBtnImg("");
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

function setBgnColor() {
    $("body,#timeContent,#divCurrentTime").css("background-color", lastColor);
}

function setImgAndBng() {
    if (selectedColor === 1) {
        changeImages("");
        $("#innerTime,.lblFooter").css("color", "white");
    } else {
        changeImages("-gray");
        $(".lblFooter").css("color", "black");
        $("#innerTime").css("color", "#757575");
    }
    setColor(selectedColor);
    lastColor = bColors[selectedColor];
    setBgnColor();
}

function setObjTranslations() {
    setTimeout(function() {
        $("#cTopic").html(`<b>${currentTranslation.meetingAt} ${(new Date).toString('dd/MM/yyyy')}</b>`);
    }, 150);
    if ($(window).width() > 800) {
        $("head").append("<link href='css/select2.min.css' rel='stylesheet' />");
        $.getScript("js/select2.min.js").done(function () {
            setTimeout(function() {
                $("#selectTimes").addClass("js-example-basic-single");
                $("#selectTimes").select2({
                    placeholder: currentTranslation.chooseTime
                });
            }, 150);
        });
    } else {
        $("#selectTimes").addClass("form-control");
        setTimeout(function() {
            $("#emptyOption").text(currentTranslation.chooseTime);
        }, 150);
        $('#emptyOption').prop("disabled", true);
        $('#emptyOption').attr("value", "");
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

function resizeModal() {
    let currentWindowHeight = $(window).height();
    if ($("#divContent").height() > $(window).height()) {
        $("#divTable").height($(window).height() * 0.75);
        $("#divTable").css("overflow-y", "auto");
    } else {
        $("#divTable").css("height", "");
        $("#divTable").css("overflow-y", "");
    }
    setTimeout(function () {
        if ($("#divContent").height() > currentWindowHeight)
            resizeModal();
    }, 50);
}

function btnPlay() {
    var state = $("#selectTimes").val();
    if (state === "" || state === null) {
        showSnackBar(currentTranslation.chooseSpeech, true);
        return;
    }
    if ((isCustom || state === "11") && (minimum + average + maximum) === 0) {
        showSnackBar(currentTranslation.emptyCustom, false);
        return;
    }
    isStarted = false;
    btnStartClick();
    $("#btnPlay,#btnRestart").hide();
    $("#btnPause,#btnRestartBasic").show();
    changeImagesByColor();
}

function btnPause() {
    stopClapping();
    isPaused = true;
    $("#btnPause,#btnRestartBasic").hide();
    $("#btnPlay,#btnRestart").show();
    changeImagesByColor();
}

function setSelect2(selVal) {
    if ($(window).width() > 800) {
        if (selVal > -1)
            $("#selectTimes").select2({
                placeholder: currentTranslation.chooseTime
            }).val(`${selVal}`).trigger("change");
        else
            $("#selectTimes").select2({
                placeholder: currentTranslation.chooseTime
            }).val("").trigger("change");
    }
    else {
        if (selVal > -1)
            $("#selectTimes").val(selVal);
        else
            $("#selectTimes").val("");
    }
}

function isStickFirstTime(sticky) {
    setSticky(sticky);
    isStickEnabled = sticky;
    $("#divStickMsg").modal("toggle");
}

window.addEventListener(orientationEvent, function () {
    resizeDivImage();
}, false);

$(function () {
    audioElement = document.createElement('audio');
    audioElement.setAttribute('src', 'sounds/beep.mp3');

    audioElement.addEventListener('ended', function() {
        this.play();
    }, false);

    audioElement.addEventListener("canplay", function() {});

    audioElement.addEventListener("timeupdate", function() {});

    audioElementClapping = document.createElement('audio');
    audioElementClapping.setAttribute('src', 'sounds/clapping.mp3');

    audioElementClapping.addEventListener('ended', function() {
        this.play();
    }, false);

    audioElementClapping.addEventListener("canplay", function() {});

    audioElementClapping.addEventListener("timeupdate", function() {});

    setDbConf();
    $.fn.hideKeyboard = function () {
        var inputs = this.filter("input").attr("readonly", "readonly"); // Force keyboard to hide on input field.
        setTimeout(function () {
            inputs.blur().removeAttr("readonly");  //actually close the keyboard and remove attributes
        }, 100);
        return this;
    };

    function getSelectedIDs() {
        var ids = [];
        $("input.chkDel[type=checkbox]").each(function () {
            if (this.checked)
                ids.push(parseInt($(this).attr("id").replace("chk", "")));
        });
        return ids;
    }

    function restart() {
        btnStopClick(false);
        isCustom = false;
        minimum = 0;
        average = 0;
        maximum = 0;
        setSelect2(-1);
    }

    $("#btnDelete").confirmation({
        rootSelector: "[data-toggle=confirmation]",
        popout: true,
        onConfirm: function () {
            multipleEnabled = false;
            if (!isStarted) {
                isStarted = false;
                btnStopClick(isStarted);
            }
            clearTimetable();
            showSnackBar(currentTranslation.deletedAgenda, true);
            $("#hNoResults").show();
            $("#tblResults,#btnDelete,#linkDownload,#btnMultiple,#btnShare").hide();
            resizeModal();
        }
    });
    $("#btnRestart").confirmation({
        rootSelector: "[data-toggle=confirmation]",
        popout: true,
        onConfirm: function () {
            restart();
        }
    });

    $("#btnDeleteMultiple").confirmation({
        rootSelector: "[data-toggle=confirmation]",
        popout: true,
        onConfirm: function () {
            var ids = getSelectedIDs();

            if (ids.length > 0) {
                var totalItems = deleteByIDs(ids);
                if (!isStarted) {
                    isStarted = false;
                    btnStopClick(isStarted);
                }
                showSnackBar(currentTranslation.deletedRoles, true);
                if (totalItems === 0) {
                    multipleEnabled = false;
                    clearTimetable();
                    $("#hNoResults").show();
                    $("#tblResults,#btnDeleteMultiple,#linkDownload,#btnMultiple,#btnShare").hide();
                }
                resizeModal();
            }
        }
    });

    setTimeout(function() {
        resizeDivImage();
    }, 50);
    $(".timing").timingfield();
    $("[data-toggle='tooltip']").tooltip();
    $("[data-toggle='tooltip']").on("hidden.bs.tooltip", function () {
        $(this).tooltip("disable");
    });
    if (errorLng) {
        setTimeout(function() {
            setObjTranslations();
        }, 150);
    } else
        setObjTranslations();
    $("#selectTimes").on("change", function () {
        if ($(this).val() === "11")
            $("#divCustomTime").modal();
        else
            isCustom = false;
    });
    $("#linkResults").click(function(e) {
        e.preventDefault();
        let value = $("#selectTimes").val();
        multipleEnabled = false;
        countTimetable();
        printTable();
        $("#btnDelete").show();
        $("#btnDeleteMultiple,.tdDel,#thDel").hide();
        $("#lblMultiple").text(currentTranslation.multiple);
        $("#icnMultiple").removeClass();
        $("#icnMultiple").toggleClass("glyphicon glyphicon-check");
        setSelect2(value);
        if ($("#divCustomTime").data('bs.modal') && $("#divCustomTime").data('bs.modal').isShown)
            $("#divCustomTime").modal("toggle");
    });
    $("#btnClear").click(function () {
	let option = "input[type=text]";
        let iTxts = [2, 3, 4, 6, 7, 8, 10, 11, 12];
	if (os == "iOS" || os == "Android")
		option = "input[type=number]";
	for (let i = 0; i < 9; i++)
	    $(option)[iTxts[i]].value = "0";
    });
    $("#btnPlay").click(function() {
        btnPlay();
    });
    $("#btnPause").click(function() {
        btnPause();
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
    $("#btnClapping").click(function () {
        if (isClappingEnabled === "true") {
            isClappingEnabled = "false";
            stopClapping();
        }
        else
            isClappingEnabled = "true";
        setClappingImg();
    });
    $("#btnRestartBasic").click(function () {
        if (isStarted && !isPaused) return;
        restart();
    });
    $("#btnRYes").click(function () {
        restart();
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
        setTimeout(function () { $(_this).tooltip("hide"); }, 1500);
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
    $("#btnVisibleTimer").click(function () {
        if (isStickEnabled === "false") {
            isStickEnabled = "true";
            setSticky(isStickEnabled);
            $("#innerTime").show();
            setTimer("timer-off");
        }
        else {
            isStickEnabled = "false";
            setSticky(isStickEnabled);
            $("#innerTime").hide();
            setTimer("timer");
        }
    });
    $("#btnStick").click(function () {
        isStickFirstTime("true");
        $("#innerTime").show();
        setTimer("timer-off");
    });
    $("#btnUnstick").click(function () {
        isStickFirstTime("false");
    });
    $("#btnMultiple").click(function () {
        if (!multipleEnabled) {
            $("#icnMultiple").toggleClass("glyphicon-check").toggleClass("glyphicon-unchecked");
            $("#btnDelete").hide();
            $(".tdDel,#thDel,#btnDeleteMultiple").show();
        }
        else {
            $("#icnMultiple").toggleClass("glyphicon-unchecked").toggleClass("glyphicon-check");
            $("#btnDelete").show();
            $(".tdDel,#thDel,#btnDeleteMultiple").hide();
            $('input:checkbox').prop("checked", false);
        }
        multipleEnabled = !multipleEnabled;
    });
    $("#txtMember,input[type=number]").on('keyup', function(e) {
        if (e.keyCode === 13)
            $(this).hideKeyboard();
    });
    $("#chkAll").change(function () {
        if (this.checked)
            $('input:checkbox').not(this).prop('checked', this.checked);
        else
            $('input:checkbox').prop("checked", false);
    });

    getCurrentColor();
    getBeep();
    getVibrate();
    getClapping();
    setVolumeImg();
    enableVibrator();
    isStick();
    setDateFormat();
    initializeDB(currentDB, latestDB);
});
