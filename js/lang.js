//var langs = ['en', 'es', 'pl'];
//var langCode = '';
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

//langCode = navigator.language.substr (0, 2);

//if (langCode in langs)
//	$.getJSON('lang/'+langCode+'.json', translate);
//else

$.getJSON('js/lang/en.json', translate);
