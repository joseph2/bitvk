// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

//Called when the user clicks on the browser action.


//chrome.browserAction.onClicked.addListener(function(tab) {
//    chrome.tabs.executeScript(
//        null, {code:"document.body.style.background='red !important'"});
//});



chrome.extension.onMessage.addListener(
    function(request, sender, send_response) {
        if (request.cmd == "audio_download") {

            options = {url:request.url}
            chrome.downloads.download(options)
            chrome.browserAction.setBadgeText({text:String(13)});
        }

    }
)


chrome.browserAction.setBadgeBackgroundColor({color:[0, 93, 255, 100]});
chrome.browserAction.setBadgeText({text:String(1)});
//window.setInterval(function() {
//    console.log("selection item:" + i);
//    chrome.browserAction.setBadgeText({text:String(i)});
//    i++;
//}, 1000);

//
//function doMagic(tab) {
//    chrome.tabs.update(tab.id, { url: 'http://www.google.com' });
//}
//chrome.browserAction.onClicked.addListener(doMagic);

//var selection_callbacks = [];
//function getSelection(callback) {
//    selection_callbacks.push(callback);
//    chrome.tabs.executeScript(null, { file:"selection.js" });
//};
//chrome.extension.onRequest.addListener(function (request) {
//    var callback = selection_callbacks.shift();
//    callback(request);
//});
//
//function sendSearch(selectedText) {
//    var serviceCall = 'http://www.google.com/search?q=' + selectedText;
//    chrome.tabs.create({url: serviceCall});
//}
//var tx = getSelection();
//var title = "Test '" + tx + "' menu item";
//var id = chrome.contextMenus.create({"title": title, "contexts":[selection],
//    "onclick": sendSearch(tx)});
//console.log("selection item:" + id);