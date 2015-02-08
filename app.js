'use strict';

var app = angular.module('app', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
    templateUrl: 'home.html',
    controller: 'HomeCtrl'
  })
  .when('/student', {
    templateUrl: 'main.html',
    controller: 'StudentCtrl',
    resolve: {
      USER: function() { return 'STUDENT'; }
    }
  })
  .when('/teacher', {
    templateUrl: 'main.html',
    controller: 'StudentCtrl',
    resolve: {
      USER: function() { return 'TEACHER'; }
    }
  })
  // .when('/about', {
  //   templateUrl: 'about.html',
  //   controller: 'AboutCtrl'
  // })
  .otherwise({
    templateUrl: 'home.html',
    controller: 'HomeCtrl'
  });
  // $locationProvider.html5Mode(true);
}]);

app.run(function($rootScope) {
  $(document).ready(function() {
    $('.dropdown-button').dropdown({"hover": false});
    // if (window_width > 600) {
    //   $('ul.tabs').tabs();
    // }
    // else {
    //   $('ul.tabs').hide();
    // }
    $('.tab-demo').show().tabs();
    $('.parallax').parallax();
    $('.modal-trigger').leanModal();
    $('.tooltipped').tooltip({"delay": 45});
    $('.collapsible-accordion').collapsible();
    $('.collapsible-expandable').collapsible({"accordion": false});
    $('.materialboxed').materialbox();
    $('.scrollspy').scrollSpy();
    $('.button-collapse').sideNav();
  });
});

app.controller('HomeCtrl', ['$scope', '$rootScope', '$location', function($scope, $rootScope, $location) {
  $rootScope.root = {
    title: 'Home'
  };

  // Github Latest Commit
  if ($('#lastUpdated').length) { // Checks if widget div exists (Index only)
    $.ajax({
      url: "https://api.github.com/repos/sonph/hackutds15/commits/gh-pages",
      dataType: "json", 
      success: function (data) {
        var sha = data.sha;
        var date = jQuery.timeago(data.commit.author.date);
        // if (window_width < 600) {
        //   sha = sha.substring(0,7);
        // }
        // $('.github-commit').find('.date').html(date);
        $('#lastUpdated').html(date);
        //$('.github-commit').find('.sha').html(sha).attr('href', data.html_url);
        // $('.github-commit').find('.sha').html(sha.substring(0, 7));

        // console.log(returndata, returndata.commit.author.date, returndata.sha);
      }  
    });      
  }

  var window_width = $(window).width;

  $('.dropdown-button').dropdown({"hover": false});
  if (window_width > 600) {
    $('ul.tabs').tabs();
  }
  else {
    $('ul.tabs').hide();
  }
  $('.tab-demo').show().tabs();
  $('.parallax').parallax();
  $('.modal-trigger').leanModal();
  $('.tooltipped').tooltip({"delay": 45});
  $('.collapsible-accordion').collapsible();
  $('.collapsible-expandable').collapsible({"accordion": false});
  $('.materialboxed').materialbox();
  $('.scrollspy').scrollSpy();
  $(document).ready(function() {
    $('.button-collapse').sideNav();
  });

}]);


// app.controller('AboutCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
//   $rootScope.root = {
//     title: 'About'
//   };
// }]);

app.controller('StudentCtrl', ['$scope', '$rootScope', 'USER', function($scope, $rootScope, USER) {
  $scope.USER = USER;

  if (USER == 'STUDENT') {
    $rootScope.root = {
      title: 'Student'
    };
    $scope.YOU = TEACHER_CALL_USER;
    $scope.ME = STUDENT_CALL_USER;
    $scope.chatName = 'Teacher';
    $scope.presenceWatch = [
      {full_user_id: TEACHER_CALL_USER + '@' + DOMAIN_NAME}
    ];
    $('.teacher-only').hide();
  } else {
    $rootScope.root = {
      title: 'Teacher'
    };
    $scope.YOU = STUDENT_CALL_USER;
    $scope.ME = TEACHER_CALL_USER;
    $scope.chatName = 'Student';
    $('.teacher-only').show();
    $('#msg_box').css('margin-top', '375px');
    $('#feedback-buttons').fadeIn();
  }

  var setContactOnline = function(online) {
    $scope.contactOnline = online;
  };

  var sendStudentSMS = function(text) {
    KandyAPI.Phone.sendSMS(
      STUDENT_PHONE_NUMBER,
      'Teacher',
      text,
      function() {
      },
      function() {
        toast('Failed to send SMS', 4000);
      }
    );
  }

  var sendMsg = function(text) {
    var uuid = KandyAPI.Phone.sendIm($scope.YOU + '@' + DOMAIN_NAME, text !== undefined ? text : $('#chat_box').val(),
      function(result) {
        // toast(JSON.stringify(result), 4000);
        if (text == '#FEEDBACK-GOOD') {
          $('#msg_box').append(
            '<div class="center"><span style="color: #A0A0A0">You have provided <span style="color:#4caf50">good</span> feedback.</span></div>'
          );
          if ($scope.contactOnline == false || $scope.contactOnline == undefined) {
            sendStudentSMS('Good Work.');
          }
        } else if (text == '#FEEDBACK-AVG') {
          $('#msg_box').append(
            '<div class="center"><span style="color: #A0A0A0">You have provided <span style="color:#ffeb3b">average</span> feedback.</span></div>'
          );
          if ($scope.contactOnline == false || $scope.contactOnline == undefined) {
            sendStudentSMS('Average Work.');
          }
        } else if (text == '#FEEDBACK-BAD') {
          $('#msg_box').append(
            '<div class="center"><span style="color: #A0A0A0">You have provided <span style="color:#f44336">bad</span> feedback.</span></div>'
          );
          if ($scope.contactOnline == false || $scope.contactOnline == undefined) {
            sendStudentSMS('Bad Work.');
          }
        } else {
          $('#msg_box').append('<div><span id="msg-' + result.UUID + '" style="color:#ff6868">You: </span>' +
                  '<span>' + $('#chat_box').val() + '</span>' +
                  '</div>');
          $('#chat_box').val('');
        }
      },
      function(message, status) {
        toast('Error: ' + message + ', status: ' + status, 4000);
        $('#msg_box').append('<div><span id="msg-' + result.UUID + '" style="color:#ff6868">You: </span>' +
                  '<span>' + $('#chat_box').val() + '</span><i class="mdi-action-report-problem right"></i>' +
                  '</div>');
          $('#chat_box').val('');
      }
    );
  };

  var getMsg = function() {
    KandyAPI.Phone.getIm(function(data) {
      for (var iter = 0; iter < data.messages.length; iter++) {
        var msg = data.messages[iter];

        // take a look at the message
        // toast(JSON.stringify(msg), 4000);
        // window.prompt('message:', JSON.stringify(msg));

        if (msg.messageType == 'chat') {
          var username = msg.sender.user_id;

            // TODO : if the logged in user is a teacher and the user he/she is chatting with
            // is not the sender, open a toast saying another student has sent him/her a message
            // toast('User id: ' + msg.sender.user_id, 4000);

          if (username == $scope.YOU) {
            // TODO : delete previous messages to limit the number of displayed messages?
            // or add scroll bar
            if (msg.contentType == 'text') {
              if (msg.message.text == '#FEEDBACK-GOOD') {
                $('#msg_box').append(
                  '<div class="center"><span style="color: #A0A0A0">Teacher has provided <span style="color:#4caf50">good</span> feedback.</div>'
                );
                toast('Teacher has provided good feedback.', 4000);
              } else if (msg.message.text == '#FEEDBACK-AVG') {
                $('#msg_box').append(
                  '<div class="center"><span style="color: #A0A0A0">Teacher has provided <span style="color:#ffeb3b">average</span> feedback.</div>'
                );
                toast('Teacher has provided average feedback.', 4000);
              } else if (msg.message.text == '#FEEDBACK-BAD') {
                $('#msg_box').append(
                  '<div class="center"><span style="color: #A0A0A0">Teacher has provided <span style="color:#f44336">bad</span> feedback.</div>'
                );
                toast('Teacher has provided bad feedback.', 4000);
              } else {
                $('#msg_box').append('<div><span style="color:#68a9ff">' + $scope.chatName + ': </span><span>' + msg.message.text + '</span></div>');
              }
            } else if (msg.contentType == 'file') {

              var content_uuid = msg.message.content_uuid;

              // TODO: ask kandy guys that the thumbnail link is broken
              var fileURL = KandyAPI.Phone.buildFileUrl(content_uuid);
              var thumbnailURL = KandyAPI.Phone.buildFileThumbnailUrl(content_uuid);
              $('#msg_box').append(
                '<div><span style="color:#68a9ff">' + $scope.chatName + ': </span><img class="materialboxed message-img" src="' + thumbnailURL + '"></div></div>'
              );
            }
            
          } else {
            console.debug(msg.sender.user_id);
          }
        } else if (msg.messageType == 'chatRemoteAck') {
          // add seen checkmark
          $('#msg-' + msg.UUID).after('<i class="mdi-action-done right"></i>')
        } else {
          console.debug(msg.messageType);
          // toast('Msg type: ' + msg.messageType, 4000);

        }
      } // END loop
    }, function() { console.debug("error loading message"); });
  }
  
  $(document).ready(function() {
    $('.tooltipped').tooltip({delay: 50});
    $('.materialboxed').materialbox();

    // setup editor
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/xcode");
    editor.getSession().setMode("ace/mode/javascript");
    editor.setFontSize(13);
    editor.$blockScrolling = Infinity;
    $scope.editor = editor;


// global variables
var isLoggedIn = false;
var intervalRef = null;

/**************** TEACHER'S LISTENERS ****************/

var onData = function(data) {
    console.debug('data' + JSON.stringify(data))
    $scope.editor.getSession().setValue(data.payload)
    // editor.setValue(data.payload)
}
var onSessionUserJoinRequest = function(notification) {
  console.debug('received join request: ' + JSON.stringify(notification))
  // approve user request
  KandyAPI.Session.acceptJoinRequest(notification.session_id, notification.full_user_id,
        function () {
            console.log('teacher approve request');
        },
        function (msg, code) {
            showStatusMessage("Attempt to accept user's join request failed (" + code + "): " + msg);
        }
  );
}
var onUserJoin = function() {
  // start sending data
  console.debug('student joined');
  toast('Student is online.', 4000);
  intervalRef = setInterval(prepareAndSend, 1000);
}
var prepareAndSend = function() {
  var data = $scope.editor.getSession().getValue()
  // console.debug($scope.editor.sesison.getDocument())
  KandyAPI.Session.sendData(SESSION_ID, data);
}
var onUserLeave = function() {
  toast('Student has left.', 4000);
  if (intervalRef != null) clearInterval(intervalRef);
}

var teacherListeners = {
  'onData': onData,
    'onUserJoinRequest': onSessionUserJoinRequest,
    'onUserJoin': onUserJoin,
    'onUserLeave': onUserLeave
};

/**************** STUDENT'S LISTENERS ****************/

var onActive = function() {
  toast('Teacher is online.', 4000);
  var joinConfig = {
            user_nickname: STUDENT_CALL_USER,
            user_first_name: null,
            user_last_name: null,
            user_phone_number: null,
            user_email: null
        };
  KandyAPI.Session.join(SESSION_ID, joinConfig, onApproved, failure(msg, code));
}
var onInactive = function() {
  toast('Something went wrong! Session is inactivated.', 4000);
}
var onApproved = function() {
  console.debug('student joined session');
  intervalRef = setInterval(prepareAndSend, 1000);
}

var studentListeners = {
  'onData': onData,
  'onActive': onActive,
  'onInactive': onInactive,
  'onJoinApproved': onApproved,
};

/********************** SESSION **********************/

var setupSession = function(type, editor) {
  console.debug('setup ' + type)
  // type=[TEACHER_CALL_USER, STUDENT_CALL_USER]
  if (!isLoggedIn) {
    KandyAPI.login(APIKEY, type + '@' + DOMAIN_NAME, PASSWORD,
      function(results) {
        console.debug(type + " logged in.");
        isLoggedIn = true;

      if (type == TEACHER_CALL_USER) {
        console.debug('retrieveSession');
        retrieveSession();
      } else if (type == STUDENT_CALL_USER) {
        console.debug('joinSession');
        joinSession();
      }
      }, failure(type + ' failed to login', 500)
    );
  }
}

// Function called by teacher view only
// Retrieve default session and start sending data
var retrieveSession = function() {
  // set teacher's listener
  KandyAPI.Session.getInfoById(SESSION_ID, 
    function(results) {
      // on success, activate
      if (results.session.session_status=='inactive') {
        KandyAPI.Session.activate(SESSION_ID, 
          function(res) {
            console.debug('teacher activated. listeners=' + JSON.stringify(teacherListeners));
            KandyAPI.Session.setListeners(SESSION_ID, teacherListeners);
          },
          function() {
            if (msg != undefined) failure(msg, code)
          }
        );
      } else {
        console.debug('activated. listeners=' + JSON.stringify(teacherListeners));
        KandyAPI.Session.setListeners(SESSION_ID, teacherListeners);
      }
    }, failure('', 500)
  );
}

// Function called by student view only
// Check availability and start sending data
var joinSession = function() {
  // Get session to join
  KandyAPI.Session.getInfoById(SESSION_ID,
    function(res) {
      console.debug('student got session info')
      if (res.session.session_status=='active') {
        KandyAPI.Session.setListeners(SESSION_ID, studentListeners);  
          var joinConfig = {};
          KandyAPI.Session.join(SESSION_ID, joinConfig,
            function() {
              console.debug('student joined')
            }, 
            function() {
              if (msg != undefined) failure(msg, code)
            }
          );
      }
    }, failure('cannot get info by id', 500)
  );
}

var setLogoutOnUnload = function(type) {
  if (type == TEACHER_CALL_USER) {
    // KandyAPI.Session.inactivate(SESSION_ID, function() {console.debug('session activated')}, failure(msg, code));
    KandyAPI.Session.leave(SESSION_ID, 'reason to leave', function() { console.debug('teacher left session')}, failure(msg, code))
    clearInterval(intervalRef)
    isLoggedIn = false;
  } else if (type == STUDENT_CALL_USER) {
    // close video call?
    // leave session
    KandyAPI.Session.leave(SESSION_ID, 'reason to leave', function(){console.debug('student left session')}, failure(msg, code));
    clearInterval(intervalRef)
    // logout
    isLoggedIn = false;
  }
}

var failure = function(msg, code) {
  console.debug("err : msg=" + msg + "; status=" + status);
  console.debug(isLoggedIn)
}



    // setup kandy video call
    setLogoutOnUnload();
    // setup();
    // login($scope.ME);
    setupSession($scope.ME);
    if ($scope.presenceWatch !== undefined) {
      KandyAPI.Phone.watchPresence($scope.presenceWatch);
    }
    setInterval(getMsg, 5000);

    // setup kandy cobrowsing
    // loginUser();
    // var session = JSON.parse(SESSION);
    // getOpenSessions();
    // leaveSession(session);
    // loadSessionDetails(session);
    // joinSession(session);
    // startCoBrowseAgent(session);


    $('#callBtn').on('click', function () {
      if ($scope.contactOnline == false) {
        if ($scope.USER == 'TEACHER') {
          KandyAPI.Phone.makePSTNCall(STUDENT_PHONE_NUMBER, 'Teacher');
        } else {
          KandyAPI.Phone.makePSTNCall(TEACHER_PHONE_NUMBER, 'Student');
        }
      } else {
        makeCall($scope.YOU);
      }
    });
    $('#answerVideoCallBtn').on('click', answerVideoCall);
    $('#rejectCallBtn').on('click', rejectCall);
    $('#hangUpCallOutBtn').on('click', hangUpCall);
    $('#holdBtn').on('click', holdCall);
    $('#unholdBtn').on('click', unholdCall);
    $('#hangUpBtn').on('click', hangUpCall);

    $('#input-file').on('change', function() {
      toast('You chose a file', 4000);
      var file = document.getElementById("input-file").files[0]; 
      $scope.fileUUID = KandyAPI.Phone.sendImWithFile($scope.YOU + '@' + DOMAIN_NAME, file,
        function(content_uuid) {  // success function
            // YOUR CODE GOES HERE
          toast(content_uuid, 4000);
          var fileURL = KandyAPI.Phone.buildFileUrl(content_uuid);
          var thumbnailURL = KandyAPI.Phone.buildFileThumbnailUrl(content_uuid);

          // TODO: ask Kandy guy: link is broken
          $('#msg_box').append(
            '<div id="msg-' + content_uuid + '"><span style="color:#ff6868">You: </span><img class="materialboxed message-img" src="' + thumbnailURL + '"></div></div>'
          );
        },
        function() {
          toast('Failed to send file', 4000);
        }
      );
    });

    $('#chat_box').on('keypress', function() {
      if (window.event.keyCode == 13) {
        sendMsg();
      }
    });

    $('#feedback-good').on('click', function() {
      sendMsg('#FEEDBACK-GOOD');
    });

    $('#feedback-avg').on('click', function() {
      sendMsg('#FEEDBACK-AVG');
    });

    $('#feedback-bad').on('click', function() {
      sendMsg('#FEEDBACK-BAD');
    });
  });
}]);


