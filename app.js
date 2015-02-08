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

    login(TEACHER_CALL_USER);
    $('#callBtn').on('click', makeCall);
    $('#answerVideoCallBtn').on('click', answerVideoCall);
    $('#rejectCallBtn').on('click', rejectCall);
    $('#hangUpCallOutBtn').on('click', hangUpCall);
    $('#holdBtn').on('click', holdCall);
    $('#unholdBtn').on('click', unholdCall);
    $('#hangUpBtn').on('click', hangUpCall);
  });
}]);


app.controller('StudentCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
  $rootScope.root = {
    title: 'Student'
  };
  
  $(document).ready(function() {
    // setup editor
    // var editor_left = ace.edit("left");
    // editor_left.setTheme("ace/theme/xcode");
    // editor_left.getSession().setMode("ace/mode/javascript");
    // editor_left.setFontSize(13);
    // editor_left.$blockScrolling = Infinity;

    // setup kandy video call
    setLogoutOnUnload();
    setup();
    login(STUDENT_CALL_USER);

    // setup kandy cobrowsing
    loginUser();
    // var session = JSON.parse(SESSION);
    // getOpenSessions();
    // leaveSession(session);
    // loadSessionDetails(session);
    // joinSession(session);
    // startCoBrowseAgent(session);


    $('#callBtn').on('click', makeCall);
    $('#answerVideoCallBtn').on('click', answerVideoCall);
    $('#rejectCallBtn').on('click', rejectCall);
    $('#hangUpCallOutBtn').on('click', hangUpCall);
    $('#holdBtn').on('click', holdCall);
    $('#unholdBtn').on('click', unholdCall);
    $('#hangUpBtn').on('click', hangUpCall);
  });
}]);


