/**
 * Copyright 2014, Genband
 * Version 2.1.0
 * KandyAPI
 * @singleton
 */

KandyAPI = (function () {

	// private copy of response codes
    var responseCodes = {
        OK: 0,
        internalServerError: 1,
        tokenExpired: 10,
        permissionDenied: 11,
        usageQuotaExceeded: 12,
        insufficientFunds: 13,
        validationFailed: 14,
        missingParameter: 15,
        invalidParameterValue: 16,
        badParameterValue: 17,
        unknownRequest: 18,
        noData: 19,
        alreadyExists: 50,
        invalidIdentifier: 51,
        invalidPassword: 52,
        doesNotExist: 53,
        invalidCountryCode: 54,
        invalidCredentials: 55,
        ajaxError: 5000,
        wsError: 6000,
        wsAlreadyOpened: 6001,
        wsNotFound: 6002,
        wsCreateError: 6003,
        wsNotAuth: 6004
    };

    var api = {
        /**
         * Version of this release
         * @type String
         */
        version: '2.1.0',
        
		// public copy of response codes
        responseCodes : JSON.parse(JSON.stringify(responseCodes))
        
    };

    var _events = {};

    /**
     *
     * @type Object Connection configuration
     * @private
     */
    var _config = {
        kandyApiUrl: 'https://api.kandy.io/v1.1',
        kandyWSUrl: null
    };

    /**
     * @property {String} _userAccessToken User access token.
     * @private
     */
    var _userAccessToken = null;

    /**
     * @property {String} _userDetails. User Details gotten from login
     * @private
     */
    var _userDetails = null;

    /**
     * @property {Boolean} _autoReconnect. Auto Reconnection configuration
     * @private
     */

    var _autoReconnect = true;

  /**
   * checking a parameter exists in an URL
   * @param url
   * @param paramKey
   */
  var _isParamKeyInUrl = function(url, paramKey) {
    paramKey = paramKey.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + paramKey + "=([^&#]*)"),
      results = regex.exec(url);
    return results != null;
  };

  /**
   * this method is for setting up default values for an ajax call
   * @param options = {
     * type: 'GET',
     * url: 'http://localhost/api',
     * data: {foo: 'bar'},
     * contentType: 'application/json'
     * acceptType: 'application/json'
     * success: function(response){...},
     * failure: function(){...}
     * }
   * @private
   */
  var _kandyAjax = function(options) {

    // set the default method as GET
    if (options['type'] === undefined || !options['type']) {
      options['type'] = 'GET';
    }

    // set the url for the ajax call
    options['url'] = _config.kandyApiUrl + options['url'];

    // check if the url doesn't contain 'key' as param,then add _userAccessToken as 'key'
    if (!_isParamKeyInUrl(options['url'], 'key')) {
      options['url'] += ((options['url'].indexOf('?') < 0) ? '?' : '&');
      options['url'] += 'key=' + encodeURIComponent(_userAccessToken);
    }

    _ajax(options);
  }

  /**
   *
   * @param options = {
     * type: 'GET',
     * url: 'http://localhost/api',
     * data: {foo: 'bar'},
     * contentType: 'application/json'
     * acceptType: 'application/json'
     * success: function(response){...},
     * failure: function(){...}
     * }
   * @private
   */
  var _ajax = function(options) {
    var contentType = options['contentType'],
      acceptType = options['acceptType'],
      success = options['success'],
      failure = options['failure'],
      type = options['type'],
      url = options['url'],
      data = options['data'];

    // set the default content-type as application/json
    if (options['contentType'] === undefined || !options['contentType']) {
      contentType = 'application/json';
    }

    // set the default accept-type as application/json
    if (options['acceptType'] === undefined || !options['acceptType']) {
      acceptType = 'application/json';
    }

    var config = {
      type: type,
      url: url,
      crossDomain: true,
      beforeSend: function (xhrObj) {
        xhrObj.setRequestHeader("Content-Type", contentType);
        xhrObj.setRequestHeader("Accept", acceptType);
      },
      success: function (response) {
        if (response.status === responseCodes.OK) {
          if (success) {
            success(response);
          }
        } else if (failure) {
          failure(response.message, response.status);
        }
      },
      error: function (x, e) {
        if (failure) {
          failure(x.statusText, responseCodes.ajaxError);
        }
      }
    };
    
    if (data) {
      // TODO: SHOULD STRINGIFY BE CALLER'S RESPONSIBILITY???
      config.data = JSON.stringify(data);
    }   

    $.ajax(config);
  };


    /**
     * @method setup
     * Setup the API
     * @param {Object} config Configuration.
     */
    api.setup = function (config) {
    	// setup default configuration
    	_config = $.extend(_config, config);

        // setup listeners
        if (config.hasOwnProperty('listeners')) {
            for (var listener in config['listeners']) {
                _events[listener] = config['listeners'][listener];
            }
        }

        if (config.hasOwnProperty('autoreconnect')) {
            _autoReconnect = config['autoreconnect'];
        }
    }



    /**
     * @method getUserAccessToken
     * Retrieves a user access token
     * @param {String} domainApiKey
     * @param {String} userName
     * @param {String} userPassword
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     */
    api.getUserAccessToken = function (domainApiKey, userName, userPassword, success, failure) {
	    // if username has domain in it remove it
	    userName = userName.split('@')[0];

        var paramStr = 'key=' + encodeURIComponent(domainApiKey) +
            "&user_id=" + encodeURIComponent(userName) +
            "&user_password=" + encodeURIComponent(userPassword);

      _kandyAjax(
        {
            url: '/domains/users/accesstokens?' + paramStr,
            success: function(response) {
                if (success) {
                    success(response.result);
                }
            },
            failure: function(msg, code) {
                if (failure) {
                    failure(msg, code);
                }
            }
        }
      );
    };

    /**
     * @method getLimitedUserDetails
     * Retrieves a user access token
     * @param {String} userAccessToken
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     */
    api.getLimitedUserDetails = function (userAccessToken, success, failure) {
        var paramStr = 'key=' + encodeURIComponent(userAccessToken);

      _kandyAjax({
            url: '/users/details/limited?' + paramStr,
            success: function (response) {
                if (success) {
                    success(response.result.user);
                }
            },
            failure: failure
        });
    };

    
    /**
     * @method getLastSeen
     * get last seen time stamps for the users passed in
     * @param {Array of String} users
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     */
    api.getLastSeen = function(users, success, failure){
        var paramStr = 'users=' + encodeURIComponent(JSON.stringify(users));

        _kandyAjax({
            url: '/users/presence/last_seen?' + paramStr,
            success: function (response) {
                if (success) {
                    success(response.result);
                }
            },
            failure: failure
        });
    };


    /**
     * @method getDataChannelConfiguration
     * get the data channel configuration used to connect to the websocket
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     */
    api.getDataChannelConfiguration = function(success, failure){
        var paramStr = 'key=' + encodeURIComponent(_userAccessToken);

        _kandyAjax({
            url: '/users/configurations/data_channel?' + paramStr,
            success: function (response) {
                if (success) {
                    success(response.result);
                }
            },
            failure: failure
        });
    };

    /**
     * @method login
     * Login as a user
     * @param {String} domainApiKey
     * @param {String} userName
     * @param {String} userPassword
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     */
	api.login = function(domainApiKey, userName, password, success, failure) {
	    api.getUserAccessToken(domainApiKey, userName, password,
            function(result) {
                if (success) {
                    _userAccessToken = result.user_access_token;
                    api.getLimitedUserDetails(_userAccessToken,
                        function(result) {
                            result.user_access_token = _userAccessToken;
                            _userDetails = result;
                            openWebSocket(
                                function() {
                                    success(result);
                                },
                                failure);
                        },
                        failure
                    );
                }
            },
            failure);
	};


    /**
     * @method loginSSO
     * Log in with user access token (for single sign-on)
     * @param {String} userAccessToken User access token
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     */
    api.loginSSO = function(userAccessToken, success, failure) {
        _userAccessToken = userAccessToken;
        api.getLimitedUserDetails(_userAccessToken,
            function(result) {
                result.user_access_token = _userAccessToken;
                _userDetails = result;
                openWebSocket(
                    function() {
                        success(result);
                    },
                    failure);
            },
            failure
        );
    };

    api.logout = function() {
        closeWebSocket();
    };

    api.reconnect = function(success, failure) {
        openWebSocket(success, failure);
    };


    function _UUIDv4() {
        var s = [],
            itoh = '0123456789ABCDEF';

        // Make array of random hex digits. The UUID only has 32 digits in it, but we
        // allocate an extra items to make room for the '-'s we'll be inserting.
        for (var i = 0; i < 36; i++) s[i] = Math.floor(Math.random() * 0x10);

        // Conform to RFC-4122, section 4.4
        s[14] = 4; // Set 4 high bits of time_high field to version
        s[19] = (s[19] & 0x3) | 0x8; // Specify 2 high bits of clock sequence

        // Convert to hex chars
        for (var i = 0; i < 36; i++) s[i] = itoh[s[i]];

        // Insert '-'s
        s[8] = s[13] = s[18] = s[23] = '-';

        return s.join('');
    }

    //=================================================================
    //=======================  WebSocket  =============================
    //=================================================================

    /**
     * @type Object Registered WebSocket events
     * @private
     */
    var _wsEvents = {};

    /**
     * @type Object Registered WebSocket handlers for responses
     * @private
     */
    var _wsResponses = {};

    /**
     * @type WebSocket WebSocket object
     * @private
     */
    var _ws = null;

    /**
     * @type Timeout Timeout for ping mechanism
     * @private
     */
    var _wsPingTimeout;

    var _connectionLostTimeout;

    var _reconnectCount = 0;

    var _onlineEventAttached = false;


    /**
     * @method isWebSocketOpened
     * @return {Boolean} indication wether is the WebSocket is opened
     * @private
     */
    function isWebSocketOpened() {
        var opened = false;

        if(_ws){
            opened = (_ws.readyState === 1);
        }

        return opened;
    }



    function sendWSPing() {
        if(isWebSocketOpened())
        {
            _wsPingTimeout = setTimeout(sendWSPing, 30000);

            var json = {
                message_type : 'ping'
            };
            try {
                _ws.send(JSON.stringify(json));
            } catch (e) {
                window.console.error("Exception in sendWSPing: " + e.message);
            }
        }
    }

    function reconnect() {
        window.console.log("reconnecting");

        openWebSocket(function(){
            window.console.log("reconnect success");
            _reconnectCount = 0;
            var onconnectionrestored = _events['onconnectionrestored'];
            if(onconnectionrestored && typeof onconnectionrestored === 'function'){
                onconnectionrestored();
            }
        },
        function(){
            _reconnectCount++;
            window.console.log("failed to reconnect");
            autoReconnect();
        });
    }

    function autoReconnect() {
        var timeout = (_reconnectCount > 10)?((_reconnectCount > 100)?60000:30000):10000;
        _connectionLostTimeout = setTimeout(reconnect, timeout);
    }

    function onBrowserOnline() {
        window.console.log("browser going online");
        clearTimeout(_connectionLostTimeout);
        _connectionLostTimeout = setTimeout(reconnect, 500);
    }

    function onBrowserOffline() {
        window.console.log("browser going offline");
        clearTimeout(_wsPingTimeout);
        _ws.close();
    }

    function buildWebSocketUrlFromDataChannelConfig(dataChannelConfig){
        var host = dataChannelConfig.data_server_host,
            port = dataChannelConfig.data_server_port,
            is_secure = dataChannelConfig.is_secure;

        var parser = document.createElement('a');
        parser.href = host;

        return (is_secure? 'wss' : 'ws') + '://' + (parser.hostname);
    }

    /**
     * @method sendWebSocketData
     * Send data through the WebSocket Channel
     * @param {Object} [success] The success callback
     * @param {Object} [failure] The failure callback.
     * @private
     */
     function openWebSocket(success, failure) {
        var handshareId;

        if(isWebSocketOpened()){
            if(failure){
                failure(responseCodes.wsAlreadyOpened);
            }
            return;
        }

        KandyAPI.getDataChannelConfiguration(

            function(result) {
                _config.kandyWSUrl = buildWebSocketUrlFromDataChannelConfig(result) + '?user_access_token=';

                try {
                    _ws = new WebSocket(_config.kandyWSUrl + encodeURIComponent(_userAccessToken));

                } catch (wsError) {
                    if(failure){
                        failure(responseCodes.wsCreateError);
                    }
                    return;
                }

                if(_ws !== null) {

                    _ws.onopen = function(evt) {
                        if (window.addEventListener && !_onlineEventAttached){
                            window.addEventListener('online',  onBrowserOnline);
                            window.addEventListener('offline',  onBrowserOffline);
                            _onlineEventAttached = true;
                        }
                        success();
                        sendWSPing();
                    };

                    _ws.onclose = function(evt) {

                        if(_autoReconnect && !_connectionLostTimeout){
                            window.console.log("connection closed");
                            clearTimeout(_wsPingTimeout);
                            autoReconnect();
                        }

                        var onconnectionlost = _events['onconnectionlost'];
                        if(onconnectionlost && typeof onconnectionlost === 'function' && _reconnectCount === 0){
                            onconnectionlost(evt);
                        }
                    };

                    _ws.onerror = function(evt) {
                        failure(responseCodes.wsError);
                    };

                    _ws.onmessage = function(evt) {
                        var message = JSON.parse(evt.data), callbacks, responseCallbacks, callbackItter, callbackLength;
                        if(message.message_type === "response") {
                            responseCallbacks = _wsResponses[message.id];
                            if(responseCallbacks) {
                                delete _wsResponses[message.id];
                                if(message.status === 0) {
                                    if(responseCallbacks.success) {
                                        responseCallbacks.success();
                                    }
                                }
                                else {
                                    if(responseCallbacks.failure) {
                                        responseCallbacks.failure(message.message, message.status);
                                    }
                                }
                            }
                        } else {
                            if (_wsEvents.hasOwnProperty(message.message_type)) {
                                callbacks = _wsEvents[message.message_type];

                                if(callbacks && callbacks.length > 0){
                                    callbackLength = callbacks.length;
                                    for (callbackItter = 0; callbackItter <  callbackLength; callbackItter++) {
                                        if(typeof callbacks[callbackItter] === "function") {
                                            callbacks[callbackItter](message);
                                        }
                                    }

                                }
                            }
                        }
                    };
                } else {
                    failure(responseCodes.wsNotFound);
                }
            },
            failure
        );
    }

    /**
     * @method sendWebSocketData
     * Send data through the WebSocket Channel
     * @param {String} data
     * @param {Object} [success] The success callback
     * @param {Object} [failure] The failure callback.
     * @private
     */
    function sendWebSocketData(data, success, failure) {
        if(isWebSocketOpened()) {
            if((success || failure) && (data.id === undefined)) {
                var id = _UUIDv4();
                data.id = id;
                _wsResponses[id] = {success: success, failure: failure};
            }

            try {
                _ws.send(JSON.stringify(data));
            } catch (e) {
                window.console.log("Exception in sendWebSocketData: " + e.message);
            }

        } else {
            failure();
        }
    }

    /**
     * @method closeWebSocket
     * Close the Notification Web Socket
     * @private
     */
    function closeWebSocket() {
        clearTimeout(_wsPingTimeout);
        if (isWebSocketOpened()) {
            _ws.close();
        }
    }

    /**
     * @method registerWebSocketListeners
     * Register listeners for Web Socket Events
     * @param {Object} listeners
     * @private
     */
    function registerWebSocketListeners(listeners) {
        var listner;
        if (listeners) {
            for (listener in listeners) {
                if (listeners.hasOwnProperty(listener)) {
                    if(_wsEvents[listener] === undefined ){
                        _wsEvents[listener] = [];
                    }
                    _wsEvents[listener] .push(listeners[listener]);
                }
            }
        }
    }


    //=================================================================
    //========================  SESSION  ==============================
    //=================================================================
	api.Session = (function() {
		var me = {};

        var _listeners = {
        };

		// forward messages to the appropriate session handler
		var _messageHandler = function(message) {
            var simpleType, sessionListeners, sessionListener, listenerCount, listenerItter = 0;
            
            if (message.message_type === 'sessionNotification') {
                message = message.payload;
            }

            window.console.log("Session message recvd: " + message.message_type);
            simpleType =  message.message_type.replace(/^session/,"on");
            sessionListeners = _listeners[message.session_id];

            if (sessionListeners) {
                listnerCount = sessionListeners.length;

                for (listenerItter; listenerItter < listnerCount; listenerItter++) {
                    sessionListener = sessionListeners[listenerItter];
                    if (sessionListener && sessionListener.hasOwnProperty(simpleType)) {
                        try {
                            sessionListener[simpleType](message);
                        } catch (e){
                            console.log("could not execute listner: " + e);
                        }
                    }
                }
            }
		};

        registerWebSocketListeners( {
            'sessionData': _messageHandler,
            'sessionNotification': _messageHandler
        });


        /**
         * @method setListeners
         * Create a session
         * @param {String} sessionId 
         * @param {Object} listeners 
         * @param {Function} success Function called when create session succeeds, takes one parameter, sessionId
         * @param {Function} failure Function called when create session fails, takes two parameters: errorMessage, errorCode
         *       
         * Example listeners:
         *      {
         *          'onData': onSessionData,
         *          'onActive': onSessionStarted,
         *          'onUserJoinRequest': onSessionUserJoinRequest,
         *          'onUserJoin': onSessionUserJoinRequest,
         *          'onJoinApprove': onSessionJoinApprove,
         *          'onJoinReject': onSessionJoinReject,
         *          'onUserLeave': onSessionUserLeave,
         *          'onUserBoot': onSessionUserBoot,
         *          'onBoot': onSessionBoot,
         *          'onInactive': onSessionEnded,
         *          'onTerminated': onSessionTerminated
         *       }
         */
        me.setListeners = function (sessionId, listeners) {

            if(_listeners[sessionId] === undefined){
                _listeners[sessionId] = [];
            }

            _listeners[sessionId].push(listeners);
        };


        /**
    	 * @method create
	     * Create a session
	     * @param {Object} sessionConfig Contains session_type, session_name, session_description, user_nickname, user_first_name, user_last_name, user_phone_number, user_email
	     * @param {Function} success Function called when create session succeeds, takes one parameter, sessionId
	     * @param {Function} failure Function called when create session fails, takes two parameters: errorMessage, errorCode
         *
         * Example sessionConfig:
         *   {
         *       session_type: 'support',
         *       session_name: sessionName,
         *       session_description: "Jim's Support Session",
         *       user_nickname: "User 1",
         *       user_first_name: "User",
         *       user_last_name: "One",
         *       user_phone_number: "303-555-1212",
         *       user_email: "user1@gmailicon.com"
         *   }
	     */
	    me.create = function (sessionConfig, success, failure) {

        _kandyAjax({
                type: 'POST',
                url: '/users/sessions/session',
                data: sessionConfig,
                success: function(response) {
                    if (success) {
                        success(response.result);
                    }
                },
                failure: function(msg, code) {
                  if (failure) {
                    failure(msg, code);
                  }
                }
            });
		};


        me.activate = function (sessionId, success, failure) {
          _kandyAjax(
                {
                    type: 'POST',
                    url: '/users/sessions/session/id/start',
                    data: {session_id: sessionId},
                    success: function(response) {
                        if (success) {
                            success();
                        }
                    },
                    failure: function(msg, code) {
                        if (failure) {
                            failure(msg, code);
                        }
                    }
                }
            );

        };

        me.inactivate = function (sessionId, success, failure) {
          _kandyAjax(
                {
                    type: 'POST',
                    url: '/users/sessions/session/id/stop',
                    data: {session_id: sessionId},
                    success: function(response) {
                        if (success) {
                            success();
                        }
                    },
                    failure: function(msg, code) {
                        if (failure) {
                            failure(msg, code);
                        }
                    }
                }
            );
        };

        /**
         * @method sendData
         * Send data to session participants
         * @param {String} sessionId Id of session to send data to
         * @param {Object} data Data to be sent to the session participants
         * @param {function} [success] success callback
         * @param {function} [failure] failure callback
         * @param {String} [destination] full user id for the destination (if none provided, sends to all participants)
         */
        me.sendData = function (sessionId, data, success, failure, destination) {
            sendWebSocketData({
                "message_type":"sessionData",
                "session_id": sessionId,
                "destination" : destination,
                "payload": data
            }, success, failure);
        };

	    /**
	     * @method terminate
	     * Delete a session
	     * @param {String} sessionId Id of session to delete
	     */
	    me.terminate = function (sessionId, success, failure) {
        _kandyAjax(
              {
                type: 'DELETE',
                url: '/users/sessions/session/id',
                data: {session_id: sessionId},
                success: function(response) {
                  if (success) {
                    success();
                  }
                },
                failure: function(msg, code) {
                  if (failure) {
                    failure(msg, code);
                  }
                }
              }
            );
		};

    	/**
    	 * @method getSessionInfoById
    	 * Get session info by session ID
    	 * @param {String} sessionId Id of session
    	 */
    	me.getInfoById = function (sessionId, success, failure) {
    	    var paramStr = 'session_id=' + sessionId;

			  var url = '/users/sessions/session/id?' + paramStr;

        _kandyAjax(
          {
            url: url,
            success: function(response) {
              if (success) {
                success(response.result);
              }
            },
            failure: function(msg, code) {
              if (failure) {
                failure(msg, code);
              }
            }
          }
        );
		};

		/**
		 * @method getSessionInfoByName
	   	 * Get session info by Name
	     * @param {String} sessionName Name of session
	     */
	    me.getInfoByName = function (sessionName, success, failure) {
	        var paramStr = '&session_name=' + sessionName;

			var url = '/users/sessions/session/name?' + paramStr;

        _kandyAjax(
          {
            url: url,
            success: function(response) {
              if (success) {
                success(response.result);
              }
            },
            failure: function(msg, code) {
              if (failure) {
                failure(msg, code);
              }
            }
          }
        );
		};

        /**
         * @method getOpenSessions
         * Get open sessions
         */
        me.getOpenSessions = function (success, failure) {

          _kandyAjax(
            {
              url: '/users/sessions',
              success: function(response) {
                if (success) {
                  success(response.result);
                }
              },
              failure: function(msg, code) {
                if (failure) {
                  failure(msg, code);
                }
              }
            }
          );
        };


        /**
         * @method getOpenSessionsByType
         * Get open sessions
         */
        me.getOpenSessionsByType = function (sessionType, success, failure) {
            var paramStr = 'session_type=' + encodeURIComponent(sessionType);

            var url = '/users/sessions?' + paramStr;

          _kandyAjax(
            {
              url: url,
              success: function(response) {
                if (success) {
                  success(response.result);
                }
              },
              failure: function(msg, code) {
                if (failure) {
                  failure(msg, code);
                }
              }
            }
          );
        };

        /**
         * @method getOpenSessionsCreatedByUser
         * Get open sessions created by this user
         */
        me.getOpenSessionsCreatedByUser = function (success, failure) {

          _kandyAjax(
            {
              url: '/users/sessions/user',
              success: function(response) {
                if (success) {
                  success(response.result);
                }
              },
              failure: function(msg, code) {
                if (failure) {
                  failure(msg, code);
                }
              }
            }
          );
        };


        /**
         * @method joinSessionBy
         * Request to join a session by ID
         * @param {String} joinConfig Reason why we are leaving the session
         * @param {Function} [success] Function called when leaving succeeds
         * @param {Function} [failure] Function called when leaving fails
         */
        me.join = function (sessionId, joinConfig, success, failure) {
            joinConfig.session_id = sessionId;

          _kandyAjax(
            {
              type: 'POST',
              url: '/users/sessions/session/id/participants/participant',
              data: joinConfig,
              success: function(response) {
                if (success) {
                  success(response.result);
                }
              },
              failure: function(msg, code) {
                if (failure) {
                  failure(msg, code);
                }
              }
            }
          );
        };

        /**
         * @method leave
         * Leave a session by session ID
         * @param {String} sessionId Session ID
         * @param {String} [leaveReason] Reason why we are leaving the session
         * @param {Function} [success] Function called when leaving succeeds
         * @param {Function} [failure] Function called when leaving fails
         */
        me.leave = function (sessionId, leaveReason, success, failure) {

          _kandyAjax(
              {
                type: 'DELETE',
                url: '/users/sessions/session/id/participants/participant?',
                data: {session_id: sessionId, leave_reason: leaveReason},
                success: function(response) {
                    if (success) {
                        success();
                    }
                },
                failure: function(msg, code) {
                    if (failure) {
                        failure(msg, code);
                    }
                }
              }
            );
        };


        /**
         * @method acceptJoinRequest
         * Admin accepts join request
         * @param {String} sessionId Session ID
         * @param {String} fullUserId Full user ID
         * @param {Function} success Function called when create session succeeds
         * @param {Function} failure Function called when create session fails
         */
        me.acceptJoinRequest = function (sessionId, fullUserId, success, failure) {

          _kandyAjax(
              {
                type: 'POST',
                url: '/users/sessions/session/id/admin/participants/participant/join',
                data: {session_id: sessionId, full_user_id: fullUserId},
                success: function(response) {
                    if (success) {
                        success();
                    }
                },
                failure: function(msg, code) {
                    if (failure) {
                        failure(msg, code);
                    }
                }
              }
            );
        };

        /**
         * @method rejectJoinRequest
         * Admin rejects join request
         * @param {String} sessionId Session ID
         * @param {String} fullUserId Full user ID
         * @param {String} rejectReason Reason for rejecting the user
         * @param {Function} success Function called when create session succeeds
         * @param {Function} failure Function called when create session fails
         */
        me.rejectJoinRequest = function (sessionId, fullUserId, rejectReason, success, failure) {

          _kandyAjax(
              {
                type: 'DELETE',
                url: '/users/sessions/session/id/admin/participants/participant/join',
                data: {session_id: sessionId, full_user_id: fullUserId, reject_reason: rejectReason},
                success: function(response) {
                    if (success) {
                        success();
                    }
                },
                failure: function(msg, code) {
                    if (failure) {
                        failure(msg, code);
                    }
                }
              }
            );
        };

        /**
         * @method bootUser
         * Admin boots a user from a session
         * @param {String} sessionId Session ID
         * @param {String} fullUserId Full user ID
         * @param {String} bootReason Reason for booting the user
         * @param {Function} success Function called when create session succeeds
         * @param {Function} failure Function called when create session fails
         */
        me.bootUser = function (sessionId, fullUserId, bootReason, success, failure) {

          _kandyAjax(
              {
                type: 'DELETE',
                url: '/users/sessions/session/id/admin/participants/participant',
                data: {session_id: sessionId, full_user_id: fullUserId, boot_reason: bootReason},
                success: function(response) {
                    if (success) {
                        success();
                    }
                },
                failure: function(msg, code) {
                    if (failure) {
                        failure(msg, code);
                    }
                }
              }
            );
        };

        return me;
    }());


//=================================================================
//=========================== PHONE ===============================
//=================================================================
/**
 * @author Russell Holmes
 * KandyAPI.Phone
 * @singleton
 * The Kandy Phone is used to make calls (audio and video), get presence notifications, and send IMs.
 */
api.Phone = (function () {
    var me = {};

    /**
     * @property {Object} _config Configuration for KandyAPI.Phone.
     * @private
     */
    var _config = {
        listeners: {},
        kandyApiUrl: "https://api.kandy.io/v1.1",
        mediatorUrl: 'http://service.kandy.io:8080/kandywrapper-1.0-SNAPSHOT',
        messageProvider: 'fring',
        pstnOutNumber: '71',
        allowAutoLogin: false
    };

    /**
     * @property {String} _username Username of the currently logged in user.
     * @private
     */
    var _username = null;

    /**
     * @property {String} _domainApiKey Domain API Key token.
     * @private
     */
    var _domainApiKey = null;

    /**
     * @property {String} _userAccessToken User access token.
     * @private
     */
    var _userAccessToken = null;

    /**
     * @property {String} _userDeviceId User device ID.
     * @private
     */
    var _userDeviceId = null;

    /**
     * @property {Object} _callTypes Holds call types.
     * @private
     */
    var _callTypes = {
        INCOMING_CALL: 1,
        OUTGOING_CALL: 2
    };

    /**
     * @property {Object} _imContentTypes Holds IM content types.
     * @private
     */
    var _imContentTypes = {
        VIDEO: 'video',
        AUDIO: 'audio',
        IMAGE: 'image',
        FILE: 'file'
    };

    /**
     * @property {Object} _presenceTypes Types of presence.
     * @private
     */
    var _presenceTypes = {
        0: 'Available',
        1: 'Unavailable',
        2: 'Away',
        3: 'Out To Lunch',
        4: 'Busy',
        5: 'On Vacation',
        6: 'Be Right Back',
        7: 'On The Phone',
        8: 'Active',
        9: 'Inactive',
        10: 'Pending',
        11: 'Offline'
    };

    /**
     * @property {CallObject} _calls call objects.
     * @private
     */
    var _calls = [];

    var _mediaInitiated = false;

    var _callStates = null;

    var _logger = null;

    var _initMediaDone = false;

    me.events = {};

    /**
     * @event callinitiated
     * Fired when an outgoing call is initiated
     * @param {Call} fcs.call.OutgoingCall object
     * @param {String} number ID of the callee
     */
    me.events['callinitiated'] = null;

    /**
     * @event callinitiatefailed
     * Fired when an attempt to initiate an outgoing call fails
     * @param {String} reasonText The reason for the failure or empty string
     */
    me.events['callinitiatefailed'] = null;

    /**
     * @event callincoming
     * Fired when a call is coming in
     * @param {Call} call The call object
     */
    me.events['callincoming'] = null;

    /**
     * @event callended
     * Fired when a call has ended
     * @param {string} call The call object
     */
    me.events['callended'] = null;

    /**
     * @event callendfailed
     * Fired when a call fails to end
     * @param {string} call The call object
     */
    me.events['callendfailed'] = null;

    /**
     * @event callanswered
     * Fired when a call is answered
     * @param {Call} call The call object
     * @param {Boolean} isAnonymous True if the all is anonymous
     */
    me.events['callanswered'] = null;

    /**
     * @event callanswerfailed
     * Fired when a failure occurs when answering a call
     * @param {Call} call The call object
     */
    me.events['callanswerfailed'] = null;

    /**
     * @event oncall
     * Fired while on call
     * @param {Call} call The call object
     */
    me.events['oncall'] = null;


    me.events['media'] = null;


    /**
     * @event presencenotification
     * @param {String} username Username of presence event
     * @param {String} state Presence state
     * @param {String} description Presence description
     * @param {String} activity Presence activity
     * Fired when presence notification is received
     */
    me.events['presencenotification'] = null;

    /**
     * @event loginsuccess
     * Fired when logged on
     */
    me.events['loginsuccess'] = null;

    /**
     * @event loginfailed
     * Fired when a login attempt fails
     */
    me.events['loginfailed'] = null;

    /**
     * @event callrejected
     * Fired when a call is rejected
     * @param {Call} call The call object
     */
    me.events['callrejected'] = null;

    /**
     * @event callrejectfailed
     * Fired when a call rejection fails
     * @param {Call} call The call object
     */
    me.events['callrejectfailed'] = null;

    /**
     * @event callignored
     * Fired when a call ignore succeeds
     * @param {Call} call The call object
     */
    me.events['callignored'] = null;

    /**
     * @event callignorefailed
     * Fired when a call ignore fails
     * @param {Call} call The call object
     */
    me.events['callignorefailed'] = null;

    /**
     * @event remotehold
     * Fired other party puts call on hold
     * @param {Call} call The call object
     */
    me.events['remotehold'] = null;

    /**
     * @event remoteunhold
     * Fired other party releases hold on call
     * @param {Call} call The call object
     */
    me.events['remoteunhold'] = null;

    /**
     * @event onconnectionlost
     * Fired when connection to comms server dies
     */
    me.events['onconnectionlost'] = null;

    /**
     * @event onmessagesavailable
     * Fired when new messages available
     */
    me.events['messagesavailable'] = null;

    me.MediaErrors = fcs.call.MediaErrors;

    /**
     * @method _fireEvent
     * Fires passed event
     * @private
     */
    function _fireEvent() {
        var eventName = Array.prototype.shift.apply(arguments);

        if (me.events[eventName])
            me.events[eventName].apply(me, arguments);
    }

    /**
     * @method _startIntraFrame
     * Starts infra-frame coding for compression
     * @param {Object} call The call Object
     * @private
     */
    function _startIntraFrame(call) {
        call.intraframe = setInterval(function () {
            if (call) {
                call.sendIntraFrame();
            } else {
                _stopIntraFrame(call);
            }
        }, 5000);
    }

    /**
     * @method _stopIntraFrame
     * Stops infra-frame coding for compression
     * @private
     */
    function _stopIntraFrame(call) {
        if (call.intraframe) {
            clearInterval(call.intraframe);
        }
    }


    /**
     * @method _handleCallNotification
     * Handles incoming call notifications
     * @param {Call} call The call object
     * @private
     */
    function _handleCallNotification(call) {
        _calls[call.getId()] = call;
        // check if this is an anonymous call
        call.isAnonymous = (call.callerNumber.indexOf("concierge") != -1);
        _fireEvent('callincoming', call, call.isAnonymous);
    }

    /**
     * @method _handleIncomingCallStateChange
     * Handles incoming call state changes
     * @param {Call} call The call object
     * @param {State} state The state of the call
     * @private
     */
    function _handleIncomingCallStateChange(call, state) {
        var callId = call.getId(),
            hold_state;

        call.isIncoming = true;
        call.isOutgoing = false;
        var localCall = _calls[callId];

        if (!localCall)
            _calls[callId] = localCall = call;

        hold_state = call.getHoldState();

        if (hold_state === "REMOTE_HOLD") {
            _logger.info('CALL HELD REMOTELY');
            call.remoteHold = true;
            _fireEvent('remotehold', call);
        } else {
            if (call.remoteHold !== undefined && call.remoteHold) {
                _logger.info('CALL REMOTE HOLD RELEASED');
                _fireEvent('remoteunhold',call);
            }
            call.remoteHold = false;
        }

        if (state === _callStates.IN_CALL) {
            if (hold_state === "LOCAL_HOLD") {
                _logger.info('ON HOLD');
            } else {
                _logger.info('ON CALL');
            }

            if (call.canSendVideo()) {
                _startIntraFrame(localCall);
            }
        } else if (state === _callStates.RENEGOTIATION) {

        } else if (state === _callStates.ON_HOLD) {
            _logger.info("CALL HELD REMOTELY");
        } else if (state === _callStates.RINGING) {
            _logger.info("RINGING");
        } else if (state === _callStates.ENDED) {
            if (call) {
                _stopIntraFrame(localCall);
                if (call.statusCode === 0 || call.statusCode === undefined) {
                    _logger.info("CALL END");
                } else {
                    if ((call.statusCode >= 100 && call.statusCode <= 300)) {
                        _logger.error("WebRTC ERROR");
                    } else {
                        _logger.error("ERROR");
                    }
                }
                delete _calls[callId];
                _fireEvent('callended', call);
            }
        } else if (state === _callStates.REJECTED) {
            _logger.info("REJECTED");
        } else if (state === _callStates.OUTGOING) {
            _logger.info("DIALING");
        } else if (state === _callStates.INCOMING) {
            _logger.info("INCOMING");
        } else if (state === _callStates.JOINED) {

        }
    }

    /**
     * @method _handleOutgoingCallStateChange
     * Handles outgoing call state changes
     * @param {Call} call The call object
     * @param {State} state The state of the call
     * @private
     */
    function _handleOutgoingCallStateChange(call, state) {
        var callId = call.getId(),
            hold_state;

        var localCall = _calls[callId];
        localCall.isOutgoing = true;
        localCall.isIncoming = false;

        hold_state = call.getHoldState();
        if (hold_state === "REMOTE_HOLD") {
            _logger.info('CALL HELD REMOTELY');
            call.remoteHold = true;
            _fireEvent('remotehold', call);
        } else {
            if (call.remoteHold !== undefined && call.remoteHold) {
                _logger.info('CALL REMOTE HOLD RELEASED');
                _fireEvent('remoteunhold',call);
            }
            call.remoteHold = false;
        }


        if (state === _callStates.IN_CALL) {
            if (hold_state === "LOCAL_HOLD") {
                _logger.info('ON HOLD');
            } else {
                _logger.info('ON CALL');
            }

            if (call.canSendVideo()) {
                _startIntraFrame(localCall);
            }
            _fireEvent('oncall', call);
        } else if (state === _callStates.RENEGOTIATION) {

        } else if (state === _callStates.ON_HOLD) {
            _logger.info("CALL HELD REMOTELY");
        } else if (state === _callStates.RINGING) {
            _logger.info("RINGING");
        } else if (state === _callStates.ENDED) {
            if (call) {
                _stopIntraFrame(localCall);
                if (call.statusCode === 0 || call.statusCode === undefined) {
                    _logger.info("CALL END");
                } else {
                    if ((call.statusCode >= 100 && call.statusCode <= 300)) {
                        _logger.error("WebRTC ERROR");
                    } else {
                        _logger.error("ERROR");
                    }
                }

                if (localCall.isAnonymous && localCall.isOutgoing) {
                    me.logout();
                }

                delete _calls[callId];
                _fireEvent('callended', call);

            }
        } else if (state === _callStates.REJECTED) {
            _logger.info("REJECTED");
        } else if (state === _callStates.OUTGOING) {
            _logger.info("DIALING");
        } else if (state === _callStates.INCOMING) {
            _logger.info("INCOMING");
        } else if (state === _callStates.JOINED) {
            _logger.info('JOINED');
        }
    }

    /**
     * @method _handlePresenceNotification
     * Handles presence notifications, fires the presencenotification event
     * @param {Presence} presence The Presence object
     * @private
     */
    function _handlePresenceNotification(presence) {
        if (presence.state === null) {
            _logger.info("State is empty.");
            return;
        }

        if (presence.name === null) {
            _logger.info("Name is empty.");
            return;
        }
        _fireEvent('presencenotification', presence.name, presence.state, _presenceTypes[presence.state], presence.activity);
    }


    /**
     * @method _supportsLocalStorage
     * @private
     * Checks if local storage is available
     */
    function _supportsLocalStorage() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    }

    /**
     * @method _setUserInformationLocalStorage
     * @private
     * @param password Password to set
     * Set access token in local storage
     */
    function _setUserInformationLocalStorage(password) {
        localStorage['kandyphone.userinformation'] = _domainApiKey + ';' + _username + ';' + password;
        return true;
    }

    /**
     * @method _getUserInformationLocalStorage
     * @private
     * Get access token from local storage
     */
    function _getUserInformationLocalStorage() {
        return localStorage['kandyphone.userinformation'];
    }

    /**
     * @method _clearAccessTokeLocalStorage
     * @private
     * Clears access token from local storage
     */
    function _clearAccessTokeLocalStorage() {
        localStorage.removeItem('kandyphone.userinformation');
        return true;
    }

    /**
     * @method _mapSpidrConfigToFcs
     * @private
     * Maps the spider configs retrived from getSpiderConfiguration to fcs configs which can then be passed to fcs.setup
     */
    function _mapSpidrConfigToFcs(spidrConfig){
        var fcsConfig = {
          notificationType: fcs.notification.NotificationTypes.WEBSOCKET,
          restUrl: spidrConfig.REST_server_address,
          restPort: spidrConfig.REST_server_port,
          websocketIP: spidrConfig.webSocket_server_address,
          websocketPort: spidrConfig.webSocket_server_port,
          websocketProtocol: (spidrConfig.use_DTLS ? 'wss' : 'ws'),
          disableNotifications: null,
          protocol: spidrConfig.REST_protocol,
          cors: true
        };

      return fcsConfig;
    }

  /**
   * @method _mapSpidrConfigToSpidrEnv
   * @private
   * Maps the spider configs retrived from getSpiderConfiguration to spidrEnv config which can then be passed to fcs.call.initMedia
   */
  function _mapSpidrConfigToSpidrEnv(spidrConfig){
    var spidrEnv = {
      iceserver: spidrConfig.ICE_server_address,
      iceserverPort: spidrConfig.ICE_server_port,
      webrtcdtls: spidrConfig.use_DTLS,
      pluginMode: "auto",
      pluginLogLevel: 2
    };
    
    
    return spidrEnv;
  }

  /**
   * @method _mergeConfigWithSpidrConfiguration
   * @private
   * merges _config with spidr config retrived from getSpidrConfiguration
   */

   function _mergeConfigWithSpidrConfiguration(spidrConfig){
      
      // merge with configs from KandyAPI.Phone.setup
      _config.fcsConfig = $.extend(_mapSpidrConfigToFcs(spidrConfig), (_config.fcsConfig || {}));
    
      // apply default SPiDR configuration
      _config.spidrEnv = $.extend(_mapSpidrConfigToSpidrEnv(spidrConfig), (_config.spidrEnv || {}));
    
      if (_config.remoteVideoContainer) {
        _config.spidrEnv['remoteVideoContainer'] = _config.remoteVideoContainer;
      }
    
      if (_config.localVideoContainer) {
        _config.spidrEnv['localVideoContainer'] = _config.localVideoContainer;
      }
    };

    /**
     * @method _login
     * @private
     * Logs in to Experius and SPiDR through fcs JSL
     * @param {String} userAccessToken Access token for user.
     * @param {String} password Password for user.
     */
    function _login(userAccessToken, password) {
        me.setUserAccessToken(userAccessToken);
        me.getDevices(userAccessToken,
            function (data) {
                if (data.devices && data.devices.length > 0) {
                    me.setUserDeviceId(data.devices[0].id);
                }
            },
            function (message) {
                // log it and keep moving, don't fail the login for this
                _logger.error("error retrieving device id: " + message);
            }
        );
        me.getSpidrConfiguration(userAccessToken,
               function(spidrConfig){
                 
                      // merge _config with spirdConfig
                      _mergeConfigWithSpidrConfiguration(spidrConfig);

                     // setup SPiDR with fcsConfig
                     fcs.setup(_config.fcsConfig);
                 
                     KandyAPI.getLimitedUserDetails(userAccessToken,
                         function (data) {
                             var username = data.full_user_id;
                           
                             fcs.setUserAuth(username, password);
                             fcs.notification.start(function () {
                                 _username = username;
                                 _callStates = fcs.call.States;
                                 // if the browser supports local storage persist the Access Token
                                 if (_config['allowAutoLogin'] && _supportsLocalStorage()) {
                                     _setUserInformationLocalStorage(password);
                                 }
                                
                                 _fireEvent('loginsuccess');
                                 },
                                 function () {
                                     _logger.error("login failed");
                                     _fireEvent('loginfailed');
                                  },
                                  false                  
                             );
                         },
                         function () {
                             _logger.error("login failed");
                             _fireEvent('loginfailed');
                          }
                     );
               },
               function(){
                   _logger.error("login failed");
                   _fireEvent('loginfailed');
               }
        );                         
    }


    /**
     * @method _sendImWithAttachment
     * @param {String} user Username of message recipient
     * @param {Object} attachment Attachement to be sent
     * @param {String} contentType Content Type of file.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * Sends a File message to another Kandy user
     */
    function _sendImWithAttachment(user, attachment, contentType, success, failure) {
        if (_config.messageProvider === 'fring') {
            var uuid = _UUIDv4();
            // Upload file and if we get a success send the IM
            me.uploadFile(attachment, function (fileUuid) {
                var message = {
                    "message": {
                        "messageType": "chat",
                        "contentType": contentType,
                        "destination": user,
                        "UUID": uuid,
                        "message": {
                            "mimeType": attachment.type,
                            "content_uuid": fileUuid,
                            "content_name": attachment.name
                        }
                    }
                };
              _kandyAjax(
                {
                  type: 'POST',
                  url: '/devices/messages?device_id=' + _userDeviceId,
                  data: message,
                  success: function (response) {
                    if (response.status === responseCodes.OK) {
                      if (success) {
                        success(uuid);
                      }
                    } else if (failure) {
                      failure(response.message, response.status);
                    }
                  },
                  failure: function (x, e) {
                    if (failure)
                      failure(x.statusText, responseCodes.ajaxError);
                  }
                }
              );
            });

            return uuid;
        }
        else {
            _logger.error('NOT SUPPORTED');
        }
    };

    function _notificationHandler (message) {
        if (message.message.message_type === "gofetch") {
            _fireEvent("messagesavailable");
        }
    }

    registerWebSocketListeners( {
        'notification': _notificationHandler
    });

    me.setUserAccessToken = function (token) {
        _userAccessToken = token;
    };

  
    me.setUserDeviceId = function (deviceId) {
        _userDeviceId = deviceId;
    };

    /**
     * @method setup
     * Setup Spdir
     * @param {Object} config Configuration.
     * @param {Array} [config.listeners={}] callback methods for KandyAPI events (see Events).
     * @param {String} [config.mediatorUrl="http://54.187.112.97:8080/kandywrapper-1.0-SNAPSHOT"] Rest endpoint for KandyWrapper.
     * @param {String} [config.allowAutoLogin=true] True to persist login information in local storage and auto login during setup
     * @param {Object} [config.fcsConfig] FCS Configuration
     * @param {KandyAPI.NOTIFICATION_TYPES} [config.fcsConfig.notificationType=KandyAPI.NOTIFICATION_TYPES.WEBSOCKET] Type of connection to use for notifications.
     * @param {String} [config.fcsConfig.restUrl="kandysimplexlb-231480754.us-east-1.elb.amazonaws.com"] Rest endpoint for spidr.
     * @param {String} [config.fcsConfig.cors=true] True to enable CORS support.
     * @param {String} [config.fcsConfig.restPort="443"] Port to use for rest endpoint.
     * @param {String} [config.fcsConfig.websocketIP="kandysimplexlb-231480754.us-east-1.elb.amazonaws.com"] Websocket endpoint for spidr.
     * @param {String} [config.fcsConfig.websocketPort="8581"] Port to use for websocket endpoint.
     * @param {String} [config.fcsConfig.disableNotifications=null] True to disable notifications.
     * @param {String} [config.fcsConfig.protocol="https"] Protocol to use http | https.
     * @param {Object} [config.spidrEnv] SPiDR Configuration.
     * @param {Object} [config.spidrEnv.iceserver="stun:206.165.51.23:3478"]
     * @param {Object} [config.spidrEnv.webrtcdtls=null]
     * @param {Object} [config.spidrEnv.remoteVideoContainer=""]
     * @param {Object} [config.spidrEnv.localVideoContainer=""]
     * @param {Object} [config.spidrEnv.pluginMode="auto"]
     * @param {Object} [config.spidrEnv.pluginLogLevel=2]
     * @param {Object} [config.spidrEnv.ice="STUN " + "stun:206.165.51.23:3478"]
     */
    me.setup = function (config) {
        fcs.logManager.initLogging(function(x,y,z) {
            if (z.message === 'ERROR')
                window.console.log(z.message);
            else
                window.console.log(z.message);
        }, true);
        _logger = fcs.logManager.getLogger("kandy_sap_js");

        // apply default configuration
        _config = $.extend(_config, config);
      
        // setup listeners
        if (_config['listeners']) {
            for (var listener in _config['listeners']) {
                if (me.events[listener] !== undefined)
                    me.events[listener] = _config['listeners'][listener];
            }
        }

        _logger = fcs.logManager.getLogger();


        fcs.notification.setOnConnectionLost(function () {
            _logger.info('Connection Lost');
            _fireEvent('onconnectionlost');
        });

        if (_config['allowAutoLogin'] && _supportsLocalStorage() && _getUserInformationLocalStorage()) {
            me.login(_getUserInformationLocalStorage().split(';')[0],
                _getUserInformationLocalStorage().split(';')[1],
                _getUserInformationLocalStorage().split(';')[2]);
        }

        fcs.presence.onReceived = function (presence) {
            _handlePresenceNotification(presence);
        };

        fcs.call.onReceived = function (call) {
            _logger.info("incoming call");

            call.onStateChange = function (state) {
                _handleIncomingCallStateChange(call, state);
            };

            _handleCallNotification(call);
        };
    };

    me.initMedia = function(success, failure, force) {
        if ((force === undefined || !force) && _initMediaDone) {
            success();
            return;
        }

        // make sure the browser supports WebRTC
        fcs.call.initMedia(
            function () {
                _logger.info("media initiated");
                _mediaInitiated = true;

                // add unload event to end any calls
                window.addEventListener("beforeunload", function (event) {
                    for (var i in _calls) {
                        me.endCall(i);
                    }
                });
                _initMediaDone = true;
                success();
            },
            function (error) {
                _logger.error("Problem occurred while initiating media");

                switch (error) {
                    case fcs.call.MediaErrors.WRONG_VERSION:
                        _logger.error("Media Plugin Version Not Supported");
                        _fireEvent('media', {type: me.MediaErrors.WRONG_VERSION});
                        break;
                    case fcs.call.MediaErrors.NEW_VERSION_WARNING:
                        _logger.error("New Plugin Version is available");
                        _fireEvent('media', 
                                {// event
                                    type: me.MediaErrors.NEW_VERSION_WARNING,
                                    urlWin32bit: 'https://kandy-portal.s3.amazonaws.com/public/Kandy/Enabler-Plugins-2.1.376/GCFWEnabler_2.1.376.0.exe',
                                    urlWin64bit: 'https://kandy-portal.s3.amazonaws.com/public/Kandy/Enabler-Plugins-2.1.376/GCFWEnabler_x86_64__2.1.376.0.exe',
                                    urlMacUnix: 'https://kandy-portal.s3.amazonaws.com/public/Kandy/Enabler-Plugins-2.1.376/GCFWEnabler_2.1.376.0.pkg'
                                }
                        );
                        break;
                    case fcs.call.MediaErrors.NOT_INITIALIZED:
                        _logger.error("Media couldn't be initialized");
                        _fireEvent('media', {type: me.MediaErrors.NOT_INITIALIZED});
                        break;
                    case fcs.call.MediaErrors.NOT_FOUND:
                        _logger.error("Plugin couldn't be found!");
                        _fireEvent('media',
                                {// event
                                    type: me.MediaErrors.NOT_FOUND,
                                    urlWin32bit: 'https://kandy-portal.s3.amazonaws.com/public/Kandy/Enabler-Plugins-2.1.376/GCFWEnabler_2.1.376.0.exe',
                                    urlWin64bit: 'https://kandy-portal.s3.amazonaws.com/public/Kandy/Enabler-Plugins-2.1.376/GCFWEnabler_x86_64__2.1.376.0.exe',
                                    urlMacUnix: 'https://kandy-portal.s3.amazonaws.com/public/Kandy/Enabler-Plugins-2.1.376/GCFWEnabler_2.1.376.0.pkg'
                                }
                        );
                        break;
                }

                failure();
            },
            {
                "pluginLogLevel": _config.spidrEnv.pluginLogLevel,
                "remoteVideoContainer": _config.spidrEnv.remoteVideoContainer,
                "localVideoContainer": _config.spidrEnv.localVideoContainer,
                "pluginMode": _config.spidrEnv.pluginMode,
                "iceserver": _config.spidrEnv.iceserver,
                "webrtcdtls": _config.spidrEnv.webrtcdtls
            }
        );
    };

    /**
     * @method login
     * Logon
     * @param {String} domainApiKey The domain API ID.
     * @param {String} username The username (should not include '@<domain>').
     * @param {String} password The password.
     */
    me.login = function (domainApiKey, username, password) {
    	api.login(domainApiKey, username, password,
    	    function(result) {
                _domainApiKey = domainApiKey;
                _login(result.user_access_token, password);
    	    },
    	    function(msg, code) {
                _logger.error("login failed");

                // if the browser supports local storage clear out the stored access token if there was one stored
                if (_supportsLocalStorage()) {
                    _clearAccessTokeLocalStorage();
                }

                _fireEvent('loginfailed');
    	    }
    	);    	
    };

    /**
     * @method logout
     * Logs out
     * @param {Function} success The success callback.
     */
    me.logout = function (success) {
        _logger.info('logging out');
        api.logout();

        //me.updatePresence(11);

        // if the browser supports local storage clear out the stored access token
        if (_supportsLocalStorage()) {
            _clearAccessTokeLocalStorage();
        }

        fcs.clearResources(function () {
            if (success)
                success();
        }, true, true);
    };

    /**
     * @method hasStoredLogin
     * Returns true if login information has been stored in local storage
     */
    me.hasStoredLogin = function () {
        (_supportsLocalStorage() && _getUserInformationLocalStorage());
    };

    /**
     * @method isMediaInitialized
     * Returns true if media is initialized
     */
    me.isMediaInitiated = function () {
        return _mediaInitiated;
    };

    /**
     * @method isIncoming
     * @param {String} callId The id of the call.
     * returns true if call is incoming
     */
    me.isIncoming = function (callId) {
        var call = _calls[callId];

        return call.isIncoming;
    };

    /**
     * @method isOutgoing
     * @param {String} callId The id of the call.
     * Returns true if call is outgoing
     */
    me.isOutgoing = function (callId) {
        var call = _calls[callId];

        return call.isOutgoing;
    };

    /**
     * @method callTypes
     * Gets call types
     * See call types enumeration
     */
    me.callTypes = function () {
        return _callTypes;
    };

    /**
     * @method getAnonymousData
     * @param {String} callId The id of the call to get the Anonymous data for.
     * returns anonymous data if the call is anonymous null if not.
     */
    me.getAnonymousData = function (callId) {
        var call = _call[callId];

        if (call && call.isAnonymous) {
            return call.callerName
        } else {
            return null;
        }
    };

    /**
     * @method callType
     * @param {String} callId The id of the call.
     * returns call type either incomming or outgoing
     */
    me.callType = function (callId) {
        var call = _calls[callId];

        if (call.isIncoming) {
            return _callTypes.INCOMING_CALL;
        }
        else if (call.isOutgoing) {
            return _callTypes.OUTGOING_CALL;
        }
    };

    /**
     * @method makePSTNCall
     * Starts PSTN call using the configured pstnOutNumber
     * @param {String} number The number to call.
     */
    me.makePSTNCall = function (number, callerId) {
        me.makeCall(_config.pstnOutNumber + number + '@' + _userDetails.domain_name, false, callerId);

    };

    /**
     * @method makeCall
     * Starts call
     * @param {String} number The number to call.
     * @param {Boolean} cameraOn Whether to turn one's own camera on
     * @param {String} callerId What you want the caller ID to look like to callee
     */
    me.makeCall = function (number, cameraOn, callerId) {
        _logger.info('making voice call');
        me.initMedia(function() {
            if (number == _username) {
                _fireEvent('callinitiatefailed', 'You cannot call yourself');
                return;
            }

            fcs.call.startCall(fcs.getUser(), {firstName: callerId}, number,
                //onSuccess
                function (outgoingCall) {
                    outgoingCall.onStateChange = function (state, statusCode) {
                        outgoingCall.statusCode = statusCode;

                        _handleOutgoingCallStateChange(outgoingCall, state);
                    };

                    outgoingCall.isAnonymous = false;
                    _calls[outgoingCall.getId()] = outgoingCall;

                    _fireEvent('callinitiated', outgoingCall, number);
                },
                //onFailure
                function () {
                    _logger.error("call failed");
                    _fireEvent('callinitiatefailed', '');

                },
                false, cameraOn);
            },
            function() {
                _logger.error("call failed");
                _fireEvent('callinitiatefailed', '');
            }
        );
    };

    /**
     * @method makeAnonymousCall
     * Starts Anonymous video call
     * @param {String} number The Kandy user being called (callee)
     * @param {String} anonymousData Data to send with anonymous call
     * @param {String} caller_user_name The Kandy user making the call (caller)
     * @param {Boolean} cameraOn Whether call is made with camera on
     */
    me.makeAnonymousCall = function (callee_user_name, anonymousData, caller_user_name, cameraOn) {

        _mergeConfigWithSpidrConfiguration(
            {
                "REST_server_address":"multispidr.kandy.io",
                "REST_server_port":443,
                "webSocket_server_address":"multispidr.kandy.io",
                "webSocket_server_port":8582,
                "ICE_server_address":"",
                "ICE_server_port":0,
                "subscription_expire_time_seconds":0,
                "REST_protocol":"https",
                "server_certificate":null,
                "use_DTLS":true,
                "audit_enable":true,
                "audit_packet_frequency":30
            }
        );

        fcs.setup(_config.fcsConfig);

        //Setup user credential
        fcs.setUserAuth(callee_user_name, '');

        fcs.notification.start(function () {
            _logger.info("Login succesfully");

            _callStates = fcs.call.States;

            fcs.call.initMedia(function () {
                _logger.info("Call init successfully");
                setTimeout(function () {

                    var anonymousUserName = {
                        "firstName": anonymousData
                    };

                    caller_user_name = caller_user_name || 'anonymous@concierge.com';

                    fcs.call.startCall(caller_user_name, anonymousUserName, callee_user_name,
                        //onSuccess
                        function (outgoingCall) {
                            outgoingCall.onStateChange = function (state, statusCode) {
                                outgoingCall.statusCode = statusCode;

                                _handleOutgoingCallStateChange(outgoingCall, state);
                            };

                            outgoingCall.isAnonymous = true;
                            _calls[outgoingCall.getId()] = outgoingCall;
                            _fireEvent('callinitiated', outgoingCall, callee_user_name);
                        },
                        //onFailure
                        function () {
                            _logger.error("call failed");
                            _fireEvent('callinitiatefailed');

                        },
                        false, cameraOn);

                }, 500);
            }, function () {
                _logger.error("Call init failed");
                logout();
            }, {
                "pluginLogLevel": _config.spidrEnv.pluginLogLevel,
                "ice": _config.spidrEnv.ice,
                "remoteVideoContainer": _config.spidrEnv.remoteVideoContainer,
                "localVideoContainer": _config.spidrEnv.localVideoContainer,
                "pluginMode": _config.spidrEnv.pluginMode,
                "iceserver": _config.spidrEnv.iceserver,
                "webrtcdtls": _config.spidrEnv.webrtcdtls
            });
        }, function () {
            console.error("Login failed");
        }, true);
    };


    /**
     * @method rejectCall
     * reject incoming call
     * @param {String} callId Id of call.
     */
    me.rejectCall = function (callId) {
        var call = _calls[callId];
        call.reject(
            function () {
                _fireEvent('callrejected', call);
            },
            function () {
                _logger.info("reject failed");
                _fireEvent('callrejectfailed', call);
            }
        );
    };

    /**
     * @method ignoreCall
     * ignore incoming call
     * @param {String} callId Id of call.
     */
    me.ignoreCall = function (callId) {
        var call = _calls[callId];
        call.ignore(
            function () {
                _fireEvent('callignored', call);
            },
            function () {
                _fireEvent('callignorefailed', call);
                _logger.info("ignore failed");
            }
        );
    };

    /**
     * @method answerCall
     * Answer voice call
     * @param {String} callId Id of call.
     * @param {Boolean} cameraOn Whether to turn one's own camera on
     */
    me.answerCall = function (callId, cameraOn) {
        me.initMedia(function() {
                var call = _calls[callId];
                call.answer(function () {
                        _fireEvent('callanswered', call, call.isAnonymous);
                    },
                    function () {
                        _logger.info("answer failed");
                        _fireEvent('callanswerfailed', call);
                    },
                    cameraOn
                );
            },
            function() {
                _logger.info("answer failed");
                _fireEvent('callanswerfailed', call);
            }
        );
    };

    /**
     * @method muteCall
     * Mutes current call
     * @param {String} callId Id of call.
     */
    me.muteCall = function (callId) {
        var call = _calls[callId];
        if (call) {
            call.mute();
            call.isMuted = true;
        }
    };

    /**
     * @method unMuteCall
     * Unmutes current call
     * @param {String} callId Id of call.
     */
    me.unMuteCall = function (callId) {
        var call = _calls[callId];
        if (call) {
            call.unmute();
            call.isMuted = false;
        }
    };

    /**
     * @method holdCall
     * Holds current call
     * @param {String} callId Id of call.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     */
    me.holdCall = function (callId, success, failure) {
        var call = _calls[callId];
        if (call) {
            success = success || function () {
            };
            failure = failure || function () {
            };

            call.hold(success, failure);
            call.held = true;
        }
    };

    /**
     * @method unHoldCall
     * Removes hold on current call
     * @param {String} callId Id of call.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     */
    me.unHoldCall = function (callId, success, failure) {
        var call = _calls[callId];
        if (call) {
            success = success || function () {
            };
            failure = failure || function () {
            };

            call.unhold(success, failure);
            call.held = false;
        }
    };

    /**
     * @method startCallVideo
     * Starts video on call
     * @param {String} callId Id of call.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     */
    me.startCallVideo = function (callId, success, failure) {
        var call = _calls[callId];
        if (call) {
            success = success || function () {
            };
            failure = failure || function () {
            };

            call.videoStart(success, failure);
        }
    };

    /**
     * @method stopCallVideo
     * Stops video on call
     * @param {String} callId Id of call.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     */
    me.stopCallVideo = function (callId, success, failure) {
        var call = _calls[callId];
        if (call) {
            success = success || function () {
            };
            failure = failure || function () {
            };

            call.stopVideo(success, failure);
        }
    };

    /**
     * @method sendDTMF
     * sends tones on a call
     * @param {String} callId Id of call.
     * @param {String} tones A string of tones
     */
    me.sendDTMF = function (callId, tones) {
        var call = _calls[callId];
        if (call) {
            call.sendDTMF(tones);
        }
    };

    /**
     * @method endCall
     * Ends call
     * @param {String} callId Id of call.
     */
    me.endCall = function (callId) {
        var call = _calls[callId];

        if (call) {
            _logger.info('ending call');
            call.end(
                function () {
                    _stopIntraFrame(call);

                    delete _calls[callId];

                    if (call.isAnonymous && call.isOutgoing) {
                        fcs.clearResources(function () {
                        }, true, true);
                    }

                    _fireEvent('callended', call);
                },
                function () {
                    _logger.error('COULD NOT END CALL');
                    _fireEvent('callendfailed', call);
                }
            );
        }
    };

    /**
     * @method watchPresence
     * Sets up watching for presence change of contacts.
     */
    me.watchPresence = function (list, success, failure) {
        var contactList = [];

        fcs.presence.watch(
        	list.map(function (item) {return item.full_user_id}),
            function () {
                _logger.info('Watch presence successful');
                if (success) {
                    success();
                }
            },
            function () {
                _logger.error('Watch presence error');
                if (failure) {
                    failure();
                }
            }
        );
    };

    /**
     * @method updatePresence
     * Sets presence for logged in user.
     */
    me.updatePresence = function (status) {
        if (fcs.getServices().presence === true) {
            fcs.presence.update(parseInt(status),
                function () {
                    _logger.info("Presence update success");
                },
                function () {
                    _logger.error("Presence update failed");
                });
        } else {
            _logger.error("Presence service not available for account");
        }
    };

    /**
     * @method searchDirectoryByPhoneNumber
     * @param {String} phoneNumber The name to search for.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * Search directory for user.
     */
    me.searchDirectoryByPhoneNumber = function (phoneNumber, success, failure) {
      var paramStr = "search_string=" + encodeURIComponent(phoneNumber);

      _kandyAjax(
        {
          url: '/users/directories/native/searches/phone_number?' + paramStr,
          success: function (response) {
            if (success) {
              var results = response.result.contacts;
              success(results);
            }
          },
          failure: failure
        }
      );
    };

    /**
     * @method searchDirectoryByName
     * @param {String} name The name to search for
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * Search directory for user.
     */
    me.searchDirectoryByName = function (name, success, failure) {
      var paramStr = "search_string=" + encodeURIComponent(name);

      _kandyAjax(
        {
          url: '/users/directories/native/searches/name?' + paramStr,
          success: function (response) {
            if (success) {
              success(response.result.contacts);
            }
          },
          failure: failure
        }
      );
    };

    /**
     * @method searchDirectoryByUserName
     * @param {String} username Username to search for.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * Search directory for user.
     */
    me.searchDirectoryByUserName = function (username, success, failure) {
      var paramStr = "search_string=" + encodeURIComponent(username);

      _kandyAjax(
        {
          url: '/users/directories/native/searches/user_id?' + paramStr,
          success: function (response) {
            if (success) {
              success(response.result.contacts);
            }
          },
          failure: failure
        }
      );

    };

    /**
     * @method searchDirectory
     * @param {String} searchString can first name, last name, user ID or phone number.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * Generic search directory for user.
     */
    me.searchDirectory = function (searchString, success, failure) {
      var paramStr = "search_string=" + encodeURIComponent(searchString);

      _kandyAjax(
        {
          url: '/users/directories/native/search/?' + paramStr,
          success: function (response) {
            if (success) {
              success(response.result.contacts);
            }
          },
          failure: failure
        }
      );

    };
  
    /**
     * @method retrievePersonalAddressBook
     * @param {String} userAccessToken
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * Retrieves address book entries.
     */
    me.retrievePersonalAddressBook = function (success, failure) {

      _kandyAjax(
        {
          url: '/users/addressbooks/personal',
          success: function (response) {
            if (success) {
              success(response.result.contacts);
            }
          },
          failure: failure
        }
      );
    };

    /**
     * @method addToPersonalAddressBook
     * @param {String} userAccessToken
     * @param {Object} entry Object container properties of the entry to add.
     * @param {Object} entry.username Object container properties of the entry to add.
     * @param {Object} entry.nickname  Nickname for address book entry.
     * @param {Object} [entry.firstName] first name for address book entry.
     * @param {Object} [entry.lastName] last name for address book entry.
     * @param {Object} [entry.homePhone] home phone for address book entry.
     * @param {Object} [entry.mobileNumber] mobile number for address book entry.
     * @param {Object} [entry.businessPhone] business phone for address book entry.
     * @param {Object} [entry.fax] fax for address book entry.
     * @param {Object} [entry.email] email for address book entry.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * Adds kandy user to current kandy user's address book.
     */
    me.addToPersonalAddressBook = function (entry, success, failure) {

      _kandyAjax(
        {
          type: 'POST',
          url: '/users/addressbooks/personal',
          data: {contact: entry},
          success: function (response) {
            console.log('success');
            if (success) {
              success(response.result);
            }
          },
          failure: failure
        }
      );
    };

    /**
     * @method removeFromPersonalAddressBook
     * @param {String} contactId Contact ID for the contact.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * Retrieves address book entries.
     */
    me.removeFromPersonalAddressBook = function (contactId, success, failure) {
        var paramStr = 'contact_id=' + encodeURIComponent(contactId);

      _kandyAjax(
        {
          type: 'DELETE',
          url: '/users/addressbooks/personal?' + paramStr,
          contentType: 'text/html',
          acceptType: '*/*',
          success: function (response) {
            if (success) {
              success();
            }
          },
          failure: failure
        }
      );
    };

    /**
     * @method sendSMS
     * @param {String} phone number.
     * @param {String} sender number.
     * @param {String} sms text.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * Retrieves address book entries.
     */
    me.sendSMS = function (number, sender, text, success, failure) {
        _kandyAjax(
            {
            type: 'POST',
            url: '/devices/smss?device_id=' + _userDeviceId,
            data: {message: {
                "source": sender,
                "destination":number,
                "message": {"text": text}
            }},
            success: success,
            failure: failure
        });
    };

    /**
     * @method sendIm
     * @param {String} user Username of message recipient
     * @param {String} text Textual message to be sent to recipient
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * Sends a textual instant message to another Kandy user
     */
    me.sendIm = function (user, text, success, failure) {
        if (_config.messageProvider === 'fring') {
            var uuid = _UUIDv4();
            var message = {
                "message": {
                    "messageType": "chat",
                    "contentType": "text",
                    "destination": user,
                    "UUID": uuid,
                    "message": {
                        "mimeType": "text/plain",
                        "text": text
                    }
                }
            };

          _kandyAjax({
            type: 'POST',
            url: '/devices/messages?device_id=' + _userDeviceId,
            data: message,
            success: function (response) {
              if (success) {
                success(response.result);
              }
            },
            failure: failure
          });
            return uuid;
        } else if (_config.messageProvider === 'spidr') {
            var im = new fcs.im.Message();
            im.primaryContact = user;
            im.type = "A2";
            im.msgText = text;
            im.charset = "UTF-8";

            fcs.im.send(im, success, failure);
            return 0;
        }
    };

    /**
     * @method sendImWithFile
     * @param {String} user Username of message recipient
     * @param {Object} file File to be sent
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * Sends a File message to another Kandy user
     */
    me.sendImWithFile = function (user, file, success, failure) {
        _sendImWithAttachment(user, file, _imContentTypes.FILE, success, failure);
    };

    /**
     * @method sendImWithImage
     * @param {String} user Username of message recipient
     * @param {Object} file File to be sent
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * Sends a File message to another Kandy user
     */
    me.sendImWithImage = function (user, file, success, failure) {
        _sendImWithAttachment(user, file, _imContentTypes.IMAGE, success, failure);
    };

    /**
     * @method sendImWithAudio
     * @param {String} user Username of message recipient
     * @param {Object} file File to be sent
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * Sends a File message to another Kandy user
     */
    me.sendImWithAudio = function (user, file, success, failure) {
        _sendImWithAttachment(user, file, _imContentTypes.AUDIO, success, failure);
    };

    /**
     * @method sendImWithVideo
     * @param {String} user Username of message recipient
     * @param {Object} file File to be sent
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * Sends a File message to another Kandy user
     */
    me.sendImWithVideo = function (user, file, success, failure) {
        _sendImWithAttachment(user, file, _imContentTypes.VIDEO, success, failure);
    };

    /**
     * @method uploadFile
     * @param {File} file File to be sent
     * @param {Function} success The success callback.
     * @param {UUID} success.uuid The UUID of the uploaded file.
     * @param {Function} failure The failure callback.
     * @param {string}    failure.message Error Message.
     * @param {string}    failure.statusCode Error status code.
     * Uploads file to be used in Rich IM messaging
     */
    me.uploadFile = function (file, success, failure) {
        // Generate a UUID
        var uuid = _UUIDv4();

        // Create a new FormData object.
        var formData = new FormData();

        // Add the file to the request.
        formData.append('file', file, file.name);

        // Set up the request.
        var xhr = new XMLHttpRequest();

        var url = _config.kandyApiUrl + '/devices/content?key=' + _userAccessToken + '&content_uuid=' + encodeURIComponent(uuid) + '&device_id=' + _userDeviceId + '&content_type=' + encodeURIComponent(file.type);

        // Open the connection.
        xhr.open('POST', url, true);

        // Set up a handler for when the request finishes.
        xhr.onload = function () {
            if (xhr.status === 200) {
                var result = {};
                if (JSON) {
                    result = JSON.parse(xhr.responseText);
                }
                else {
                    result = eval('(' + xhr.responseText + ')');
                }

                if (result.status == responseCodes.OK) {
                    // File(s) uploaded.
                    if (success)
                        success(uuid);

                }
                else if (failure) {
                    if (failure)
                        failure(response.message, response.status);
                }


            } else {
                if (failure)
                    failure('Request Error', '500');
            }
        };

        // Send the Data.
        xhr.send(formData);

        return uuid;
    };

    /**
     * @method buildFileUrl
     * @param {uuid} UUID for file
     * Builds Url to uploaded file
     */
    me.buildFileUrl = function (uuid) {
        return _config.kandyApiUrl + '/devices/content?key=' + _userAccessToken + '&content_uuid=' + encodeURIComponent(uuid) + '&device_id=' + _userDeviceId;
    };

    /**
     * @method buildFileThumbnailUrl
     * @param {uuid} UUID for file
     * @param {string} size of thumbnail 24x24
     * Builds Url to thumbnail uploaded file
     */
    me.buildFileThumbnailUrl = function (uuid, size) {
        if (size === undefined || !size) {
            size = '500x500';
        }

        return _config.kandyApiUrl + '/devices/content/thumbnail?key=' + _userAccessToken + '&content_uuid=' + encodeURIComponent(uuid) + '&device_id=' + _userDeviceId + '&thumbnail_size=' + size;
    };

    /**
     * @method getIm
     * Retrieves IM messages
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * @return {Object} response An array of messages
     * e.g.
     * {
	 *    [
	 *      {
                "messageType":"chat",
                "sender":
                    {
                        "user_id":"972542205056",
                        "domain_name":"domain.com",
                        "full_user_id":"972542205056@domain.com"
     },
     "UUID":"acd2fa752c3c4edf97de8b0a48f622f0",
     "timestamp":"1400510413",
     "message":
     {
         "mimeType": "text/plain",
         "text": "let's meet tonight"
     }
     }
     *    ]
     * }
     */
    me.getIm = function (success, failure) {
      _kandyAjax({
        url: '/devices/messages?device_id=' + _userDeviceId,
        success: function (response) {
          var incoming;
          if (success) {

            if (response.result.messages.length) {
              // prepare id list for clearing
              var id_list = response.result.messages.map(function (item) {
                return item.UUID;
              });

              // make sure UUIDs have hyphens
              response.result.messages = response.result.messages.map(function (msg) {
                if (msg.UUID.indexOf('-') === -1) {
                  msg.UUID = [msg.UUID.substring(0, 8),
                    msg.UUID.substring(8, 12),
                    msg.UUID.substring(12, 16),
                    msg.UUID.substring(16, 20),
                    msg.UUID.substring(20, msg.UUID.length)
                  ].join('-');
                }
                return msg;
              });
            }

            success(response.result);

            if (response.result.messages.length) {
              me.clearIm(id_list);
            }
          }
        },
        failure: failure
      });
    };

    /**
     * @method clearIm
     * Retrieves IM messages
     * @param {Array} ids Id of IMs to remove.
     * @param {Function} failure The failure callback.
     * @return {Object} response An array of messages
     */
    me.clearIm = function (ids, success, failure) {
        var i = 0,
            encodeddata,
            url,
            xhr;
        for (i; i < ids.length; i += 10) {
            encodeddata = encodeURIComponent('["' + ids.slice(i, i + 10).join('","') + '"]');
            url = _config.kandyApiUrl + '/devices/messages?key=' + _userAccessToken + '&messages=' + encodeddata + '&device_id=' + _userDeviceId;
            xhr = new XMLHttpRequest();
            xhr.open('DELETE', url);
            xhr.send();
        }
    };

    /**
    /**
     * @method retrieveDeviceAddressBook
     * Retrieve the network address book
     * @param {String} userAccessToken
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * @return {Object} response object with success being true or false
     */
    me.retrieveDeviceAddressBook = function (userAccessToken, success, failure) {

      _kandyAjax({
            url: '/users/addressbooks/device?key=' + encodeURIComponent(userAccessToken),
            success: function (response) {
              if (success) {
                success(response);
              }
            },
            failure: failure
        });
    };
    /**
     * @method getDevices
     * Retrieves devices for users
     * @param {Function} userAccessToken User Access Token.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     */
    me.getDevices = function (userAccessToken, success, failure) {
        var encodedAccessCode = encodeURIComponent(userAccessToken);
      _kandyAjax({
        url: '/users/devices?key=' + encodedAccessCode,
        success: function (response) {
          if (success) {
            success(response.result);
          }
        },
        failure: function (x, e) {
          _logger.error('ERROR RETRIEVING DEVICES');

          if (failure) {
            failure(x.statusText, responseCodes.ajaxError);
          }
        }
      });
    };

    /**
     * @method getSpidrConfiguration
     * Retrieves spidr configuration
     * @param {Function} userAccessToken User Access Token.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     */

     me.getSpidrConfiguration = function(userAccessToken, success, failure){
       var paramStr = 'key=' + encodeURIComponent(userAccessToken);
       _kandyAjax(
         {
           url: '/users/configurations/communications/spidr?' + paramStr + '&secure=true',
           success: function (response) {
             if (success) {
               var spidrConfig = response.result.spidr_configuration;
               success(spidrConfig);
             }
           },
           failure: failure
        }
       );
       
     };  

    return me;
}());


//=================================================================
//======================= REGISTRATION ============================
//=================================================================
/**
 * @author Russell Holmes
 * KandyAPI.Registration
 * @singleton
 * Registration is used to register with the Kandy API.
 *
 * Simply create a new KandyAPI phone instance passing in your configuration
 *
 *     KandyAPI.Registration.setup({
 *       listeners:{
 *           callinitiated: function(call, number){
 *              // Call has been initiated.
 *           }
 *       }
 *     });
 */
api.Registration = (function () {
    var me = {};

    /**
     * @property {Object} _config Configuration for KandyAPI.Registration.
     * @private
     */
    var _config = {
        listeners: {},
        kandyApiUrl: 'https://api.kandy.io/v1.1'
    };

    /**
     * @property {String} _config Domain Access Code.
     * @private
     */
    var _domainAccessToken = null;

    /**
     * @method _fireEvent
     * Fires passed event
     * @private
     */
    function _fireEvent() {
        var eventName = Array.prototype.shift.apply(arguments);

        if (me.events[eventName])
            me.events[eventName].apply(me, arguments);
    }

    /**
     * @method setup
     * @param {Object} config Configuration.
     * @param {Array} [config.listeners={}] Listeners for KandyAPI.Registration.
     * @param {String} [config.mediatorUrl="http://api.kandy.io"] Rest endpoint for KandyWrapper.
     */
    me.setup = function (config) {

        // setup default configuration
        _config = $.extend(_config, config);

        me._domainAccessToken = config.domainAccessToken;

        // setup listeners
        if (_config['listeners']) {
            for (var listener in _config['listeners']) {
                if (me.events[listener] !== undefined)
                    me.events[listener] = _config['listeners'][listener];
            }
        }

        _logger = fcs.logManager.getLogger();
    };

    /**
     * @method retrieveCountryCode
     * Retrieves county code based on Device
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     */
    me.retrieveCountryCode = function (success, failure) {
        var encodedAccessCode = encodeURIComponent(me._domainAccessToken);

      _kandyAjax({
        url: '/domains/countrycodes?key=' + encodedAccessCode,
        success: function (response) {
          if (success) {
            success(response.result);
          }
        },
        failure: function (x, e) {
          _logger.error('ERROR RETRIEVING COUNTRY CODE');
          if (failure){
            failure(x, e);
          }
        }
      });
    };

    /**
     * @method sendValidationCode
     * Send validation code to phone
     * @param {String} phoneNumber Phone number to send validation SMS to.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     */
    me.sendValidationCode = function (phoneNumber, countryCode, success, failure) {

      $.ajaxPrefilter("json script", function (options) {
            options.crossDomain = true;
        });

      _kandyAjax({
            type: 'POST',
            url: '/domains/verifications/smss?key=' + encodeURIComponent(me._domainAccessToken),
            data: {
                user_phone_number: phoneNumber,
                user_country_code: countryCode
            },
            success: function (response) {
                if(success){
                    success();
                }
            },
            failure: failure
        });
    };

    /**
     * @method validateCode
     * Validate SMS code sent to phone
     * @param {String} validationCode Validation code sent to phone.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     */
    me.validateCode = function (validationCode, success, failure) {
        var encodedAccessCode = encodeURIComponent(me._domainAccessToken);

      _kandyAjax({
        url: '/domains/verifications/codes?key=' + encodedAccessCode + '&validation_code=' + validationCode,
        success: function (response) {
          if (success) {
            success(response.result.valid);
          }
        },
        failure: failure
      });
    };

    /**
     * @method register a device
     * Registers a device in Kandy
     * @param {Object}
     * e.g. {
     *        {String} domainAccessToken: "7b81d8e63f5b478382b4e23127260090", // optional
     *        {String} userPhoneNumber: "4034932232",
     *        {String} userCountryCode "UA",
     *        {String} validationCode "1234",
     *        {String} deviceNativeId "3456",
     *        {String} deviceFamily "iPhone",  // optional
     *        {String} deviceName "myPhone",  // optional
     *        {String} clientSwVersion "4",  // optional
     *        {String} deviceOsVersion "801",  // optional
     *        {String} userPassword "pwdxyz13!",  // optional
     *        {Function} success = function() { doSomething(); }
     *        {Function} failure = function() { doSomethingElse(); }
     *   }
     * @return {Object} response object
     * e.g. { user_id: "972542405850",
              full_user_id: "972542405850@domain.com",
     domain_name:  "domain.com",
     user_access_token: "4d405f6dfd9842a981a90daaf0da08fa",
     device_id: "4d405f6dfd9842a389d5b45d65a9dfd0"
     }
     */
    me.register = function (params, success, failure) {

        $.ajaxPrefilter("json script", function (options) {
            options.crossDomain = true;
        });

      _kandyAjax({
            type: 'POST',
            url: '/api_wrappers/registrations?key=' + encodeURIComponent(me._domainAccessToken),
            data: {
                user_phone_number: params.userPhoneNumber,
                user_country_code: params.userCountryCode,
                validation_code: params.validationCode,
                device_native_id: params.deviceNativeId
            },
            success: function (response) {
                if (success){
                	success(response.result);	
                }
                        
            },
            failure: failure
        });
    };

    /**
     * @method getConfiguration
     * Retrieves domain name, access token, and SPiDR configuration
     * @param {String} domainApiKey
     * @param {String} domainApiSecret
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * @return {Object} response object
     * e.g. {
         "domain_name": "domain.com",
         "domain_access_token": "4d405f6dfd9842a981a90daaf0da08fa",
         "spidr_configuration":
             {
                 "REST_server_address":"kandysimplex.fring.com",
                 "REST_server_port":443,
                 "webSocket_server_address":"kandysimplex.fring.com",
                 "webSocket_server_port":8582,
                 "ICE_server_address":"54.84.226.174",
                 "ICE_server_port":3478,
                 "subscription_expire_time_seconds":null,
                 "REST_protocol":"https",
                 "server_certificate":null,
                 "use_DTLS":false,
                 "audit_enable":true,
                 "audit_packet_frequency":null
             }
         }
     */

    me.getConfiguration = function (params, success, failure) {

        var paramStr = 'key=' + encodeURIComponent(params.domainApiKey) +
            '&domain_api_secret=' + encodeURIComponent(params.domainApiSecret);
      _kandyAjax({
        url: '/api_wrappers/configurations?' + paramStr,
        success: function (response) {
          if (success) {
            success({
              "domainName": response.result.domain_name,
              "domainAccessToken": response.result.domain_access_token,
              "spidrConfiguration": {
                "restUrl": response.result.spidr_configuration.REST_server_address,
                "restPort": response.result.spidr_configuration.REST_server_port,
                "protocol": response.result.spidr_configuration.REST_protocol,
                "websocketIP": response.result.spidr_configuration.webSocket_server_address,
                "websocketPort": response.result.spidr_configuration.webSocket_server_port,
                "spidr_env": {
                  "iceserver": ('stun:' + response.result.spidr_configuration.ICE_server_address + ":" +
                    response.result.spidr_configuration.ICE_server_port),
                  "ice": ('STUN stun:' + response.result.spidr_configuration.ICE_server_address + ":" +
                    response.result.spidr_configuration.ICE_server_port)

                }
              }
            });
          }
        },
        failure: failure
      });
    };

    return me;
}());
  return api;
}());