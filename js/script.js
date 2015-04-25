var SERVER_ADDRESS = "https://accounts.google.com/o/oauth2/auth";
var CLIENT_ID = "872533094067-3mae4rlvuahk2pb146ju3ncgrtbh4c2s.apps.googleusercontent.com";
var REDIRECT_URI = "http://smishlayev.github.io/yum/index.html";
var SCOPE = [
    "https://www.googleapis.com/auth/youtube.upload",
];
var VALIDATION_SERVER = "https://googleapis.com/oauth2/v1/tokeninfo";

function constructAuthURI() {
    var parameters = {
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: SCOPE.join(" "),
        response_type: "token"
    };
    return SERVER_ADDRESS + "?" + $.param(parameters);
}

function makeAuthRequest() {
    window.location.replace(constructAuthURI());
}

function deparam(s) {
    data = s.split("&");
    var dict = {};
    $.each(data, function(index, elem) {
        var key = "";
        var value = "";
        [key, value] = elem.split("=");
        dict[key] = value;
    });
    return dict;
}

function handleAuthResponse(data) {
    makeValidationRequest(data);
}

function makeValidationRequest(token) {
    $.getJSON(VALIDATION_SERVER + "?" + $.param({access_token: token}),
         handleValidationResponse);
}

function handleValidationResponse(data) {
    if(data["audience"] != CLIENT_ID) {
        //TODO something went wrong
    }
    if(data["scope"] != SCOPE.join(" ")) {
        //TODO something went wrong
    }
    if(data["error"]) {
        // TODO have errors
    }
    alert("success");
}



$(document).ready(function() {
    var data = deparam(window.location.hash.substring(1));
    if("access_token" in data) { // set cookie and check it
        makeValidationRequest(data["access_token"]);
    } else {
        makeAuthRequest();
    }
});


