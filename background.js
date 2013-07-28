function TrackList(storage) {
    this.key = 'tracks';
    this.storage = storage;
    this.items = [];


    var loader = (function (track_list) {
        return function (fetched_data) {
            console.log(fetched_data);
            if (Object.getOwnPropertyNames(fetched_data).length == 0) return;
            track_list.items = fetched_data.tracks;
            chrome.browserAction.setBadgeText({text: String(track_list.items.length)});
        }
    })(this);


    //load data
    storage.get(this.key, loader);

    this.add = function (track, file_name) {
        track.file = file_name
        track.downloaded = true
        this.items.push(track)
        var items = this.items
        this.storage.set({'tracks': items});
    }
}

track_list = new TrackList(chrome.storage.local);

Zepto(function ($) {});

function download_complete(downloadId) {
    chrome.browserAction.getBadgeText({}, function (currentText) {
        var number = parseInt(currentText)
        chrome.browserAction.setBadgeText({text: String(number + 1)});
    });
}

function download(url, file_name) {
    if (chrome.downloads) {
        var options = {url: url, filename: file_name}
        chrome.downloads.download(options, download_complete)
    } else {
        var a = document.createElement('a');
        a.href = url;
        a.download = file_name;
        a.click();
        download_complete();
    }
}

var cmd_listener = (function (track_list) {

    return function (request, sender, send_response) {
        if (request.cmd == "vokal_download_audio") {
            var track = request.track
            var file_name = track.artist + " - " + track.title + '.mp3';
            download(track.url, file_name); // todo add try..catch
            track_list.add(track, file_name)
        }

    };
})(track_list)


chrome.browserAction.setBadgeBackgroundColor({color: [0, 93, 255, 100]});
chrome.browserAction.setBadgeText({text: String(0)});
chrome.browserAction.setPopup({popup: "popup.html"})
chrome.extension.onMessage.addListener(cmd_listener)