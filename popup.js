Zepto(function ($) {
    chrome.storage.local.get("tracks", function (fetchedData) {
        $.each(fetchedData.tracks, function (index, track) {
            var className = track.downloaded ? 'downloaded' : 'not_downloaded';
            var row = '<li class="' + className + '"><strong>' + track.artist + '</strong> - ' + track.title + '</li>';
            $("#track_list").append(row);
        })
    });
})
