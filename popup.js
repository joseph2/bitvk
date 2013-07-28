Zepto(function ($) {

    chrome.storage.local.get("tracks", function(fetchedData) {
        $.each(fetchedData.tracks, function(index, item){
            $("#track_list").append("<li>" + item.file + "</li>")
        })
    });
})
