'use strict';

var app = angular.module('app', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
    templateUrl: 'home.html',
    controller: 'HomeCtrl'
  })
  .when('/student', {
    templateUrl: 'student.html',
    controller: 'StudentCtrl'
  })
  .when('/teacher', {
    templateUrl: 'teacher.html',
    controller: 'TeacherCtrl'
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

app.controller('TeacherCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
  $rootScope.root = {
    title: 'Student'
  };

  var sendMsg = function() {
    var uuid = KandyAPI.Phone.sendIm(STUDENT_CALL_USER + '@' + DOMAIN_NAME, $('#chat_box').val(),
      function(result) {
          $('#msg_box').append('<div><span>You: </span>' +
                  '<span>' + $('#chat_box').val() + '</span>' +
                  '</div>');
          $('#chat_box').val('');
      },
      function(message, status) {
          alert("Failed to send message.");
      }
    );
  }

  var getMsg = function() {
    KandyAPI.Phone.getIm(function(data) {
      for (var iter = 0; iter < data.messages.length; iter++) {
        var msg = data.messages[iter];
        if (msg.messageType == 'chat') {
          var username = msg.sender.user_id;
          if (username == STUDENT_CALL_USER) {
            // TODO : delete previous messages to limit the number of displayed messages?
            // or add scroll bar
            $('#msg_box').append('<div><span>Student: </span><span>' + msg.message.text + '</span></div>');
          } else {
            console.debug(msg.sender.user_id);
          }
        } else {
          console.debug(msg.messageType);
        }
      } // END loop
    }, function() { alert("error loading message"); });
  }
  
  $(document).ready(function() {
    // setup editor
    // var editor_left = ace.edit("left");
    // editor_left.setTheme("ace/theme/xcode");
    // editor_left.getSession().setMode("ace/mode/javascript");
    // editor_left.setFontSize(13);
    // editor_left.$blockScrolling = Infinity;

    // setup kandy
    setLogoutOnUnload();
    setup();
    setInterval(getMsg, 3000);

    login(TEACHER_CALL_USER);
    $('#callBtn').on('click', makeCall);
    $('#answerVideoCallBtn').on('click', answerVideoCall);
    $('#rejectCallBtn').on('click', rejectCall);
    $('#hangUpCallOutBtn').on('click', hangUpCall);
    $('#holdBtn').on('click', holdCall);
    $('#unholdBtn').on('click', unholdCall);
    $('#hangUpBtn').on('click', hangUpCall);

    $('#chat_box').on('keypress', function() {
      if (window.event.keyCode == 13) {
        sendMsg();
      }
    });
  });
}]);


app.controller('StudentCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
  $rootScope.root = {
    title: 'Student'
  };

  var sendMsg = function() {
    var uuid = KandyAPI.Phone.sendIm(TEACHER_CALL_USER + '@' + DOMAIN_NAME, $('#chat_box').val(),
      function(result) {
          $('#msg_box').append('<div><span>You:</span>' +
                  '<span>' + $('#chat_box').val() + '</span>' +
                  '</div>');
          $('#chat_box').val('');
      },
      function(message, status) {
          alert("Error " + message + "; status=" + status);
      }
    );
  };

  var getMsg = function() {
    KandyAPI.Phone.getIm(function(data) {
      for (var iter = 0; iter < data.messages.length; iter++) {
        var msg = data.messages[iter];
        if (msg.messageType == 'chat') {
          var username = msg.sender.user_id;
          if (username == TEACHER_CALL_USER) {
            // TODO : delete previous messages to limit the number of displayed messages?
            // or add scroll bar
            $('#msg_box').append('<div><span>Teacher: </span><span>' + msg.message.text + '</span></div>');
          } else {
            console.debug(msg.sender.user_id);
          }
        } else {
          console.debug(msg.messageType);
        }
      } // END loop
    }, function() { alert("error loading message"); });
  }
  
  $(document).ready(function() {
    // setup editor
    // var editor_left = ace.edit("left");
    // editor_left.setTheme("ace/theme/xcode");
    // editor_left.getSession().setMode("ace/mode/javascript");
    // editor_left.setFontSize(13);
    // editor_left.$blockScrolling = Infinity;

    // setup kandy
    setLogoutOnUnload();
    setup();
	loginUser();
    setInterval(getMsg, 3000);
    login(STUDENT_CALL_USER);
    $('#callBtn').on('click', makeCall);
    $('#answerVideoCallBtn').on('click', answerVideoCall);
    $('#rejectCallBtn').on('click', rejectCall);
    $('#hangUpCallOutBtn').on('click', hangUpCall);
    $('#holdBtn').on('click', holdCall);
    $('#unholdBtn').on('click', unholdCall);
    $('#hangUpBtn').on('click', hangUpCall);

    $('#chat_box').on('keypress', function() {
      if (window.event.keyCode == 13) {
        sendMsg();
      }
    });
  });
}]);


