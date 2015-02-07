'use strict';

var app = angular.module('app', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
    templateUrl: 'home.html',
    controller: 'HomeCtrl'
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


  // setup kandy
  var uiState = '';
  var callId = null;
  var audio = null;

  var setupAudio = function() {
      var ringInAudioSrcs = [
          {src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringin.mp3', type: 'audio/mp3'},
          {src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringin.ogg', type: 'audio/ogg'}
      ];
      var ringOutAudioSrcs = [
          {src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringout.mp3', type: 'audio/mp3'},
          {src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringout.ogg', type: 'audio/ogg'}
      ];
      var msgInAudioSrcs = [
          {src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/msgin.mp3', type: 'audio/mp3'},
          {src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/msgin.ogg', type: 'audio/ogg'}
      ];

      audio = {
          ringIn: $('<audio/>', {loop: 'loop', id: 'ringInAudio'})[0],
          ringOut: $('<audio/>', {loop: 'loop', id: 'ringOutAudio'})[0],
          msgIn: $('<audio/>', {id: 'msgInAudio'})[0]
      };

      // setup Msg sources
      for (var i = 0; i < msgInAudioSrcs.length; i++) {
          audio.msgIn.appendChild($('<source/>', msgInAudioSrcs[i])[0]);
      }

      // setup RingIn sources
      for (var i = 0; i < ringInAudioSrcs.length; i++) {
          audio.ringIn.appendChild($('<source/>', ringInAudioSrcs[i])[0]);
      }

      // setup RingOut sources
      for (var i = 0; i < ringOutAudioSrcs.length; i++) {
          audio.ringOut.appendChild($('<source/>', ringOutAudioSrcs[i])[0]);
      }
  };

  // called when page is done loading to initialize KandyAPI
  var setup = function() {
      setupAudio();

      try {
          if (KandyAPI === undefined) {
              alert("KandyAPI object undefined (not finding kandy.js)");
          } else if (fcs === undefined) {
              alert("fcs object undefined (not finding fcs.js)");
          } else {
              changeUIState('LOGGED_OUT');

              KandyAPI.Phone.setup({
                  remoteVideoContainer: $('#videoPane')[0],
                  // respond to Kandy events...
                  listeners: {
                      loginsuccess: function () {
                          console.debug('loginsuccess');
                          KandyAPI.Phone.updatePresence(0);
                          changeUIState('READY_FOR_CALLING');
                      },
                      loginfailed: function () {
                          console.debug('loginfailed');
                          alert("Login failed");
                      },
                      // you successfully initiated a call (waiting for callee to answer)
                      callinitiated: function (call, number) {
                          console.debug('callinitiated');
                          audio.ringOut.play();
                          callId = call.getId();
                          $('#otherPartyName').val($('#callOutId').val());
                          changeUIState('CALLING');
                      },
                      callinitiatefailed: function(message) {
                          console.debug('callinitiatefailed');
                          audio.ringOut.pause();
                          if (message !== undefined && message.length > 0) {
                              alert(message);
                          }
                          $('#statusMsg').html("Call initiation failed.");
                          changeUIState("READY_FOR_CALLING");
                      },
                      // your call was declined by callee
                      callrejected: function () {
                          console.debug('callrejected');
                          audio.ringIn.pause();
                          changeUIState("READY_FOR_CALLING");
                          $('#statusMsg').html("Call declined.");
                      },
                      callrejectfailed: function() {
                          console.debug('callrejectfailed')
                          $('#statusMsg').html("Call decline failed.");
                      },
                      callignored: function() {
                          console.debug('callignored');
                          audio.ringIn.pause();
                          changeUIState("READY_FOR_CALLING");
                          $('#statusMsg').html("Call declined.");
                      },
                      callignorefailed: function() {
                          console.debug('callignorefailed');
                      },
                      // you are being called, time to answer or reject
                      callincoming: function (call, isAnonymous) {
                          console.debug('callincoming');
                          audio.ringIn.play();
                          callId = call.getId();
                          if (!isAnonymous) {
                              $('#otherPartyName').val(call.callerName);
                          } else {
                              $('#otherPartyName').val('anonymous');
                          }
                          changeUIState('BEING_CALLED');
                      },
                      // you indicated that you are answering the call
                      callanswered: function (call) {
                          console.debug('callanswered');
                          audio.ringIn.pause();
                          changeUIState("ON_CALL");
                      },
                      callanswerfailed: function (call) {
                          console.debug('callanswerfailed');
                      },
                      // you are connected to other party (either they called you or you called them),
                      oncall: function (call) {
                          console.debug('oncall');
                          audio.ringOut.pause();
                          changeUIState("ON_CALL");
                      },
                      // call connection ended
                      callended: function (call) {
                          console.debug('callended');
                          audio.ringOut.pause();
                          audio.ringIn.pause();

                          callId = null;
                          if (uiState != 'LOGGED_OUT') {
                              changeUIState("READY_FOR_CALLING");
                              $('#statusMsg').html("Call ended.");
                          }
                      },
                      callendfailed: function () {
                          console.debug('callendfailed');
                      },
                      // presense notifications (are your contacts available, away, offline?) not handled in this demo
                      presencenotification: function (username, state, description, activity) {
                          console.debug('presencenotification');
                      }
                  }
              });
          }
      } catch (err) {
          alert("Error initializing KandyAPI.Phone:" + err.message + "\n"+err.stack);
      }
  };

  var login = function() {
      try {
        KandyAPI.Phone.login(APIKEY, $("#loginId").val(), PASSWORD);
      } catch(err) {
        alert("Error in login(): " + err.message);
      }
  };

  var makeCall = function() {
      KandyAPI.Phone.makeCall($('#callOutId').val(), true);
  };
  var answerVideoCall = function() {
      changeUIState("ANSWERING_CALL");
      KandyAPI.Phone.answerCall(callId, true);
  };
  var rejectCall = function() {
      KandyAPI.Phone.rejectCall(callId);
  };
  var holdCall = function() {
      KandyAPI.Phone.holdCall(callId);
      changeUIState('CALL_HELD');
  };
  var unholdCall = function() {
      KandyAPI.Phone.unHoldCall(callId);
      changeUIState('ON_CALL')
  };
  var hangUpCall = function() {
      KandyAPI.Phone.endCall(callId);
  };

  var isOnCall = function() {
      return (uiState == 'ON_CALL' || uiState == 'BEING_CALLED' || uiState == 'CALLING' || uiState == 'CALL_HELD');
  };

  var logout = function() {
      try {
          if (isOnCall()) {
              if (confirm("End call and log out?")) {
                  KandyAPI.Phone.endCall(callId);
                  KandyAPI.Phone.logout(function () {
                      changeUIState('LOGGED_OUT');
                  });
              }
          } else {
              KandyAPI.Phone.logout(function () {
                  changeUIState('LOGGED_OUT');
              });
          }
      } catch (err) {
          alert("Error in logout(): "+err.message)
      }
  };

  var changeUIState = function(state) {
      uiState = state;
      switch (uiState) {
          case 'LOGGED_OUT':
              $("#login").show();
              $("#logout").css('visibility','hidden');
              $("#someonesCalling").hide();
              $('#readyForCalling').hide();
              $('#onCall').hide();
              $("#statusMsg").html('');
              $('#videoPane').hide();
              break;
          case 'READY_FOR_CALLING':
              $("#login").hide();  //hide();
              $("#logout").css('visibility','visible');
              $('#someonesCalling').hide();
              $('#readyForCalling').show();
              $('#callingOut').hide();
              $('#onCall').hide();
              $('#statusMsg').html("");
              $('#videoPane').empty();
              $('#videoPane').show();
              break;
          case 'CALLING':
              $('#someonesCalling').hide();
              $('#readyForCalling').hide();
              $('#callingOut').show();
              $('#onCall').hide();
              $('#statusMsg').html("Calling " + $('#callOutId').val());
              break;
          case 'ON_CALL':
              $('#someonesCalling').hide();
              $('#readyForCalling').hide();
              $('#callingOut').hide();
              $('#onCall').show();
                  $('#holdBtn').css('display', 'inline');
                  $('#unholdBtn').hide();
              $('#statusMsg').html("Connected to " + $('#otherPartyName').val());
              break;
          case 'BEING_CALLED':
              $('#someonesCalling').show();
              $('#readyForCalling').hide();
              $('#callingOut').hide();
              $('#onCall').hide();
              $('#statusMsg').html("Incoming call from " + $('#otherPartyName').val() + "...");
              break;
          case 'ANSWERING_CALL':
              $('#someonesCalling').hide();
              $('#statusMsg').html("Establishing connection with " + $('#otherPartyName').val() + "...");
              break;
          case 'CALL_HELD':
              $('#someonesCalling').hide();
              $('#readyForCalling').hide();
              $('#callingOut').hide();
              $('#onCall').show();
                  $('#holdBtn').hide();
                  $('#unholdBtn').css('display', 'inline');
              $('#statusMsg').html("On hold with " + $('#otherPartyName').val() + "...");
              break;
      }
  }

  $(window).bind('beforeunload', function(e) {
      console.debug('leaving page');
      try {
          if (isOnCall()) {
              KandyAPI.Phone.endCall(callId);
          }
          KandyAPI.Phone.logout(function () {
          });
      } catch (err) {
          //swallow it
      }
      var message = null;
      e.returnValue = null;
      return message;
  });



  $(document).ready(function() {
    // setup editor
    var editor_left = ace.edit("left");
    editor_left.setTheme("ace/theme/xcode");
    editor_left.getSession().setMode("ace/mode/javascript");
    editor_left.setFontSize(13);
    editor_left.$blockScrolling = Infinity;

    setup();
    $('#loginBtn').on('click', login);
    $('#logout').on('click', logout);
    $('#callBtn').on('click', makeCall);
    $('#answerVideoCallBtn').on('click', answerVideoCall);
    $('#rejectCallBtn').on('click', rejectCall);
    $('#hangUpCallOutBtn').on('click', hangUpCall);
    $('#holdBtn').on('click', holdCall);
    $('#unholdBtn').on('click', unholdCall);
    $('#hangUpBtn').on('click', hangUpCall);

    $('#loginForm').on('submit', login);
    $('#callOutForm').on('submit', makeCall);
  });

}]);


// app.controller('AboutCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
//   $rootScope.root = {
//     title: 'About'
//   };
// }]);
