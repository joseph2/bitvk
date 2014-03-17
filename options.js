jQuery(function ($) {
    console.log(chrome.app);

    // Проверяем доступность новой версии
    $.getJSON( "http://bitvk.com/update/version.json", function( data ) {
      if (data != (chrome.app.getDetails().version)) {
        // Если новая версия найдена выдаём сообщение
        $('#head').prepend('<div id="alertv" class="alert alert-warning"></div>');
        $('#alertv').append(chrome.i18n.getMessage('alertv'));
      }
    });

    // Инициализируем чекбоксы
    $("[name='bitrate']").bootstrapSwitch();
    $("[name='bitrate']").bootstrapSwitch('onText', 'I');
    $("[name='bitrate']").bootstrapSwitch('offText', 'O');
    $("[name='download']").bootstrapSwitch();
    $("[name='download']").bootstrapSwitch('onText', 'I');
    $("[name='download']").bootstrapSwitch('offText', 'O');

    // Localization
    $('title').text('BitVK - '+chrome.i18n.getMessage("settingstitle"));
    $('#sslogan').text(chrome.i18n.getMessage('slogan'));
    $('#about').text(chrome.i18n.getMessage("about"));
    $('#hdownload').text(chrome.i18n.getMessage("hdownload"));
    $('#hbitrate').text(chrome.i18n.getMessage("hbitrate"));
    $('#descdownload').text(chrome.i18n.getMessage("descdownload"));
    $('#descbitrate').text(chrome.i18n.getMessage("descbitrate"));
    $('#uselang').text(chrome.i18n.getMessage("showlanguag"));
    $('#fullv').text(chrome.i18n.getMessage("fullv"));
    $('#action__save_settings').text(chrome.i18n.getMessage("savesettings"));
    $('#develop').prepend(chrome.i18n.getMessage("author"));
    $('#succmsg').text(chrome.i18n.getMessage('savemsg'));

    // Version from manifest
    $('#vokal_version').text(chrome.app.getDetails().version);

    // Чтение настроек из хранилища
    var settingsT = function settingsT() {
        this.bt = null;
        this.dn = null;
    }
    chrome.storage.sync.get('vkmustool', function(items) {
        if (items.vkmustool) {
            settingsT.bt = items.vkmustool.bitrate;
            settingsT.dn = items.vkmustool.download;

            // Значения по умолчанию, если хранилище пусто
            if (settingsT.bt == null) {
                settingsT.bt = true;}
            if (settingsT.dn == null) {
                settingsT.dn = true;}
            
            // Восстановить сохраненные значения из хранилища
            if (settingsT.bt == false) {
                $("#bitcheck").children(".bootstrap-switch").toggleClass("bootstrap-switch-on bootstrap-switch-off");}
            if (settingsT.dn == false) {
                $("#downcheck").children(".bootstrap-switch").toggleClass("bootstrap-switch-on bootstrap-switch-off");}         
        }
    });


    // Сохранение настроек в хранилище
    $('#action__save_settings').on('click', function (e) {
        var settingsF = function settingsF() {
            this.bitrate = null;
            this.download = null;
        }
        settingsF.bitrate = $("#bitrate").prop("checked");
        settingsF.download = $("#download").prop("checked");
        chrome.storage.sync.set({'vkmustool':settingsF}, function(success) {
            $('#action__save_settings').toggleClass("btn-info btn-success");
            $("#succmsg").show("fast");
            setTimeout (function(){
                $("#succmsg").fadeOut("slow");
                $('#action__save_settings').toggleClass("btn-success btn-info");
            }, 5000);
        });
    });
    // End    

})