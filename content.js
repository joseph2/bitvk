var audios = [];

var example_track = {
    "url": '',
    "artist": '',
    "title": ''
}

function parsePlaylist() {

    var nodes = $('.audio');
    if (nodes.length > 0) {
        for (var i = 0; i < nodes.length; i++) {
            var track = parseAudioNode(nodes[i]);
            if (track == null) return;
            track.id = i;
            injectDownloadLink(nodes[i], track);
            audios[i] = track
        }
    }
    console.log(audios)

}

function parseAudioNode(node) {
    var value = $('input[type=hidden]', node).val();

    if (value === undefined) return;

    var hrefArr = value.split(',');
    if (hrefArr.length == 0) return;

    var track = {"artist": '', "title": ''}
    track.url = hrefArr[0];
    track.artist = $.trim($('.title_wrap b', node).text());
    track.title = $.trim($('.title_wrap .title', node).text());

    return track;
};

function injectDownloadLink(node, track) {
    var download_link = '<div class="audio_remove_wrap vokal_el fl_r"><div vokal_track_id="' + track.id + '" class="vokal_download_btn" onmouseover="Audio.rowActive(this, \'Скачать аудиозапись\', [9, 5, 0]);" onmouseout="Audio.rowInactive(this);" ></a></div>';
    $('.actions', node).prepend(download_link)
};


function initialize() {
    parsePlaylist();

//    $('#page_wrap').on('mouseup', initAudioNodesCount)
    $('.vokal_el').on('click', function (e) {

        var track_id = $(e.target).attr('vokal_track_id')
        if (track_id == undefined) return;
        var track = audios[parseInt(track_id)]

        chrome.extension.sendMessage({cmd: "vokal_download_audio", track: track});

        return false;
    })
};


Zepto(function ($) {
    initialize();
})
