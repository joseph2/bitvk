function show_stat() {
    var table = $("#table_stat");
    var header = '<thead><th class="stat_artist">Автор</td><th>Название</th><th>Время</th><th>Битрейт</th><th>Файл</th></thead>' +
        '<tr><td class="row_loading loading" colspan="5"></td></tr>';
    table.html(header);

    setTimeout(function () {
        chrome.storage.local.get("tracks", function (fetchedData) {

            var tracks = fetchedData.tracks;

            if (tracks && tracks.length) {
                $('#vokal_total_tracks').text(tracks.length);

                var total_download_tracks = 0;
                var table_html = '';


                tracks.forEach(function (track) {
                    var className = track.downloaded ? 'success' : '';

                    if (track.downloaded) total_download_tracks++;

                    //tooltip trim if contain \"
                    table_html += '<tr class="' + className + '" title="' + track.artist.replace(/"/g,'\'') + ' - ' + track.title + '">' +
                        '<td class="stat_artist">' + track.artist + '</td>' +
                        '<td class="stat_title">' + track.title + '</td>' +
                        '<td>' + track.duration + '</td>' +
                        '<td>' + track.bit_rate + '</td>' +
                        '<td class="stat_file">' + (track.file || '&mdash;') + '</td></tr>';

                });
            } else {
                table_html = '<tr><td class="text-muted row_no_data" colspan="5"> Нет данных</td></tr>';
            }

            $('.row_loading').hide();
            table.append(table_html);

            $('#table_stat tr').tooltip({});
            $('#vokal_total_download_tracks').text(total_download_tracks);
        });
    }, 300);
}


jQuery(function ($) {
    console.log(chrome.app);
    $('#vokal_version').text(chrome.app.getDetails().version);

    chrome.storage.local.getBytesInUse('tracks', function (bytes) {
        $('#vokal_cache_size').text(bytes);
    });

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
            $('#description').append('Успех!');
        });
    });    


    $('#action__reset_cache').on('click', function (e) {
        chrome.storage.local.clear();
        //chrome.browserAction.setBadgeText({text: String(0)});
        chrome.storage.local.getBytesInUse('tracks', function (bytes) {
            $('#vokal_cache_size').text(bytes);
        });
    });

    $('.nav-tabs a').on('click', function (e) {
        console.log(e.target)
        if ($(e.target).attr('href') == "#stat") {
            show_stat();
        }
    })
})
