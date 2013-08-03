jQuery(function ($) {
    console.log(chrome.app);
    $('#vokal_version').text(chrome.app.getDetails().version);

    chrome.storage.local.getBytesInUse('tracks', function (bytes) {
        $('#vokal_cache_size').text(bytes);
    });

    $('#action__reset_cache').on('click', function (e) {
        chrome.storage.local.clear();
        chrome.browserAction.setBadgeText({text: String(0)});
        chrome.storage.local.getBytesInUse('tracks', function (bytes) {
            $('#vokal_cache_size').text(bytes);
        });
    });

    $('.nav-tabs a').on('click', function (e) {
        console.log(e.target)

    })

    chrome.storage.local.get("tracks", function (fetchedData) {

        var tracks = fetchedData.tracks;
        var table = $("#table_stat");

        var header = '<thead><th>Автор</td><th>Название</th><th>Продолжительность</th><th>Битрейт</th><th>Файл</th></thead>';
        table.append(header);

        $('#vokal_total_tracks').text(tracks.length);

        var total_download_tracks = 0;
        $.each(tracks, function (index, track) {
            var className = track.downloaded ? 'success' : '';

            if (track.downloaded) total_download_tracks++;

            var row = '<tr class="' + className + '"><td>' + track.artist + '</td>' +
                '<td>' + track.title + '</td>' +
                '<td>' + track.duration + '</td>' +
                '<td>' + track.bit_rate + '</td>' +
                '<td>' + (track.file || '&mdash;') + '</td></tr>';
            table.append(row);
        })

        $('#vokal_total_download_tracks').text(total_download_tracks);
    });
})
