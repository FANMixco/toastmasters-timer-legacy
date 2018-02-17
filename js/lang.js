var langs = ['en', 'es'];
var langCode = '';
var currentTranslation;

var translate = function (jsdata) {
    currentTranslation = jsdata;
    $("[tkey]").each(function (index) {
        $(this).html(jsdata[$(this).attr('tkey')]);
    });
    $("[tkey-title]").each(function (index) {
        $(this).prop('title', (jsdata[$(this).attr('tkey-title')]));
    });
    $("[tkey-placeholder]").each(function (index) {
        $(this).prop('placeholder', (jsdata[$(this).attr('tkey-placeholder')]));
    });
}

langCode = navigator.language.substr (0, 2);

try {
    if (langs.includes(langCode))
        $.getJSON('lang/' + langCode + '.json', translate);
    else
        $.getJSON('js/lang/en.json', translate);
}
catch (e) {
    setTimeout(function () {
        if (isValueInArray(langs, langCode))
            $.getJSON('lang/' + langCode + '.json', translate);
        else
            $.getJSON('js/lang/en.json', translate);
    }, 125);
}

function isValueInArray(arr, val) {
    inArray = false;
    for (i = 0; i < arr.length; i++)
        if (val == arr[i])
            inArray = true;
    return inArray;
}
