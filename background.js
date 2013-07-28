function download_complete() {
    chrome.browserAction.getBadgeText({}, function (currentText) {
        var number = parseInt(currentText)
        chrome.browserAction.setBadgeText({text: String(number + 1)});
    });
}

var cmd_listener = function (request, sender, send_response) {
    if (request.cmd == "vokal_download_audio") {
        download_complete();
    }
};

chrome.storage.local.get("tracks", function(fetchedData) {
    var number_tracks = fetchedData.tracks.length || 0;
    chrome.browserAction.setBadgeText({text: String(number_tracks + 1)});
});


chrome.browserAction.setBadgeBackgroundColor({color: [0, 93, 255, 100]});
chrome.browserAction.setBadgeText({text: String(0)});
chrome.browserAction.setPopup({popup: "popup.html"})
chrome.extension.onMessage.addListener(cmd_listener)