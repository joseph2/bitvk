jQuery(function ($) {
    // Localization
    $('title').text('BitVK - '+chrome.i18n.getMessage("settingstitle"));
    $('#about').text(chrome.i18n.getMessage("about"));
    $('#sbitrate').append(chrome.i18n.getMessage("showbitrate"));
    $('#sdownload').append(chrome.i18n.getMessage("showdownload"));
    $('#uselang').text(chrome.i18n.getMessage("showlanguag"));
    $('#action__save_settings').text(chrome.i18n.getMessage("savesettings"));
    $('#develop').prepend(chrome.i18n.getMessage("author"));

    console.log(chrome.app);
    $('#vokal_version').text(chrome.app.getDetails().version);

    //ЧТЕНИЕ НАСТРОЕК
    var settingsT = function settingsT() {
        this.bt = null;
        this.dn = null;
    }
    chrome.storage.sync.get('vkmustool', function(items) {
        if (items.vkmustool) {
            settingsT.bt = items.vkmustool.bitrate;
            settingsT.dn = items.vkmustool.download;
            settingsT.ln = items.vkmustool.languag;

            // Значения по умолчанию
            if (settingsT.bt == null) {
                settingsT.bt = true;}
            if (settingsT.dn == null) {
                settingsT.dn = true;}
            if (settingsT.ln == null) {
                settingsT.ln = "ru";}
            
            // Восстановить сохраненные значения.
            if (settingsT.bt == false) {
                $("input[name=bitrate]").removeAttr("checked");}
            if (settingsT.dn == false) {
                $("input[name=download]").removeAttr("checked");}    
            if (settingsT.ln == "ru") {
                $("#languag [value='ru']").attr("selected", "selected");} 
            if (settingsT.ln == "en") {
                $("#languag [value='en']").attr("selected", "selected");}      
        }
    });

    //СОХРАНЕНИЕ НАСТРОЕК
    $('#action__save_settings').on('click', function (e) {
        var settingsF = function settingsF() {
            this.bitrate = null;
            this.download = null;
            this.languag = null;
        }
        settingsF.bitrate = $("#bitrate").prop("checked");
        settingsF.download = $("#download").prop("checked");
        settingsF.languag = $("#languag option:selected").val();
        chrome.storage.sync.set({'vkmustool':settingsF}, function(success) {
            $('#action__save_settings').toggleClass("btn-success");
            $("#succmsg").remove();
            $('#inncover').append('<span id="succmsg"></span>');
            $('#succmsg').text(chrome.i18n.getMessage('savemsg'));
        });
    });    

})