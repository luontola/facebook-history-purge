// ==UserScript==
// @name       Facebook History Purge
// @namespace  http://www.orfjackal.net/
// @version    1.0
// @description  Deletes from your Facebook wall all stories older than the selected post.
// @include    http://*.facebook.com/*
// @include    https://*.facebook.com/*
// @copyright  2011, Esko Luontola
// @require    http://code.jquery.com/jquery-1.6.2.min.js
// ==/UserScript==
//
// Usage instructions:
//
// Double-click the "X" button in one of your posts to use. It will 
// ask for your confirmation and then delete all posts older than the 
// current post. You must yourself click the "Older Posts" link at the 
// end of the wall to delete more, because this script will not delete 
// posts which are not shown.
//
// NOTE: This script was adapted from http://userscripts.org/scripts/show/92664

(function($) {
    if ($('a.edit_profilepicture').size() == 0) { return; /* not on profile page */ }
    
    var getSurroundingStory = function (element) {
        return $(element).closest('.storyContent');
    };
    var getAllStories = function () {
        return $('#profile_minifeed').find('.storyContent');
    };
    var deleteStoriesOlderThan = function (story) {
        var deleteAllThatFollows = false;
        getAllStories().each(function() {
            if (story.is(this)) {
                deleteAllThatFollows = true;
            }
            if (deleteAllThatFollows) {
                deleteStory(this);
            }
        });
    };
    var deleteStory = function (story) {
        console.log('delete story ', story);
        var closeButton = $(story).find('a.uiCloseButton').filter(':first');
        var params = getUrlParameters(closeButton.attr('ajaxify'));
        
        // Bare minimum parameters for the request.
        // - DOM environment variables via Firebug
        $.ajax({
            type    : 'POST',
            url     : '/ajax/minifeed.php',
            data    : {
                '__a'                   : 1,
                'profile_fbid'          : unsafeWindow.Env.user,
                'post_form_id'          : unsafeWindow.Env.post_form_id,
                'post_form_id_source'   : 'AsyncRequest',
                'ministory_key'         : params['ministory_key'],
                'story_type'            : params['story_type'],
                'fb_dtsg'               : unsafeWindow.Env.fb_dtsg
            }
        });
        
        // colors to help with debugging
        //$(story).css('background-color', 'Red');
        //$(closeButton).parent().css('background-color', 'Orange');
        $(story).closest('.uiStreamStory').hide(3000);
    };
    var getUrlParameters = function (url) {
        var e,
            a = /\+/g,  // Regex for replacing addition symbol with a space
            r = /([^&=]+)=?([^&]*)/g,
            d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
            q = url.substring(url.indexOf('?') + 1),
            urlParams = {};
        while (e = r.exec(q)) {
            urlParams[d(e[1])] = d(e[2]);
        }
        return urlParams;
    };
    
    $('#profile_minifeed').delegate('a.uiCloseButton', 'dblclick', function() {
        if (confirm("Delete this story and all that are older than it?")) {
            var story = getSurroundingStory(this);
            deleteStoriesOlderThan(story);
        }
    });
    
})(jQuery);
jQuery.noConflict();
