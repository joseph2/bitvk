var vokal = {
    index: 0,
    tracks: [],

    getTrack: function(index) {
       return this.tracks[index];
    },

    addTrack: function (track) {
        track.id = this.index++;
        track.downloaded = false;
        this.tracks[track.id] = track

        return track;
    },

    findTrackByUrl: function(url) {
        $.each(this.tracks, function(index, track){
            if (track.url == url) {
                return track;
            }
        })

        return undefined;
    },
    markDownloadedTrack: function (track) {
        track.downloaded = true;
        this.tracks[track.id] = track;
    }
};

function clientListener() {
    $(document).on('mouseover', 'div.audio', function (e) {

        e.preventDefault();
        var el = $(e.target)
        while (!el.hasClass('audio')) {
            el = el.parent();
        }
        if (!el.attr('vokal_id')) {
            var track = parseAudioNode(el)
            if (track === undefined) return;

            var vokal_track = vokal.findTrackByUrl(track.url)
            if (vokal_track === undefined) {
                vokal.addTrack(track)
            }


            injectDownloadLink(el, track);
            el.attr('vokal_id', track.id)
        }

    });
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
    clientListener();

    $(document).on('click', '.vokal_el', function (e) {

        var track_id = $(e.target).attr('vokal_track_id')
        if (track_id == undefined) return;
        var track = vokal.getTrack(parseInt(track_id))
        if (!track.downloaded) {
            chrome.extension.sendMessage({cmd: "vokal_download_audio", track: track});
            vokal.markDownloadedTrack(track)
            var el = $(e.target)
            while (!el.hasClass('info')) {
                el = el.parent();
            }
            $('.duration', el).addClass('vokal_downloaded');
        }

        return false;
    })
};


Zepto(function ($) {
    initialize();
})
