Zepto(function ($) {
    chrome.storage.local.get("tracks", function (fetchedData) {
        var list = $("#track_list");
        list.addClass('loading');
        var tracks = fetchedData.tracks;

        var html = '';

        if (tracks && tracks.length) {

            fetchedData.tracks.forEach(function (track) {
                if (!track.downloaded) return;
                html += '<li><strong>' + track.artist + '</strong> - ' + track.title + '</li>';
            });
        }

        if(!html) {
            html = '<tr><td class="text-muted row_no_data" colspan="5">Нет скаченных песен</td></tr>';
        }

        list.removeClass('loading');
        list.append(html);
    });
})
