var SERVER_ADDRESS = "https://accounts.google.com/o/oauth2/auth";
var CLIENT_ID = "872533094067-3mae4rlvuahk2pb146ju3ncgrtbh4c2s.apps.googleusercontent.com";
var REDIRECT_URI = "http://smishlayev.github.io/yum/index.html";
var SCOPE = [
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
        // $("button").click(requestAuth);
        $("div.video").html("Please log in first");
    }
}

function setUserInfo() {
    gapi.client.load("plus", "v1", function() {
        var request = gapi.client.plus.people.get({"userId": "me"});
        request.execute(function(response) {
            var header = $("header");
            header.append($("p").text(response.displayName));
            var img = $("<img/>", {
                src: response.image.url,
                width: "50px",
            });
            header.append(img);
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
        part: "snippet",
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
    console.log(item);
}

$(document).ready(function() {
});


