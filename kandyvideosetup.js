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
var setup = function(callback) {
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
                            $('#statusMsg').html("Call ended");
                        }
                    },
                    callendfailed: function () {
                        console.debug('callendfailed');
                    },
                    // presense notifications (are your contacts available, away, offline?) not handled in this demo
                    presencenotification: function (username, state, description, activity) {
                        // console.debug('presencenotification');
                        // TODO: if the current logged in user is a teacher and a contact that he/she is not contacting
                        // has gone offline, show a toast
                        switch(state) {
                            case 0:     // available
                                $('#msg_box').append(
                                    '<div class="center"><span style="color: #A0A0A0">Contact is now online.</span></div>'
                                );
                                toast('Contact is now online', 4000);
                            break;
                            case 11:    // offline
                                $('#msg_box').append(
                                    '<div class="center"><span style="color: #A0A0A0">Contact has gone offline.</span></div>'
                                );
                                toast('Contact has gone offline', 4000);
                            break;
                        }
                    }
                }
            });
        }
        if (typeof(callback) == "function") {
            callback();
        }
    } catch (err) {
        alert("Error initializing KandyAPI.Phone:" + err.message + "\n"+err.stack);
    }
};

var login = function(id) {
    try {
      KandyAPI.Phone.login(APIKEY, id, PASSWORD);
      if (typeof(callback) == "function") {
        callback();
      }
    } catch(err) {
      alert("Error in login(): " + err.message);
    }
};

var makeCall = function(user) {
    KandyAPI.Phone.makeCall(user + '@mahindra15.com', true);
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
            $('#mainControl').hide();
            $("#login").show();
            $("#logout").css('visibility','hidden');
            $("#someonesCalling").hide();
            $('#readyForCalling').hide();
            $('#onCall').hide();
            $("#statusMsg").html('Initializing');
            $('#videoPane').hide();
            break;
        case 'READY_FOR_CALLING':
            $('#preloader-div').fadeOut();
            $('#statusMsg').fadeOut();
            $('#preloader-div').hide();
            $('#statusMsg').hide();
            $('#statusMsg').html('');
            $('#mainControl').fadeIn();
            $("#login").hide();  //hide();
            $("#logout").css('visibility','visible');
            $('#someonesCalling').hide();
            $('#readyForCalling').show();
            $('#callingOut').hide();
            $('#onCall').hide();
            $('#statusMsg').html('Ready');
            $('#statusMsg').fadeIn();
            $('#videoPane').empty();
            $('#videoPane').show();
            $('#callBtn').removeClass('disabled');
            break;
        case 'CALLING':
            $('#callBtn').addClass('disabled');
            $('#status').fadeOut();
            $('#statusMsg').html('Calling');
            $('#mainControl').fadeOut();
            $('#mainControl').hide();
            $('#preloader-div').fadeIn();
            $('#status').fadeIn();
            $('#someonesCalling').hide();
            $('#readyForCalling').hide();
            $('#callingOut').show();
            $('#onCall').hide();
            $('#holdBtn').show();
            break;
        case 'ON_CALL':
            $('#preloader-div').fadeOut();
            $('#preloader-div').hide();
            $('#someonesCalling').hide();
            $('#readyForCalling').hide();
            $('#callingOut').hide();
            $('#onCall').show();
            $('#mainControl').show();
            $('#videoPane').fadeIn();
            $('#videoPane').show();
            $('#unholdBtn').hide();
            $('#holdBtn').show();
            $('#statusMsg').html("Connected");
            break;
        case 'BEING_CALLED':
            $('#someonesCalling').show();
            $('#readyForCalling').hide();
            $('#callingOut').hide();
            $('#onCall').hide();
            $('#statusMsg').html("Incoming call");
            break;
        case 'ANSWERING_CALL':
            $('#someonesCalling').hide();
            $('#statusMsg').html("Connecting");
            break;
        case 'CALL_HELD':
            $('#someonesCalling').hide();
            $('#readyForCalling').hide();
            $('#callingOut').hide();
            $('#onCall').show();
                $('#holdBtn').hide();
                $('#unholdBtn').show();
            $('#statusMsg').html("On hold");
            break;
    }
}

var setLogoutOnUnload = function() {
    $(window).bind('beforeunload', function(e) {
        console.debug('leaving page');
        try {
            if (isOnCall()) {
                KandyAPI.Phone.endCall(callId);
            }
            KandyAPI.Phone.updatePresence(11);
            KandyAPI.Phone.logout(function () {
            });
        } catch (err) {
            //swallow it
        }
        var message = null;
        e.returnValue = null;
        return message;
    });
}