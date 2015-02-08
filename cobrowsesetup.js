
// global variables
var isLoggedIn = false;
var intervalRef = null;

/**************** TEACHER'S LISTENERS ****************/

var onData = function(data) {
	if (data != null && data != undefined) {
		console.debug('data' + JSON.stringify(data))
		ace.editor("editor").setValue(data.payload);
		// editor.setValue(data.payload)
	}
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
	var data = { payload: ace.edit("editor").session.getDocument() }
	console.debug(ace.edit("editor").sesison.getDocument())
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