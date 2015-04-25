var SERVER_ADDRESS = "https://accounts.google.com/o/oauth2/auth";
var CLIENT_ID = "872533094067-3mae4rlvuahk2pb146ju3ncgrtbh4c2s.apps.googleusercontent.com";
var REDIRECT_URI = "http://smishlayev.github.io/yum/manager.html";
var LOGIN_URI = "http://smishlayev.github.io/yum/index.html";
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
        setUserInfo();
        requestUploadListId();
    } else {
        $("a.hero__sign-in").click(requestAuth);
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

