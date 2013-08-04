function throw_event(name, data) {
    var event = document.createEvent("Event");
    event.initEvent(name, true, true);
    document.dispatchEvent(event);
    console.log('Dispatch event: ' + name);
}

SETTINGS = {
    gather_detail: true
};

var Track = function Track() {
    this._version = 1;
    this.id = null;
    this.vk_id = null;
    this.url = null;
    this.artist = null;
    this.title = null;
    this.duration = null;
    this.bit_rate = null;
    this.bytes = null;
    this.downloaded = false;
    this.file = null;
}

hasFileDetails = function (track) {
    return track.duration && track.bit_rate && track.bytes;
};


trackList = {
    storage_key: 'tracks',
    storage    : null,
    receiver   : null,
    tracks     : [],
    index      : 0,
    changed    : false,

    initialize: function (storage, receiver) {
        this.storage = storage;
        this.receiver = receiver;

        var loader = (function (track_list) {
            return function (fetched_data) {

                if (Object.getOwnPropertyNames(fetched_data).length > 0) {
                    track_list.tracks = fetched_data.tracks;
                    track_list.index = track_list.tracks.length;
                    console.log('load tracks:' + track_list.tracks.length);
                } else {
                    console.log('Not saved tracks');
                }

                throw_event('load_data');
            }
        })(this);

        storage.get(this.key, loader);
    },

    download: function (track) {
        track.file = track.artist + " - " + track.title + '.mp3';
        var a = document.createElement('a');
        a.href = track.url;
        a.download = track.file;
        a.click();

        track.downloaded = true;
        this.add(track);

//            this.receiver.sendMessage({cmd: "vokal_download_audio", track: track});
    },

    save: function () {
        if (!this.changed) return;

        var items = this.tracks;
        this.storage.set({'tracks': items});
//        this.receiver.sendMessage({cmd: "vokal_update_data", number: items.length});
        chrome.extension.sendMessage({cmd: "vokal_update_data", number: items.length});
        this.changed = false;
    },

    /**
     * @param vk_id
     * @returns {Track}
     */
    getByVkId: function (vk_id) {
        for (var i = 0; i < this.tracks.length; i++) {
            if (this.tracks[i].vk_id == vk_id) {
                return this.tracks[i];
            }
        }

        return null;
    },

    get: function (id) {
        return this.tracks[id]
    },
    add: function (track) {

        if (track.id && this.tracks[track.id]) {
            this._update(track);
            return;
        }

        var exist_track = this.getByVkId(track.vk_id);
        if (exist_track) {
            track.id = exist_track.id;
            this._update(track);
            return;
        }

        track.id = this.index++;
        this.tracks[track.id] = track;
        this.changed = true;
        console.log('add', track);
    },

    _update: function (new_track) {
        var changed = false;
        var track = this.tracks[new_track.id];

        for (var property in new_track) {
            var new_field = new_track[property]
            if (new_field !== track[property]) {
                track[property] = new_field;
                changed = true;
            }
        }

        //fixme
        this.changed = true;
        console.log('update', track);
    }
};

window.view = {
    markDownloaded: function (btn) {
        var el = $(btn)
        while (!el.hasClass('area')) {
            el = el.parent();
        }

        el.addClass('vokal_downloaded');
    },

    onDownloadClick      : function (target) {

        var track_id = $(target).attr('vokal_track_id')
        if (track_id === undefined) return;
        var track = trackList.get(parseInt(track_id));

        if (track && !track.downloaded) {
            trackList.download(track);
            this.markDownloaded(target);
        }
    },

//{"0":"XXXXXXX","1":"217260901","2":"https://psv4.vk.me/c1062/u939351/audios/35e614163a0f.mp3","3":"201","4":"3:21","5":"Trobar De Morte","6":"The Harp of Dagda","7":"23180514","8":"0","9":"0","10":"","11":"0","12":"1","_order":1,"_prev":"XXXXXXX_218332870","_next":"XXXXXXX_214922351","aid":"XXXXXXX_217260901"}
    onPlayerDownloadClick: function (vk_data) {
        var track = new Track();
        track.vk_id = vk_data.aid;
        track.url = vk_data["2"];
        track.artist = vk_data["5"];
        track.title = vk_data["6"];
        track.duration = vk_data["4"];


        trackList.add(track);
        trackList.download(track);

        return track;
    }
}

window.parser = {
    parseAudioList: function () {
        $('.audio').each(function () {

            var node = $(this);
            if (node.hasClass('claimed')) return;

            if (!node.attr('vokal_id')) {
                var unsaved_track = parser.parseAudioNode(node);
                if (!unsaved_track) return;

                var track = trackList.getByVkId(unsaved_track.vk_id);
                if (!track) {
                    track = unsaved_track;
                    trackList.add(track)
                }

                if (SETTINGS.gather_detail && !hasFileDetails(track)) {
                    var callback = (function (node) {
                        return function (track) {
                            injector.injectToAudioNode(node, track)
                        };
                    })(node);

                    parser.gatherTrackDetail(unsaved_track, callback);
                } else {
                    injector.injectToAudioNode(node, track);
                }


            }
        })
    },

    gatherTrackDetail: function (track, callback) {
        $.ajax({
            type   : 'HEAD',
            url    : track.url,
            timeout: 2000,
            success: function (data, textStatus, request) {
                track.bytes = parseInt(request.getResponseHeader('Content-Length'));
                var seconds = parser.stringTimeToSeconds(track.duration);
                var kbit = track.bytes / 128;
                track.bit_rate = Math.ceil(Math.round(kbit / seconds) / 16) * 16;
                trackList.add(track);
                callback(track);
            },
            error  : function (xhr, type) {
                console.log(track, xhr);
            }
        })
    },

    stringTimeToSeconds: function (string) {
        var result = 0;
        var arr = string.split(':').reverse();
        for (var i = 0; i < arr.length; i++) {
            result += parseInt(arr[i]) * Math.pow(60, i);
        }

        return result;
    },

    /**
     * .audio element
     * @param node
     * @returns {Track}
     */
    parseAudioNode: function (node) {

        if (!node[0].id) return null;
        var matches = node[0].id.match(/(\d+_\d+)/);
        if (!matches) return null;

        var vk_id = matches[0];
        var value = $('input[type=hidden]', node).val();

        if (!value) return null;

        var hrefArr = value.split(',');
        if (hrefArr.length == 0) return null;

        var track = new Track();
        track.vk_id = vk_id;
        track.url = hrefArr[0];
        track.artist = $.trim($('.title_wrap b', node).text());
        track.title = $.trim($('.title_wrap .title', node).text());
        track.duration = $('.duration', node).text();

        return track;
    }
};


injector = {
    clientTimerListener: function () {
        parser.parseAudioList();

        setInterval(function () {
            parser.parseAudioList()
        }, 1000);

        setInterval(function () {
            trackList.save();
        }, 2000);
    },

    clientClickListener: function () {
        window.document.addEventListener('click', function (event) {
            /**
             * click by download button's from audio list
             */
            if (event.target.className == 'vokal_download_btn') {
                view.onDownloadClick(event.target)
            }

            // click by download button's from top player
            if (event.target.className == 'vokal_ac_download_btn') {
                view.onPlayerDownloadClick(JSON.parse((event.target.getAttribute('current_track'))))
            }


            //inject to top player
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
    },

    /**
     *
     * @param node
     * @param track
     */
    injectToAudioNode: function (node, track) {
        var download_link = '<div class="audio_remove_wrap vokal_el fl_r" ' +
            'onmouseover="Audio.rowActive(this, \'Скачать аудиозапись\', [9, 5, 0]);" ' +
            'onmouseout="Audio.rowInactive(this);" ' +
            'onclick="return cancelEvent(event);">' +
            '<div vokal_track_id="' + track.id + '" class="vokal_download_btn"></div></div>';

        $('.actions', node).prepend(download_link);


        node.attr('vokal_id', track.id)

        if (track.bit_rate) {
            $('.duration', node).after('<div class="fl_r vokal_bitrate">' + track.bit_rate + ' kb/s</div>');
        }

        if (track.downloaded) {
            view.markDownloaded($('.area', node));
        }
    }
};

Zepto(function ($) {
    window.trackList.initialize(chrome.storage.local, chrome.extension);

    $(document).on('load_data', function () {
        injector.clientTimerListener();
        injector.clientClickListener();
    })

});
