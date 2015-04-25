var SERVER_ADDRESS = "https://accounts.google.com/o/oauth2/auth";
var CLIENT_ID = "872533094067-3mae4rlvuahk2pb146ju3ncgrtbh4c2s.apps.googleusercontent.com";
var REDIRECT_URI = "http://smishlayev.github.io/yum/index.html";
var SCOPE = [
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/userinfo.profile",
];
var VALIDATION_SERVER = "https://www.googleapis.com/oauth2/v1/tokeninfo";

function handleClientLoad() {
    checkAuth();
}

function checkAuth() {
    gapi.auth.authorize({
        client_id: CLIENT_ID,
        scope: SCOPE,
        immediate: true
    }, handleAuthResult);
}

function requestAuth() {
    gapi.auth.authorize({
        client_id: CLIENT_ID,
        scope: SCOPE,
        immediate: false
    }, handleAuthResult);
}

function handleAuthResult(authResult) {
    if(authResult && !authResult.error) {
        $.cookie("user_id", authResult.user_id, {expires: authResult.expires});
        setUserInfo();
        requestUploadListId();
    } else {
        $("div.profile .profile_login").click(requestAuth);
        // $("div.video").html("Please log in first");
    }
}

function setUserInfo() {
    gapi.client.load("plus", "v1", function() {
        var request = gapi.client.plus.people.get({"userId": "me"});
        request.execute(function(response) {

            $("div.profile div.profile__name").text(response.displayName);
            $("div.profile div.profile__image img").attr("src", response.image.url);
        });
    });
}

function requestUploadListId() {
    gapi.client.load("youtube", "v3", function() {
        request = gapi.client.youtube.channels.list({
            mine: true,
            part: "contentDetails",
        });
        request.execute(function(response) {
            playlistId = response.result.items[0].contentDetails.relatedPlaylists.uploads;
            requestPlaylistVideos(playlistId);
        });
    });
}

function requestPlaylistVideos(playlistId) {
    var request = gapi.client.youtube.playlistItems.list({
        playlistId: playlistId,
        part: "contentDetails,snippet",
        //fields: "entry/sippet/title",//(title,thumbnails.medium),contentDetails/duration",
        maxResult: 10,
    });
    request.execute(function(response) {
        if(response.result.items) {
            $.each(response.result.items, function(index, item) {
                addVideo(item);
            });
        } else {
            $("div.video").html("Sorry, no videos are there for you");
        }
    });
}

function addVideo(item) {
    var reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
    var duration = "";
    if (reptms.test(item.contentDetails.duration)) {
        var matches = reptms.exec(input);
        if (matches[1])
            duration += matches[1] + ":";
        if (matches[2])
            duration += matches[2] + ":";
        else
            duration += "00:";
        if (matches[3])
            duration += matches[3];
        else
            duration += "00";
    }

    var li = $("<li>", {
            class: "video__item col-lg-3 col-sm-4 col-xs-6"});
    var a = $("<a>", {
        href: "http://www.youtube.com/watch?v=" + item.contentDetails.videoId,
        class: "video_link",
        title: item.snippet.title}).appendTo(li);
    var img = $("<img>", {
        src: "http://i.ytimg.com/vi/ZKOtE9DOwGE/mqdefault.jpg",
        alt: item.snippet.title,
        class: "img-responsive"}).appendTo(a);
    var h2 = $("<h2>").text(item.snippet.title).appendTo(a);
    var play = $("<span>", {
        class: "glyphicon glyphicon-play-circle"}).appendTo(a);
    var duration = $("<span>", {
        class: "duration"}).text(duration).appendTo(a);
    $("ul.video__list").append(li);
}


$( window ).resize(function() {
    $('.filters__bar').affix({
        offset: {
            top: $('.filters').offset().top
        }
    }); 
});




