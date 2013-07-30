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

        var table = $("#table_stat");

        var header = '<thead><th>Artist</td><th>Title</th><th>Duration</th><th>Bit rate</th><th>File</th></thead>';
        table.append(header);

        $.each(fetchedData.tracks, function (index, track) {
            var className = track.downloaded ? 'success' : '';

            var row = '<tr class="' + className + '"><td>' + track.artist + '</td>' +
                '<td>' + track.title + '</td>' +
                '<td>' + track.duration + '</td>' +
                '<td>' + track.bit_rate + '</td>' +
                '<td>' + (track.file || '&mdash;') + '</td></tr>';
            table.append(row);
        })
    });
})
