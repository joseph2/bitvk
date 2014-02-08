jQuery(function ($) {
    
    console.log(chrome.app);

    // Localization
    $('title').text('BitVK - '+chrome.i18n.getMessage("settingstitle"));
    $('#about').text(chrome.i18n.getMessage("about"));
    $('#sbitrate').append(chrome.i18n.getMessage("showbitrate"));
    $('#sdownload').append(chrome.i18n.getMessage("showdownload"));
    $('#uselang').text(chrome.i18n.getMessage("showlanguag"));
    $('#action__save_settings').text(chrome.i18n.getMessage("savesettings"));
    $('#develop').prepend(chrome.i18n.getMessage("author"));

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
                $("input[name=bitrate]").removeAttr("checked");}
            if (settingsT.dn == false) {
                $("input[name=download]").removeAttr("checked");}        
        }
    });
    // End


    // Сохранение настроек в хранилище
    $('#action__save_settings').on('click', function (e) {
        var settingsF = function settingsF() {
            this.bitrate = null;
            this.download = null;
        }
        settingsF.bitrate = $("#bitrate").prop("checked");
        settingsF.download = $("#download").prop("checked");
        chrome.storage.sync.set({'vkmustool':settingsF}, function(success) {
            $('#action__save_settings').toggleClass("btn-success");
            $("#succmsg").remove();
            $('#inncover').append('<span id="succmsg"></span>');
            $('#succmsg').text(chrome.i18n.getMessage('savemsg'));
        });
    });
    // End    

})