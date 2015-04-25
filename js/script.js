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

function handleAuthResult(authResult) {
    if(authResult && !authResult.error) {
        setUserInfo();
        requestUploadListId();
    } else {
        window.location.replace(LOGIN_URI);
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
        src: item.snippet.thumbnails.medium.url,
        alt: item.snippet.title,
        class: "img-responsive"}).appendTo(a);
    var h2 = $("<h2>").text(item.snippet.title).appendTo(a);
    var play = $("<span>", {
        class: "glyphicon glyphicon-play-circle"}).appendTo(a);
    var duration = $("<span>", {
        class: "duration"}).text(duration).appendTo(a);
    $("ul.video__list").append(li);
}

var UploadVideo = function() {
  this.tags = ["yum", "garage48"];
  this.categoryId = 22;
  this.videoId = "";
  this.uploadStartTime = 0;
  this.token = gapi.auth.getToken().access_token;
};

UploadVideo.prototype.uploadFile = function(file) {
  var metadata = {
    snippet: {
      title: file.name,
      description: $("Uploaded using YUM").text(),
      tags: this.tags,
      categoryId: this.categoryId
    },
    status: {
      privacyStatus: "unlisted",
    }
  };
  this.file = file;
  var uploader = new MediaUploader({
    baseUrl: "https://www.googleapis.com/upload/youtube/v3/videos",
    file: file,
    token: this.token,
    metadata: metadata,
    params: {
      part: Object.keys(metadata).join(",")
    },
    onError: function(data) {
      var message = data;
      // Assuming the error is raised by the YouTube API, data will be
      // a JSON string with error.message set. That may not be the
      // only time onError will be raised, though.
      try {
        var errorResponse = JSON.parse(data);
        message = errorResponse.error.message;
      } finally {
        alert(message);
      }
    }.bind(this),
    onProgress: function(data) {
      var currentTime = Date.now();
      var bytesUploaded = data.loaded;
      var totalBytes = data.total;
      // The times are in millis, so we need to divide by 1000 to get seconds.
      var bytesPerSecond = bytesUploaded / ((currentTime - this.uploadStartTime) / 1000);
      var estimatedSecondsRemaining = (totalBytes - bytesUploaded) / bytesPerSecond;
      var percentageComplete = (bytesUploaded * 100) / totalBytes;

      //$('#upload-progress').attr({
      //  value: bytesUploaded,
      //  max: totalBytes
      //});

      //$('#percent-transferred').text(percentageComplete);
      //$('#bytes-transferred').text(bytesUploaded);
      //$('#total-bytes').text(totalBytes);

      //$('.during-upload').show();
    }.bind(this),
    onComplete: function(data) {
      var uploadResponse = JSON.parse(data);
      this.videoId = uploadResponse.id;
      //$('#video-id').text(this.videoId);
      //$('.post-upload').show();
      this.pollForVideoStatus();
    }.bind(this)
  });
  // This won't correspond to the *exact* start of the upload, but it should be close enough.
  this.uploadStartTime = Date.now();
  uploader.upload();
};

var STATUS_POLLING_INTERVAL_MILLIS = 1 * 1000;
UploadVideo.prototype.pollForVideoStatus = function() {
    gapi.client.request({
        path: "/youtube/v3/videos",
        params: {
            part: "status,player",
            id: this.videoId
        },
        callback: function(response) {
            if (response.error) {
                // The status polling failed.
                console.log(response.error.message);
                setTimeout(this.pollForVideoStatus.bind(this), STATUS_POLLING_INTERVAL_MILLIS);
            } else {
                var uploadStatus = response.items[0].status.uploadStatus;
                switch (uploadStatus) {
                    // This is a non-final status, so we need to poll again.
                    case "uploaded":
                        this.file.previewElement.classList.add("dz-success");
                        setTimeout(this.pollForVideoStatus.bind(this), STATUS_POLLING_INTERVAL_MILLIS);
                        break;
                    // The video was successfully transcoded and is available.
                    case "processed":
                        alert("processed " + this.file.name);
                        break;
                    // All other statuses indicate a permanent transcoding failure.
                    default:
                        this.file.previewElement.classList.add("dz-error");
                        break;
                }
            }
        }.bind(this)
    });
};

function processAddedFile(file) {
    var up = new UploadVideo();
    up.uploadFile(file);
}

$( window ).resize(function() {
    if( $('.filters__bar')){
        $('.filters__bar').affix({
            offset: {
                top: $('.filters').offset().top
            }
        });
    }
});

$(function() {
    Dropzone.autoDiscover = false;
    $("#file-dropzone").dropzone({
        url: "/stub",
        autoProcessQueue: false,
        maxFilesize: 100,
        paramName: "uploadfile",
        uploadMultiple: true,
        maxThumbnailFilesize: 5,
        init: function() {
            this.on("addedfile", function(file) {
                processAddedFile(file);
            });
        },
    });
})
