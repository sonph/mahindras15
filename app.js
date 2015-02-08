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
  if (USER == 'STUDENT') {
    $rootScope.root = {
      title: 'Student'
    };
    $scope.YOU = TEACHER_CALL_USER;
    $scope.ME = STUDENT_CALL_USER;
    $scope.chatName = 'Teacher';
  } else {
    $rootScope.root = {
      title: 'Teacher'
    };
    $scope.YOU = STUDENT_CALL_USER;
    $scope.ME = TEACHER_CALL_USER;
    $scope.chatName = 'Student'
  }

  var sendMsg = function() {
    var uuid = KandyAPI.Phone.sendIm($scope.YOU + '@' + DOMAIN_NAME, $('#chat_box').val(),
      function(result) {
        // toast(JSON.stringify(result), 4000);
          $('#msg_box').append('<div><span id="msg-' + result.UUID + '" style="color:#ff6868">You: </span>' +
                  '<span>' + $('#chat_box').val() + '</span>' +
                  '</div>');
          $('#chat_box').val('');
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

        if (msg.messageType == 'chat') {
          var username = msg.sender.user_id;

            // TODO : if the logged in user is a teacher and the user he/she is chatting with
            // is not the sender, open a toast saying another student has sent him/her a message

          if (username == $scope.YOU) {
            // TODO : delete previous messages to limit the number of displayed messages?
            // or add scroll bar
            $('#msg_box').append('<div><span style="color:#68a9ff">' + $scope.chatName + ': </span><span>' + msg.message.text + '</span></div>');
            // toast('User id: ' + msg.sender.user_id, 4000);           
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
    }, function() { alert("error loading message"); });
  }
  
  $(document).ready(function() {
    $('.tooltipped').tooltip({delay: 50});

    // setup editor
    // var editor_left = ace.edit("left");
    // editor_left.setTheme("ace/theme/xcode");
    // editor_left.getSession().setMode("ace/mode/javascript");
    // editor_left.setFontSize(13);
    // editor_left.$blockScrolling = Infinity;

    // setup kandy video call
    setLogoutOnUnload();
    setup();
    login($scope.ME);
	setInterval(getMsg, 3000);

    // setup kandy cobrowsing
    // loginUser();
    // var session = JSON.parse(SESSION);
    // getOpenSessions();
    // leaveSession(session);
    // loadSessionDetails(session);
    // joinSession(session);
    // startCoBrowseAgent(session);


    $('#callBtn').on('click', function () {
      makeCall($scope.YOU);
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
      var uuid = KandyAPI.Phone.sendImWithFile($scope.YOU, file,
        function() {  // success function
            // YOUR CODE GOES HERE
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
  });
}]);


