// called when page is done loading to set up (initialize) the KandyAPI.Phone
var sessions = {};
var currentUser = {};
var currentSession;

var loginAnonymous = function() {
    if ($("#domainApiId").val() === '') {
        alert("Please enter Domain API Key.")
    } else {
        KandyAPI.loginAnonymous(
            $("#domainApiId").val(),
            function (results) {
                changeUIStateCobrowse('NO_SESSION');
                currentUser = results.full_user_id;
                $('#user_id').text(currentUser);
            },
            function (msg, code) {
                alert("Error loggin anonymous user(" + code + "): " + msg);
            }
        );
    }
};

var loginUser = function() {
    KandyAPI.login(
        APIKEY,
        STUDENT_COBROWSE_USER,
        PASSWORD,
        function(results) {
            changeUIStateCobrowse('NO_SESSION');
            currentUser = results.full_user_id;
            $('#user_id').text(currentUser);
        },
        function(msg, code) {
            alert("Error loggin in:(" + code + "): " + msg);
        }
    );
};

var getOpenSessions = function(alertWhenNone) {
    KandyAPI.Session.getOpenSessions(
        function(result) {
            processSessionList(result.sessions, alertWhenNone);
        },
        function(msg, code) {
            alert("Error getting session info(" + code + "): " + msg);
        }
    );
};

var processSessionList = function(sessionList, alertWhenNone) {
    $("#sessions").empty();

    if (sessionList.length > 0) {
        var i=0;
        for (i=0; i < sessionList.length; ++i) {
            sessions[sessionList[i].session_id] = sessionList[i];
            $("#sessions").append('<option value="'+ sessionList[i].session_id +'">' + sessionList[i].session_id +'</option>');
        }
        loadSessionDetails();
    } else {
        changeUIStateCobrowse('NO_SESSION');
        sessions = [];
        clearSessionDetails();
        if (alertWhenNone === undefined || alertWhenNone === null || alertWhenNone)
            alert('No sessions.')
    }

}

var onSessionJoinApprove = function(notification) {
    sessions[notification.session_id].joined = true;
    changeUIStateCobrowse('SESSION_PARTICIPANT');
};



var listeners = {
    'onJoinApprove': onSessionJoinApprove
};

var joinSession = function() {

    KandyAPI.Session.setListeners(currentSession.session_id, listeners);
    KandyAPI.Session.join(
        currentSession.session_id,
        {
        },
        function() {
            console.log("Session join requested.  ID = " + currentSession.session_id);
        },
        function(msg, code) {
            alert("Error joining session (" + code + "): " + msg);
        }
    );
};

var leaveSession = function() {
    KandyAPI.Session.leave(
        currentSession.session_id,
        "Let me outta here",
        function() {
            currentSession.joined = false;
            changeUIStateCobrowse('SESSION_NONPARTICIPANT');
            console.log("Session left.  ID = " + currentSession.session_id);
        },
        function(msg, code) {
            alert("Error leaving session (" + code + "): " + msg);
        }
    );
};

var loadSessionDetails = function() {
    currentSession = sessions[$("#sessions").val()];
    $('#session_type').text(currentSession.session_type);
    $('#session_status').text(currentSession.session_status);
    $('#session_admin').text(currentSession.admin_full_user_id);

    if(currentSession.joined){
        changeUIStateCobrowse('SESSION_PARTICIPANT');
    } else {
        changeUIStateCobrowse('SESSION_NONPARTICIPANT');
    }


};

var startCoBrowseAgent = function() {
    changeUIStateCobrowse('COBROWSING_STARTED');
    KandyAPI.CoBrowse.startBrowsingAgent(currentSession.session_id, document.getElementById('cobrowsing-holder'));
}

var stopCoBrowseAgent = function() {
    changeUIStateCobrowse('COBROWSING_STOPPED');
    KandyAPI.CoBrowse.stopBrowsingAgent();
}

var changeUIStateCobrowse = function(state) {
    switch (state) {
        case 'LOGGED_OUT':
            $("#loginForm").show();
            $("#userDetails").hide();
            $('#loggedIn').hide();
            break;
        case 'NO_SESSION':
            $("#loginForm").hide();
            $("#userDetails").show();
            $('#loggedIn').show();
            $("#sessionsLoaded").hide();
            $("#noSessionsLoaded").show();
            $(".admin").hide();
            $(".participant").hide();
            $('.nonparticipant').hide();
            break;
        case 'SESSION_PARTICIPANT':
            $("#sessionsLoaded").show();
            $("#noSessionsLoaded").hide();
            $("#session_role").text("Participant");
            $(".admin").hide();
            $('.nonparticipant').hide();
            $(".participant").show();
            break;
        case 'SESSION_NONPARTICIPANT':
            $("#sessionsLoaded").show();
            $("#noSessionsLoaded").hide();
            $("#session_role").text("Non-participant");
            $(".admin").hide();
            $(".participant").hide();
            $('.nonparticipant').show();
            break;
        case 'COBROWSING_STARTED':
            $("#startCoBrowse").hide();
            $("#stopCoBrowse").show();
            break;
        case 'COBROWSING_STOPPED':
            $("#startCoBrowse").show();
            $("#stopCoBrowse").hide();
            break;
    }
};

var clearSessionDetails = function() {
    var sess = sessions[$("#sessions").val()];
    $('#session_type').text("");
    $('#session_status').text("");
};

$("#sessionSelect" ).change(function() {
    loadSessionDetails();
});


