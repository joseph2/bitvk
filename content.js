function throw_event(name, data) {
    var event = document.createEvent("Event");
    event.initEvent(name, true, true);
    document.dispatchEvent(event);
    console.log('Dispatch event: ' + name);
}

function TrackList(storage) {
    this.key = 'tracks';
    this.storage = storage;
    this.tracks = [];
    this.index = 0;

    var loader = (function (track_list) {
        return function (fetched_data) {

            if (Object.getOwnPropertyNames(fetched_data).length > 0) {
                track_list.tracks = fetched_data.tracks;
            }

            console.log('load tracks:' + track_list.tracks.length);
            throw_event('load_data');
        }
    })(this);

    storage.get(this.key, loader);

    this.download = function (track) {
        track.file = track.artist + " - " + track.title + '.mp3'
        var a = document.createElement('a');
        a.href = track.url;
        a.download = track.file;
        a.click();

        track.downloaded = true
        this.tracks[track.id] = track

        var items = this.tracks
        this.storage.set({'tracks': items});
        chrome.extension.sendMessage({cmd: "vokal_download_audio", track: track});
    }

    this.get = function (index) {
        return this.tracks[index];
    }

    this.add = function (track) {
        track.id = this.index++;
        track.downloaded = false;
        this.tracks[track.id] = track

        return track;
    }

    this.findByUrl = function (url) {

        for (var i = 0; i < this.tracks.length; i++) {
            if (this.tracks[i].url == url) {
                return this.tracks[i];
            }
        }

        return undefined;
    }
}


function markDownloaded(btn) {
    var el = $(btn)
    while (!el.hasClass('info')) {
        el = el.parent();
    }

    $('.duration', el).addClass('vokal_downloaded');
}

function onDownloadClick(target) {

    var track_id = $(target).attr('vokal_track_id')
    if (track_id == undefined) return;
    var track = trackList.get(parseInt(track_id))

    if (!track.downloaded) {
        trackList.download(track);
        markDownloaded(target)
    }
}

audio_list_parser = function () {
    $('.audio').each(function () {

        var node = $(this)
        if (!node.attr('vokal_id')) {
            var raw_track = parseAudioNode(node);
            if (raw_track === undefined) return;

            var track = trackList.findByUrl(raw_track.url)
            if (track === undefined) {
                console.log('new track:' + raw_track.url);
                track = trackList.add(raw_track)
            }

            injectDownloadLink(node, track);
            node.attr('vokal_id', track.id)

            ;
            if (track.downloaded) {
                $('.duration', node).addClass('vokal_downloaded');
            }

        }
    })
};

function clientTimerListener() {
    audio_list_parser();
    setInterval(audio_list_parser, 1000)
}

function clientClickListener() {
    window.document.addEventListener('click', function (event) {
        if (event.target.className == 'vokal_download_btn') {
            onDownloadClick(event.target)
        }
    }, true);
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


Zepto(function ($) {
    trackList = new TrackList(chrome.storage.local);

    $(document).on('load_data', function () {
        clientTimerListener();
        clientClickListener();
    })

})
