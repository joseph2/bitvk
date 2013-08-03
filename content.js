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

    this.update = function (new_track) {
        var track = !this.tracks[new_track.id];
        if (!track) return;

        track.duration = new_track.duration
        track.bytes = new_track.bytes
        track.bit_rate = new_track.bit_rate

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
    while (!el.hasClass('area')) {
        el = el.parent();
    }

    el.addClass('vokal_downloaded');
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

//{"0":"XXXXXXX","1":"217260901","2":"https://psv4.vk.me/c1062/u939351/audios/35e614163a0f.mp3","3":"201","4":"3:21","5":"Trobar De Morte","6":"The Harp of Dagda","7":"23180514","8":"0","9":"0","10":"","11":"0","12":"1","_order":1,"_prev":"XXXXXXX_218332870","_next":"XXXXXXX_214922351","aid":"XXXXXXX_217260901"}
function onPlayerDownloadClick(vk_data) {
    var raw_track = {}
    raw_track.url = vk_data["2"]
    raw_track.artist = vk_data["5"]
    raw_track.title = vk_data["6"]
    raw_track.duration = vk_data["4"]


    var track = trackList.add(raw_track)
    trackList.download(track)
    return raw_track;
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

            $.ajax({
                type: 'HEAD',
                url: raw_track.url,
                timeout: 1000,
                success: function (data, textStatus, request) {
                    track.bytes = parseInt(request.getResponseHeader('Content-Length'));
                    var seconds = stringTimeToSeconds(track.duration);
                    var kbit = track.bytes / 128;
                    track.bit_rate = Math.ceil(Math.round(kbit / seconds) / 16) * 16;

                    injectDownloadLink(node, track);
                },
                error: function (xhr, type) {
                    console.log(xhr, type)
                }
            })

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

        if (event.target.className == 'vokal_ac_download_btn') {
            onPlayerDownloadClick(JSON.parse((event.target.getAttribute('current_track'))))
        }

        if (event.target.id == 'ac_play' && !$('#vokal_ac_btn').length) {
            setTimeout(function () {
                var download_link = '<div id="vokal_ac_btn" class="vokal_el ctrl_wrap clear_fix fl_l" ' +
                    'onmouseover="Audio.rowActive(this, \'Скачать аудиозапись\', [9, 5, 0]);" ' +
                    'onclick="return cancelEvent(event);">' +
                    '<div class="vokal_ac_download_btn" current_track="" ' +
                    'onmouseover="this.setAttribute(\'current_track\', JSON.stringify(window.audioPlayer.lastSong));" ></div></div>';
                $('#ac_status').after(download_link);
            }, 200);
        }
    }, true);
}

function stringTimeToSeconds(string) {
    var result = 0;
    var arr = string.split(':').reverse();
    for (var i = 0; i < arr.length; i++) {
        result += parseInt(arr[i]) * Math.pow(60, i);
    }

    return result;
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
    track.duration = $('.duration', node).text();

    return track;
};

function injectDownloadLink(node, track) {
    var download_link = '<div class="audio_remove_wrap vokal_el fl_r" ' +
        'onmouseover="Audio.rowActive(this, \'Скачать аудиозапись\', [9, 5, 0]);" ' +
        'onmouseout="Audio.rowInactive(this);" ' +
        'onclick="return cancelEvent(event);">' +
        '<div vokal_track_id="' + track.id + '" class="vokal_download_btn"></div></div>';

    $('.actions', node).prepend(download_link);


    node.attr('vokal_id', track.id)

    $('.duration', node).after('<div class="fl_r vokal_bitrate">' + track.bit_rate + ' kb/s</div>');

    if (track.downloaded) {
        markDownloaded($('.area', node));
    }
};


Zepto(function ($) {
    trackList = new TrackList(chrome.storage.local);

    $(document).on('load_data', function () {
        clientTimerListener();
        clientClickListener();
    })

})
