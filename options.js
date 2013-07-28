jQuery(function ($) {

    $('#vokal_version').text(chrome.app.getDetails().version);

    chrome.storage.local.getBytesInUse('tracks', function(bytes)
    {
        $('#vokal_cache_size').text(bytes);
    });

    $('#action__reset_cache').on('click', function (e) {
        chrome.storage.local.clear();
        chrome.storage.local.getBytesInUse('tracks', function(bytes)
        {
            $('#vokal_cache_size').text(bytes);
        });
    });

    $('.nav-tabs a').on('click', function (e) {
        console.log(e.target)

    })
})
