jQuery(function ($) {
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

            // Значения по умолчанию
            if (settingsT.bt == null) {
                settingsT.bt = true;}
            if (settingsT.dn == null) {
                settingsT.dn = true;}
            
            // Восстановить сохраненные значения.
            if (settingsT.bt == false) {
                $("input[name=bitrate]").removeAttr("checked");}
            if (settingsT.dn == false) {
                $("input[name=download]").removeAttr("checked");}                  
        }
    });

    //СОХРАНЕНИЕ НАСТРОЕК
    $('#action__save_settings').on('click', function (e) {
        var settingsF = function settingsF() {
            this.bitrate = null;
            this.download = null;
        }
        settingsF.bitrate = $("#bitrate").prop("checked");
        settingsF.download = $("#download").prop("checked");
        chrome.storage.sync.set({'vkmustool':settingsF}, function(success) {
            $('#action__save_settings').toggleClass('btn-success');
            $('#inncover').append('Настройки сохранены');
        });
    });    

})