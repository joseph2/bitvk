var vokal = {
    index: 0,
    tracks: [],

    getTrack: function (index) {
        return this.tracks[index];
    },

    addTrack: function (track) {
        track.id = this.index++;
        track.downloaded = false;
        this.tracks[track.id] = track

        return track;
    },

    findTrackByUrl: function (url) {
        $.each(this.tracks, function (index, track) {
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

function loadData() {
    chrome.storage.local.get("tracks", function (fetchedData) {
        $.each(fetchedData.tracks, function (index, item) {
            vokal.addTrack(item)
        })
    });
}

function clientMoveListener() {
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

function clientClickListener () {
    window.document.addEventListener('click', function (event) {
        if (event.target.className == 'vokal_download_btn') {
            onDownloadClick(event.target)
        }
    }, true);
}

function onDownloadClick(target) {
    console.log(target);

    var track_id = $(target).attr('vokal_track_id')
    if (track_id == undefined) return;
    var track = vokal.getTrack(parseInt(track_id))
    if (!track.downloaded) {
        chrome.extension.sendMessage({cmd: "vokal_download_audio", track: track});
        vokal.markDownloadedTrack(track)
        var el = $(target)
        while (!el.hasClass('info')) {
            el = el.parent();
        }
        $('.duration', el).addClass('vokal_downloaded');
    }
}

function clientTimerListener() {
    setInterval(function () {
        $('.audio').each(function () {

            var node = $(this)
            if (!node.attr('vokal_id')) {
                var track = parseAudioNode(node);
                if (track === undefined) return;
                var vokal_track = vokal.findTrackByUrl(track.url)
                if (vokal_track === undefined) {
                    vokal.addTrack(track)
                }

                injectDownloadLink(node, track);
                node.attr('vokal_id', track.id)
            }
        })
    }, 1000)
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
    var download_link = '<div class="audio_remove_wrap vokal_el fl_r" ' +
        'onmouseover="Audio.rowActive(this, \'Скачать аудиозапись\', [9, 5, 0]);" ' +
        'onmouseout="Audio.rowInactive(this);" ' +
        'onclick="return cancelEvent(event);">' +
        '<div vokal_track_id="' + track.id + '" class="vokal_download_btn"></div></div>';

    $('.actions', node).prepend(download_link)
};




function initialize() {
//    clientMoveListener();
//    loadData();
    clientTimerListener();
    clientClickListener();
};


Zepto(function ($) {
    initialize();
})

