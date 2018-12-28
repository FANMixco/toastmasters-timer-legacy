var langs = ["en", "es"];
var langCode = "";
var currentTranslation;
var errorLng = false;

var translate = function (jsdata) {
    currentTranslation = jsdata;
    $("[tkey]").each(function () {
        $(this).html(jsdata[$(this).attr("tkey")]);
    });
    $("[tkey-title]").each(function () {
        $(this).prop("title", jsdata[$(this).attr("tkey-title")]);
    });
    $("[tkey-placeholder]").each(function () {
        $(this).prop("placeholder", jsdata[$(this).attr("tkey-placeholder")]);
    });
    $("[tkey-btn-ok]").each(function () {
        $(this).data("btn-ok-label", jsdata[$(this).attr("tkey-btn-ok")]);
    });
    $("[tkey-btn-cancel]").each(function () {
        $(this).data("btn-cancel-label", jsdata[$(this).attr("tkey-btn-cancel")]);
    });
    $("[tkey-data-title]").each(function () {
        $(this).data("title", jsdata[$(this).attr("tkey-data-title")]);
    });
};

langCode = navigator.language.substr (0, 2);

try {
    if (!langs.includes(langCode))
        langCode = "en";
    $.getJSON(`js/lang/${langCode}.json`, translate);
}
catch (e) {
    errorLng = true;
    setTimeout(function () {
        if (!isValueInArray(langs, langCode))
            langCode = "en";
    	$.getJSON(`js/lang/${langCode}.json`, translate);
    }, 125);
}

function isValueInArray(arr, val) {
    inArray = false;
    for (i = 0; i < arr.length; i++)
        if (val === arr[i])
            inArray = true;
    return inArray;
}
