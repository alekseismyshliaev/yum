var SERVER_ADDRESS = "https://accounts.google.com/o/oauth2/auth";
var CLIENT_ID = "872533094067-3mae4rlvuahk2pb146ju3ncgrtbh4c2s.apps.googleusercontent.com";
var REDIRECT_URI = "http://smishlayev.github.io/yum/manager.html";
var LOGIN_URI = "http://smishlayev.github.io/yum/index.html";
var SCOPE = [
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/userinfo.profile",
].join(" ");
var VALIDATION_SERVER = "https://www.googleapis.com/oauth2/v1/tokeninfo";

function handleClientLoad() {
    var params = {
        callback: handleAuthResult,
        client_id: CLIENT_ID,
        cookiepolicy: "single_host_origin",
    };
    var signinButton = $("a.hero__sign-in");
    signinButton.click(function() {
        gapi.auth.signIn(params);
    });
}

function handleAuthResult(authResult) {
    if(authResult["status"]["signed_in"]) {
        alert("success");
        window.location.replace(REDIRECT_URI);
    } else {
        console.log("Sign-in state: " + authResult["error"]);
    }
}

