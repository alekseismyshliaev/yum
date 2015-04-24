var SERVER_ADDRESS = "https://accounts.google.com/o/oauth2/auth";
var CLIENT_ID = "872533094067-3mae4rlvuahk2pb146ju3ncgrtbh4c2s.apps.googleusercontent.com";
var REDIRECT_URI = "http://smishlayev.github.io/yum/index.html";
var SCOPE = [
    "https://www.googleapis.com/auth/youtube.upload",
];

function constructAuthURI() {
    var parameters = {
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: SCOPE.join(),
        response_type: "token"
    };
    return SERVER_ADDRESS + "?" + $.param(parameters);
}

function makeAuthRequest() {
    window.location.replace(constructAuthURI());
}

$(document).ready(function() {
    makeAuthRequest();
});


