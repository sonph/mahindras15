/*!
 * FCS Javascript Library
 *
 * Copyright 2012, Genband
 */

(function( window, undefined ) {
    
// DO NOT UPDATE THIS DEFINITION

// IT IS ONLY USED FOR REMOVING TEST

// SPECIFIC REFERENCES FROM API.

var __testonly__ = false;
var GlobalBroadcaster = function() {

    var MAX_PRIORITY = 10, MIN_PRIORITY = 1, topics = {}, subUid = -1;



    function unsubscribeFromTopic(token) {

        var m, i, j;

        for (m in topics) {

            if (topics[m] && topics.hasOwnProperty(m)) {

                for (i = 0, j = topics[m].length; i < j; i++) {

                    if (topics[m][i].token === token) {

                        topics[m].splice(i, 1);

                        return token;

                    }

                }

            }

        }

        return false;

    }



    function subscribeToTopic(topic, func, priority, temporary) {

        var token, prio = MAX_PRIORITY, temp = false;



        if (typeof topic !== 'string') {

            throw new Error("First parameter must be a string topic name.");

        }



        if (typeof func !== 'function') {

            throw new Error("Second parameter must be a function.");

        }



        if (typeof priority !== 'undefined') {

            if (typeof priority !== 'number') {

                throw new Error("Priority must be a number.");

            }

            else {

                if (priority > MAX_PRIORITY ||

                        priority < MIN_PRIORITY) {

                    throw new Error("Priority must be between 1-10.");

                }

                else {

                    prio = priority;

                }

            }

        }



        if (temporary === true) {

            temp = temporary;

        }



        if (!topics[topic]) {

            topics[topic] = [];

        }



        token = (++subUid).toString();

        topics[topic].push({

            token: token,

            prio: prio,

            func: func,

            temp: temp

        });



        topics[topic].sort(function(a, b) {

            return parseFloat(b.prio) - parseFloat(a.prio);

        });



        return token;

    }



    function publishTopic(topic, args) {

        var subscribers, len, _args, _topic;



        if (arguments.length === 0) {

            throw new Error("First parameter must be a string topic name.");

        }



        _args = Array.prototype.slice.call(arguments);

        _topic = _args.shift();



        subscribers = topics[_topic];

        len = subscribers ? subscribers.length : 0;

        while (len--) {

            subscribers[len].func.apply(null, _args);

            if (subscribers[len].temp) {

                unsubscribeFromTopic(subscribers[len].token);

            }

        }

    }



    /*

     * 

     * Publish events of interest

     * with a specific topic name and arguments

     * such as the data to pass along

     * 

     * @param {string} topic - Topic name.

     * @param {...*} [args] - arguments.

     * 

     * @returns {undefined}

     */

    this.publish = publishTopic;



    /*

     * 

     * Subscribe to events of interest

     * with a specific topic name and a

     * callback function, to be executed

     * when the topic/event is observed.

     * Default priority 10.

     * Priority must be between 1-10.

     * Functions with lower priority 

     * will be executed first. 

     * 

     * @param {string} topic - Topic name.

     * @param {type} func - function to be executed when the topic/event is observed

     * @param {number} [priority] - function with higher priority will be executed first

     * @param {boolean} [temporary] - if set to true, subscriber will unsubcribe automatically after first execution.

     * 

     * @returns {string} token - reference to subscription

     */

    this.subscribe = subscribeToTopic;



    /*

     * 

     * Unsubscribe from a specific

     * topic, based on a tokenized reference

     * to the subscription

     * 

     * @param {string} token - reference to subscription

     * 

     * @returns {false|string} - returns token if successfull,

     * otherwise returns false. 

     */

    this.unsubscribe = unsubscribeFromTopic;

};



var globalBroadcaster = new GlobalBroadcaster();
var CONSTANTS = {
    "WEBRTC": {
        "PLUGIN_ID": "fcsPlugin",
        "MEDIA_STATE": {
            NOT_FOUND: "notfound",
            SEND_RECEIVE: "sendrecv",
            SEND_ONLY: "sendonly",
            RECEIVE_ONLY: "recvonly",
            INACTIVE: "inactive"
        },
        "PLUGIN_MODE": {
            WEBRTC: "webrtc", // 2.1 Enabler Plugin
            LEGACY: "legacy", // 1.2 Disabler Plugin
            LEGACYH264: "legacyh264", // 1.3 Disabler Plugin with H264
            AUTO: "auto"          // Native For Chrome Browser and 2.1 Enabler Plugin for other Browsers
        },
        "RTC_SIGNALING_STATE": {
            STABLE: "stable",
            HAVE_LOCAL_OFFER: "have-local-offer",
            HAVE_REMOTE_OFFER: "have-remote-offer",
            HAVE_LOCAL_PRANSWER: "have-local-pranswer",
            HAVE_REMOTE_PRANSWER: "have-remote-pranswer",
            CLOSED: "closed"
        },
        "RTC_SDP_TYPE": {
            "OFFER": "offer",
            "ANSWER": "answer",
            "PRANSWER": "pranswer"
        }
    },
    "STRING": {
        "NEW_LINE": "\n",
        "CARRIAGE_RETURN": "\r",
        "VIDEO" : "video",
        "AUDIO" : "audio"
    },
    "SDP" : {
        "A_LINE" : "a=",
        "M_LINE" : "m="
    },
    "HTTP_METHOD" : {
        "GET" : "GET",
        "POST" : "POST",
        "PUT" : "PUT",
        "DELETE" : "DELETE",
        "OPTIONS" : "OPTIONS"
    },
    "WEBSOCKET": {
        "PROTOCOL": {
            "SECURE": "wss",
            "NONSECURE": "ws"
        },
        "DEFAULT_PORT": "8581",
        "STATUS": {
            "OPENED": 1,
            "ALREADY_OPENED": 2,
            "CREATE_ERROR": 3,
            "CONNECTION_ERROR": 4,
            "NOT_FOUND": 5
        }
    },
    "COLLABORATION": {
        "GUEST_SUFFIX": "-guest"
    },
    "EVENT": {
        "XHR_REQUEST_NOT_INITIALIZED" : "XHR_REQUEST_NOT_INITIALIZED",
        "DEVICE_SUBSCRIPTION_STARTED": "DEVICE_SUBSCRIPTION_STARTED",
        "DEVICE_SUBSCRIPTION_ENDED": "DEVICE_SUBSCRIPTION_ENDED",
        "CONNECTION_REESTABLISHED": "CONNECTION_REESTABLISHED",
        "CONNECTION_LOST": "CONNECTION_LOST",
        "TOKEN_AUTH_STARTED": "TOKEN_AUTH_STARTED",
        "BASIC_AUTH_STARTED": "BASIC_AUTH_STARTED",
        "TOKEN_NOT_FOUND": "TOKEN_NOT_FOUND",
        "SESSION_EXPIRED": "SESSION_EXPIRED"
    }
};
var JQrestful = function() {



    var ajaxSetuped = false,

            DEFAULT_LONPOLLING_TOLERANS = 30000,

            DEFAULT_AJAX_TIMEOUT = 40000,

            XHR_READY_STATE = {

                REQUEST_NOT_INITIALIZED: 0

            };



    function getLogger() {

        return logManager.getLogger("jQrestful");

    }



    function composeAjaxRequestResponseLog(context, jqXHR, errorThrown, data) {

        var responseLog = {type: context.type,

            url: context.url,

            dataType: context.dataType,

            async: context.async,

            jsonp: context.jsonp,

            crossDomain: context.crossDomain,

            timeout: context.timeout};

        if (data) {

            responseLog.data = data;

        }

        if (errorThrown) {

            responseLog.errorThrown = errorThrown;

        }

        if (jqXHR) {

            responseLog.state = jqXHR.state();

            responseLog.status = jqXHR.status;

            responseLog.statusText = jqXHR.statusText;

            responseLog.responseText = jqXHR.responseText;

            responseLog.readyState = jqXHR.readyState;

        }

        return responseLog;

    }



function parseError(x, e) {

        var returnResult, statusCode;

        getLogger().error("parseError:'" + e + "' Status:'" + x.status + "' ResponseText:'" + x.responseText + "'");



        if(x.responseText !== undefined && x.responseText.search("statusCode") !== -1){

            if (JSON.parse(x.responseText).subscribeResponse !== undefined){

                statusCode = JSON.parse(x.responseText).subscribeResponse.statusCode;

            } else if (JSON.parse(x.responseText).authorizationResponse !== undefined) {

                statusCode = JSON.parse(x.responseText).authorizationResponse.statusCode;

            }

        }

                

        statusCode = statusCode ? statusCode : x.status;



        switch (statusCode) {

            case 401:

                returnResult = fcs.Errors.AUTH;

                break;

            case 403:

                returnResult = fcs.Errors.INCORRECT_LOGIN_PASS;

                break;

            case 19:

                returnResult = fcs.Errors.LOGIN_LIMIT_CLIENT;

                break;

            case 20:

                returnResult = fcs.Errors.LOGIN_LIMIT_TABLET;

                break;

            case 44:

                returnResult = fcs.Errors.FORCE_LOGOUT_ERROR;

                break;

            case 46:

                returnResult = fcs.Errors.TOKEN_NOT_FOUND;

                break;

            case 47:

                returnResult = fcs.Errors.SESSION_EXPIRED;

                break;

            default:

                returnResult = fcs.Errors.NETWORK;

        }

        return returnResult;

    }

    

    // TODO tolga: remove parseError when all of the responseTypes are added

    function parseErrorStatusCode(x, e, responseType){

        getLogger().error("parseErrorStatusCode:'" + e + "' Status:'" + x.status + "' ResponseText:'" + x.responseText + "'");

        

        if(x.responseText !== undefined 

            && x.responseText.search("statusCode") !== -1 

            && JSON.parse(x.responseText)[responseType] !== undefined) {

            

            return JSON.parse(x.responseText)[responseType].statusCode;

        }

        

        return (x.status === 401 || x.status === 403) ? x.status:400;

    }

    



    /**

    * @ignore

    */

    this.call = function(method, callParams, successHandler, errorHandler, parser, requestTimeout, synchronous, responseType, header) {

        var parsedData, dataType = "json", timeout = DEFAULT_AJAX_TIMEOUT,

                url = callParams.url, resourceString,

                logger = getLogger(),

                xhr;

        if (callParams || callParams.data) {

            parsedData = callParams.data;

        }



        if (fcsConfig.polling) {

            timeout = fcsConfig.polling * 1000;

            if (fcsConfig.longpollingTolerans) {

                timeout = timeout + fcsConfig.longpollingTolerans;

            }

            else {

                timeout = timeout + DEFAULT_LONPOLLING_TOLERANS;

            }

        }



        if (url.split("/rest/version/")[1]) {

            // extracting rest resource from url.

            // ".../rest/version/<ver>/<user/anonymous>/<userName>/restResource/..."

            resourceString = url.split("/rest/version/")[1].split("/")[3];

            if (!resourceString) {

                // rest resource string not found, get last string in the url

                resourceString = url.substring(url.lastIndexOf("/") + 1, url.length);

            }

            // remove "?" if exists

            resourceString = resourceString.split("?")[0];



            if (parsedData) {

                logger.info("Send ajax request: " + resourceString, parsedData);

            }

            else {

                logger.info("Send ajax request: " + resourceString);

            }

        }



        xhr = window.$.ajax({

            type: method,

            url: url,

            cache: true,

            headers : header,

            data: parsedData,

            dataType: dataType,

            async: fcs.isAsync() === false ? false : true,

            jsonp: false,

            crossDomain: fcsConfig.cors ? fcsConfig.cors : false,

            timeout: timeout

        }).done(function onAjaxSuccess(val, textStatus, jqXHR) {

            logger.info("ajax success: " + textStatus + " " + jqXHR.status + " " + jqXHR.statusText,

                    composeAjaxRequestResponseLog(this, jqXHR, undefined, val));

            var parsed_data = val;

            if (parser && typeof parser === 'function') {

                parsed_data = parser(val);

            }

            if (successHandler && typeof successHandler === 'function') {

                successHandler(parsed_data);

            }



        }).fail(function onAjaxFailure(jqXHR, textStatus, errorThrown) {

            logger.error("ajax error: " + textStatus + " " + jqXHR.status + " " + jqXHR.statusText,

                    composeAjaxRequestResponseLog(this, jqXHR, errorThrown));

            if (jqXHR.status === 410) {

                logger.error("410 Gone received");

                utils.callFunctionIfExist(fcs.notification.onGoneReceived);

                return;

            }



            if (jqXHR.status === 0 && jqXHR.statusText === "abort") {

                logger.trace("Ajax request aborted internally. not calling failure callback");

                return;

            }



            if (jqXHR.readyState === XHR_READY_STATE.REQUEST_NOT_INITIALIZED) {

                globalBroadcaster.publish(CONSTANTS.EVENT.XHR_REQUEST_NOT_INITIALIZED);

                logger.debug("Ajax request cannot be sent, this is a connection problem.");

            }

            

             if (errorHandler && typeof errorHandler === 'function') {

                if (responseType === "addressBookResponse") {

                    errorHandler(parseErrorStatusCode(jqXHR, textStatus, responseType));

                }

                else {

                    errorHandler(parseError(jqXHR, textStatus));

                }

            }

            else {

                logger.trace("Error handler is not defined or not a function");

            }

        });



        return xhr;

    };

};



var jQueryAdapter = new JQrestful();
var JqrestfullManager = function() {

    var REQUEST_TYPE_PUT = "PUT",
            REQUEST_TYPE_POST = "POST",
            REQUEST_TYPE_GET = "GET",
            REQUEST_TYPE_DELETE = "DELETE",username, password, session;

    function getLogger() {
        return logManager.getLogger("JqrestfullManager");
    }

    function onSubscriptionStarted(data) {
        session = data.session;
    }
    
    // In order to delete previous session
    function onSubscriptionEnded() {
        session = null;
    }

    function onTokenAuth(data) {
        username = data.username;
    }

    function onBasicAuth(data) {
        username = data.username;
        password = data.password;
    }

    function manipulateHeader(header) {
        if (!header) {
            header = {};
        }
        if (!header.Accept) {
            header.Accept = "application/json";
        }
        if (!header['Content-Type']) {
            header['Content-Type'] = "application/json";
        }
        //Check whether auth or basic auth
        if (session) {
            header['x-session'] = session;
            delete header.Authorization;
        } else {
            if (username && password) {
                header.Authorization = "basic " + window.btoa(username + ":" + password);
            }
            delete header['x-session'];
        }
        return header;
    }

    //TODO: requestTimeout, synchronous parameters should be refactored.
    //TODO: Header parameter should be  the first one. This would be corrected in refactor
    function sendRequest(method, callParams, successHandler, errorHandler, parser, requestTimeout, synchronous, responseType, header) {
        var failureHandler = function(statusCode) {
            if (statusCode === fcs.Errors.TOKEN_NOT_FOUND) {
                globalBroadcaster.publish(CONSTANTS.EVENT.TOKEN_NOT_FOUND);
                session = null;
            } else if (statusCode === fcs.Errors.SESSION_EXPIRED){
                globalBroadcaster.publish(CONSTANTS.EVENT.SESSION_EXPIRED);
                session = null;
            }

            if (errorHandler && typeof errorHandler === 'function') {
                errorHandler(statusCode);
            }
        };
        return jQueryAdapter.call(method, callParams, successHandler, failureHandler, parser, null, null, responseType, header);
    }

    function sendPostRequestTokenAuth(callParams, successHandler, errorHandler, parser, requestTimeout, synchronous, responseType, header, token) {
        if (!header) {
            header = {};
        }
        if (!header.Accept) {
            header.Accept = "application/json";
        }
        if (!header['Content-Type']) {
            header['Content-Type'] = "application/json";
        }
        //Check whether auth or basic auth
        if (header['x-session']) {
            delete header['x-session'];
        }
        if (header.Authorization) {
            delete header.Authorization;
        }
        if (!header['x-token']) {
            header['x-token'] = token;
        }
        return sendRequest(REQUEST_TYPE_POST, callParams, successHandler, errorHandler, parser, null, null, responseType, header);
    }

    this.call = function(method, callParams, successHandler, errorHandler, parser, requestTimeout, synchronous, responseType, header) {
        header = manipulateHeader(header);
        
        if (callParams || callParams.data) {
            callParams.data = JSON.stringify(callParams.data);
        }
        
        return sendRequest(method, callParams, successHandler, errorHandler, parser, null, null, responseType, header);
    };

    this.sendPostRequest = function(callParams, successHandler, errorHandler, parser, requestTimeout, synchronous, responseType, header, token) {
        
        if (callParams || callParams.data) {
            callParams.data = JSON.stringify(callParams.data);
        }
        
        if (token) {
            return sendPostRequestTokenAuth(callParams, successHandler, errorHandler, parser, requestTimeout, synchronous, responseType, header, token);
        } else {
            header = manipulateHeader(header);
            return sendRequest(REQUEST_TYPE_POST, callParams, successHandler, errorHandler, parser, null, null, responseType, header);
        }
    };

    this.sendGetRequest = function(callParams, successHandler, errorHandler, parser, requestTimeout, synchronous, responseType, header) {
        header = manipulateHeader(header);        
        return sendRequest(REQUEST_TYPE_GET, callParams, successHandler, errorHandler, parser, null, null, responseType, header);
    };

    this.sendDeleteRequest = function(callParams, successHandler, errorHandler, parser, requestTimeout, synchronous, responseType, header) {
        header = manipulateHeader(header);
        
        if (callParams || callParams.data) {
            callParams.data = JSON.stringify(callParams.data);
        }
        
        return sendRequest(REQUEST_TYPE_DELETE, callParams, successHandler, errorHandler, parser, null, null, responseType, header);
    };

    this.sendPutRequest = function(callParams, successHandler, errorHandler, parser, requestTimeout, synchronous, responseType, header) {
        header = manipulateHeader(header);
        
        if (callParams || callParams.data) {
            callParams.data = JSON.stringify(callParams.data);
        }
        
        return sendRequest(REQUEST_TYPE_PUT, callParams, successHandler, errorHandler, parser, null, null, responseType, header);
    };

    globalBroadcaster.subscribe(CONSTANTS.EVENT.TOKEN_AUTH_STARTED, onTokenAuth, 9);
    globalBroadcaster.subscribe(CONSTANTS.EVENT.BASIC_AUTH_STARTED, onBasicAuth, 10);
    globalBroadcaster.subscribe(CONSTANTS.EVENT.DEVICE_SUBSCRIPTION_STARTED, onSubscriptionStarted);
    globalBroadcaster.subscribe(CONSTANTS.EVENT.DEVICE_SUBSCRIPTION_ENDED, onSubscriptionEnded);

    if (__testonly__) { this.manipulateHeader = manipulateHeader; }
    if (__testonly__) { this.setSession = function(value) { session = value; }; }
    if (__testonly__) { this.setUsernamePassword = function(user, pass) { username = user; password = pass; }; }
};

var server = new JqrestfullManager();
var fcsConfig = {

    polling: 30

};





var un = null, pw = null, connected = true, tkn = null;



function getDomain() {

    return un.split('@')[1];

}



function getUser() {

    return un;

}



function getUserPassword() {

    return pw;

}



function getUserToken() {

    return tkn;

}



function getVersion() {

    return "3.0.0";

}



function isConnected() {

    return connected;

}



function setConnected(connectionStatus) {

    connected = connectionStatus === true ? true : false;

}



/**

* @name fcs

* @namespace

*/

var Core = function() {



    var dev = null, pluginVer = null, services = {}, async = true;



    /**

     * This function returns value of async paramater of $.ajax requests

     * 

     * @name fcs.isAsync

     * @function

     * @returns {Boolean} true/false

     * @since 3.0.0

     *

     * @example

     * fcs.isAsync();

     */

    this.isAsync = function() {

        return async;

    };



    /**

     * This function sets async option of $.ajax() requests.

     * If It is set to false, ajax requests will be sent synchronously

     * otherwise ajax requests will be sent asynchronously.

     * 

     * @name fcs.setAsync

     * @function

     * @param {Boolean} value

     * @return {Boolean} true/false

     * @since 3.0.0

     *

     * @example

     * fcs.setAsync(false);

     */

    this.setAsync = function(value) {

        async = value;

    };



    /**

     * This function returns username of authenticated user in user@domain format.

     *

     * @name fcs.getUser

     * @function

     * @returns {string} Username of current user

     * @since 3.0.0

     *

     * @example

     * fcs.getUser();

     */

    this.getUser = getUser;

    

     /**

     * This function returns password of authenticated user

     *

     * @name fcs.getUserPassword

     * @function

     * @returns {string} Password of current user

     * @since 3.0.0

     *

     * @example

     * fcs.getUserPassword();

     */

    this.getUserPassword = getUserPassword;



    /**

     * This function returns current domain name of authenticated user

     *

     * @name fcs.getDomain

     * @function

     * @returns {string} Current domain name

     * @since 3.0.0

     *

     * @example

     * fcs.getDomain();

     */

    this.getDomain = getDomain;

    

    /**

     * This function returns the version of the JSL-API

     * 

     * @name fcs.getVersion

     * @function

     * @returns {string} Version of the JSL-API

     * @since 3.0.0

     * 

     * @example 

     * fcs.getVersion(); 

     */

    this.getVersion = getVersion;

    

    /**

     * This fucntion returns current device.

     *

     * @name fcs.getDevice

     * @function

     * @returns {string} Device specified for communicating with the server

     * @since 3.0.0

     *

     * @example

     * fcs.getDevice();

     */

    this.getDevice = function() {

        return dev;

    };



    /**

     * This function sets the user as authentication mode and cancels device authentication (if such exists),

     * as user and device modes are mutually exclusive.

     *

     * @name fcs.setUserAuth

     * @function

     * @param {string} The user to be used for communicating with the server

     * @param {string} The password to be used for communicating with the server

     * 

     * @since 3.0.0

     *

     * @example

     * fcs.setUserAuth("Username", "Password");

     */

    this.setUserAuth = function(user, password) {

        un = user;

        pw = password;

        dev = null;

        globalBroadcaster.publish(CONSTANTS.EVENT.BASIC_AUTH_STARTED, {'username' : user, 'password': password});

    };

    

    /**

     * This function sets the user as token mode authentication and cancels user authentication or/and device authentication (if such exists),

     * token authentication has priority over other authentications

     *

     * @name fcs.setTokenAuth

     * @function

     * @param {string} The user to be used for communicating with the server

     * @param {string} The token to be used for communicating with the server

     * 

     * @since 3.0.0

     *

     * @example

     * fcs.setTokenAuth("Username", "Token");

     */

    this.setTokenAuth = function(user, token){

        un = user;

        tkn = token;

        globalBroadcaster.publish(CONSTANTS.EVENT.TOKEN_AUTH_STARTED, {'username' : user, 'token': token});

    };



    /**

     * This function sets the device as authentication mode and cancels user authentication (if such exists),

     * as user and device modes are mutually exclusive.

     *

     * @name fcs.setDeviceAuth

     * @function

     * @since 3.0.0

     * @param {string} deviceID The device to be used for communicating with the server

     *

     * @example

     * fcs.setDeviceAuth("DeviceID");

     */

    this.setDeviceAuth = function(deviceID) {

        dev = deviceID;

        un = null;

    };



    /**

     * List of Authentication Types.

     * @see setDeviceAuth

     * @see setUserAuth

     * @name AuthenticationType

     * @property {number} USER User authentication

     * @property {number} DEVICE Device authentication

     * @readonly

     * @memberOf fcs

     */

    this.AuthenticationType = {

        USER: 1,

        DEVICE: 2

    };



    /**

     * List of Error Types

     *

     * @name fcs.Errors

     * @property {number} NETWORK Network failures

     * @property {number} AUTH Authentication / Authorization failures

     * @property {number} STATE Invalid state

     * @property {number} PRIV Privilege failures

     * @property {number} CONV_SUBS Conversation service subscription failures

     * @property {number} UNKNOWN Unknown failures

     * @property {number} LOGIN_LIMIT Login limit exceeded

     * @property {number} INCORRECT_LOGIN_PASS Incorrect identifier

     * @property {number} INVALID_LOGIN Invalid username

     * @readonly

     * @memberOf fcs

     * @example 

     * if (e === fcs.Errors.AUTH) 

     * {

     *     console.log("Authentication error occured")

     * }

     */

    this.Errors = {

        NETWORK: 1,

        AUTH: 2,

        STATE: 3,

        PRIV: 4,

        CONV_SUBS: 5,

        UNKNOWN: 9,

        LOGIN_LIMIT_CLIENT: 10,

        INCORRECT_LOGIN_PASS: 11,

        INVALID_LOGIN: 12,

        FORCE_LOGOUT_ERROR : 13,

        LOGIN_LIMIT_TABLET: 14,

        TOKEN_NOT_FOUND: 15,

        SESSION_EXPIRED: 16

    };



    /**

     * This function is used to set up JSL library

     *

     * @name fcs.setup

     * @function

     * @param {object} configParams Object containing parameters to be configured

     * @param {fcs.notification.NotificationTypes} [configParams.notificationType] The notification type to be used. Defauts to: LONGPOLLING

     * @param {string} [configParams.restUrl] The URL of REST server http://ip:port. Defaults to an absolute url : /rest

     * @param {string} [configParams.restPort] The port of REST server http://ip:port. 

     * @param {string} [configParams.polling] Polling time value in seconds. Default is 30.

     * @param {string} [configParams.expires] Expire time value in miliseconds. Default is 3600.

     * @param {string} [configParams.screenSharingMaxWidth] Defines maximum witdh of screen sharing option.

     * @param {string} [configParams.websocketProtocol] Determines if the websocketProtocol is secure or non-secure. Default is non-secure, which is "ws".

     * @param {string} [configParams.websocketIP] Holds the websocket connection's IP adress.

     * @param {string} [configParams.websocketPort] Holds the websocket connection's port value. By defult, it is 8581.

     * @param {string} [configParams.codecsToRemove] Audio codesc to be removed.

     * @param {string} [configParams.callAuditTimer] Audit time value for calls.

     * @param {string} [configParams.cors] True if Cross-Origin Request Sharing supported.

     * @param {string} [configParams.services] Defines the enabled services for client. Ex: CallControl, IM, call, conversation 

     * @param {string} [configParams.sipware] Necessary URL for SIP connection.

     * @param {string} [configParams.protocol] HTTP protocol to be used. Ex: Http, Https

     * @param {string} [configParams.clientIp] The client IP address for SNMP triggers

     * @since 3.0.0

     * @example

     *

     * fcs.setup(

     *   {

     *       notificationType: fcs.notification.NotificationTypes.SNMP,

     *       clientIp: 'IP Address',

     *       restUrl: "http://ip:port"

     *   }

     * );

     */

    this.setup = function(configParams) {

        var param;

        for (param in configParams) {

            if (configParams.hasOwnProperty(param)) {

                fcsConfig[param] = configParams[param];

            }

        }

    };



    /**

     * This function sets version of plugin

     *

     * @name fcs.setPluginVersion

     * @function

     * @param {string} version

     * @since 3.0.0

     * @example

     * 

     * fcs.setPluginVersion(version);

     */

    this.setPluginVersion = function(version) {

        pluginVer = version;

    };



    /**

     * This function returns version of plugin

     *

     * @name fcs.getPluginVersion

     * @function

     * @returns {String} Version of Current Plugin

     * @since 3.0.0

     * @example

     * 

     * fcs.getPluginVersion();

     */

    this.getPluginVersion = function() {

        return pluginVer;

    };



    /**

     * This function returns assigned services of authenticated user.

     *

     * @name fcs.getServices

     * @function

     * @returns {object} The assigned services of authenticated user

     * @since 3.0.0

     * @example

     * 

     * fcs.getServices();

     */

    this.getServices = function() {

        return services;

    };



    /**

     * This function assigns determined services to current user

     *

     * @name fcs.setServices

     * @function

     * @param {array} serviceParam The list of assigned services for the user

     * @since 3.0.0

     * @example

     * fcs.setServices(["CallControl", "RestfulClient"]);

     */

    this.setServices = function(serviceParam) {

        var i;

        // for each element in serviceParam array, we create the service with value "true" in "services" object

        if (serviceParam) {

            for (i = 0; i < serviceParam.length; i++) {

                switch (serviceParam[i]) {

                    case "CallDisplay":

                        services.callDisplay = true;

                        break;

                    case "CallDisposition":

                        services.callDisposition = true;

                        break;

                    case "RestfulClient":

                        services.restfulClient = true;

                        break;

                    case "call":

                    case "CallControl":

                        services.callControl = true;

                        break;

                    case "CallMe":

                        services.callMe = true;

                        break;

                    case "Directory":

                        services.directory = true;

                        break;

                    case "ClickToCall":

                        services.clickToCall = true;

                        break;

                    case "Presence":

                        services.presence = true;

                        break;

                    case "AddressBook":

                        services.contacts = true;

                        break;

                    case "CallLog":

                        services.history = true;

                        break;

                    case "Custom":

                        services.custom = true;

                        break;

                    case "IM":

                        services.IM = true;

                        break;

                    case "Route":

                        services.routes = true;

                        break;

                    case "Collaboration":

                        services.collab = true;

                        break;

                    case "conversation":

                    case "Conversation":

                        services.conversation = true;

                        break;

                    default:

                        break;

                }

            }

        }

    };

    

    /**

     * This function deletes subscription of authenticated user and clear other  user related resources

     * 

     * @deprecated use fcs.notification.stop

     * @name fcs.clearResources

     * @function

     * @param {type} done Function to be executed when process done

     * @param {type} clearUserCredentials True if remove the user credentials from local storage

     * @param {type} synchronous

     * @since 3.0.0

     * @example

     * fcs.clearResources();

     *

     */

    this.clearResources = function(done, clearUserCredentials, synchronous) {

        fcs.setAsync(false);

        fcs.notification.stop(function() {

            //onsuccess

            window.localStorage.removeItem("SubscriptionStamp");

        }, function() {

            //onfailure, can be used in the future

        }, true);

        if (clearUserCredentials) {

            window.localStorage.removeItem("USERNAME");

            window.localStorage.removeItem("PASSWORD");

        }

        if (typeof done === 'function') {

            done();

        }

    };

    

    this.getUserLocale = function(onSuccess, onFailure) {

        server.sendGetRequest({

                "url":getWAMUrl(1, "/localization", false)

            },

            function (data) {

                utils.callFunctionIfExist(onSuccess, data);

            },

            onFailure

        );        

    };

    

    

    /**

     * Returns network connectivity status.

     * 

     * @name fcs.isConnected

     * @function

     * 

     * @returns {Boolean}, true if connection is up otherwise false.

     */

    this.isConnected = isConnected;



}, fcs;



fcs = new Core();



window.fcs = fcs;

fcs.fcsConfig = fcsConfig;
/**

 * 

 * LogManager provides javascript logging framework.<br />

 * 

 * <br />The logging level strategy is as follows:<br />

 * 

 * <br />DEBUG: Used for development and detailed debugging logs<br />

 * INFO: Messages that provide information about the high level flow<br />

 * through. Contain basic information about the actions being performed<br />

 * by the user and/or the system<br />

 * WARN: Things that shouldn't happen but don't have any immediate effect, and should be flagged<br />

 * ERROR: Errors and Exceptions<br />

 * FATAL: Anything that causes the system to enter into an unstable and unusable state<br />

 * 

 * 

 * @name logManager

 * @namespace

 * @memberOf fcs

 * 

 * @version 3.0.0

 * @since 3.0.0

 * 

 */

var LogManager = function() {

    var loggers = {},

            RECORDED_LOGS_DEFAULT_MIN_TRESHOLD = 1000,

            enabled = false,

            recordingEnabled = false,

            overrideRecordedLogs = true,

            recordedLogs = [],

            recordedLogsOverrideTreshod = RECORDED_LOGS_DEFAULT_MIN_TRESHOLD,

            logLevels = {

        OFF: 1,

        FATAL: 2,

        ERROR: 3,

        WARN: 4,

        INFO: 5,

        DEBUG: 6,

        TRACE: 7,

        ALL: 8

    }, Level = {

        OFF: "OFF",

        FATAL: "FATAL",

        ERROR: "ERROR",

        WARN: "WARN",

        INFO: "INFO",

        DEBUG: "DEBUG",

        TRACE: "TRACE",

        ALL: "ALL"

    }, _logHandler = null;



    function getNotificationId() {

        return notificationManager ? notificationManager.getNotificationId() : null;

    }



    /**

     * 

     * Log object.

     * 

     * @typedef {Object} logObject

     * @readonly

     * @since 3.0.0

     * 

     * @property {String}  user - the user registered to fcs library.

     * @property {String}  timestamp - the time stamp of the log, Not Avaliable.

     * @property {String}  logger - the name of the logger, Not Avaliable.

     * @property {String}  level - the level of message, Not Avaliable.

     * @property {?String} notificationId - the notification channnel id used by fcs library.

     * @property {String}  message -  the message string.

     * @property {Object}  args - the arguments.

     * 

     */



    /**

     * 

     * Log handler function.

     *

     * @typedef {function} logHandler

     * @param {string} loggerName Name of the logger

     * @param {string} level Level of message

     * @param {logObject} logObject Log object

     * @since 3.0.0

     */



    /**

     * 

     * Initializes logging using user-provided log handler.

     * @name initLogging

     * @since 3.0.0

     * @function

     * @memberOf fcs.logManager

     * 

     * @param {logHandler} logHandler, Function that will receive log entries

     * @param {boolean} enableDebug, Flag defining whether debugging should be enabled or not

     * @returns {undefined}

     */

    this.initLogging = function(logHandler, enableDebug) {

        if (!logHandler || typeof logHandler !== 'function') {

            return false;

        }

        _logHandler = logHandler;

        enabled = enableDebug === true ? true : false;

    };



    /**

     * 

     * Enumerates all possible log levels.

     * @name Level

     * @enum {string}

     * @since 3.0.0

     * @readonly

     * @memberOf fcs.logManager

     * @property {string} [OFF=OFF] string representation of the Off level.

     * @property {string} [FATAL=FATAL]  string representation of the Fatal level.

     * @property {string} [ERROR=ERROR] string representation of the Error level.

     * @property {string} [WARN=WARN] string representation of the Warn level.

     * @property {string} [INFO=INFO] string representation of the Info level.

     * @property {string} [DEBUG=DEBUG] string representation of the Debug level.

     * @property {string} [TRACE=TRACE] string representation of the Trace level.

     * @property {string} [ALL=ALL] string representation of the All level.

     */

    this.Level = Level;



    /**

     * @deprecated Will be removed by 3.0.1

     * 

     * Levels of the Logger.

     * @name Levels

     * @enum {number}

     * @since 3.0.0

     * @readonly

     * @memberOf fcs.logManager

     * @property {number} [OFF=1] All levels of message object to log off.

     * @property {number} [FATAL=2]  Log a message object with the fatal level.

     * @property {number} [ERROR=3] Log a message object with the error level.

     * @property {number} [WARN=4] Log a message object with the warn level.

     * @property {number} [INFO=5] Log a message object with the info level.

     * @property {number} [DEBUG=6] Log a message object with the debug level.

     * @property {number} [TRACE=7] Log a message object with the trace level.

     * @property {number} [ALL=8] Log a message object with the all level.

     */



    this.Levels = logLevels;



    function clearRecordedLogs() {

        while (recordedLogs.length > 0) {

            recordedLogs.pop();

        }

    }



    /**

     * @deprecated Will be removed by 3.0.1

     * 

     * Enable or disable all logging, depending on whether enable parameter

     * is set to true or false.

     * 

     * @name setEnabled

     * @function

     * @memberOf fcs.logManager

     * 

     * @param {boolean} enable Enable or disable all logging

     * 

     * @since 3.0.0

     */

    this.setEnabled = function(enable) {

        enabled = enable === true ? true : false;

        if (!enabled) {

            recordingEnabled = false;

            clearRecordedLogs();

            overrideRecordedLogs = true;

            recordedLogsOverrideTreshod = RECORDED_LOGS_DEFAULT_MIN_TRESHOLD;

        }

    };



    /**

     * Returns true or false depending on whether logging is enabled.

     * 

     * @name isEnabled

     * @function

     * @memberOf fcs.logManager

     * 

     * @returns {Boolean} 

     * @since 3.0.0

     */

    this.isEnabled = function() {

        return enabled;

    };



    /**

     * @deprecated Will be removed by 3.0.1

     * 

     * Enable or disable log recording, depending on whether enable parameter

     * is set to true or false.<br />

     * 

     * <br />Recorded logs are overrided when recorded log count exceeds default

     * threshold of 1000.<br />

     * 

     * <br />Overriding treshold of recorded logs can be specified with logCountTreshold

     * parameter.<br />

     * 

     * <br />Overriding recorded logs can be enabled or disabled depending on 

     * whether logOverriding parameter is set to true or false.<br />

     * 

     * <br />If logOverriding is set to false, overriding treshold of recorded logs

     * is ignored.

     *  

     * @name setRecordingEnabled

     * @function

     * @memberOf fcs.logManager

     * 

     * @param {Boolean} enable Enable or disable log recording

     * @param {number} logCountTreshold Overriding treshold of recorded logs

     * @param {Boolean} logOverriding Enable or disable overriding recorded logs

     * 

     * @since 3.0.0

     */

    this.setRecordingEnabled = function(enable, logCountTreshold, logOverriding) {

        recordingEnabled = enable === true ? true : false;

        if (recordingEnabled) {

            overrideRecordedLogs = logOverriding === false ? false : true;

            recordedLogsOverrideTreshod = RECORDED_LOGS_DEFAULT_MIN_TRESHOLD;

            if (typeof logCountTreshold !== 'undefined' &&

                    typeof logCountTreshold === 'number' &&

                    logCountTreshold > RECORDED_LOGS_DEFAULT_MIN_TRESHOLD) {

                recordedLogsOverrideTreshod = logCountTreshold;

            }

        }

        else {

            recordingEnabled = false;

            clearRecordedLogs();

            overrideRecordedLogs = true;

            recordedLogsOverrideTreshod = RECORDED_LOGS_DEFAULT_MIN_TRESHOLD;

        }

    };



    /**

     * @deprecated Will be removed by 3.0.1

     * 

     * Returns true or false depending on whether recording logs is enabled.

     * 

     * @name isRecordingEnabled

     * @function

     * @memberOf fcs.logManager

     * 

     * @returns {Boolean} 

     * 

     * @since 3.0.0

     */

    this.isRecordingEnabled = function() {

        return recordingEnabled;

    };



    /**

     * @deprecated Will be removed by 3.0.1

     * 

     * Returns true or false depending on whether overriding recorded logs is enabled.

     * 

     * @name isOverrideRecordedLogs

     * @function

     * @memberOf fcs.logManager

     * 

     * @returns {Boolean} 

     * @since 3.0.0

     */

    this.isOverrideRecordedLogs = function() {

        return overrideRecordedLogs;

    };



    /**

     * @deprecated Will be removed by 3.0.1

     * 

     * Returns overriding threshold of recorded logs.

     * 

     * @name getRecordedLogsOverrideTreshod

     * @function

     * @memberOf fcs.logManager

     * 

     * @returns {number}

     * @since 3.0.0

     

     */

    this.getRecordedLogsOverrideTreshod = function() {

        return recordedLogsOverrideTreshod;

    };



    /**

     * @deprecated Will be removed by 3.0.1

     * 

     * Returns array of recorded logs.

     * 

     * @name getRecordedLogs

     * @function

     * @memberOf fcs.logManager

     * 

     * @returns {Array.<logObject>}.

     * @since 3.0.0

     */

    this.getRecordedLogs = function() {

        return recordedLogs;

    };



    /**

     * @deprecated Will be removed by 3.0.1

     * 

     * Returns recorded logs count.

     * 

     * @name getRecordedLogsCount

     * @function

     * @memberOf fcs.logManager

     * 

     * @returns {number}

     * @since 3.0.0

     */

    this.getRecordedLogsCount = function() {

        return recordedLogs.length;

    };



    /**

     * @deprecated Will be removed by 3.0.1

     * 

     * Returns loggers object list.

     * 

     * @name getLoggers

     * @function

     * @memberOf fcs.logManager

     * 

     * @returns {object}

     * @since 3.0.0  

     */

    this.getLoggers = function() {

        return loggers;

    };



    /**

     * @deprecated Will be removed by 3.0.1

     * 

     * Clear all recorded logs.

     * 

     * @name clearRecordedLogs

     * @function

     * @memberOf fcs.logManager

     * @since 3.0.0

     * 

     */

    this.clearRecordedLogs = clearRecordedLogs;



    /**

     * @deprecated Will be removed by 3.0.1

     * 

     * Logging function.

     *

     * @typedef {function} loggerFunction

     * @param {string} message message string to log

     * @param {...object} [args] arguments to log

     * @since 3.0.0

     */



    /**

     * @deprecated Will be removed by 3.0.1

     * 

     * Logger intance.

     * 

     * @typedef {Object} logger

     * 

     * @property {loggerFunction}  trace  Log a message object with the trace level.

     * @property {loggerFunction}  debug  Log a message object with the debug level.

     * @property {loggerFunction}  info  Log a message object with the info level.

     * @property {loggerFunction}  warn  Log a message object with the warn level.

     * @property {loggerFunction}  error  Log a message object with the error level.

     * @property {loggerFunction}  fatal  Log a message object with the fatal level.

     * 

     * @version 3.0.0

     * @since 3.0.0

     * 

     */



    function Logger(loggerName) {

        var name = loggerName, level = logLevels.ALL;



        this.getName = function() {

            return name;

        };



        this.setLevel = function(loggerLevel)

        {

            if (loggerLevel && logLevels[loggerLevel]) {

                level = logLevels[loggerLevel];

            }

        };



        this.getLevel = function()

        {

            return level;

        };



        function log(level, message, argument) {

            if (enabled) {

                var logObject = {};



                logObject.user = getUser();

                logObject.timestamp = new Date().getTime();

                logObject.logger = name;

                logObject.level = level;

                logObject.notificationId = getNotificationId();

                logObject.message = message;

                logObject.args = argument;





                if (_logHandler) {

                    try {

                        _logHandler(logObject.logger, logObject.level, logObject);

                    }

                    catch (e) {

                        return undefined;

                    }

                }

                else {

                    window.console.log(logObject.timestamp + " - " + logObject.logger + " - " + logObject.message, logObject.args ? logObject.args : " ");

                    if (recordingEnabled) {

                        if (overrideRecordedLogs &&

                                recordedLogs.length > recordedLogsOverrideTreshod) {

                            logObject.logger = "LOGGER";

                            logObject.args = recordedLogsOverrideTreshod;

                            logObject.message = "Log count exceeded maxium treshold of, deleting previous logs :";

                            clearRecordedLogs();

                            recordedLogs.push(logObject);

                        }

                        else {

                            recordedLogs.push(logObject);

                        }

                    }

                    return true;

                }

            }

            return false;

        }



        this.trace = function trace(msg, argument) {

            if (logLevels.TRACE > level) {

                return false;

            }



            return log(Level.TRACE, msg, argument);

        };



        this.debug = function debug(msg, argument) {

            if (logLevels.DEBUG > level) {

                return false;

            }

            return log(Level.DEBUG, msg, argument);

        };



        this.info = function info(msg, argument) {

            if (logLevels.INFO > level) {

                return false;

            }

            return log(Level.INFO, msg, argument);

        };



        this.warn = function warn(msg, argument) {

            if (logLevels.WARN > level) {

                return false;

            }

            return log(Level.WARN, msg, argument);

        };



        this.error = function error(msg, argument) {

            if (logLevels.ERROR > level) {

                return false;

            }

            return log(Level.ERROR, msg, argument);

        };



        this.fatal = function fatal(msg, argument) {

            if (logLevels.FATAL > level) {

                return false;

            }

            return log(Level.FATAL, msg, argument);

        };

    }



    /**

     * @deprecated Will be removed by 3.0.1

     * Retrieve a logger named according to the value of the loggerName parameter.

     * If the named logger already exists, then the existing instance will be returned. 

     * Otherwise, a new instance is created.<br />

     * 

     * <br />If loggerName is undefined, loggerName is set to "Default".<br />

     * 

     * @name getLogger

     * @function

     * @memberOf fcs.logManager

     * 

     * @param {string} loggerName The name of the logger to retrieve.

     * @returns {logger}

     * 

     * @since 3.0.0

     */

    this.getLogger = function(loggerName) {

        var logger, _loggerName;

        _loggerName = loggerName ? loggerName.trim().length !== 0 ? loggerName : "Default" : "Default";

        if (loggers[_loggerName]) {

            logger = loggers[_loggerName];

        }

        else {

            logger = new Logger(_loggerName);

            loggers[logger.getName()] = logger;

        }



        return logger;

    };

};



var logManager = new LogManager();

fcs.logManager = logManager;
var spidr, JslFacade = function() {
    var logger = logManager.getLogger("jslFacade");

    this.configurationData = {
        notificationType: null,
        restUrl: null,
        restPort: null,
        websocketIP: null,
        websocketPort: null,
        disableNotifications: null,
        protocol: null       
        //iceserver: null,
        //webrtcdtls: null,
        //pluginMode: null
    };
    this.notificationHandler = {
        onLoginSuccess: null,
        onLoginFailure: null,
        onCallNotification: null,
        onImNotification: null,
        onPresenceNotification: null
    };
    
    this.environmentVariables = {
        iceserver: null,
        webrtcdtls: null,
        pluginMode: null,
        pluginLogLevel: null,        
        ice: null,
        videoContainer: ""
    };

    this.incomingCall = null; //may remove
    this.outgoingCall = null; //may remove
    this.onCallNotification = null;
    this.onImNotification = null;
    this.onPresenceNotification = null;
    this.mediaInitiated = false;
    this.callStates = null;
    this.onIncomingCallStateChange = null;
    this.onOutgoingCallStateChange = null;
    this.onIncomingCallStreamAdded = null;
    this.onOutgoingCallStreamAdded = null;
    this.rejectSuccess = null;
    this.rejectFailure = null;
    this.downloadPlugin = null;

    /**
     * Setup environment
     *
     * @name spidr.setup()
     * @function
     * @param {Object} rest_ip
     * @param {Object} websocket_ip
     * @param {Object} rest_port
     * @param {Object} websocket_port
     * @param {Object} notification_type - "longpolling", "snmp", "websocket"
     * @param {boolean} disable_notifications - "true", "false"
     * @param {Object} protocol
     */
    //Not needed. This is for config.json
    this.makeConnection = function(configData) {
        /*fcs.setup({
         notificationType: notification_type,
         restIP: rest_ip,
         restPort: rest_port,
         websocketIP: websocket_ip,
         websocketPort: websocket_port,
         disableNotifications : disable_notifications,
         protocol: "http"
         });*/
        fcs.setup(configData);
    };

    /**
     * Authenticate as a user
     *
     * @name spidr.authenticate()
     * @function
     * @param {Object} username
     * @param {Object} password
     */

    this.authenticate = function(username, password) {
        fcs.setUserAuth(username, password);
    };

    /**
     * Subscribe to services
     *
     * @name spidr.subscribe()
     * @param onLoginSuccess
     * @param onLoginFailure
     * @param onCallNotification
     * @param onIMNotification
     * @param onPresenceNotification
     * @param isAnonymous
     */

    this.subscribe = function(onLoginSuccess, onLoginFailure,
            onCallNotification,
            onIMNotification,
            onPresenceNotification,
            isAnonymous) {
        fcs.notification.start(function() {
            //onSuccess
            if (utils.callFunctionIfExist(onLoginSuccess) === -1) {
                logger.error("onLoginSuccess is not defined");
            }

            spidr.callStates = fcs.call.States;
            
            fcs.call.initMedia(function() {
                logger.info("Media Initiated");
                spidr.mediaInitiated = true;
                },
                function() {
                    logger.error("Problem occured while initiating media");
                    utils.callFunctionIfExist(spidr.downloadPlugin);
                },
                {
                    "pluginLogLevel": spidr.environmentVariables.pluginLogLevel,//2,
                    "ice": spidr.environmentVariables.ice, //"STUN " + "stun:206.165.51.23:3478",
                    "videoContainer": spidr.environmentVariables.videoContainer, //"",
                    "pluginMode": spidr.environmentVariables.pluginMode, //"auto",
                    "iceserver": spidr.environmentVariables.iceserver, //"stun:206.165.51.23:3478"
                    "webrtcdtls" : spidr.environmentVariables.webrtcdtls
                }
            );

            if (!isAnonymous) {
                fcs.call.onReceived = function(call) {
                    logger.info("incoming call");
                    spidr.incomingCall = call;
                    
                    spidr.incomingCall.onStateChange = function(state) {
                        if (utils.callFunctionIfExist(spidr.onIncomingCallStateChange, call, state) === -1) {
                            logger.error("Assign a function to spidr.onIncomingCallStateChange");
                        }                       
                    };
                    
                    spidr.incomingCall.onStreamAdded = function(streamURL) {
                        if (utils.callFunctionIfExist(spidr.onIncomingCallStreamAdded, call, streamURL) === -1) {
                            logger.error("Assign a function to spidr.onIncomingCallStreamAdded");
                        }
                    };
                    
                    if (utils.callFunctionIfExist(onCallNotification, call) === -1) {
                        logger.error("onCallNotification is not defined");
                    }
                };

                fcs.im.onReceived = function(msg) {
                    //showNotification();
                    //window.alert("im received");
                    //window.alert("FROM= " + msg.primaryContact + " MSG= " + msg.msgText);
                    if (utils.callFunctionIfExist(onIMNotification, msg) === -1) {
                        logger.error("onIMNotification is not defined");
                    }

                };

                fcs.presence.onReceived = function(presence) {
                    //showNotification();
                    //window.alert("Presence info received");
                    //window.alert("Presence info received from= " + presence.name + " Status= " + presence.activity);
                    if (utils.callFunctionIfExist(onPresenceNotification, presence) === -1) {
                        logger.error("onIMNotification is not defined");
                    }

                };
            }
        },
                onLoginFailure,
                // window.alert("Something Wrong Here!!!");
                isAnonymous
                );
    };

    /**
     * Login.
     *
     * @name spidr.login()
     * @function
     * @param {Object} username
     * @param {Object} password
     * @param nh
     * @param isAnonymous
     */

    function login(username, password, nh, isAnonymous) {
        spidr.authenticate(username, password);
        spidr.subscribe(nh.onLoginSuccess, nh.onLoginFailure, nh.onCallNotification,
                nh.onImNotification, nh.onPresenceNotification, isAnonymous);
    }

    /**
     * LoginNamed
     *
     * @name spidr.loginNamed()
     * @function
     * @param {Object} username
     * @param {Object} password
     * @param nh
     */
    //function name may be loginIdentified
    this.loginNamed = function(username, password, nh) {
        login(username, password, nh, false);
    };

    /**
     * LoginAnonymous
     *
     * @name spidr.loginAnonymous()
     * @function
     * @param nh
     * @param callTo
     */
    this.loginAnonymous = function(callTo) {
        var nh = spidr.notificationHandler;
        nh.onLoginSuccess = function() {
            logger.info("Anonymous login is successful");
        };
        nh.onLoginFailure = function() {
            logger.error("Anonymous login is failed");
        };
        login(callTo, "abcd1234", nh, true);
        /*spidr.authenticate(callTo, "abcd1234");
         spidr.subscribe(nh.onLoginSuccess, nh.onLoginFailure, nh.onCallNotification,
         nh.onImNotification, nh.onPresenceNotification, true); */
    };

    /**
     * Logout
     *
     * @name spidr.logout()
     * @function
     * @param onSuccess
     * @param onFailure
     */

    this.logout = function(onSuccess, onFailure) {
        fcs.clearResources(function() {
            // if anything needs to be cleared specificly.
            // // clear it here.
            //  $(window).unbind('beforeunload');
            //  $(window).unbind('unload');
            //  window.location.href = ".";
        },
                true,
                true);
        //  fcs.notification.stop(function() {
        //onsuccess
        //    onSuccess();
        //  }, function() {
        //onfailure, can be used in the future
        //      onFailure();
        //  }, true /*synchronous*/); 

    };

    function makeCall(contact, to, onStartCall, onFailure, isVideoEnabled, sendInitialVideo) {
        //needs to be worked on onSuccess, onFailure?
        fcs.call.startCall(fcs.getUser(), contact, to,
                //onSuccess
                        function(outgoingCall) {                           
                            outgoingCall.onStateChange = function(state, statusCode) {                                
                                outgoingCall.statusCode = statusCode;
                                if (utils.callFunctionIfExist(spidr.onOutgoingCallStateChange, outgoingCall, state) === -1) {
                                    logger.error("Assign a function to spidr.onOutgoingCallStateChange");
                                }
                            };
                            //spidr.outgoingCallOnLocalStreamAdded = onLocalStreamAdded;
                            //onLocalStreamAdded();
                            outgoingCall.onStreamAdded = function(streamURL) {
                                if (utils.callFunctionIfExist(spidr.onOutgoingCallStreamAdded, outgoingCall, streamURL) === -1) {
                                    logger.error("Assign a function to spidr.onOutgoingCallStreamAdded");
                                }
                            };
                            spidr.outgoingCall = outgoingCall;
                            utils.callFunctionIfExist(onStartCall, outgoingCall);
                        },
                        //onFailure	
                                function() {
                                    logger.error("CALL FAILED!!!");
                                    utils.callFunctionIfExist(onFailure);
                                },
                                isVideoEnabled /*isVideoEnabled*/, sendInitialVideo /*sendInitialVideo*/);
                    }

            /**
             * Make a video call
             *
             * @name spidr.makeVideoCall()
             * @param onStartCall
             * @param onFailure
             * @param {Object} contact - caller's info contact.firstName, contact.lastNAme
             * @param {Object} to
             */

            this.makeVideoCall = function(contact, to, onStartCall, onFailure) {
                makeCall(contact, to, onStartCall, onFailure, false, true);
            };

            /**
             * Make a voice call
             *
             * @name spidr.makeVoiceCall()
             * @param onStartCall
             * @param onFailure
             * @param {Object} contact - caller's info contact.firstName, contact.lastNAme
             * @param {Object} to
             */

            this.makeVoiceCall = function(contact, to, onStartCall, onFailure) {
                makeCall(contact, to, onStartCall, onFailure, false, false);
            };

            /**
             * Receive a voice call
             *
             * @name spidr.receiveVoiceCall()
             * @function
             */

            this.receiveVoiceCall = function() {
                //
            };

            /**
             * Make a three-way call
             *
             * @name spidr.makeThreeWayCall()
             * @function
             */

            this.makeThreeWayCall = function() {
                //I am not sure yet if this is a separate method
            };

            /**
             * Make a voice to video call
             *
             * @name spidr.makeVoiceToVideoCall()
             * @function
             */

            this.makeVoiceToVideoCall = function() {
                //start call with required configuration for voice/video options
            };

            /**
             * Send an instant message
             *
             * @name spidr.sendIm()
             * @function
             * @param {Object} to
             * @param {Object} type
             * @param {Object} msgText
             * @param {Object} charset
             * @param {Object} onSuccess
             * @param {Object} onError
             */

            this.sendIm = function(to, type, msgText, charset, onSuccess, onError) {
                //construct an im object with values of to, type, msgText, charset then call fcs.im
                var im = new fcs.im.Message();
                im.primaryContact = to;
                im.type = type;
                im.msgText = msgText;
                im.charset = charset;

                fcs.im.send(im, onSuccess, onError);
            };

            /**
             * Receive an instant message
             *
             * @name spidr.receiveIm()
             * @function
             * @param {Object}
             */

            this.receiveIm = function() {

            };

            /**
             * Receive infos of contacts
             *
             * @name spidr.retrieveContacts()
             * @function
             * @param {Object} onSuccess
             * @param {Object} onError
             */

            this.retrieveContacts = function(onSuccess, onError) {

                fcs.addressbook.retrieve(onSuccess, onError);
            };

            /**
             * Watch presence info of contacts
             *
             * @name spidr.watchPresence()
             * @function
             * @param {Object} userlist
             * @param {Object} onSuccess
             * @param {Object} onError
             */

            this.watchPresence = function(userlist, onSuccess, onError) {

                fcs.presence.watch(userlist, onSuccess, onError);
            };

            /**
             * Stop watching presence info of contacts
             *
             * @name spidr.unWatchPresence()
             * @function
             * @param {Object} userlist
             * @param {Object} onSuccess
             * @param {Object} onError
             */

            this.unWatchPresence = function(userlist, onSuccess, onError) {

                fcs.presence.stopwatch(userlist, onSuccess, onError);
            };

            /**
             * Receive presence info of contacts
             *
             * @name spidr.receivePresence()
             * @function
             * @param {Object} userlist
             * @param {Object} onSuccess
             * @param {Object} onError
             */

            this.receivePresence = function(userlist, onSuccess, onError) {

                fcs.presence.retrieve(userlist, onSuccess, onError);
            };

            /**
             * Update presence
             *
             * @name spidr.updatePresence()
             * @function
             * @param {Object} state
             */

            this.updatePresence = function(state) {

                if (fcs.getServices().presence === true) {
                    //Setting ONLINE after login succeded
                    //Publish message needs to be send when subscription is successful

                    fcs.presence.update(state,
                            function() {
                                logger.info("Presence update success");
                            },
                            function() {
                                logger.error("Presence update failed");
                            });

                    //For testing
                    switch (state) {
                        case 0:
                            logger.info("CONNECTED");
                            break;
                        case 1:
                            logger.info("UNAVAILABLE");
                            break;
                        case 2:
                            logger.info("AWAY");
                            break;
                        case 3:
                            logger.info("OUT_TO_LUNCH");
                            break;
                        case 4:
                            logger.info("BUSY");
                            break;
                        case 5:
                            logger.info("ON_VACATION");
                            break;
                        case 6:
                            logger.info("BE_RIGHT_BACK");
                            break;
                        case 7:
                            logger.info("ON_THE_PHONE");
                            break;
                        case 8:
                            logger.info("ACTIVE");
                            break;
                        case 9:
                            logger.info("INACTIVE");
                            break;
                        case 10:
                            logger.info("PENDING");
                            break;
                        case 11:
                            logger.info("OFFLINE");
                            break;
                        case 12:
                            logger.info("CONNECTEDNOTE");
                            break;
                        case 13:
                            logger.info("UNAVAILABLENOTE");
                            break;
                        default:
                            logger.info("WRONG STATE");
                    }
                }
                else
                {
                    logger.fatal("PRESENCE SERVICE NOT ASSIGNED FOR THIS USER");
                }
            };

            /**
             * Look up an address in the address book
             *
             * @name spidr.searchAddress()
             * @function
             * @param {Object} criteria
             * @param {Object} searchType
             */

            this.searchAddress = function(criteria, searchType) {
                //Specific search
                //fcs.addressbook.searchDirectory(criteria, searchType, onSuccess, onFailure);
                //Retreive adressbook
                //fcs.addressbook.retrieve(onSuccess, onFailure);		
            };

            /**
             * Incoming Call Answer
             *
             * @name spidr.callAnswer()
             * @function
             * @param call
             * @param onAnswer
             * @param onFailure 
             * @param isVideoAnswer
             */

            function callAnswer(call, onAnswer, onFailure, isVideoAnswer) {
                //if(spidr.incomingCallOnLocalStreamAdded != null && typeof (spidr.incomingCallOnLocalStreamAdded) === "function"){
                //spidr.incomingCall.answer(spidr.incomingCallOnLocalStreamAdded(onLocalStreamAdded),
                // spidr.incomingCall.
                call.answer(onAnswer,
                        onFailure,
                        isVideoAnswer
                        );
            }

            /**
             * Incoming Call Answer with voice
             *
             * @name spidr.answerVoiceCall()
             * @function
             * @param call
             * @param onAnswer
             * @param onFailure 
             */

            this.answerVoiceCall = function(call, onAnswer, onFailure) {
                //if(spidr.incomingCallOnLocalStreamAdded != null && typeof (spidr.incomingCallOnLocalStreamAdded) === "function"){
                //spidr.incomingCall.answer(spidr.incomingCallOnLocalStreamAdded(onLocalStreamAdded),
                // spidr.incomingCall.
                callAnswer(call, onAnswer, onFailure, false);
            };

            /**
             * Incoming Call Answer with voice
             *
             * @name spidr.answerVideoCall()
             * @function
             * @param call
             * @param onAnswer
             * @param onFailure 
             */

            this.answerVideoCall = function(call, onAnswer, onFailure) {
                //if(spidr.incomingCallOnLocalStreamAdded != null && typeof (spidr.incomingCallOnLocalStreamAdded) === "function"){
                //spidr.incomingCall.answer(spidr.incomingCallOnLocalStreamAdded(onLocalStreamAdded),
                // spidr.incomingCall.
                callAnswer(call, onAnswer, onFailure, true);
            };

            /**
             * Call End
             *
             * @name spidr.endCall()
             * @function
             * @param call
             * @param {Object} onEnd
             * @param {Object} onFailure
             */

            this.endCall = function(call, onEnd, onFailure) {
                //var call = spidr.incomingCall || spidr.outgoingCall;
                call.end(
                        onEnd,
                        onFailure
                        );
                logger.info("Call is ended.");
            };

            /**
             * Incoming Call Reject
             *
             * @name spidr.rejectCall()
             * @function
             * @param call
             * @param {Object} rejectSuccess
             * @param {Object} rejectFailure
             */

            this.rejectCall = function(call, rejectSuccess, rejectFailure) {
                //spidr.incomingCall.
                call.reject(
                        rejectSuccess,
                        rejectFailure
                        );
                logger.info("Incoming call is rejected.");
            };

            /**
             * Start video
             * 
             * @name spidr.startVideo
             * @function
             * @param call
             * @param {Object} startSuccess
             * @param {Object} startFailure
             */
            //add call parameter
            this.startVideo = function(call, startSuccess, startFailure) {
                //var call = spidr.incomingCall || spidr.outgoingCall;
                logger.info("Start video");
                call.videoStart(startSuccess, startFailure);
            };

            /**
             * Stop video 
             * 
             * @name spidr.stopVideo
             * @function
             * @param call
             * @param {Object} stopSuccess
             * @param {Object} stopFailure
             */
            //add call parameter
            this.stopVideo = function(call, stopSuccess, stopFailure) {
                //var call = spidr.incomingCall || spidr.outgoingCall;
                logger.info("Stop video");
                call.videoStop(stopSuccess, stopFailure);
            };

            /*
             * callMute
             * Use this method to mute
             */
            this.mute = function(call) {
                //var call = spidr.incomingCall || spidr.outgoingCall;
                call.mute();
                logger.info("Mute");
            };

            /*
             * callUnMute
             * Use this method to mute
             */
            this.unMute = function(call) {
                //var call = spidr.incomingCall || spidr.outgoingCall;
                call.unmute();
                logger.info("Unmute");
            };

            /*
             * hold
             * Use this method to hold call
             * 
             * @name spidr.hold
             * @function
             * @param call
             * @param {Object} holdSuccess
             * @param {Object} holdFailure
             */
            this.hold = function(call, holdSuccess, holdFailure) {
                //var call = spidr.incomingCall || spidr.outgoingCall;
                call.hold(holdSuccess, holdFailure);
                logger.info("Hold");
            };

            /*
             * unHold
             * Use this method to unhold call
             * 
             * @name spidr.unHold
             * @function
             * @param {Object} unHoldSuccess
             * @param {Object} unHoldFailure
             */
            this.unHold = function(call, unHoldSuccess, unHoldFailure) {
                //var call = spidr.incomingCall || spidr.outgoingCall;
                call.unhold(unHoldSuccess, unHoldFailure);
                logger.info("Unhold");
            };

            /*
             * sendDTMF
             * Use this method to sendDTMF
             */
            this.sendDTMF = function(tone) {
                var call = spidr.incomingCall || spidr.outgoingCall;
                call.sendDTMF(tone);
            };

            /*
             * getServices
             * Use this method to get services
             */

            this.getServices = function() {
                var services;
                services = fcs.getServices();
                return services;
            };

            /*
             * getUser
             * Use this method to get user
             */

            this.getUser = function() {
                var user;
                user = fcs.getUser();
                return user;
            };

        };
spidr = new JslFacade();
window.spidr = spidr;

function getUrl(){
        var url = "";

        if(!fcsConfig.protocol || !fcsConfig.restUrl || !fcsConfig.restPort) {
            return url;
        }        
        return url + fcsConfig.protocol + "://" + fcsConfig.restUrl + ":" + fcsConfig.restPort;
    }

    function getWAMUrl(version, url, authNeeded){
        if (authNeeded === false) {
            // Authentcation is not needed.
            return getUrl() + "/rest/version/" + (version?version:"latest") + url;            
        } else {
            // Authentcation is needed for the rest request
            if(fcs.notification){
                return getUrl() + "/rest/version/" + (version?version:"latest") + (fcs.notification.isAnonymous() ? "/anonymous/" : "/user/" ) + fcs.getUser() + url;
            }
            else{
                return getUrl() + "/rest/version/" + (version?version:"latest") + "/user/" + fcs.getUser() + url;
            }              
        }
    }    
        
    
    function getSipwareUrl(){
        var url;
        if(fcsConfig.sipware){
            return fcsConfig.sipware + "/WebBroker/connections/";
        }
        return url;
    }  
    
    function getAbsolutePath() {
        var loc = window.location, pathName = loc.pathname.substring(0, loc.pathname.lastIndexOf('/') + 1);
        return loc.href.substring(0, loc.href.length - ((loc.pathname + loc.search + loc.hash).length - pathName.length));
    }

var CookieStorage = function() {
    // Get an object that holds all cookies
    var cookies = (function() {
        var cookies = {},
            all = document.cookie,
            list,
            i = 0,
            cookie, firstEq, name, value;
        if (all === "") {
            return cookies;
        }            
        
        list = all.split("; "); // Split into individual name=value pairs
        
        for(; i < list.length; i += 1) {
            cookie = list[i];
            firstEq = cookie.indexOf("="); // Find the first = sign
            name = cookie.substring(0, firstEq); // Get cookie name
            value = cookie.substring(firstEq+1); // Get cookie value
            value = decodeURIComponent(value); // Decode the value
            
            cookies[name] = value;
        }
        return cookies;
    }()),
    
    // Collect the cookie names in an array
    keys = [],
    key;
    for(key in cookies) {
        if(cookies.hasOwnProperty(key)){
            keys.push(key);
        }
       
    }
    // Public API
    this.length = keys.length;

    
    // Return the name of the nth cookie, or null if n is out of range
    this.key = function(n) {
        if (n < 0 || n >= keys.length) {
            return null;
        }            
        
        return keys[n];
    };

    // Return the value of the named cookie, or null.
    this.getItem = function(name) {
        if (arguments.length !== 1) {
            throw new Error("Provide one argument");
        }
        
        return cookies[name] || null;
    };

    this.setItem = function(key, value) {
        if (arguments.length !== 2) {
           throw new Error("Provide two arguments");
        }
        
        if (cookies[key] === undefined) { // If no existing cookie with this name
            keys.push(key);
            this.length++;
        }
        
        cookies[key] = value;
        
        var cookie = key + "=" + encodeURIComponent(value),
        today = new Date(),
        expiry = new Date(today.getTime() + 30 * 24 * 3600 * 1000);    
        // Add cookie attributes to that string
        
        cookie += "; max-age=" + expiry;
        
        
        cookie += "; path=/";
                    
        // Set the cookie through the document.cookie property
        document.cookie = cookie;
    };
    
    // Remove the specified cookie
    this.removeItem = function(key) {
        if (arguments.length !== 1) {
            throw new Error("Provide one argument");
        }
        
        var i = 0, max;
        if (cookies[key] === undefined) { // If it doesn't exist, do nothing
            return;
        }
            
        // Delete the cookie from our internal set of cookies
        delete cookies[key];
        
        // And remove the key from the array of names, too.        
        for(max = keys.length; i < max; i += 1) {
            if (keys[i] === key) { // When we find the one we want
                keys.splice(i,1); // Remove it from the array.
                break;
            }
        }
        this.length--; // Decrement cookie length
        
        // Actually delete the cookie
        document.cookie = key + "=; max-age=0";
    };
    
    // Remove all cookies
    this.clear = function() {
        var i = 0;
        for(; i < keys.length; i++) {
            document.cookie = keys[i] + "=; max-age=0";
        }
        
        // Reset our internal state
        cookies = {};
        keys = [];
        this.length = 0;
    };
};
var cache = (typeof window.localStorage !== 'undefined') ? window.localStorage : new CookieStorage();
window.cache = cache;
var Utils = function() {
    var logger = logManager.getLogger("utils");

    this.getProperty = function(obj, property) {
        return ((typeof obj[property]) === 'undefined') ? null : obj[property];
    };

    this.callFunctionIfExist = function() {
        var args = Array.prototype.slice.call(arguments), func;
        func = args.shift();
        if (typeof (func) === 'function') {
            try {
                func.apply(null, args);
                return true;
            }
            catch (e) {
                logger.error("Exception occured:\n" + e.stack);
                return undefined;
            }
        }
        else {
            logger.info("Not a function:" + func);
            return -1;
        }
    };

    this.s4 = function() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };

    this.extend = function(target, object) {
        var prop;
        for (prop in object) {
            if (object.hasOwnProperty(prop)) {
                target[prop] = object[prop];
            }
        }
        return target;
    };

    this.getTimestamp = function() {
        return new Date().getTime();
    };

    function getPropertyValueIfExistsInObject(object, key) {
        var objId, retVal;
        if (object) {
            for (objId in object) {
                if (object.hasOwnProperty(objId)) {
                    if (objId === key) {
                        retVal = object[objId];
                    }
                    else if (typeof object[objId] === "object") {
                        retVal = getPropertyValueIfExistsInObject(object[objId], key);
                    }
                    if (retVal) {
                        break;
                    }
                }
            }
            return retVal;
        }
    }

    this.getPropertyValueIfExistsInObject = getPropertyValueIfExistsInObject;

};
var utils = new Utils();


var SDPParser = function() {
    var logger = logManager.getLogger("sdpParser"),
            self, mediaDescriptions, sessionDescription;

    this.init = function(sdpData) {
        self = this;
        self.sessionDescription = {};
        self.mediaDescriptions = [];
        self.sdp = sdpData;
        self.parseSDP();
        self.setSessionDescriptionAttributes();
        self.setMediaDescriptionsAttributes();
    };


    this.parseSDP = function() { 
        var descriptions = [], index = 1, mediaDescription;
        descriptions = self.sdp.split(/^(?=m=)/m);
        self.sessionDescription.data = descriptions[0];
        for (index; index < descriptions.length; index++) {
            mediaDescription = {};
            mediaDescription.data = descriptions[index];
            self.mediaDescriptions.push(mediaDescription);
        }
    };

    this.setSessionDescriptionAttributes = function() {
        var line = 0, sessionDescriptions = self.sessionDescription.data.split(/\r\n|\r|\n/), connectionData;

        for (line; line < sessionDescriptions.length; line++) {
            if ((sessionDescriptions[line].match("^e="))) {
                self.sessionDescription.email = sessionDescriptions[line].split('=')[1];
            }
            else if ((sessionDescriptions[line].match("^c="))) {
                connectionData = sessionDescriptions[line].split('=')[1];
                self.sessionDescription.connection = connectionData;
                self.sessionDescription.ip = connectionData.split(' ')[2];
            }
        }
    };

    this.setMediaDescriptionsAttributes = function() {
        var line = 0, mediaDescriptionIndex, mediaDescriptionAttributes, mediaData, connectionData;

        for (mediaDescriptionIndex in self.mediaDescriptions) {
            if (self.mediaDescriptions.hasOwnProperty(mediaDescriptionIndex)) {
                mediaDescriptionAttributes = self.mediaDescriptions[mediaDescriptionIndex].data.split(/\r\n|\r|\n/);
                this.mediaDescriptions[mediaDescriptionIndex].direction = "sendrecv";
                for (line in mediaDescriptionAttributes) {
                    if (mediaDescriptionAttributes.hasOwnProperty(line)) {
                        //direction default sendrcv setle
                        if ((mediaDescriptionAttributes[line].match("^m="))) {
                            mediaData = mediaDescriptionAttributes[line].split('=')[1];
                            self.mediaDescriptions[mediaDescriptionIndex].media = mediaData;
                            self.mediaDescriptions[mediaDescriptionIndex].port = mediaData.split(' ')[1];
                        }
                        else if ((mediaDescriptionAttributes[line].match("^a=sendrecv")) || (mediaDescriptionAttributes[line].match("^a=sendonly")) || (mediaDescriptionAttributes[line].match("^a=recvonly")) || (mediaDescriptionAttributes[line].match("^a=inactive"))) {
                            self.mediaDescriptions[mediaDescriptionIndex].direction = mediaDescriptionAttributes[line].split('=')[1];
                        }
                        else if ((mediaDescriptionAttributes[line].match("^c="))) {
                            connectionData = mediaDescriptionAttributes[line].split('=')[1];
                            self.mediaDescriptions[mediaDescriptionIndex].connection = connectionData;
                            self.mediaDescriptions[mediaDescriptionIndex].ip = connectionData.split(' ')[2];
                        }
                    }
                }
            }
        }

    };

    this.isHold = function(isRemote) {
        var isHold = false, ip, media_index = 0, mediaDesc, direction;
        for (media_index in self.mediaDescriptions) {
            if (self.mediaDescriptions.hasOwnProperty(media_index)) {
                mediaDesc = this.mediaDescriptions[media_index];
                if (mediaDesc.ip) {
                    ip = mediaDesc.ip;
                }
                else {
                    if (self.sessionDescription.ip) {
                        ip = self.sessionDescription.ip;
                    }
                }

                if (mediaDesc.port !== 0) {
                    if ((mediaDesc.direction === "inactive") || 
                        ( (mediaDesc.direction === "sendonly") && isRemote) || 
                        ( (mediaDesc.direction === "recvonly") && !isRemote) || 
                        (ip === "0.0.0.0") ) {
                        isHold = true;
                    }
                    else {
                        isHold = false;
                        break;
                    }
                }
            }
        }
        return isHold;
    };

    this.isRemoteHold = function() {
        return this.isHold(true);
    };
    
    this.isLocalHold = function() {
        return this.isHold(false);
    };
    
    this.getSessionDescription = function() {
        return self.sessionDescription;
    };

    this.getMediaDescriptions = function() {
        return self.mediaDescriptions;
    };

    this.isSdpHas = function(pSdp, type) {
        var msg = "isSdpHas for type " + type + ": ", result = false;

        if (pSdp.indexOf(CONSTANTS.SDP.M_LINE + type) !== -1) {
            result = true;
            logger.info(msg + result);
            return result;
        }

        logger.info(msg + result);
        return result;
    };

    this.isSdpHasAudio = function(pSdp) {
        return this.isSdpHas(pSdp, CONSTANTS.STRING.AUDIO);
    };

    this.isSdpHasVideo = function(pSdp) {
        return this.isSdpHas(pSdp, CONSTANTS.STRING.VIDEO);
    };

    this.isSdpHasMediaWithZeroPort = function(pSdp, type) {
        return pSdp.indexOf(CONSTANTS.SDP.M_LINE + type + " 0") !== -1;
    };

    this.isSdpHasAudioWithZeroPort = function(pSdp) {
        return this.isSdpHasMediaWithZeroPort(pSdp, CONSTANTS.STRING.AUDIO);
    };

    this.isSdpHasVideoWithZeroPort = function(pSdp) {
        return this.isSdpHasMediaWithZeroPort(pSdp, CONSTANTS.STRING.VIDEO);
    };

    this.replaceZeroVideoPortWithOne = function(pSdp) {
        if (this.isSdpHasMediaWithZeroPort(pSdp, CONSTANTS.STRING.VIDEO)) {
            pSdp = pSdp.replace(CONSTANTS.SDP.M_LINE + CONSTANTS.STRING.VIDEO + " 0 ", CONSTANTS.SDP.M_LINE + CONSTANTS.STRING.VIDEO + " 1 ");
        }
    };

    this.getSdpDirection = function(pSdp, type) {
        var substr = "", descriptions = [], index,
                direction = CONSTANTS.WEBRTC.MEDIA_STATE.INACTIVE, logmsg;

        logmsg = function(state) {
            logger.info("getSdpDirection: type= " + type + " state= " + state);
        };

        if (!this.isSdpHas(pSdp, type)) {
            logmsg(direction);
            return direction;
        }

        if (this.isSdpHasMediaWithZeroPort(pSdp, type)) {
            logmsg(direction);
            return direction;
        }

        descriptions = pSdp.split(/^(?=m=)/m);
        for (index = 0; index < descriptions.length; index++) {
            substr = descriptions[index];
            if (substr.indexOf(CONSTANTS.SDP.M_LINE + type) !== -1) {
                if (substr.indexOf(CONSTANTS.SDP.A_LINE + CONSTANTS.WEBRTC.MEDIA_STATE.SEND_RECEIVE) !== -1) {
                    direction = CONSTANTS.WEBRTC.MEDIA_STATE.SEND_RECEIVE;
                    logmsg(direction);
                    return direction;
                } else if (substr.indexOf(CONSTANTS.SDP.A_LINE + CONSTANTS.WEBRTC.MEDIA_STATE.SEND_ONLY) !== -1) {
                    direction = CONSTANTS.WEBRTC.MEDIA_STATE.SEND_ONLY;
                    logmsg(direction);
                    return direction;
                } else if (substr.indexOf(CONSTANTS.SDP.A_LINE + CONSTANTS.WEBRTC.MEDIA_STATE.RECEIVE_ONLY) !== -1) {
                    direction = CONSTANTS.WEBRTC.MEDIA_STATE.RECEIVE_ONLY;
                    logmsg(direction);
                    return direction;
                } else if (substr.indexOf(CONSTANTS.SDP.A_LINE + CONSTANTS.WEBRTC.MEDIA_STATE.INACTIVE) !== -1) {
                    logmsg(direction);
                    return direction;
                }
            }
        }
        direction = CONSTANTS.WEBRTC.MEDIA_STATE.NOT_FOUND;
        logmsg(direction);
        return direction;
    };

    this.getAudioSdpDirection = function(pSdp) {
        return this.getSdpDirection(pSdp, CONSTANTS.STRING.AUDIO);
    };

    this.getVideoSdpDirection = function(pSdp) {
        return this.getSdpDirection(pSdp, CONSTANTS.STRING.VIDEO);
    };

    this.isAudioSdpDirectionInactive = function(pSdp) {
        return this.getAudioSdpDirection(pSdp) === CONSTANTS.WEBRTC.MEDIA_STATE.INACTIVE;
    };

    this.isAudioSdpDirectionSendrecv = function(pSdp) {
        return this.getAudioSdpDirection(pSdp) === CONSTANTS.WEBRTC.MEDIA_STATE.SEND_RECEIVE;
    };

    this.isAudioSdpDirectionSendonly = function(pSdp) {
        return this.getAudioSdpDirection(pSdp) === CONSTANTS.WEBRTC.MEDIA_STATE.SEND_ONLY;
    };

    this.isAudioSdpDirectionRecvonly = function(pSdp) {
        return this.getAudioSdpDirection(pSdp) === CONSTANTS.WEBRTC.MEDIA_STATE.RECEIVE_ONLY;
    };

    this.isVideoSdpDirectionInactive = function(pSdp) {
        return this.getVideoSdpDirection(pSdp) === CONSTANTS.WEBRTC.MEDIA_STATE.INACTIVE;
    };

    this.isVideoSdpDirectionSendrecv = function(pSdp) {
        return this.getVideoSdpDirection(pSdp) === CONSTANTS.WEBRTC.MEDIA_STATE.SEND_RECEIVE;
    };

    this.isVideoSdpDirectionSendonly = function(pSdp) {
        return this.getVideoSdpDirection(pSdp) === CONSTANTS.WEBRTC.MEDIA_STATE.SEND_ONLY;
    };

    this.isVideoSdpDirectionRecvonly = function(pSdp) {
        return this.getVideoSdpDirection(pSdp) === CONSTANTS.WEBRTC.MEDIA_STATE.RECEIVE_ONLY;
    };

    function changeDirection(pSdp, directionBefore, directionAfter, type) {
        var sdp = "", substr, descriptions = [], index,
                msg = "changeDirection: before= " + directionBefore + " after= " + directionAfter;

        if (directionBefore === directionAfter) {
            //no need to change direction
            return pSdp;
        }

        if (type === undefined || type === null) {
            logger.info(msg + " for all media types");
        } else if (directionBefore !== this.getSdpDirection(pSdp, type)) {
            //Ignore changing the direction if the "directionBefore" and existing directions do not match
            return pSdp;
        } else {
            logger.info(msg + " type= " + type);
        }

        descriptions = pSdp.split(/^(?=m=)/m);
        for (index = 0; index < descriptions.length; index++) {
            substr = descriptions[index];
            if (type === undefined || type === null || substr.indexOf(CONSTANTS.SDP.M_LINE + type) !== -1) {
                substr = substr.replace(CONSTANTS.SDP.A_LINE + directionBefore, CONSTANTS.SDP.A_LINE + directionAfter);
            }
            sdp = sdp + substr;
        }

        return sdp;
    }

    this.updateSdpDirection = function(pSdp, type, direction) {
        logger.info("updateSdpDirection: type= " + type + " direction= " + direction);
        var beforeDirection = this.getSdpDirection(pSdp, type);
        return changeDirection(pSdp, beforeDirection, direction, type);
    };

    this.updateAudioSdpDirection = function(pSdp, direction) {
        logger.info("updateSdpDirection: type= " + CONSTANTS.STRING.AUDIO + " direction= " + direction);
        var beforeDirection = this.getSdpDirection(pSdp, CONSTANTS.STRING.AUDIO);
        return changeDirection(pSdp, beforeDirection, direction, CONSTANTS.STRING.AUDIO);
    };

    this.updateVideoSdpDirection = function(pSdp, direction) {
        logger.info("updateSdpDirection: type= " + CONSTANTS.STRING.VIDEO + " direction= " + direction);
        var beforeDirection = this.getSdpDirection(pSdp, CONSTANTS.STRING.VIDEO);
        return changeDirection(pSdp, beforeDirection, direction, CONSTANTS.STRING.VIDEO);
    };

    this.updateAudioSdpDirectionToInactive = function(pSdp) {
        return this.updateAudioSdpDirection(pSdp, CONSTANTS.WEBRTC.MEDIA_STATE.INACTIVE);
    };

    this.updateVideoSdpDirectionToInactive = function(pSdp) {
        return this.updateVideoSdpDirection(pSdp, CONSTANTS.WEBRTC.MEDIA_STATE.INACTIVE);
    };

    this.isSdpHasDirection = function(pSdp) {
        var sr_indx, so_indx, ro_indx, in_indx;
        sr_indx = pSdp.indexOf(CONSTANTS.SDP.A_LINE + CONSTANTS.WEBRTC.MEDIA_STATE.SEND_RECEIVE, 0);
        so_indx = pSdp.indexOf(CONSTANTS.SDP.A_LINE + CONSTANTS.WEBRTC.MEDIA_STATE.SEND_ONLY, 0);
        ro_indx = pSdp.indexOf(CONSTANTS.SDP.A_LINE + CONSTANTS.WEBRTC.MEDIA_STATE.RECEIVE_ONLY, 0);
        in_indx = pSdp.indexOf(CONSTANTS.SDP.A_LINE + CONSTANTS.WEBRTC.MEDIA_STATE.INACTIVE, 0);
        return (sr_indx + 1) + (so_indx + 1) + (ro_indx + 1) + (in_indx + 1) === 0 ? false : true;
    };

    this.isSdpEnabled = function(pSdp, type) {
        var direction, msg = "isSdpEnabled for type " + type + ": ", result = false;

        if (this.isSdpHasMediaWithZeroPort(pSdp, type)) {
            logger.info(msg + result);
            return result;
        }
        if (type === CONSTANTS.STRING.VIDEO) {
            direction = this.getVideoSdpDirection(pSdp);
            if (direction === CONSTANTS.WEBRTC.MEDIA_STATE.RECEIVE_ONLY || direction === CONSTANTS.WEBRTC.MEDIA_STATE.INACTIVE) {
                logger.info(msg + result);
                return result;
            }
        }
        if (this.isSdpHas(pSdp, type)) {
            result = true;
        }
        logger.info(msg + result);
        return result;
    };

    this.isAudioSdpEnabled = function(pSdp) {
        return this.isSdpEnabled(pSdp, CONSTANTS.STRING.AUDIO);
    };

    this.isVideoSdpEnabled = function(pSdp) {
        return this.isSdpEnabled(pSdp, CONSTANTS.STRING.VIDEO);
    };

    this.isSdpVideoReceiveEnabled = function(pSdp) {
        var direction, msg = "isSdpVideoReceiveEnabled: ", result = false;

        if (pSdp.indexOf(CONSTANTS.SDP.M_LINE + CONSTANTS.STRING.VIDEO + " 0") !== -1) {
            logger.info(msg + result);
            return result;
        }

        direction = this.getVideoSdpDirection(pSdp);
        if (direction === CONSTANTS.WEBRTC.MEDIA_STATE.SEND_ONLY || direction === CONSTANTS.WEBRTC.MEDIA_STATE.INACTIVE) {
            logger.info(msg + result);
            return result;
        }

        if (pSdp.indexOf(CONSTANTS.SDP.M_LINE + CONSTANTS.STRING.VIDEO) !== -1) {
            result = true;
            logger.info(msg + result);
            return result;
        }

        logger.info(msg + result);
        return result;
    };

    this.updateH264Level = function(pSdp) {
        var sdp = "", substr = "", descriptions = [], index, reg = /\r\n|\r|\n/m, video_arr, i, new_substr = "", elm, elm_array;

        descriptions = pSdp.split(/^(?=m=)/m);
        for (index = 0; index < descriptions.length; index++) {
            substr = descriptions[index];
            if (substr.indexOf(CONSTANTS.SDP.M_LINE + CONSTANTS.STRING.VIDEO) !== -1) {
                video_arr = substr.split(reg);
                for (i = 0; i < video_arr.length; i++) {
                    elm = video_arr[i];
                    if (elm && elm.indexOf("a=rtpmap:") !== -1 && elm.indexOf("H264") !== -1) {
                        elm_array = elm.split(/\:| /m);
                        elm = elm + CONSTANTS.STRING.CARRIAGE_RETURN + CONSTANTS.STRING.NEW_LINE;
                        elm = elm + "a=fmtp:" + elm_array[1] + " profile-level-id=428014;";
                        elm = elm + CONSTANTS.STRING.CARRIAGE_RETURN + CONSTANTS.STRING.NEW_LINE;
                        // Workaround for issue 1603.
                    } else if (elm && elm !== "") {
                        elm = elm + CONSTANTS.STRING.CARRIAGE_RETURN + CONSTANTS.STRING.NEW_LINE;
                    }
                    new_substr = new_substr + elm;
                }
                substr = new_substr;
            }
            sdp = sdp + substr;
        }
        return sdp;
    };

    this.isSdpVideoCandidateEnabled = function(pSdp) {
        var msg = "isSdpVideoCandidateEnabled: ", result = false;

        if (this.isSdpHasVideoWithZeroPort(pSdp)) {
            logger.info(msg + result);
            return result;
        }

        if (this.isVideoSdpDirectionInactive(pSdp)) {
            logger.info(msg + result);
            return result;
        }

        if (!this.isSdpHasVideo(pSdp)) {
            result = true;
            logger.info(msg + result);
            return true;
        }

        logger.info(msg + result);
        return result;
    };

};

var sdpParser = new SDPParser();
var SoapRequestHandler = function() {
    
    var logger = logManager.getLogger("soapRequestHandler"),
            REQUEST_TYPE_POST = "POST";

    this.XML=[];
    this.Nodes=[];
    this.State="";
    this.formatXML = function(Str) {
        if (Str){
            return Str.replace(/&/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
        return "";
    };
    this.beginNode = function(Name) {
        if (!Name) {return;}
        if (this.State==="open"){ 
            this.XML.push(">");
        }   
        this.State="open";
        this.Nodes.push(Name);
        this.XML.push("<"+Name);
    };
    this.endNode = function() {
        if (this.State==="open")
        {
            this.XML.push("/>");
            this.Nodes.pop();
        }
        else if (this.Nodes.length>0){
            this.XML.push("</"+this.Nodes.pop()+">");
        }
        this.State="";
    };
    this.attrib = function(Name, Value){
        if (this.State!=="open" || !Name) {return;}
        this.XML.push(" "+Name+"=\'"+this.formatXML(Value)+"\'");
    };
    this.writeString = function(Value){
        if (this.State==="open") {this.XML.push(">");}
        this.XML.push(this.formatXML(Value));
        this.State="";
    };
    this.node = function(Name, Value){
        if (!Name) {return;}
        if (this.State==="open") {this.XML.push(">");}
        this.XML.push((Value==="" || !Value)?"<"+Name+"/>":"<"+Name+">"+this.formatXML(Value)+"</"+Name+">");
        this.State="";
    };
    this.close = function(){
        while (this.Nodes.length>0){
            this.endNode();
        }
        this.State="closed";
    };
    this.toString = function(){
        return this.XML.join("");
    };
    
    function createSoapRequestBody(transactionId,modType,controlTags){
        var handler = new SoapRequestHandler(),key,prefix;
        
        prefix = "TxnProxyUrl: rad://cc.radisys.com\nTxnProxyMethod: POST\n\n";
        
        handler.beginNode('SOAP-ENV:Envelope');
        handler.attrib('SOAP-ENV:encodingStyle',"http://schemas.xmlsoap.org/soap/encoding/");
        handler.attrib('xmlns:SOAP-ENC',"http://schemas.xmlsoap.org/soap/encoding/");
        handler.attrib('xmlns:SOAP-ENV',"http://schemas.xmlsoap.org/soap/envelope/");
            handler.beginNode('SOAP-ENV:Header');
            handler.attrib('xmlns:wsse',"http://schemas.xmlsoap.org/ws/2002/07/secext");
            handler.attrib('xmlns:wau',"http://schemas.xmlsoap.org/ws/2002/07/utility");
                handler.beginNode('TrxnID');
                handler.writeString(transactionId);
                handler.endNode();
            handler.endNode();
            handler.beginNode('SOAP-ENV:Body');
                handler.beginNode('m:'+modType);
                handler.attrib('xmlns:m','http://schemas.pactolus.com');
                    for (key in controlTags) {
                      if (controlTags.hasOwnProperty(key)) {
                        handler.beginNode(key);  
                        handler.writeString(controlTags[key]);
                        handler.endNode();
                      }
                    }
                handler.endNode();
            handler.endNode();
        handler.endNode();
        
        return prefix + handler.toString();
    }
    
    this.sendRequest = function(id, modType, controlTags, successHandler, errorHandler){
        
        var requestData,
            headers,
            connectionid;
            
            headers = {
                "Content-Type" : "text/plain+radproxy",
                "Accept" : "text/plain+radproxy",
                "x-proxyurl" : getSipwareUrl()
            };
        if(!getSipwareUrl()){
            logger.info("Sipware IP not found in configuration, Be sure it is present");
            return;
        }

        function webClientLeaveCall(){
            requestData = createSoapRequestBody(id, "WebClientLeaveRequest",{
                conferenceID:controlTags.conferenceID
                });
            window.$.ajax({
                type: REQUEST_TYPE_POST,
                url:  getUrl() + "/proxy",
                headers:headers,
                data: requestData,
                dataType : "text",
                success: function(val) {
                    if (successHandler && typeof successHandler === 'function') {
                        successHandler();
                    }              
                },
                error: function(x, e) {                
                    if (errorHandler && typeof errorHandler === 'function') {
                        errorHandler();
                    }
                }
            });
        }
        function mainCall(){
            requestData = createSoapRequestBody(id, modType,controlTags);
            window.$.ajax({
                type: REQUEST_TYPE_POST,
                url:  getUrl() + "/proxy",
                headers:headers,
                data: requestData,
                dataType : "text",
                success: function(val) {
                    webClientLeaveCall();
                },
                error: function(x, e) {}
            });
        }
        function webClientJoinCall(){
            requestData = createSoapRequestBody(id, "WebClientJoinRequest", {
                conferenceID:controlTags.conferenceID, 
                moderatorEvents:"true",
                csrEvents:"F"
            });
            window.$.ajax({
                type: REQUEST_TYPE_POST,
                url:  getUrl() + "/proxy",
                headers:headers,
                data: requestData,
                dataType : "text",
                success: function(val) {
                    mainCall();
                },
                error: function(x, e) {}
            });
        }
        function activateConferenceCall(){
            headers["x-proxyurl"] = getSipwareUrl() + window.$.trim(connectionid) + "/requests";
            requestData = createSoapRequestBody(id, "ActivateForConferenceRequest", {
                conferenceID:controlTags.conferenceID
            });
            window.$.ajax({
                type: REQUEST_TYPE_POST,
                url:  getUrl() + "/proxy",
                headers:headers,
                data: requestData,
                dataType : "text",
                success: function(val) {
                    webClientJoinCall();
                },
                error: function(x, e) {}
            });
        }
        function connectionIdCall(){
            window.$.ajax({
                type:REQUEST_TYPE_POST,
                url: getUrl() + "/proxy",
                headers:headers,
                dataType : "text",
                success: function(val) {
                    connectionid = val.split(': ')[1];
                    activateConferenceCall();
                },
                error: function(x, e) {}        
            });
        }
        connectionIdCall();
   };
};
var soapRequestHandler = new SoapRequestHandler();


var ConnectivityService = function() {

    var CONNECTION_URL = "/rest/version/latest/isAlive";

    this.checkConnectivity = function(onSuccess, onFailure) {
        server.sendGetRequest({
                    url: getUrl() + CONNECTION_URL + "?" + utils.getTimestamp()
                }, onSuccess,
                onFailure);
    };

};
var connectivityService = new ConnectivityService();

var ConnectivityManager = function() {
    var logger = logManager.getLogger("connectivityManager"),
            PRIORITY = 1,
            DEFAULT_INTERVAL_VALUE = 10000,
            isConnected = true, connectivityTimer,
            connectivityHandler = null;

    function stopCheckConnectivityTimer() {
        logger.info("check connectivity timer is stopped.");
        clearInterval(connectivityTimer);
    }

    function onCheckConnectivitySuccess() {
        if (!isConnected) {
            isConnected = true;
            setConnected(isConnected);
            logger.trace("Connectivity re-established...");
            globalBroadcaster.publish(CONSTANTS.EVENT.CONNECTION_REESTABLISHED);
        }
    }

    function onCheckConnectivityFailure() {
        if (isConnected) {
            isConnected = false;
            setConnected(isConnected);
            logger.trace("Connectivity is lost...");
            globalBroadcaster.publish(CONSTANTS.EVENT.CONNECTION_LOST);
        }
    }

    function checkConnectivity() {
        try {
            connectivityHandler();
        }
        catch (e) {
            logger.trace("Exception occured while executing connecitivy handler: ", e);
        }
        connectivityService.checkConnectivity(onCheckConnectivitySuccess, onCheckConnectivityFailure);
    }


    function initConnectivityCheck(message) {
        var intervalValue = DEFAULT_INTERVAL_VALUE,
                handler = message.connectivity ? message.connectivity.handler : null,
                interval = message.connectivity ? message.connectivity.interval : null;
        if (handler && typeof handler === 'function') {
            connectivityHandler = handler;
        }

        if (interval) {
            intervalValue = interval;
        }

        stopCheckConnectivityTimer();
        connectivityTimer = setInterval(checkConnectivity, intervalValue);
    }

    globalBroadcaster.subscribe(CONSTANTS.EVENT.DEVICE_SUBSCRIPTION_STARTED, initConnectivityCheck, PRIORITY);
    globalBroadcaster.subscribe(CONSTANTS.EVENT.DEVICE_SUBSCRIPTION_ENDED, stopCheckConnectivityTimer, PRIORITY);
    globalBroadcaster.subscribe(CONSTANTS.EVENT.XHR_REQUEST_NOT_INITIALIZED, onCheckConnectivityFailure, PRIORITY);

};
var connectivityManager = new ConnectivityManager();

var Notification = function() {

    /**

     * Called on receipt of a 410 GONE message

     *

     * @name fcs.notification.onGoneReceived

     * @event

     * 

     * @since 3.0.0

     * 

     * @example 

     * var goneReceived = function(data){

     *    // do something here

     * };

     * 

     * fcs.notification.onGoneReceived = goneReceived;

     */

    

    /**

     * Manages a user's subscriptions to remote notifications.  A user may subscribe to specific

     * event types (calls, instant messages, presence updates) using SNMP or long polling.

     *

     * Note that call/im/presence event handlers must be assigned in other objects before calling

     * notificationSubscribe/extendNotificationSubscription.

     *

     * @name notification

     * @namespace

     * @memberOf fcs

     * 

     * @version 3.0.0

     * @since 3.0.0

     *

     * @see fcs.config.notificationType

     * @see fcs.im.onReceived

     * @see fcs.call.onReceived

     * @see fcs.presence.onReceived

     *

     */



    /**

     * Enum for notification types.

     *

     * @name NotificationTypes

     * @property {string} LONGPOLLING Long polling type

     * @property {string} SNMP SNMP type

     * @property {string} WEBSOCKET WebSocket type

     * @readonly

     * @memberOf fcs.notification

     */

    

    /**

     * Boolean for anonymous users.

     * Used by rest requests to determine some parameters at URL and body).

     *

     * @name isAnonymous

     * @return isAnonymous true if the user is anonymous

     * @since 3.0.0

     * @memberOf fcs.notification

     */

    

    /**

     * Unsubscribe from getting notifications

     *

     * @name fcs.notification.stop

     * @param {function} onSuccess Success callback

     * @param {function} onFailure Failure callback

     * @param {boolean} synchronous Determines if the operation is sync or async

     * @function

     * @since 3.0.0

     * @example

     * fcs.notification.stop(

     * //Success callback

     * function(){

     *     window.console.log("Notification system is stopped successfully!!")

     * },

     * //Failure callback

     * function(){

     *     window.console.log("Something Wrong Here!!!")

     * },

     * // synchronous

     * false

     * );

     */

    

    /**

     * Subscribe and fetch the notifications <BR />

     * NOTE: Before subscribing, you have to set handlers for received notification. Only handlers registered before starting the notification will receive events.

     * @name fcs.notification.start

     * @param {function} onSuccess Success callback

     * @param {function} onFailure Failure callback

     * @param {boolean} anonymous Is this an anonymous

     * @param {string} cachePrefix Prefix of the cache key to be used (this allows for multiple subscriptions)

     * @param {string} forceLogout Kills the session of the oldest device.(For more information : User Guide Demo Examples in Api Doc ) 

     * @function

     * 

     * @since 3.0.0

     * 

     * @example

     * 

     * //Sets up connection and notification types

     * fcs.setup({

     *        "restUrl": "&lt;rest_url&gt;",

     *        "restPort": "rest_port",

     *        "websocketIP": "&lt;websocket_ip&gt;",

     *        "websocketPort": "&lt;websocket_port&gt;",

     *        "notificationType": "websocket",

     *        "callAuditTimer": "30000",

     *        "clientControlled" : true,

     *        "protocol" : "http"

     *});

     * 

     * // Login

     * // User must login SPiDR to be able to receive and make calls

     * // Login includes authentication and subscription steps. After logging in you can receive notifications

     * // Provide username and password to the setUserAuth method

     * var incomingCall,outgoingCall;

     * fcs.setUserAuth("user@somedomain.com","password");

     * fcs.notification.start(function(){

     *       //Initialize media

     *       fcs.call.initMedia(function(){},function(){},{

     *                 "pluginLogLevel" : 2,

     *                 "ice" : "STUN " + "stun:206.165.51.23:3478",

     *                 "videoContainer" : "",

     *                 "pluginMode" : "auto",

     *                 "iceserver" : "stun:206.165.51.23:3478"

     *             });

     *       fcs.call.onReceived = function(call) {

     *       //Handle incoming notifications here (incomingCall, callEnd, etc.)

     *       //window.alert("incoming call");

     *       //call.onStateChange(state);

     *       //call.onStreamAdded(streamURL);

     *       incomingCall=call;

     *     }

     * },

     * function(){

     * window.console.log("Something Wrong Here!!!")

     * },

     * false,false,false

     * );

     * 

     */

    

    /**

     * Sets the notification error handler.

     *

     * @name fcs.notification.setOnError

     * @param {function(error)} callback The failure callback to be called.

     * @function

     * @since 3.0.0

     */



    /**

     * Sets the notification success handler.

     *

     * @name fcs.notification.setOnSuccess

     * @param {function} callback The success callback to be called.

     * @function

     * @since 3.0.0

     */



    /**

     * Sets the connection lost handler.

     *

     * @name fcs.notification.setOnConnectionLost

     * @function

     * @since 3.0.0

     */

    

    /**

     * Sets the connection established handler.

     *

     * @name fcs.notification.setOnConnectionEstablished

     * @function

     * @since 3.0.0

     */

    

    /**

     * Will be used by external triggers to fetch notifications.

     *

     * @name fcs.notification.trigger

     * @function

     * @since 3.0.0

     * @example

     *

     * fcs.notification.start();

     *

     * //Native code received SNMP Trigger so retrieve the notification

     *

     * fcs.notification.trigger();

     *

     */

};



var NotificationParsers = {};

var NotificationCallBacks = {};
/*jslint regexp: false, sloppy: true */

var rtc, WebRTCAbstraction = function(){
    var logger = fcs.logManager.getLogger("webRTC"), logPrefix = "(WebRTC) ",
    NOTINITIALIZED = logPrefix + "not initialized", localStream = null, webRTCInitialized = false, 
    rtcPlugin = null, mediaAudio = true, mediaVideo = true, videoContainer = null, 
    stunturn = "", iceServerUrl = "", webrtcdtls = false, peerCount = 0,
    nl = "\n", lf = "\r", video = "video", audio = "audio", mLine = "m=", aLine = "a=", crypto = "crypto", 
    fingerprint = "fingerprint", typeOff = "offer", typeAns = "answer", typePreAns = "pranswer", nack = "nack", 
    pli = "pli", nackpli = nack + " " + pli, nativeVideoWidth = 320, nativeVideoHeight = 240, 
    pluginVideoWidth = 320, pluginVideoHeight = 240, defaultVideoContainer, localVideoContainer, 
    remoteVideoContainer, videoSourceAvailable = false, audioSourceAvailable = false,
    webrtcH264PluginVersion = {
        major:               "3",
        minor:               "0",

        min_revision:      "382",
        min_build:           "0",

        current_revision:  "403",
        current_build:       "0"
    },
    webrtc22PluginVersion = {
        major:               "2",
        minor:               "2",

        min_revision:      "408",
        min_build:           "0",

        current_revision:  "408",
        current_build:       "0"
    },
    webrtc21PluginVersion = {
        major:               "2",
        minor:               "1",

        min_revision:      "343",
        min_build:           "0",

        current_revision:  "376",
        current_build:       "0"
    },
    legacyPluginVersion = {
        major:               "1",
        minor:               "2",

        min_revision:      "290",
        min_build:           "0",

        current_revision:  "394",
        current_build:       "0"
    },
    legacyH264PluginVersion = {
        major:               "1",
        minor:               "3",

        min_revision:      "298",
        min_build:           "0",

        current_revision:  "402",
        current_build:       "0"
    },
    pluginid = "fcsPlugin",
    PluginModes = {
        WEBRTCH264: "webrtch264",   // 3.0 Enabler Plugin
        WEBRTC22:   "webrtc22",     // 2.2 Enabler Plugin
        WEBRTC21:   "webrtc21",     // 2.1 Enabler Plugin
        WEBRTC:     "webrtc",       // 2.1 Enabler Plugin
        LEGACY:     "legacy",       // 1.2 Disabler Plugin
        LEGACYH264: "legacyh264",   // 1.3 Disabler Plugin with H264
        AUTO:       "auto",         // Native For Chrome Browser and 2.1 Enabler Plugin for other Browsers
        AUTO21:     "auto21",       // Native For Chrome Browser and 2.1 Enabler Plugin for other Browsers
        AUTO22:     "auto22",       // Native For Chrome Browser and 2.1 Enabler Plugin for other Browsers
        AUTOH264:   "autoh264"      // Native For Chrome Browser and 3.0 Enabler Plugin for other Browsers
    },

    //**************************************************************************
    //Default plugin mode assignments - Start
    //**************************************************************************
    pluginMode = PluginModes.WEBRTC21,
    defaultRTCPluginMode = PluginModes.WEBRTC21,
    webrtcPluginVersion = webrtc21PluginVersion,
    //**************************************************************************
    //Default plugin mode assignments - End
    //**************************************************************************

    MediaStates = {
        NOT_FOUND: "notfound",
        SEND_RECEIVE: "sendrecv",
        SEND_ONLY: "sendonly",
        RECEIVE_ONLY: "recvonly",
        INACTIVE: "inactive"
    },
    RTCSignalingState = {
        STABLE: "stable",
        HAVE_LOCAL_OFFER: "have-local-offer",
        HAVE_REMOTE_OFFER: "have-remote-offer",
        HAVE_LOCAL_PRANSWER: "have-local-pranswer",
        HAVE_REMOTE_PRANSWER: "have-remote-pranswer",
        CLOSED: "closed"
    },
    ICEParams = {
        ICE_UFRAG : "ice-ufrag:",
        ICE_PWD : "ice-pwd:",
        NOT_FOUND : "Not found"
    };
               
    this.isVideoSourceAvailable = function() {
        return videoSourceAvailable;
    };
           
    this.isAudioSourceAvailable = function() {
        return audioSourceAvailable;
    };
      
    function checkMediaSourceAvailability(callback) {
        var i = 0, listOfNativeMediaStream = null;
        if (pluginMode !== PluginModes.AUTO) {
            // Checking plugin media source(camera and microphone) availability
            videoSourceAvailable = (rtcPlugin.getVideoDeviceNames().length > 0) ? true : false;
            audioSourceAvailable  = (rtcPlugin.getAudioOutDeviceNames().length > 0) ? true : false;
            utils.callFunctionIfExist(callback);             
        } else {
            // Checking native media source(camera and microphone) availability
            listOfNativeMediaStream = window.MediaStreamTrack;
            if (typeof listOfNativeMediaStream !== 'undefined'){            
                listOfNativeMediaStream.getSources(function(mediaSources) {
                    for (i = 0; i < mediaSources.length; i++) {
                        if (mediaSources[i].kind === video) {
                            // Video source is available such as webcam
                            videoSourceAvailable = true;
                        } else if (mediaSources[i].kind === audio) {
                            // audio source is available such as mic
                            audioSourceAvailable = true;
                        }   
                    }
                    utils.callFunctionIfExist(callback);                     
                });
            } 
        }                 
    }     
           
    function getGlobalSendVideo() {
        //TODO videoSourceAvailable param should be used and all SDP negotionation should be checked for the new param
        // Since getGlobalSendVideo() is used in all SDP negotionation, we will plan to change this method's implementation
        // in the future and test accordingly
        var globalSendVideo = true;
        //globalSendVideo = fcsConfig["videoSendEnabled"];
        return (mediaVideo && globalSendVideo);
    }
    
    /**
     * Sets call local stream video send status
     * @param {type} call
     * @param {type} status
     */
    function callSetLocalSendVideo(call,status) {
        logger.debug("callSetLocalSendVideo= " + status);
        if (call.call) {
            call.call.setSendVideo(status);
        }
        if (pluginMode !== PluginModes.AUTO) {
            call.peer.showLocalVideo = status;
        }
    }

    /**
     * Indicates call local stream video send status
     * @param {type} call
     * @returns true/false
     */
    function callCanLocalSendVideo(call) {
        return call.call.canSendVideo();
    }

    function setPluginLanguage(lang) {
        if (!lang) {
            lang = "en";
        }
        if(rtcPlugin) {
            rtcPlugin.language = lang;
        }
    }

    function getLocalAudioTrack(peer) {
        logger.debug("getLocalAudioTrack");
        var audioTracks;
        
        /*
         * ABE-832: On MAC OS, Safari browser version 6.1 doesn't recognize array 
         * indices of integer type. Therefore, all [0] calls are changed to ["0"].
         * All other browser types function correctly with both integer and string
         * indices.
         */
        
        if(peer.localStreams && peer.localStreams["0"].audioTracks) {
            if (peer.localStreams["0"].audioTracks.length > 0) {
                return peer.localStreams["0"].audioTracks["0"];
            }
        }
        else if (peer.getLocalStreams) {
            audioTracks = peer.getLocalStreams()["0"].getAudioTracks();
            if(audioTracks && audioTracks.length > 0) {
                return audioTracks["0"];
            }
        }
        
        return null;
    }

    function getLocalVideoTrack(peer) {
        logger.debug("getLocalVideoTrack");
        var streams;
        
        /*
         * ABE-832: On MAC OS, Safari browser version 6.1 doesn't recognize array 
         * indices of integer type. Therefore, all [0] calls are changed to ["0"].
         * All other browser types function correctly with both integer and string
         * indices.
         */
        
        if(peer.localStreams && peer.localStreams["0"].videoTracks) {
            if (peer.localStreams["0"].videoTracks.length > 0) {
                return peer.localStreams["0"].videoTracks["0"];
            }
        }
        else if (peer.getLocalStreams) {
            streams = peer.getLocalStreams();
            if(streams && streams["0"].getVideoTracks() && streams["0"].getVideoTracks().length > 0) {
                return streams["0"].getVideoTracks()["0"];
            }
        }
        
        return null;
    }
    
    function removeSdpLineContainingText (pSdp, containing_text) {
        var i,
        splitArray = pSdp.split(nl);

        pSdp = splitArray[0] + nl;
        for(i=1; i < splitArray.length-1; i++) {
            if(splitArray[i].indexOf(containing_text) !== -1) {
                logger.debug("removed line which contains " + containing_text);
            }
            else {
                pSdp += splitArray[i] + nl;
            }
        }
        return pSdp;
    }

    function getPayloadTypeOf(codecString,pSdp) {
        var splitArray, rtpmapArray, payloadTypeArray;
        
        if(pSdp.indexOf(codecString) === -1) {
            return 0;            
        }

        splitArray = pSdp.split(codecString);
        rtpmapArray = splitArray[0].split("a=rtpmap:");
        payloadTypeArray = rtpmapArray[rtpmapArray.length-1].split(" ");

        logger.debug("getPayloadTypeOf(" + codecString + ") = " + payloadTypeArray[0]);
        
        return payloadTypeArray[0];
    }
    
    function getVP8PayloadType(pSdp) {
        return getPayloadTypeOf("VP8/90000",pSdp);
    }
    
    function getG7228000PayloadType(pSdp) {
        return getPayloadTypeOf("G722/8000",pSdp);
    }
    
    function getG72216000PayloadType(pSdp) {
        return getPayloadTypeOf("G722/16000",pSdp);
    }
    
    function getH264PayloadType(pSdp) {
        return getPayloadTypeOf("H264/90000",pSdp);
    }
    
    function getRTXPayloadType(pSdp) {
        return getPayloadTypeOf("rtx/90000",pSdp);
    }
    
    function getTelephoneEventPayloadType(pSdp,rate) {
        return getPayloadTypeOf("telephone-event/" + rate,pSdp);
    }
    
    /**
     * performVP8RTCPParameterWorkaround: this function will handle missing VP8 RTCP params mostly observed in plugin configuration
     * It will do nothing and work correctly, when plugin webrtc base is upgraded to Chrome 37
     * check for "ccm fir".   If not exists, add "a=rtcp-fb:* ccm fir",
     * check for "nack pli".  If not exists, add "a=rtcp-fb:* nack pli",
     * check for "nack".      If not exists, add "a=rtcp-fb:* nack",
     * check for "goog-remb". If not exists, add "a=rtcp-fb:* goog-remb",
     */
    function performVP8RTCPParameterWorkaround (pSdp) {
        var splitArray, newSdp, tempSdp, vp8PayloadType;
        
        if(pSdp.indexOf("VP8/90000") === -1) {
            return pSdp;            
        }
        
        vp8PayloadType = getVP8PayloadType(pSdp);
        
        //if(pSdp.indexOf("a=rtcp-fb:" + vp8PayloadType + " ccm fir") !== -1) {
        //    pSdp = removeSdpLineContainingText(pSdp, "a=rtcp-fb:" + vp8PayloadType + " ccm fir");
        //}
        
        //if(pSdp.indexOf("a=rtcp-fb:" + vp8PayloadType + " nack pli") !== -1) {
        //    pSdp = removeSdpLineContainingText(pSdp, "a=rtcp-fb:" + vp8PayloadType + " nack pli");
        //}
        
        //if(pSdp.indexOf("a=rtcp-fb:" + vp8PayloadType + " nack") !== -1) {
        //    pSdp = removeSdpLineContainingText(pSdp, "a=rtcp-fb:" + vp8PayloadType + " nack");
        //}
        
        //if(pSdp.indexOf("a=rtcp-fb:" + vp8PayloadType + " goog-remb") !== -1) {
        //    pSdp = removeSdpLineContainingText(pSdp, "a=rtcp-fb:" + vp8PayloadType + " goog-remb");
        //}
        
        //if(pSdp.indexOf("red/90000") !== -1) {
        //    pSdp = removeSdpLineContainingText(pSdp, "red/90000");
        //}

        //if(pSdp.indexOf("ulpfec/90000") !== -1) {
        //    pSdp = removeSdpLineContainingText(pSdp, "ulpfec/90000");
        //}

        tempSdp = pSdp.replace("a=rtcp-fb:" + vp8PayloadType + " nack pli", 
                               "a=rtcp-fb:" + vp8PayloadType + " no_ack_pli");  //It will use to identify nack pli 
        
        tempSdp = tempSdp.replace("a=rtcp-fb:" + vp8PayloadType + " nack", 
                                  "a=rtcp-fb:" + vp8PayloadType + " none_ack");  //It will use to identify nack
        
        splitArray = pSdp.split("VP8/90000");
        
        if(splitArray.length <= 1){
            return pSdp;
        }
        
        newSdp = splitArray[0] + "VP8/90000";
        if(pSdp.indexOf("a=rtcp-fb:" + vp8PayloadType + " ccm fir") === -1) {
            logger.debug("performVP8RTCPParameterWorkaround : Adding a=rtcp-fb:" + vp8PayloadType + " ccm fir");
            newSdp = newSdp + "\r\na=rtcp-fb:" + vp8PayloadType + " ccm fir";
        }
        if(tempSdp.indexOf("a=rtcp-fb:" + vp8PayloadType + " no_ack_pli") === -1) {
            logger.debug("performVP8RTCPParameterWorkaround : Adding a=rtcp-fb:" + vp8PayloadType + " nack pli");
            newSdp = newSdp + "\r\na=rtcp-fb:" + vp8PayloadType + " nack pli";
        }
        if(tempSdp.indexOf("a=rtcp-fb:" + vp8PayloadType + " none_ack") === -1) {
            logger.debug("performVP8RTCPParameterWorkaround : Adding a=rtcp-fb:" + vp8PayloadType + " nack");
            newSdp = newSdp + "\r\na=rtcp-fb:" + vp8PayloadType + " nack";
        }
        if(pSdp.indexOf("a=rtcp-fb:" + vp8PayloadType + " goog-remb") === -1) {
            logger.debug("performVP8RTCPParameterWorkaround : Adding a=rtcp-fb:" + vp8PayloadType + " goog-remb");
            newSdp = newSdp + "\r\na=rtcp-fb:" + vp8PayloadType + " goog-remb";
        }

        pSdp = newSdp + splitArray[1];
        return pSdp;
    }
    
    /**
     * performVP8BandwidthWorkaround: this function will remove following lines which causes
     * webrtc failed to process error on Chrome Beta with PCC call. will be soon observed on Chrome stable.
     * check for "b=AS:0".        If exists, remove,
     */
    function performVP8BandwidthWorkaround (pSdp) {
        
        if(pSdp.indexOf("VP8/90000") === -1) {
            return pSdp;            
        }
        
        if(pSdp.indexOf("b=AS:0") !== -1) {
            logger.debug("performVP8BandwidthWorkaround : Removing b=AS:0");
            pSdp = removeSdpLineContainingText(pSdp, "b=AS:0");
        }
        
        return pSdp;
    }
    
    function performG722ParameterWorkaround (pSdp) {
        var g722PayloadType;
        
        if(pSdp.indexOf("G722/8000") === -1) {
            return pSdp;            
        }
        
        g722PayloadType = getG7228000PayloadType(pSdp);
        
        pSdp = pSdp.replace("a=rtpmap:" + g722PayloadType + " G722/8000", 
                            "a=rtpmap:" + g722PayloadType + " G722/16000"); 
        
        return pSdp;
    }
    
    /**
     * removeAudioCodec: removes given codec type from sdp.
     */
    function removeAudioCodec(pSdp, codecToRemove) {
        var sdp = "", substr = "", descriptions = [], index, reg = /\r\n|\r|\n/m, audio_arr, i, 
            new_substr = "", elm, regExpCodec;

        descriptions = pSdp.split(/^(?=m=)/m);
        for (index = 0; index < descriptions.length; index++) {
            substr = descriptions[index];
            if (substr.indexOf(mLine + audio) !== -1) {
                audio_arr = substr.split(reg);
                for (i = 0; i < audio_arr.length; i++) {
                    elm = audio_arr[i];
                    if (elm && elm.indexOf(mLine + audio) !== -1) {
                        // remove given audio codec from m=audio line
                        regExpCodec = new RegExp(" " + codecToRemove, "g");
                        elm = elm.replace(regExpCodec, "");
                        elm = elm + lf + nl;
                        // Workaround for issue 1603.
                    } else if (elm && elm.indexOf("a=fmtp:" + codecToRemove) !== -1) {
                        elm = elm.replace(/a=fmtp[\w\W]*/, "");
                    } else if (elm && elm.indexOf("a=rtpmap:" + codecToRemove) !== -1) {
                        elm = elm.replace(/a=rtpmap[\w\W]*/, "");
                    } else if (elm && elm.indexOf("a=rtcp-fb:" + codecToRemove) !== -1) {
                        elm = elm.replace(/a=rtcp-fb[\w\W]*/, "");
                    } else if (elm && elm !== "") {
                        elm = elm + lf + nl;
                    }
                    new_substr = new_substr + elm;
                }
                substr = new_substr;
            }
            sdp = sdp + substr;
        }
        return sdp;
    }

    /**
     * removeVideoCodec: removes given codec type from sdp.
     */
    function removeVideoCodec(pSdp, codecToRemove) {
        var sdp = "", substr = "", descriptions = [], index, reg = /\r\n|\r|\n/m, video_arr, i, 
            new_substr = "", elm, regExpCodec;

        descriptions = pSdp.split(/^(?=m=)/m);
        for (index = 0; index < descriptions.length; index++) {
            substr = descriptions[index];
            if (substr.indexOf(mLine + video) !== -1) {
                video_arr = substr.split(reg);
                for (i = 0; i < video_arr.length; i++) {
                    elm = video_arr[i];
                    if (elm && elm.indexOf(mLine + video) !== -1) {
                        // remove given video codec from m=video line
                        regExpCodec = new RegExp(" " + codecToRemove, "g");
                        elm = elm.replace(regExpCodec, "");
                        elm = elm + lf + nl;
                        // Workaround for issue 1603.
                    } else if (elm && elm.indexOf("a=fmtp:" + codecToRemove) !== -1) {
                        elm = elm.replace(/a=fmtp[\w\W]*/, "");
                    } else if (elm && elm.indexOf("a=rtpmap:" + codecToRemove) !== -1) {
                        elm = elm.replace(/a=rtpmap[\w\W]*/, "");
                    } else if (elm && elm.indexOf("a=rtcp-fb:" + codecToRemove) !== -1) {
                        elm = elm.replace(/a=rtcp-fb[\w\W]*/, "");
                    } else if (elm && elm !== "") {
                        elm = elm + lf + nl;
                    }
                    new_substr = new_substr + elm;
                }
                substr = new_substr;
            }
            sdp = sdp + substr;
        }
        return sdp;
    }

    /**
     * removeRTXCodec: this function will remove rtx video codec
     */
    function removeRTXCodec (pSdp) {
        var rtxPayloadType;
                
        if(pSdp.indexOf("rtx/90000") === -1) {
            return pSdp;            
        }
        
        rtxPayloadType = getRTXPayloadType(pSdp);
        
        logger.debug("removeRTXCodec : Removing rtx video codec " + rtxPayloadType);
        pSdp = removeVideoCodec(pSdp, rtxPayloadType);
        
        return pSdp;
    }
    
    /**
     * removeG722Codec: this function will remove G722 audio codec
     */
    function removeG722Codec (pSdp) {
        /* 
        Commented out for now. If it is required it can be opened 

        var g722PayloadType;
        
        if((pSdp.indexOf("G722/8000") === -1) || (pSdp.indexOf("G722/16000") === -1)) {
            return pSdp;            
        }
        
        g722PayloadType = getG7228000PayloadType(pSdp);
        
        logger.debug("removeG722Codec : Removing G722/8000 video codec " + g722PayloadType);
        pSdp = removeAudioCodec(pSdp, g722PayloadType);
        
        g722PayloadType = getG72216000PayloadType(pSdp);
        
        logger.debug("removeG722Codec : Removing G722/16000 video codec " + g722PayloadType);
        pSdp = removeAudioCodec(pSdp, g722PayloadType);
        */
       
        return pSdp;
    }
    
    /**
     * isVideoCodecsSupported: this function checks supported video codecs are listed in m=video line
     * Supported video codecs are :
     *      VP8     default supported codec
     *      H264    if plugin_mode is webrtch264 or legacyh264
     */
    function isVideoCodecsSupported (pSdp) {
        
        if(pSdp.indexOf("VP8/90000") !== -1) {
            return true;            
        }
        
        if(pluginMode === PluginModes.WEBRTCH264 ||
           pluginMode === PluginModes.LEGACYH264) {
            if(pSdp.indexOf("H264/90000") !== -1) {
                return true;            
            }
        }

        return false;
    }
    
    // Issue      : Meetme conference failed
    //              When video is sent in SDP with 1, hold scenario for meetme failed.
    function checkValidVideoPort(sdp) {
        var mediaSplit;

        if (sdp.indexOf(mLine + video + " 1 ", 0) !== -1) {
            mediaSplit = sdp.split(mLine + video);

            if (mediaSplit[1].indexOf("c=IN IP4 0.0.0.0") !== -1) {
                return false;
            }
        }
        return true;
    }
    
    // Issue      : Meetme conference failed due to a webrtc bug
    //              When video is sent in SDP with 0 without a=crypto line(SDES) in SDP,
    //              hold scenario for meetme failed.
    // Workaround : Add dummy a=crypto or a=fingerprint line to solve the issue with a workaround
    // Note       : fingerprint(DTLS enabled) may still fails on meetme. This is known issue as below:
    //              https://code.google.com/p/webrtc/issues/detail?id=2316
    //              Check with Chrome 37
    function addSdpMissingCryptoLine(sdp) {
        var mediaSplit, audioLines, cryptLine = null, reg = /\r\n|\r|\n/m, i;

        // If there is no "m=video 0" line, sdp should not be modified
        if (sdp.indexOf(mLine + video + " 0 ", 0) === -1) {
            return sdp;
        }
        
        mediaSplit = sdp.split(mLine + video);

        audioLines = mediaSplit[0].split(reg);
        for (i = 0; i < audioLines.length; i++) {
            if ((audioLines[i].indexOf(aLine + crypto) !== -1) || (audioLines[i].indexOf(aLine + fingerprint) !== -1)) {
                cryptLine = audioLines[i];
                break;
            }
        }

        if (cryptLine === null) {
            return sdp;
        }

        if (mediaSplit[0].indexOf(aLine + crypto) !== -1) {
            if (mediaSplit[1].indexOf(aLine + crypto, 0) === -1) {
                mediaSplit[1] += cryptLine + "\n";
                logger.debug("addSdpMissingCryptoLine : crypto line is added : " + cryptLine);
            }
        } else if (mediaSplit[0].indexOf(aLine + fingerprint, 0) !== -1) {
            if (mediaSplit[1].indexOf(aLine + fingerprint, 0) === -1) {
                //DTLS is enabled, even adding fingerprint line in SDP,
                //meetme scenario fails. This is known issue and followed
                //by webrtc for DTLS enabled scenarios :
                //https://code.google.com/p/webrtc/issues/detail?id=2316
                mediaSplit[1] += cryptLine + "\na=setup:passive\n";
                logger.debug("addSdpMissingCryptoLine : dtls lines are added : " + cryptLine + "and a=setup:passive");
                logger.debug("dtls enabled: known issue by webrtc may be fixed! Check it");
            }
        }
        sdp = mediaSplit.join(mLine + video);
        return sdp;
    }

    function clearSdpPli (pSdp) {
        if (pSdp.indexOf(nackpli) !== -1) {
            pSdp = pSdp.replace(nackpli, nack);
        }
        return pSdp;
    }

    /*
     * This is a transcoder bug that only happens on native webrtc.
     * We can remove it once it's fixed.
     * This function will remove one of the lines if there are two
     * concecutive same lines that contains "nack pli"
     * TODO tolga remove once this issue is fixed
     */
    function removeSdpPli (pSdp) {
        var i, splitArray = pSdp.split(nl);

        pSdp = splitArray[0] + nl;
        for(i=1; i < splitArray.length-1; i++) {
            if(splitArray[i-1] === splitArray[i] && splitArray[i].indexOf(nackpli) !== -1) {
                logger.debug("removed extra nack pli line");
            }
            else {
                pSdp += splitArray[i] + nl;
            }
        }
        return pSdp;
    }

    /**
     * Replaces new telephone event code in pSdp with the oldCode 
     * This is needed for WebRTC engine compatibility
     * If an offer has a different telephone event code than what is already negotiated in that session, webrtc engine gives error
     * Ex: Negotitation is firstly done with 126, but then the call server sends an offer with 96
     */
    function replaceTelephoneEventPayloadType(pSdp, oldCode, newCode) {
        var finalsdp, regex, matches, tempAudioLine, descriptions, index, substr, partialsdp = "", number = "";
        
        regex = /^\.*(a=rtpmap:)(\d*)( telephone-event[ \w+ ]*[ \/+ ]*[ \w+ ]*)\r\n?/m;
        
        /* example: matches= ["a=rtpmap:96 telephone-event/8000\r\n", "a=rtpmap:", "96", " telephone-event/8000"] */
        
        if (oldCode === newCode) { // telephone event has not changed
            // nothing has changed, return without any changes
            return pSdp;
        }
        
        // telephone event has changed
        finalsdp = pSdp;
        
        // replace rtpmap
        regex = new RegExp("^\\.*a=rtpmap:" + newCode + " telephone-event[ \\/+ ]*([ \\w+ ]*)\\r\n", "m");
        matches = finalsdp.match(regex);
        if (matches !== null && matches.length >= 2 && matches[1] !== "") {
            number = matches[1];
        } else {
            number = 8000;
        }
        finalsdp = finalsdp.replace(regex,'a=rtpmap:' + oldCode + ' telephone-event/' + number + '\r\n');
        
        // replace audio line
        regex = new RegExp("^\\.*(m=audio )[ \\w+ ]*[ \\/+ ]*[ \\w+ ]*( " + newCode + ")", "mg");
        matches = finalsdp.match(regex);
        
        if (matches !== null && matches.length >= 1 && matches[0] !== "") {
            tempAudioLine = matches[0];
            tempAudioLine = tempAudioLine.replace(newCode, oldCode);
            finalsdp = finalsdp.replace(regex, tempAudioLine);
        }
           
        // replace fmtp
        // only audio section needs to be considered, do not change video section
        descriptions = finalsdp.split(/^(?=m=)/m);
        for (index = 0; index < descriptions.length; index++) {
            substr = descriptions[index];
            if (substr.indexOf(mLine + audio) !== -1) {
                regex = new RegExp("^\\.*a=fmtp:" + newCode, "mg");
                substr = substr.replace(regex, 'a=fmtp:' + oldCode);
            }
            partialsdp = partialsdp + substr;
        }
        if (partialsdp !== "") {
            finalsdp = partialsdp;  
        }
        logger.debug("replaceTelephoneEventPayloadType: newcode " + newCode + " is replaced with oldcode " + oldCode);
        return finalsdp;    
    }

    function getTelephoneEventCode(pSdp, rate, oldCode) {
        var telephoneEventPayloadType;
            
        if(pSdp.indexOf("telephone-event/" + rate) !== -1) {
            telephoneEventPayloadType = getTelephoneEventPayloadType(pSdp,rate);
            if (!oldCode) {
                return telephoneEventPayloadType;
            } else {
                return oldCode;
            }
        }
        
        return null;
    }    

    /**
     * Replaces telephone event code in pSdp with the oldCode 
     * This is needed for WebRTC engine compatibility
     * Ex: Negotitation is firstly done with 126, but then the call server sends an offer with 96
     */
    function fixTelephoneEventPayloadType(pSdp, rate, oldCode) {
        var telephoneEventPayloadType, newSdp;
            
        if(pSdp.indexOf("telephone-event/" + rate) !== -1) {
            telephoneEventPayloadType = getTelephoneEventPayloadType(pSdp,rate);
            if (!oldCode) {
                oldCode = telephoneEventPayloadType;
            } else if (oldCode !== telephoneEventPayloadType) {
                newSdp = replaceTelephoneEventPayloadType(pSdp, 
                                                 oldCode, 
                                                 telephoneEventPayloadType);
                return newSdp;
            }
        }
        
        return pSdp;
    }    

    function fixLocalTelephoneEventPayloadType(call, pSdp) {
        var newSdp;

        call.localTelephoneEvent8000PayloadType = getTelephoneEventCode(pSdp, "8000", call.localTelephoneEvent8000PayloadType);
        call.localTelephoneEvent16000PayloadType = getTelephoneEventCode(pSdp, "16000", call.localTelephoneEvent16000PayloadType);

        newSdp = fixTelephoneEventPayloadType(pSdp, "8000", call.localTelephoneEvent8000PayloadType);
        newSdp = fixTelephoneEventPayloadType(newSdp, "16000", call.localTelephoneEvent16000PayloadType);
        
        return newSdp;
    }    
    
    function fixRemoteTelephoneEventPayloadType(call, pSdp) {
        var newSdp;

        call.remoteTelephoneEvent8000PayloadType = getTelephoneEventCode(pSdp, "8000", call.remoteTelephoneEvent8000PayloadType);
        call.remoteTelephoneEvent16000PayloadType = getTelephoneEventCode(pSdp, "16000", call.remoteTelephoneEvent16000PayloadType);

        newSdp = fixTelephoneEventPayloadType(pSdp, "8000", call.remoteTelephoneEvent8000PayloadType);
        newSdp = fixTelephoneEventPayloadType(newSdp, "16000", call.remoteTelephoneEvent16000PayloadType);

        return newSdp;
    }    
    
    /**
     * updateAudioCodec: removes opus and codec listed in config file from codec list. Required for DTMF until the bug is fixed.
     */
    function updateAudioCodec(pSdp) {
        var sdp = "", substr = "", descriptions = [], index, reg = /\r\n|\r|\n/m, audio_arr, i, new_substr = "", elm,
                remcodec, regExpCodec, codecsToRemove = [], j, remrtpmap;

        remrtpmap = "";
        descriptions = pSdp.split(/^(?=m=)/m);
        for (index = 0; index < descriptions.length; index++) {
            substr = descriptions[index];
            if (substr.indexOf(mLine + audio) !== -1) {
                audio_arr = substr.split(reg);
                for (i = 0; i < audio_arr.length; i++) {
                    elm = audio_arr[i];
                    if (elm && elm.indexOf(mLine + audio) !== -1) {
                        // remove audio codecs given in config file from m=audio line
                        codecsToRemove = fcsConfig.codecsToRemove;
                        if (codecsToRemove !== undefined) {
                            for (j = 0; j < codecsToRemove.length; j++) {
                                remcodec = codecsToRemove[j];
                                regExpCodec = new RegExp(" " + remcodec, "g");
                                elm = elm.replace(regExpCodec, "");

                                if (j !== 0) {
                                    remrtpmap = remrtpmap + "|";
                                }
                                remrtpmap = remrtpmap + remcodec;
                            }
                        }
                        // remove opus due to dtmf support problem, this is not tied to configuration
                        //elm = elm.replace(/ 111 /, " ");
                        elm = elm + lf + nl;
                        // Workaround for issue 1603.
                    } else if (elm && elm.indexOf("a=fmtp") !== -1) {
                        elm = elm.replace(/a=fmtp[\w\W]*/, "");
                    } else if (elm && elm !== "") {
                        elm = elm + lf + nl;
                    }
                    new_substr = new_substr + elm;
                }
                substr = new_substr;
            }
            sdp = sdp + substr;
        }
        // remove rtpmap of removed codecs
        if (remrtpmap !== "") {
            regExpCodec = new RegExp("a=rtpmap:(?:" + remrtpmap + ").*\r\n", "g");
            sdp = sdp.replace(regExpCodec, "");
        }
        return sdp;
    }

    /**
     * updateH264Level: adds h264 fmtp
     */
    function updateH264Level (pSdp) {
        var sdp = "", substr="",descriptions=[],index, reg = /\r\n|\r|\n/m, 
            video_arr, i, new_substr = "", elm, elm_array;

        descriptions= pSdp.split(/^(?=m=)/m);
        for(index=0;index<descriptions.length;index++){
            substr = descriptions[index];
            if(substr.indexOf(mLine + video) !== -1){
                video_arr = substr.split(reg);
                for(i=0;i<video_arr.length;i++){
                    elm = video_arr[i];
                    if (elm && elm.indexOf("a=rtpmap:") !== -1 && elm.indexOf("H264") !== -1) {
                        elm_array = elm.split(/\:| /m);
                        elm = elm + lf + nl;
                        if(pluginMode === PluginModes.WEBRTCH264) {
                            elm = elm + "a=fmtp:" + elm_array[1] + " profile-level-id=42000D"; //42000D
                            logger.debug("updateH264Level : Adding a=fmtp:" + elm_array[1] + " profile-level-id=42000D;");   //42000D
                        } else {
                            elm = elm + "a=fmtp:" + elm_array[1] + " profile-level-id=428014";
                            logger.debug("updateH264Level : Adding a=fmtp:" + elm_array[1] + " profile-level-id=428014;");
                        }
                        elm = elm + lf + nl;
                        // Workaround for issue 1603.
                    } else if (elm && elm !== "") {
                        elm = elm + lf + nl;
                    }
                    new_substr = new_substr + elm;
                }
                substr = new_substr;
            }
            sdp = sdp + substr;
        }
        return sdp;
    }

    function getICEParams(pSdp, type, isVideo) {
        var parse1, parse2, parse3, param;
 
        switch (type) {
            case ICEParams.ICE_UFRAG:
                parse1 = pSdp.split('a=ice-ufrag:');
                break; 
            case ICEParams.ICE_PWD:
                parse1 = pSdp.split('a=ice-pwd:');
                break;   
            default:
                return undefined;
        }

        if(isVideo){
            if(parse1[2] !== undefined) { /*"....a=ice-....a=ice-...."*/
                parse2 = parse1[2];
                parse3 = parse2.split('a=');
                param = parse3[0];
                return param; /*return video ice params*/    
            } else {
                return undefined;
            }   
        } else {
            if(parse1[1] !== undefined) { /*"....a=ice-....a=ice-...."*/
                parse2 = parse1[1];
                parse3 = parse2.split('a=');
                param = parse3[0];
                return param;     
            } else {
                return undefined;
            }              
        }
    }

    function updateICEParams(pSdp, type, new_value) {
        var sdp = "", subsdp = "", substr, index, num,
                parse1, parse2, parse3, param=null;
 
        switch(type)
        {
            case ICEParams.ICE_UFRAG:
                parse1 = pSdp.split('a=ice-ufrag:');
                break; 
            case ICEParams.ICE_PWD:
                parse1 = pSdp.split('a=ice-pwd:');
                break;   
            default: 
                return pSdp;
        }
                
        for (index = 0; index < parse1.length; index++) 
        {
            substr = parse1[index];
            if (index === 2) 
            {               
                parse2 = substr.split('a=');
                
                for (num = 0; num < parse2.length; num++) 
                {
                    parse3 = parse2[num];
                    if(num===0)
                    {    
                        parse2[num]= new_value;
                        subsdp = subsdp + parse2[num];
                    }else
                    {    
                        subsdp = subsdp + 'a=' + parse2[num];
                    }
                }               
                substr = subsdp;
                sdp = sdp + substr;
            }else
            {    
                sdp = sdp + substr + 'a=' + type;
            }
        }              
        return sdp;
    }

    function checkICEParams(pSdp, mediaType, type) {
	var parse1, parse2;
 
	parse1 = pSdp.split('m=video');
	if(parse1.length < 2){
		return 0;
	}

        switch (type) {
            case ICEParams.ICE_UFRAG:
                if(mediaType === "audio"){
			parse2 = parse1[0].split('a=ice-ufrag:');
		}else{
			parse2 = parse1[1].split('a=ice-ufrag:');
		}
                break; 
            case ICEParams.ICE_PWD:            
		if(mediaType === "audio"){
			parse2 = parse1[0].split('a=ice-pwd:');
		}else{
			parse2 = parse1[1].split('a=ice-pwd:');
		}
                break;			 
            default:
                return 0;
	}	
	
        return parse2.length;   
    }

    function restoreICEParams(pSdp, mediaType, type, new_value) {
        var sdp = "", substr, index, parse1;
 
        parse1 = pSdp.split('m=video');
	if(parse1.length < 2){
            return pSdp;
	}
                
        for (index = 0; index < parse1.length; index++) 
        {
            substr = parse1[index];
            if(index === 0) 
            {                                                
                if(mediaType === "audio"){
			substr = substr + 'a=' + type + new_value;
		}
		sdp = sdp + substr;
            } 
            if(index === 1) 
            {                                                
                if(mediaType === "video"){
			substr = substr + 'a=' + type + new_value;
		}
		sdp = sdp + 'm=video' + substr;
            }			
        }		
        return sdp;
    }

    function checkandRestoreICEParams(pSdp, oSdp) {
	var sdp = "", audioUFRAGParam, audioPWDParam, videoUFRAGParam, videoPWDParam, ice_ufrag, ice_pwd;
 
	sdp = pSdp;
        
        audioUFRAGParam = checkICEParams(sdp, "audio", ICEParams.ICE_UFRAG);
	if(audioUFRAGParam < 2){
            ice_ufrag = getICEParams(oSdp, ICEParams.ICE_UFRAG, false);
            if (ice_ufrag) {
                sdp = restoreICEParams(sdp, "audio", ICEParams.ICE_UFRAG, ice_ufrag);
            }
	}
	audioPWDParam = checkICEParams(sdp, "audio", ICEParams.ICE_PWD);
	if(audioPWDParam < 2){
            ice_pwd = getICEParams(oSdp, ICEParams.ICE_PWD, false);
            if (ice_pwd) {
                sdp = restoreICEParams(sdp, "audio", ICEParams.ICE_PWD, ice_pwd);
            }
	}
	videoUFRAGParam = checkICEParams(sdp, "video", ICEParams.ICE_UFRAG);
	if(videoUFRAGParam < 2){
            ice_ufrag = getICEParams(oSdp, ICEParams.ICE_UFRAG, false);
            if (ice_ufrag) {
                sdp = restoreICEParams(sdp, "video", ICEParams.ICE_UFRAG, ice_ufrag);
            }
	}
	videoPWDParam = checkICEParams(sdp, "video", ICEParams.ICE_PWD);
	if(videoPWDParam < 2){
            ice_pwd = getICEParams(oSdp, ICEParams.ICE_PWD, false);
            if (ice_pwd) {
                sdp = restoreICEParams(sdp, "video", ICEParams.ICE_PWD, ice_pwd);
            }
	} 
        return sdp;
    }

    /**
     * addVP8Codec: adds missing VP8 Codec 
     */
    function addVP8Codec (pSdp, offerSdp) {
        var sdp = "", substr="",descriptions=[],index, 
            reg = /\r\n|\r|\n/m, video_arr, i, new_substr = "", 
            vp8PayloadType, codecType, elm,
            videoUFRAGParam, videoPWDParam, ice_ufrag, ice_pwd;

        if(pSdp.indexOf("VP8/90000") !== -1) {
            return pSdp;            
        }
        
        descriptions= pSdp.split(/^(?=m=)/m);
        for(index=0;index<descriptions.length;index++){
            substr = descriptions[index];
            if(substr.indexOf(mLine + video) !== -1){
                if (offerSdp && 
                    offerSdp.indexOf(mLine + video) !== -1 &&
                    offerSdp.indexOf("VP8/90000") !== -1) {
                        vp8PayloadType = getVP8PayloadType(offerSdp);
                        if (substr.indexOf("a=rtpmap:" + vp8PayloadType) !== -1) {
                            removeSdpLineContainingText(substr,"a=rtpmap:" + vp8PayloadType);
                        }
                } else {
                    codecType = 100;
                    while (substr.indexOf("a=rtpmap:" + codecType) !== -1) {
                        codecType = codecType + 1;
                    }
                    vp8PayloadType = codecType;
                }
                video_arr = substr.split(reg);
                for(i=0;i<video_arr.length;i++){
                    elm = video_arr[i];
                    if (elm && elm.indexOf("m=video") !== -1) {
                        if (elm.indexOf(vp8PayloadType) === -1) {
                            elm = elm + " " + vp8PayloadType;
                        }
                        elm = elm  + lf + nl + "a=rtpmap:" + vp8PayloadType + " VP8/90000" + lf + nl;
                    } else if (elm && elm !== "") {
                        elm = elm + lf + nl;
                    }
                    new_substr = new_substr + elm;
                }
                substr = new_substr;
            }
            sdp = sdp + substr;
        }

        videoUFRAGParam = checkICEParams(sdp, "video", ICEParams.ICE_UFRAG);
	if(videoUFRAGParam < 2){
            ice_ufrag = getICEParams(sdp, ICEParams.ICE_UFRAG, false);
            if (ice_ufrag) {
                sdp = restoreICEParams(sdp, "video", ICEParams.ICE_UFRAG, ice_ufrag);
            }
	}
	videoPWDParam = checkICEParams(sdp, "video", ICEParams.ICE_PWD);
	if(videoPWDParam < 2){
            ice_pwd = getICEParams(sdp, ICEParams.ICE_PWD, false);
            if (ice_pwd) {
                sdp = restoreICEParams(sdp, "video", ICEParams.ICE_PWD, ice_pwd);
            }
	} 

        return performVP8RTCPParameterWorkaround(sdp);
    }

    function removeVideoDescription (pSdp) {
        var sdp = "", substr="", descriptions=[], index;

        descriptions= pSdp.split(/^(?=m=)/m);
        for(index=0;index<descriptions.length;index++){
            substr = descriptions[index];
            if(substr.indexOf(mLine + video) === -1){
                sdp = sdp + substr;
            } else {
                logger.debug("removeVideoDescription : m=video description removed");
            }
        }
        return sdp;
    }

    function getSdpDirectionLogging(pSdp, type, logging) {
        var substr = "", descriptions = [], index,
            direction = MediaStates.INACTIVE, logmsg;

        logmsg = function(state) {
            if (logging) {
                logger.debug("getSdpDirection: type= " + type + " state= " + state);
            }
        };

        if (!webRTCInitialized) {
            direction = MediaStates.NOT_FOUND;
            logmsg(direction);
            return direction;
        }

        if (pSdp.indexOf(mLine + type) === -1) {
            logmsg(direction);
            return direction;
        }

        if (pSdp.indexOf(mLine + type + " 0") !== -1) {
            logmsg(direction);
            return direction;
        }

        descriptions = pSdp.split(/^(?=m=)/m);
        for (index = 0; index < descriptions.length; index++) {
            substr = descriptions[index];
            if (substr.indexOf(mLine + type) !== -1) {
                if (substr.indexOf(aLine + MediaStates.SEND_RECEIVE) !== -1) {
                    direction = MediaStates.SEND_RECEIVE;
                    logmsg(direction);
                    return direction;
                } else if (substr.indexOf(aLine + MediaStates.SEND_ONLY) !== -1) {
                    direction = MediaStates.SEND_ONLY;
                    logmsg(direction);
                    return direction;
                } else if (substr.indexOf(aLine + MediaStates.RECEIVE_ONLY) !== -1) {
                    direction = MediaStates.RECEIVE_ONLY;
                    logmsg(direction);
                    return direction;
                } else if (substr.indexOf(aLine + MediaStates.INACTIVE) !== -1) {
                    logmsg(direction);
                    return direction;
                }
                direction = MediaStates.SEND_RECEIVE;
                return direction;
            }
        }
        direction = MediaStates.NOT_FOUND;
        logmsg(direction);
        return direction;
    }

    /**
     * getSdpDirection for type:audio or video
     */
    function getSdpDirection(pSdp, type) {
       return getSdpDirectionLogging(pSdp, type, true);
    }

    function changeDirection(pSdp, directionBefore, directionAfter, type) {
        var sdp = "", substr, descriptions = [], index,
            msg = logPrefix + "changeDirection: before= " + directionBefore + " after= " + directionAfter;

        if (directionBefore === directionAfter) {
            //no need to change direction
            return pSdp;
        }

        if (type === undefined || type === null) {
            logger.debug(msg + " for all media types");
        } else if (directionBefore !== getSdpDirectionLogging(pSdp, type, false)) {
            //Ignore changing the direction if the "directionBefore" and existing directions do not match
            return pSdp;
        } else {
            logger.debug(msg + " type= " + type);
        }

        descriptions = pSdp.split(/^(?=m=)/m);
        for (index = 0; index < descriptions.length; index++) {
            substr = descriptions[index];
            if (type === undefined || type === null || substr.indexOf(mLine + type) !== -1) {
                substr = substr.replace(aLine + directionBefore, aLine + directionAfter);
            }
            sdp = sdp + substr;
        }

        return sdp;
    }

    /**
     * updateSdpDirection for type:audio or video
     */
    function updateSdpDirection(pSdp, type, direction) {
        logger.debug("updateSdpDirection: type= " + type + " direction= " + direction);
        var beforeDirection = getSdpDirectionLogging(pSdp, type, false);
        return changeDirection(pSdp, beforeDirection, direction, type);
    }

    /**
     * escalateSdpDirection for type:audio or video
     */
    function escalateSdpDirection(pSdp, type) {
        var direction = getSdpDirectionLogging(pSdp, type, false);
        logger.debug("escalateSdpDirection: type= " + type + " direction= " + direction);
        if (direction === MediaStates.RECEIVE_ONLY) {
            return changeDirection(pSdp, direction, MediaStates.SEND_RECEIVE, type);
        } else if (direction === MediaStates.INACTIVE) {
            return changeDirection(pSdp, direction, MediaStates.SEND_ONLY, type);
        }
        return pSdp;
    }

   /**
     * deescalateSdpDirection for type:audio or video
     */
    function deescalateSdpDirection(pSdp, type) {
        var direction = getSdpDirectionLogging(pSdp, type, false);
        logger.debug("deescalateSdpDirection: type= " + type + " direction= " + direction);
        if (direction === MediaStates.SEND_RECEIVE) {
            return changeDirection(pSdp, direction, MediaStates.RECEIVE_ONLY, type);
        } else if (direction === MediaStates.SEND_ONLY) {
            return changeDirection(pSdp, direction, MediaStates.INACTIVE, type);
        }
        return pSdp;
    }

    /**
     * enableAudio
     */
    function enableAudio (pSdp, enable) {
        if (!webRTCInitialized) {
            return;
        }

        if (pluginMode === PluginModes.LEGACY || 
            pluginMode === PluginModes.LEGACYH264) {
                if (enable) {
                    pSdp.audioPort = 1;
                } else {
                    pSdp.audioPort = 0;
                }
        }
    }

    /**
     * enableVideo
     */
    function enableVideo (pSdp, enable){
        if (!webRTCInitialized) {
            return;
        }

        if (pluginMode === PluginModes.LEGACY || 
            pluginMode === PluginModes.LEGACYH264) {
                if (enable) {
                    pSdp.videoPort = 1;
                } else {
                    pSdp.videoPort = 0;
                }
        }
    }

    /**
     * getSdpFromObject
     * There is a webrtc bug in Plugin. 
     * sendrecv direction changed to recvonly for offer type sdps
     * This function is the workaround solution to get the correct sdp from the object
     * until webrtc bug in plugin is fixed.
     */
    function getSdpFromObject (oSdp) {
        var sdp;

        if (!webRTCInitialized) {
            logger.debug("Plugin is not installed");
            return;
        }
        
        if (pluginMode === PluginModes.AUTO) {
            return oSdp.sdp;
        }

        sdp = oSdp.sdp;
        
        sdp = updateSdpDirection(sdp, audio, oSdp.audioDirection);
        sdp = updateSdpDirection(sdp, video, oSdp.videoDirection);
        
        return sdp;
    }

    /**
     * webRTCSdp
     */
    function webRTCSdp (type, pSdp) {
        
        if (!webRTCInitialized) {
            logger.debug("Plugin is not installed");
            return;
        }

        return rtcPlugin.createSessionDescription(type, pSdp);
    }

    /**
     * nativeWebRTCSdp
     */
    function nativeWebRTCSdp (type, pSdp) {

        if (!webRTCInitialized) {
            return null;
        }

        return new window.RTCSessionDescription({"type":type, "sdp":pSdp});
    }

    /**
     * updateSdpVideoPort
     */
    function updateSdpVideoPort(pSdp, status) {
        var r_sdp, port_text;

        logger.debug("updateSdpVideoPort: status= " + status);
        
        r_sdp = pSdp;

        if (status) {
            port_text = mLine + video + " 1";
        }
        else {
            port_text = mLine + video + " 0";
            r_sdp = updateSdpDirection(r_sdp, video, MediaStates.INACTIVE);
        }
        
        if (r_sdp.indexOf(mLine + video) !== -1) {
            r_sdp = r_sdp.replace(/m=video [0-9]+/, port_text);
        }

        return r_sdp;
    }

    /**
     * deleteCryptoFromSdp - delete crypto from the sdp, use it when dtls is enabled
     */
    function deleteCryptoFromSdp(sdp) {
        while (sdp.indexOf("a=crypto") !== -1) {
            sdp = sdp.replace(/(a=crypto:[\w\W]*?(:\r|\n))/, "");
        }
        return sdp;
    }

    /**
     * setMediaActPass - use it to adjust offer sdp
     */
    function setMediaActPass(sdp) {
        logger.debug("setMediaActPass: ");
        while (sdp.indexOf("a=setup:active") !== -1) {
            logger.debug("a=setup:active to a=setup:actpass");
            sdp = sdp.replace("a=setup:active", "a=setup:actpass");
        }
        while (sdp.indexOf("a=setup:passive") !== -1) {
            logger.debug("a=setup:passive to a=setup:actpass");
            sdp = sdp.replace("a=setup:passive", "a=setup:actpass");
        }
        return sdp;
    }

    /**
     * setMediaPassive - use it to adjust answer sdp
     */
    function setMediaPassive(sdp) {
        logger.debug("setMediaPassive: ");
        while (sdp.indexOf("a=setup:actpass") !== -1) {
            logger.debug("a=setup:actpass to a=setup:passive");
            sdp = sdp.replace("a=setup:actpass", "a=setup:passive");
        }
        return sdp;
    }

    /**
     * isSdpHas for type:audio or video
     */
    function isSdpHas(pSdp, type) {
        var msg = logPrefix + "isSdpHas for type " + type + ": ", result=false;
        if (!webRTCInitialized) {
            return result;
        }

        if (pSdp.indexOf(mLine + type) !== -1) {
            result = true;
            logger.debug(msg + result);
            return result;
        }

        logger.debug(msg + result);
        return result;
    }

    /**
     * isSdpEnabled for type:audio or video 
     */
    function isSdpEnabled(pSdp, type) {
        var direction, msg = logPrefix + "isSdpEnabled for type " + type + ": ", result=false;

        if (!webRTCInitialized) {
            return result;
        }

        if (pSdp.indexOf(mLine + type) === -1) {
            logger.debug(msg + result);
            return result;
        }

        if (pSdp.indexOf(mLine + type + " 0") !== -1) {
            logger.debug(msg + result);
            return result;
        }

        direction = getSdpDirectionLogging(pSdp, type, false);
        if (direction === MediaStates.INACTIVE) {
            logger.debug(msg + result);
            return result;
        }
        
        result = true;
        logger.debug(msg + result);
        return result;
    }

    /**
     * isSdpVideoReceiveEnabled
     */
    function isSdpVideoReceiveEnabled(pSdp) {
        var direction, 
            msg = logPrefix + "isSdpVideoReceiveEnabled: ", 
            result = false;

        if (!isSdpEnabled(pSdp, video)) {
            logger.debug(msg + result);
            return result;
        }

        direction = getSdpDirectionLogging(pSdp, video, false);
        if (direction === MediaStates.SEND_RECEIVE ||
            direction === MediaStates.RECEIVE_ONLY) {
            result = true;
            logger.debug(msg + result);
            return result;
        }

        logger.debug(msg + result);
        return result;
    }

    /**
     * isSdpVideoSendEnabled
     */
    function isSdpVideoSendEnabled(pSdp) {
        var direction, 
            msg = logPrefix + "isSdpVideoSendEnabled: ", 
            result = false;

        if (!isSdpEnabled(pSdp, video)) {
            logger.debug(msg + result);
            return result;
        }

        direction = getSdpDirectionLogging(pSdp, video, false);
        if (direction === MediaStates.SEND_RECEIVE ||
            direction === MediaStates.SEND_ONLY) {
            result = true;
            logger.debug(msg + result);
            return result;
        }

        logger.debug(msg + result);
        return result;
    }

    // TODO: Optimize and refactor this method
    // setReceiveVideo = setReceiveRemoteVideo = setShowRemoteVideoContainer
    // setReceivingVideo = setSendLocalVideo = setShowLocalVideoContainer
    function callSetReceiveVideo(call) {
        var status = getSdpDirectionLogging(call.sdp, video, false);
        logger.debug("callSetReceiveVideo: status= " + status);
//        if (status === MediaStates.RECEIVE_ONLY) {
//            call.call.setReceiveVideo(false);
//            call.call.setReceivingVideo(true);
//        } else if (status === MediaStates.SEND_ONLY) {
//            call.call.setReceiveVideo(true);
//            call.call.setReceivingVideo(false);
//        } else if (status === MediaStates.SEND_RECEIVE) {
//            call.call.setReceiveVideo(true);
//            call.call.setReceivingVideo(true);
//        } else {
//            call.call.setReceiveVideo(false);
//            call.call.setReceivingVideo(false);
//        }
        call.call.setReceiveVideo(isSdpVideoSendEnabled(call.sdp, video));
        call.call.setReceivingVideo(isSdpVideoReceiveEnabled(call.sdp, video));
    }

    function isIceLite (pSdp) {
        if(pSdp.indexOf("a=ice-lite") !== -1) {
            return true;
        }

        return false;
    }

    function newMLineCheck(rSdp, lSdp) {
        var remoteSdp = rSdp.match(/m=/g),
        localSdp = lSdp.match(/m=/g);

        return remoteSdp.length === localSdp.length;
    }

    /**
     * performVideoPortZeroWorkaround - apply this when term side sends an answer with video port 0
     */
    function performVideoPortZeroWorkaround(pSdp) {
        var arr, newSdp;
        
        if (pSdp.indexOf(mLine + video + " 0 ", 0) === -1) {
            return pSdp;
        }

        // Meetme workaround
        newSdp = addSdpMissingCryptoLine (pSdp);
        
        arr = newSdp.split(mLine + video + " 0 ");
        newSdp = arr.join(mLine + video + " 1 ");
        
        //chrome38 fix
        newSdp = updateSdpDirection(newSdp, video, MediaStates.INACTIVE);
        
        return newSdp;
    }

    function removeAllVideoCodecs(pSdp) {
        var regex, matches, codecs, newSdp, index;
        
        regex = new RegExp("^\\.*(m=video )(\\d*)( RTP/SAVPF )([ \\w+ ]*[ \\/+ ]*[ \\w+ ])\\r\n", "m");

        newSdp = pSdp;
        matches = newSdp.match(regex);
        
        if (matches !== null && matches.length >= 5 && matches[0] !== "") {
            codecs = matches[4].split(" ");
            for (index = 0; index < codecs.length; index++) {
                logger.debug("codec[" + index + "] : " + codecs[index]);
                newSdp = removeVideoCodec(newSdp, codecs[index]);
            }
        }
        
        return newSdp;
    }

    /**
     * checkSupportedVideoCodecs 
     * 
     * checks video codec support status and remove video m-line if no supported video codec is available
     */
    function checkSupportedVideoCodecs(pSdp, localOfferSdp) {
        var newSdp;
        if (isVideoCodecsSupported(pSdp)) {
            return pSdp;
        } else {
            if (localOfferSdp) {
                newSdp = removeAllVideoCodecs(pSdp);
                newSdp = addVP8Codec(newSdp, localOfferSdp);
                newSdp = updateSdpVideoPort(newSdp, false);
                newSdp = performVideoPortZeroWorkaround(newSdp);
            } else {
                //*******************************************************
                //Changing video port to 0 when there is no supported  
                //video codecs is not working in webrtc library
                //*******************************************************
                if (pSdp.indexOf("VP8/90000") === -1) {
                    if (pSdp.indexOf(mLine + video + " 0 ", 0) !== -1) {
                        newSdp = addVP8Codec(pSdp, newSdp);
                    } else {
                        newSdp = removeVideoDescription(pSdp);  //this is required for PCC and meetme with video
                    }
                } else {
                    newSdp = removeVideoDescription(pSdp);      //this is required for PCC and meetme with video
                }
            }

            return newSdp;
        }
    }

    function fireOnStreamAddedEvent(call, streamUrl) {
        if (call && call.call && call.call.onStreamAdded) {
            callSetReceiveVideo(call);
            utils.callFunctionIfExist(call.call.onStreamAdded, streamUrl);
        }
    }

    /**
     * performEnablerOrigAudioWorkaround - orig side can't hear audio when term side didn't start with video
     */
    function performEnablerOrigAudioWorkaround(call, onSuccess, onFail) {
        logger.debug("Enabler workaround for orig side to hear audio");

        if (webrtcdtls) {
            call.sdp = setMediaPassive(call.sdp);
        }

        call.peer.setRemoteDescription(webRTCSdp(typeAns, call.sdp), function() {
                logger.debug("performEnablerOrigAudioWorkaround: setRemoteDescription success");
                utils.callFunctionIfExist(onSuccess);
            }, function(e) {
                logger.debug("performEnablerOrigAudioWorkaround: setRemoteDescription failed: " + e);
                utils.callFunctionIfExist(onFail);
            }
        );
    }

    /**
     * performNativeOrigAudioWorkaround - orig side can't hear audio when term side didn't start with video
     */
    function performNativeOrigAudioWorkaround(call, onSuccess, onFail) {
        logger.debug("Native workaround for orig side to hear audio");

        if (webrtcdtls) {
            call.sdp = setMediaPassive(call.sdp);
        }

        call.peer.setRemoteDescription(nativeWebRTCSdp(typeAns, call.sdp), function() {
                logger.debug("performNativeOrigAudioWorkaround: setRemoteDescription success");
                utils.callFunctionIfExist(onSuccess);
            }, function(e) {
                logger.debug("performNativeOrigAudioWorkaround: setRemoteDescription failed: " + e);
                utils.callFunctionIfExist(onFail);
            }
        );
    }

    /**
     * restoreEnablerActualSdp - local and remote sdp's were manipulated to play audio. restore them here.
     */
    function restoreEnablerActualSdp(call, onSuccess, onFail, localVideoDirection, remoteVideoDirection) {
        logger.debug("Enabler restore manipulated local and remote sdp's");
        var newLocalSdp = getSdpFromObject(call.peer.localDescription);
        newLocalSdp = updateSdpDirection(newLocalSdp, video, localVideoDirection);

        if (webrtcdtls) {
            newLocalSdp = setMediaActPass(newLocalSdp);
            call.sdp = setMediaPassive(call.sdp);
        }
        
        newLocalSdp = fixLocalTelephoneEventPayloadType(call, newLocalSdp);

        // set local sdp with original direction
        call.peer.setLocalDescription(webRTCSdp(typeOff, newLocalSdp), function() {
            logger.debug("restoreEnablerActualSdp: setLocalDescription success");
            // restore actual remote sdp
            call.sdp = changeDirection(call.sdp, MediaStates.SEND_ONLY, remoteVideoDirection, video);
            call.sdp = changeDirection(call.sdp, MediaStates.SEND_ONLY, MediaStates.SEND_RECEIVE, video);
            
            // this is required just before setRemoteDescription
            callSetReceiveVideo(call);

            call.peer.setRemoteDescription(webRTCSdp(typeAns, call.sdp), function() {
                logger.debug("restoreEnablerActualSdp: setRemoteDescription success");
                utils.callFunctionIfExist(onSuccess);
            }, function(e) {
                logger.debug("restoreEnablerActualSdp: setRemoteDescription failed: " + e);
                utils.callFunctionIfExist(onFail);
            });
        }, function(e) {
            logger.debug("restoreEnablerActualSdp: setLocalDescription failed: " + e);
            utils.callFunctionIfExist(onFail);
        });
    }

    /**
     * restoreNativeActualSdp - local and remote sdp's were manipulated to play audio. restore them here.
     */
    function restoreNativeActualSdp(call, onSuccess, onFail, localVideoDirection, remoteVideoDirection) {
        logger.debug("Native restore manipulated local and remote sdp's");
        var newLocalSdp = call.peer.localDescription.sdp;
        newLocalSdp = updateSdpDirection(newLocalSdp, video, localVideoDirection);

        if (webrtcdtls) {
            newLocalSdp = setMediaActPass(newLocalSdp);
            call.sdp = setMediaPassive(call.sdp);
        }
        
        newLocalSdp = fixLocalTelephoneEventPayloadType(call, newLocalSdp);

        // set local sdp with original direction
        call.peer.setLocalDescription(nativeWebRTCSdp(typeOff, newLocalSdp), function() {
            logger.debug("restoreNativeActualSdp: setLocalDescription success");
            // restore actual remote sdp
            call.sdp = changeDirection(call.sdp, MediaStates.SEND_ONLY, remoteVideoDirection, video);
            call.sdp = changeDirection(call.sdp, MediaStates.SEND_ONLY, MediaStates.SEND_RECEIVE, video);
            
            // this is required just before setRemoteDescription
            callSetReceiveVideo(call);

            call.peer.setRemoteDescription(nativeWebRTCSdp(typeAns, call.sdp), function() {
                logger.debug("restoreNativeActualSdp: setRemoteDescription success");
                utils.callFunctionIfExist(onSuccess);
            }, function(e) {
                logger.debug("restoreNativeActualSdp: setRemoteDescription failed: " + e);
                utils.callFunctionIfExist(onFail);
            });
        }, function(e) {
            logger.debug("restoreNativeActualSdp: setLocalDescription failed: " + e);
            utils.callFunctionIfExist(onFail);
        });
    }

    /**
     * performEnablerVideoStartWorkaround - term side cannot see orig's video
     */
    function performEnablerVideoStartWorkaround(call, onSuccess, onFail) {
        var peer = call.peer, remoteAudioState, remoteVideoState;
    
        logger.debug("Enabler workaround to play video");

        call.sdp = checkandRestoreICEParams(call.sdp, call.sdp);
        call.sdp = addSdpMissingCryptoLine(call.sdp);

        remoteAudioState = getSdpDirectionLogging(call.sdp, audio, false);
        remoteVideoState = getSdpDirectionLogging(call.sdp, video, false);

        call.sdp = updateSdpDirection(call.sdp, audio, MediaStates.INACTIVE);
        call.sdp = updateSdpDirection(call.sdp, video, MediaStates.INACTIVE);

        if (webrtcdtls) {
            call.sdp = setMediaActPass(call.sdp);
        }
            
        peer.setRemoteDescription(webRTCSdp(typeOff, call.sdp), function() {
            logger.debug("performEnablerVideoStartWorkaround: first setRemoteDescription success");

            // restore original values
            call.sdp = updateSdpDirection(call.sdp, audio, remoteAudioState);
            call.sdp = updateSdpDirection(call.sdp, video, remoteVideoState);

            peer.setRemoteDescription(webRTCSdp(typeOff, call.sdp), function() {
                logger.debug("performEnablerVideoStartWorkaround: second setRemoteDescription success");
                peer.createAnswer(peer.remoteDescription,function(obj) {
                    var localSdp = getSdpFromObject(obj);
                    
                    if (getSdpDirectionLogging(call.sdp, audio, false) === MediaStates.INACTIVE) {
                        localSdp = updateSdpDirection(localSdp, audio, MediaStates.INACTIVE);
                    }

                    if (call.remoteVideoState === MediaStates.INACTIVE) {
                        localSdp = updateSdpDirection(localSdp, video, MediaStates.INACTIVE);
                    } else if (callCanLocalSendVideo(call)) {
                        localSdp = updateSdpDirection(localSdp, video, MediaStates.SEND_RECEIVE);
                    } else {
                        localSdp = updateSdpDirection(localSdp, video, MediaStates.RECEIVE_ONLY);
                    }

                    localSdp = performVP8RTCPParameterWorkaround(localSdp);
                    fireOnStreamAddedEvent(call);
                    
                    localSdp = checkandRestoreICEParams(localSdp, call.sdp);

                    if (webrtcdtls) {
                        localSdp = setMediaPassive(localSdp);
                    }

                    localSdp = fixLocalTelephoneEventPayloadType(call, localSdp);

                    peer.setLocalDescription(webRTCSdp(typeAns, localSdp), function() {
                        logger.debug("performEnablerVideoStartWorkaround: setlocalDescription success");
                        onSuccess();
                    }, function(e) {
                        logger.debug("performEnablerVideoStartWorkaround: setlocalDescription failed!!" + e);
                        onFail(logPrefix + "performEnablerVideoStartWorkaround: setlocalDescription failed!!");
                    });
                }, function(e) {
                    logger.debug("performEnablerVideoStartWorkaround: createAnswer failed!! " + e);
                    onFail(logPrefix + "Session cannot be created");
                }, {
                    'mandatory': {
                        'OfferToReceiveAudio': mediaAudio,
                        'OfferToReceiveVideo': getGlobalSendVideo()
                    }
                });
            }, function(e) {
                logger.debug("performEnablerVideoStartWorkaround: first setRemoteDescription failed!!" + e);
                onFail(logPrefix + "performEnablerVideoStartWorkaround: first setRemoteDescription failed!!");
            });
        }, function(e) {
            logger.debug("performEnablerVideoStartWorkaround: second setRemoteDescription failed!!" + e);
            onFail(logPrefix + "performEnablerVideoStartWorkaround: second setRemoteDescription failed!!");
        });
    }

    /**
     * performNativeVideoStartWorkaround - term side cannot see orig's video
     */
    function performNativeVideoStartWorkaround(call, onSuccess, onFail) {
        var peer = call.peer, remoteAudioState, remoteVideoState;
        
        logger.debug("Native workaround to play video");
        
        call.sdp = checkandRestoreICEParams(call.sdp, call.sdp);
        call.sdp = addSdpMissingCryptoLine(call.sdp);

        remoteAudioState = getSdpDirection(call.sdp, audio);
        remoteVideoState = getSdpDirection(call.sdp, video);

        call.sdp = updateSdpDirection(call.sdp, audio, MediaStates.INACTIVE);
        call.sdp = updateSdpDirection(call.sdp, video, MediaStates.INACTIVE);

        if (webrtcdtls) {
            call.sdp = setMediaActPass(call.sdp);
        }
            
        peer.setRemoteDescription(nativeWebRTCSdp(typeOff, call.sdp), function() {
            logger.debug("performNativeVideoStartWorkaround: first setRemoteDescription success");

            // restore original values
            call.sdp = updateSdpDirection(call.sdp, audio, remoteAudioState);
            call.sdp = updateSdpDirection(call.sdp, video, remoteVideoState);

            peer.setRemoteDescription(nativeWebRTCSdp(typeOff, call.sdp), function() {
                logger.debug("performNativeVideoStartWorkaround: second setRemoteDescription success");
                peer.createAnswer(function(obj) {
                    if (getSdpDirectionLogging(call.sdp, audio, false) === MediaStates.INACTIVE) {
                        obj.sdp = updateSdpDirection(obj.sdp, audio, MediaStates.INACTIVE);
                    }

                    if (call.remoteVideoState === MediaStates.INACTIVE) {
                        obj.sdp = updateSdpDirection(obj.sdp, video, MediaStates.INACTIVE);
                    } else if (callCanLocalSendVideo(call)) {
                        obj.sdp = updateSdpDirection(obj.sdp, video, MediaStates.SEND_RECEIVE);
                    } else {
                        obj.sdp = updateSdpDirection(obj.sdp, video, MediaStates.RECEIVE_ONLY);
                    }

                    obj.sdp = performVP8RTCPParameterWorkaround(obj.sdp);
                    fireOnStreamAddedEvent(call);
                    
                    obj.sdp = checkandRestoreICEParams(obj.sdp, call.sdp);

                    if (webrtcdtls) {
                        obj.sdp = setMediaPassive(obj.sdp);
                    }

                    obj.sdp = fixLocalTelephoneEventPayloadType(call, obj.sdp);

                    peer.setLocalDescription(nativeWebRTCSdp(typeAns, obj.sdp), function() {
                        logger.debug("performNativeVideoStartWorkaround: setlocalDescription success");
                        onSuccess();
                    }, function(e) {
                        logger.debug("performNativeVideoStartWorkaround: setlocalDescription failed!!" + e);
                        onFail(logPrefix + "performNativeVideoStartWorkaround: setlocalDescription failed!!");
                    });
                }, function(e) {
                    logger.debug("performNativeVideoStartWorkaround: createAnswer failed!! " + e);
                    onFail(logPrefix + "Session cannot be created");
                }, {
                    'mandatory': {
                        'OfferToReceiveAudio': mediaAudio,
                        'OfferToReceiveVideo': getGlobalSendVideo()
                    }
                });
            }, function(e) {
                logger.debug("performNativeVideoStartWorkaround: first setRemoteDescription failed!!" + e);
                onFail(logPrefix + "performNativeVideoStartWorkaround: first setRemoteDescription failed!!");
            });
        }, function(e) {
            logger.debug("performNativeVideoStartWorkaround: second setRemoteDescription failed!!" + e);
            onFail(logPrefix + "performNativeVideoStartWorkaround: second setRemoteDescription failed!!");
        });
    }

    /**
     * Add Candidates
     */

    function addCandidates (call) {
        var ma_indx, mv_indx, ma_str = "", mv_str = "", c_indx, candidate, arr, i, reg = /\r\n|\r|\n/;

        ma_indx = call.sdp.indexOf(mLine + audio, 0);
        mv_indx = call.sdp.indexOf(mLine + video, 0);

        if(ma_indx !== -1 && mv_indx !== -1) {
            if(ma_indx < mv_indx) {
                ma_str = call.sdp.substring(ma_indx, mv_indx);
                mv_str = call.sdp.substring(mv_indx);
            } else {
                mv_str = call.sdp.substring(mv_indx, ma_indx);
                ma_str = call.sdp.substring(ma_indx);
            }
        } else if(ma_indx !== -1) {
            ma_str = call.sdp.substring(ma_indx);
        } else if(mv_indx !== -1) {
            mv_str = call.sdp.substring(mv_indx);
        }

        if (ma_str !== "") {
            c_indx = ma_str.indexOf("a=candidate", 0);
            if (c_indx !== -1) {
                ma_str = ma_str.substring(c_indx);
                arr = ma_str.split(reg);
                i = 0;
                while (arr[i] && arr[i].indexOf("a=candidate") !== -1) {
                    if (pluginMode !== PluginModes.AUTO) {
                        candidate = rtcPlugin.createIceCandidate(arr[i], audio, 0);
                    } else {
                        candidate = new window.RTCIceCandidate({sdpMLineIndex: 0,
                            candidate: arr[i]});
                    }
                    call.peer.addIceCandidate(candidate);
                    i++;
                }
            }
        }

        if (mv_str !== "") {
            c_indx = mv_str.indexOf("a=candidate", 0);
            if (c_indx !== -1) {
                mv_str = mv_str.substring(c_indx);
                arr = mv_str.split(reg);
                i = 0;
                while (arr[i] && arr[i].indexOf("a=candidate") !== -1) {
                    if (pluginMode !== PluginModes.AUTO) {
                        candidate = rtcPlugin.createIceCandidate(arr[i], video, 1);
                    } else {
                        candidate = new window.RTCIceCandidate({sdpMLineIndex: 1,
                            candidate: arr[i]});
                    }
                    call.peer.addIceCandidate(candidate);
                    i++;
                }

            }
        }
    }

    /**
     * onEnablerIceCandidate to be called when the enabler plugin is enabled
     */
    function onEnablerIceCandidate(call, event) {
        var  sdp;
        if(event.candidate === null) {
            if(call.successCallback) {
                logger.debug("All ICE candidates received for call : " + call.id);

                sdp = getSdpFromObject(call.peer.localDescription);
                //sdp = sdp.replace("s=","s=genband");
                sdp = updateH264Level(sdp);

                call.successCallback(sdp);
                call.successCallback = null;
            }
        } else {
            logger.debug("ICE candidate received : sdpMLineIndex = " + event.candidate.sdpMLineIndex
                + ", candidate = " + event.candidate.candidate + " for call : " + call.id);
        }
    }

    /**
     * onNativeIceCandidate to be called when native webrtc is enabled
     */
    function onNativeIceCandidate(call, event) {
        var sdp;
        if(event.candidate === null) {
            if(call.successCallback) {
                sdp = call.peer.localDescription.sdp;
                call.successCallback(sdp);
                call.successCallback = null;
            }
        } else {
            logger.debug("ICE candidate received: sdpMLineIndex = " + event.candidate.sdpMLineIndex
                + ", candidate = " + event.candidate.candidate + " for call : " + call.id);
        }
    }

    /**
     * onDisablerIceCandidate to be called when the disabler plugin is enabled
     */
    function onDisablerIceCandidate(call, event) {
        var  answer, offer, sdp, audioStatus, videoStatus;
        logger.debug("ICE candidate received: sdpMLineIndex = " + event.candidate.sdpMLineIndex
            + ", candidate = " + event.candidate.candidate + " for call : " + call.id);

        offer = call.offer;
        if(offer) {
            audioStatus = isSdpEnabled(offer.sdp, audio);
            videoStatus = isSdpEnabled(offer.sdp, video);

            logger.debug("offer.useCandidateInfo will be called");
            offer.useCandidateInfo(event.candidate);

            if(!audioStatus) {
                enableAudio(offer,false);
            }
        }

        answer = call.answer;
        if(call.answer) {
            audioStatus = isSdpEnabled(answer.sdp, audio);
            videoStatus = isSdpEnabled(answer.sdp, video);

            logger.debug("answer.useCandidateInfo will be called");
            answer.useCandidateInfo(event.candidate);

            if(!audioStatus) {
                enableAudio(answer,false);
            }
        }

        if(event.candidate.sdpMLineIndex === 0) {
            call.audio_candidate = true;
        } else {
            call.video_candidate = true;
        }

        if( offer &&
            !(isSdpEnabled(offer.sdp, audio) && call.audio_candidate === false) &&
            !(isSdpEnabled(offer.sdp, video) && call.video_candidate === false)) {

            sdp = offer.sdp;
            sdp = sdp.replace("s=","s=genband");
            sdp = updateH264Level(sdp);

            logger.debug("onDisablerIceCandidate offer.sdp : " + sdp);

            call.offer = null;

            call.successCallback(sdp);
        }

        if( answer &&
            !(isSdpEnabled(answer.sdp, audio) && call.audio_candidate === false) &&
            !(isSdpEnabled(answer.sdp, video) && call.video_candidate === false)) {

            sdp = answer.sdp;
            sdp = updateH264Level(sdp);
            
            logger.debug("onDisablerIceCandidate answer.sdp : " + sdp);

            call.answer = null;

            call.successCallback(sdp);
        }
    }

    function onIceCandidate(call, event) {
        switch(pluginMode) {
            case PluginModes.AUTO:
                onNativeIceCandidate(call, event);
                break;
            case PluginModes.LEGACY:
            case PluginModes.LEGACYH264:
                onDisablerIceCandidate(call, event);
                break;
            case PluginModes.WEBRTC:
            case PluginModes.WEBRTCH264:
            case PluginModes.WEBRTC22:
            case PluginModes.WEBRTC21:
                onEnablerIceCandidate(call, event);
                break;
            default:
                onEnablerIceCandidate(call, event);
                break;
        }
    }

    function onSessionConnecting(call, message) {
        logger.debug("onSessionConnecting");
    }

    function onSessionOpened(call, message) {
        logger.debug("onSessionOpened");
    }

    function onSignalingStateChange(call, event) {
        //TODO may need to move the state changes for webrtc here
        logger.debug("Signalling state changed: state= " + event.srcElement.signalingState);
    }

    function createStreamRenderer(streamUrl, container, options){
        var renderer;
        
        if(!streamUrl || !container){
            return;
        }
        
        if (pluginMode === PluginModes.AUTO) {
            container.innerHTML = "";
            renderer = document.createElement('video');
            renderer.src = streamUrl;
            
            renderer.style.width = "100%";
            renderer.style.height = "100%";
            
            renderer.autoplay = "true";
            
            if (options) {
                if (options.muted) {
                    renderer.muted = "true";
                }
            }
            
            container.appendChild(renderer);
        } else if (pluginMode === PluginModes.WEBRTC || 
                   pluginMode === PluginModes.WEBRTCH264 ||
                   pluginMode === PluginModes.WEBRTC22 ||
                   pluginMode === PluginModes.WEBRTC21 ) {
            container.innerHTML = "<object style='background-color:black;' width='100%' height='100%' type='application/x-gcfwenabler-video'><param name='autoplay' value='true' /><param name='videosrc' value='" + streamUrl +  "' /></object>";
        }
        return renderer;
   }
    
    function disposeStreamRenderer(container){
        if(container){
            container.innerHTML = "";
        }
    }

    function useDefaultRenderer(streamUrl, local) {
        var videoContainer;

        if (defaultVideoContainer && defaultVideoContainer.children.length === 0) {
            //Create divs for the remote and local
            defaultVideoContainer.innerHTML = "<div style='height:100%;width:100%'></div><div style='position:absolute;bottom:10px;right:10px;height:30%; width:30%;'></div>";
        }

        if (local) {
            if(localVideoContainer){
                videoContainer = localVideoContainer;
            } else {
                videoContainer = defaultVideoContainer.lastElementChild;
            }
        } else {
            if(remoteVideoContainer){
                videoContainer = remoteVideoContainer;
            } else {
                videoContainer = defaultVideoContainer.firstElementChild;
            }
        }
        createStreamRenderer(streamUrl, videoContainer, {muted: local});
    }

    function onRemoteStreamAdded(call, event) {
        var streamUrl;
        logger.debug("onRemoteStreamAdded");
        if (event.stream) {
            if (pluginMode === PluginModes.AUTO) {
                streamUrl = window.webkitURL.createObjectURL(event.stream);

                //Used for Audio only calls to get video track to WebRTC API to work properly.
                if (event.stream.getVideoTracks()) {
                    logger.info("Accessed Video Track");
                }
            } else if (pluginMode === PluginModes.WEBRTC || 
                       pluginMode === PluginModes.WEBRTCH264 ||
                       pluginMode === PluginModes.WEBRTC22 ||
                       pluginMode === PluginModes.WEBRTC21 ) {
                streamUrl = rtcPlugin.getURLFromStream(event.stream);
            }

            if (streamUrl) {
                logger.debug("onRemoteStreamAdded: " + streamUrl);
                if (defaultVideoContainer) {
                    useDefaultRenderer(streamUrl, false);
                } else if (remoteVideoContainer) {
                    createStreamRenderer(streamUrl, remoteVideoContainer);
                } else {
                    fireOnStreamAddedEvent(call, streamUrl);
                }
            }
        }
    }

    //This function is called internally when we make a new call or hold/unhold scenario
    function onLocalStreamAdded(internalCall) {
        var streamUrl;
        logger.debug("onLocalStreamAdded");
        //logger.debug("onLocalStreamAdded : peerCount : " + peerCount);     //Ersan - Multiple Call Plugin Issue Tries
        //if (peerCount < 2) {                                              //Ersan - Multiple Call Plugin Issue Tries
        if (localStream) {
            if (callCanLocalSendVideo(internalCall)) {
                if (pluginMode === PluginModes.AUTO) {
                    streamUrl = window.webkitURL.createObjectURL(localStream);
                } else if (pluginMode === PluginModes.WEBRTC || 
                           pluginMode === PluginModes.WEBRTCH264 ||
                           pluginMode === PluginModes.WEBRTC22 ||
                           pluginMode === PluginModes.WEBRTC21 ) {
                    streamUrl = rtcPlugin.getURLFromStream(localStream);
                }

                if (streamUrl) {
                    logger.debug("onLocalStreamAdded: " + streamUrl);
                    if (defaultVideoContainer) {
                        useDefaultRenderer(streamUrl, true);
                    } else if (localVideoContainer) {
                        createStreamRenderer(streamUrl, localVideoContainer, {muted: true});
                    } else {
                        internalCall.call.localStreamURL = streamUrl;
                    }
                }
            } else {
                if (defaultVideoContainer) {
                    if(defaultVideoContainer.lastElementChild) {
                        disposeStreamRenderer(defaultVideoContainer.lastElementChild);
                    }
                } else if (localVideoContainer) {
                    disposeStreamRenderer(localVideoContainer);
                }
            }
        }
	//}     //Ersan - Multiple Call Plugin Issue Tries
    }

    function onRemoteStreamRemoved(call, event) {
        logger.debug("onRemoteStreamRemoved");
        
        //Ersan - Multiple Call Plugin Issue Tries
        //
        //event.stream.stop();
        //if (defaultVideoContainer) {
        //    if(defaultVideoContainer.firstElementChild) {
        //        disposeStreamRenderer(defaultVideoContainer.firstElementChild);
        //    }
        //} else if (remoteVideoContainer) {
        //    disposeStreamRenderer(remoteVideoContainer);
        //}
    }

    function onIceComplete(call) {
        var  sdp;
        logger.debug("All ICE candidates received for call : " + call.id);
        if(pluginMode !== PluginModes.LEGACY && pluginMode !== PluginModes.LEGACYH264 && call.successCallback) {
            if(call.offer) {
                sdp = call.offer.sdp;
                sdp = sdp.replace("s=","s=genband");
                call.offer = null;      // ABE-1328
            } else if(call.answer) {
                sdp = call.answer.sdp;
                call.answer = null;     // ABE-1328
            }

            sdp = updateH264Level(sdp);

            logger.debug("onIceComplete sdp : " + sdp);

            call.successCallback(sdp);
            call.successCallback = null;
        }
    }

    function createPeer(call, onsuccess, onfailure){
        try {
            var pc, constraints, i, servers = [];
            if (iceServerUrl instanceof Array) {
                for(i = 0; i<iceServerUrl.length; i++) {
                    servers[i] = iceServerUrl[i];
                    if(pluginMode === PluginModes.WEBRTC  || pluginMode === PluginModes.WEBRTC21) { //Plugin 2.1 does not support multiple servers
                        break;
                    }
                }                
            } else if (iceServerUrl === null ||  iceServerUrl === ""){
                servers = [];
            } else {
                servers[0] = iceServerUrl;
            }
            stunturn = {iceServers:servers};
            if(pluginMode !== PluginModes.AUTO) {
                if(pluginMode === PluginModes.WEBRTCH264 || pluginMode === PluginModes.WEBRTC22) {
                    constraints = {"optional": {"DtlsSrtpKeyAgreement": webrtcdtls}};
                    pc = rtcPlugin.createPeerConnection(stunturn, constraints);
                } else {
                    if(pluginMode === PluginModes.LEGACY || pluginMode === PluginModes.LEGACYH264) {
                        stunturn = "STUN stun.l.google.com:19302";
                    }
                    pc = rtcPlugin.createPeerConnection(stunturn);
                }
            } else {
                constraints = {"optional": [{"DtlsSrtpKeyAgreement": webrtcdtls}]};
                pc = new window.webkitRTCPeerConnection(stunturn, constraints);
            }
            peerCount++;
            call.peer = pc;

            pc.onconnecting = function(event){
                onSessionConnecting(call, event);
            };
            pc.onopen = function(event){
                onSessionOpened(call, event);
            };
            pc.onsignalingstatechange = function(event){
                onSignalingStateChange(call, event);
            };
            pc.onaddstream = function(event){
                onRemoteStreamAdded(call, event);
            };
            pc.onremovestream = function(event){
                onRemoteStreamRemoved(call, event);
            };
            pc.onicecandidate = function(event){
                onIceCandidate(call, event);
            };
            pc.onicecomplete = function(){
                onIceComplete(call);
            };

            logger.info("create PeerConnection successfully.");
            onsuccess();
        } catch(err) {
            logger.error("Failed to create PeerConnection, exception: " + err.message);
            onfailure();
        }
    }

    /**
     * refreshVideoRenderer
     *
     * @ignore
     * @name rtc.refreshVideoRenderer
     * @function
     */
    this.refreshVideoRenderer = function (call) {
        if (!webRTCInitialized) {
            logger.warn("Plugin is not installed");
            return;
        }

        if (!call.peer) {
            return;
        }

        if(pluginMode === PluginModes.LEGACY || pluginMode === PluginModes.LEGACYH264) {
            call.peer.refreshRenderer();
        }
    };

    /**
     * sends Intra Frame
     *
     * @ignore
     * @name rtc.sendIntraFrame
     * @function
     */
    this.sendIntraFrame = function (call) {
        if (!webRTCInitialized) {
            logger.warn("Plugin is not installed");
            return;
        }

        if (!call.peer) {
            return;
        }

        if(pluginMode === PluginModes.LEGACY || 
           pluginMode === PluginModes.LEGACYH264 || 
           pluginMode === PluginModes.WEBRTCH264 || 
           pluginMode === PluginModes.WEBRTC22){
            if (callCanLocalSendVideo(call)) {
                call.peer.sendIntraFrame();
            } else {
                call.peer.sendBlackFrame();
            }
        }
    };


    /**
     * sends Black Frame
     *
     * @ignore
     * @name rtc.sendBlackFrame
     * @function
     */
    this.sendBlackFrame = function (call) {
        if (!webRTCInitialized) {
            return;
        }

        if (!call.peer) {
            return;
        }

        if(pluginMode === PluginModes.LEGACY || 
           pluginMode === PluginModes.LEGACYH264 || 
           pluginMode === PluginModes.WEBRTCH264 || 
           pluginMode === PluginModes.WEBRTC22){
            call.peer.sendBlackFrame();
        }
    };

    function isAudioMuted(call) {
        if (call && call.audioMuted) {
            return call.audioMuted;
        }
        return false;
    }

    function isVideoMuted(call) {
        if (call && call.videoMuted) {
            return call.videoMuted;
        }
        return false;
    }

    function muteCall(call, mute) {
        var localAudioTrack;
        if (!webRTCInitialized) {
            return;
        }

        if (!call.peer) {
            return;
        }

        logger.info("mute " + mute);
        localAudioTrack = getLocalAudioTrack(call.peer);
        if (localAudioTrack) {
            localAudioTrack.enabled = !mute;
            call.audioMuted = mute;
        }
    }

    function restoreMuteStateOfCall(call) {
        var previousMuteStateOfCall;
        if (!call.peer) {
            return;
        }
        
        previousMuteStateOfCall = isAudioMuted(call);
        logger.debug("previous mute state of call: " + previousMuteStateOfCall);
        muteCall(call, previousMuteStateOfCall);
    }

    /**
     * Mute or unmute the call
     *
     * @ignore
     * @name rtc.mute
     * @function
     * @param {Object} call internalCall
     * @param {boolean} mute true to mute, false to unmute
     */
    this.mute = muteCall;

    /**
     * Increment version in o= header in the SDP.
     *
     */
    function incrementVersion(psdp) {
        var oline=[], newoline ="", index, version, regExpCodec, arr=[];
        logger.debug(" incrementVersion");

        // o=- 937770930552268055 2 IN IP4 127.0.0.1
        oline = psdp.match('o=(?:.+?[\\s.,;]+){2}([^\\s.,;]+)'); // get the 3rd

        version = oline[1];
        version = +version; // convert to int
        version = version + 1;

        arr = oline[0].split(" ");
        arr[arr.length - 1] = version; // set new version to last element
        for (index = 0; index < arr.length; index++) {
            if (index !== 0) {
                newoline = newoline + " ";
            }
            newoline = newoline + arr[index];
        }

        regExpCodec = new RegExp(oline[0], "g");
        psdp = psdp.replace(regExpCodec, newoline);

        return psdp;
    }

    /**
     * Updates the version in tosdp with the one retrieved from fromsdp with incrementing
     *
     */
    function updateVersion(fromsdp, tosdp) {
        var fromOline=[], toOline=[], newoline ="", index, version, regExpCodec, arr=[];

        logger.debug(" updateVersion called...");

        // o=- 937770930552268055 2 IN IP4 127.0.0.1
        fromOline = fromsdp.match('o=(?:.+?[\\s.,;]+){2}([^\\s.,;]+)'); // get the 3rd
        toOline = tosdp.match('o=(?:.+?[\\s.,;]+){2}([^\\s.,;]+)'); // get the 3rd

        version = fromOline[1];
        version = +version; // convert to int
        version = version + 1;

        logger.debug(" updateVersion fromVersion incremented: " + version);

        arr = toOline[0].split(" ");
        arr[arr.length - 1] = version; // set new version to last element
        for (index = 0; index < arr.length; index++) {
            if (index !== 0) {
                newoline = newoline + " ";
            }
            newoline = newoline + arr[index];
        }

        regExpCodec = new RegExp(toOline[0], "g");
        tosdp = tosdp.replace(regExpCodec, newoline);

        return tosdp;
    }

    /**
     * Mutes audio and video tracks (to be used during Hold)
     *
     * @ignore
     * @name rtc.mute
     * @function
     * @param {Object} call internalCall
     * @param {boolean} mute true to mute, false to unmute
     */
    function muteOnHold(call, mute) {
        var localAudioTrack, localVideoTrack;

        logger.info("Mute on Hold called, mute=" + mute);
        if (!webRTCInitialized) {
            logger.warn("Plugin is not installed");
            return;
        }

        if (!call.peer) {
            return;
        }

        localAudioTrack = getLocalAudioTrack(call.peer);
        if (localAudioTrack) {
            localAudioTrack.enabled = !mute;
            call.audioMuted = mute;
        }

        localVideoTrack = getLocalVideoTrack(call.peer);
        if (localVideoTrack) {
            localVideoTrack.enabled = !mute;
            call.videoMuted = mute;
        }
    }

    this.isAudioMuted = isAudioMuted;

    this.isVideoMuted = isVideoMuted;

    /**
     * Send DTMF tone
     *
     * @ignore
     * @name rtc.sendDTMF
     * @function
     * @param {Object} call internalCall
     * @param {String} tone DTMF tone
     */
    this.sendDTMF = function (call, tone) {

        logger.info("sending DTMF tone : " + tone);

        if (!webRTCInitialized) {
            logger.warn(NOTINITIALIZED);            
            return;
        }

        if (!call.peer) {
            return;
        }

        //disabler plugin uses dtmf differently. DO your job and return.
        if(pluginMode === PluginModes.LEGACY || pluginMode === PluginModes.LEGACYH264) {
            call.peer.sendDtmf(tone, 400);
            return;
        }

        if(!call.dtmfSender) {
            var localAudioTrack = getLocalAudioTrack(call.peer);
            if(!localAudioTrack) {
                return;
            }
            call.dtmfSender = call.peer.createDTMFSender(localAudioTrack);
            if(!call.dtmfSender) {
                return;
            }
        }
        
        if (call.dtmfSender.canInsertDTMF === true) {
            call.dtmfSender.insertDTMF(tone, 400);
        }
        else {
            logger.error("Failed to execute 'insertDTMF' on 'RTCDTMFSender': The 'canInsertDTMF' attribute is false: this sender cannot send DTMF");
        }
    };

    /**
     * return call's local sdp
     *
     * @ignore
     * @name rtc.getLocalDescription
     * @function
     * @param {Object} call InternalCall
     * @param {function(sdp)} successCallback The success callback function to be called
     * @param {function()} failureCallback The failure callback function to be called
     */
    this.getLocalDescription = function (call, successCallback, failureCallback){
        if(call.peer){
            successCallback(getSdpFromObject(call.peer.localDescription));
        } else{
            logger.warn("getLocalDescription failed!!");
            failureCallback();
        }
    };


    /**
     * return call's remote sdp
     *
     * @ignore
     * @name rtc.getRemoteDescription
     * @function
     * @param {Object} call InternalCall
     * @param {function(sdp)} successCallback The success callback function to be called
     * @param {function()} failureCallback The failure callback function to be called
     */
    this.getRemoteDescription = function (call, successCallback, failureCallback){
        if(call.peer){
            successCallback(getSdpFromObject(call.peer.remoteDescription));
        } else{
            logger.warn("getRemoteDescription failed!!");
            failureCallback();
        }
    };

    /**
     * createEnablerAnswer to be used when the enabler plugin is enabled
     */
    function createEnablerAnswer(call, successCallback, failureCallback, isVideoEnabled) {
        logger.debug("createEnablerAnswer: isVideoEnabled= " + isVideoEnabled + " state= " + call.peer.signalingState);
        var peer = call.peer, newSdp, newOffer;

        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);
        call.sdp = checkSupportedVideoCodecs(call.sdp, null);
        call.sdp = removeRTXCodec(call.sdp);
        call.sdp = removeG722Codec(call.sdp);
        call.sdp = performG722ParameterWorkaround(call.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);
        //basar c2c         //TODO : added for native but not added for plugin 2.1 why ?
        call.sdp = changeDirection(call.sdp, MediaStates.INACTIVE, MediaStates.SEND_RECEIVE, audio);
        //basar

        if (webrtcdtls) {
            call.sdp = setMediaActPass(call.sdp);
        }
        
        peer.setRemoteDescription(webRTCSdp(typeOff,call.sdp),
            function(){
                peer.addStream(localStream);
                call.localStream = localStream;

                callSetReceiveVideo(call);
                addCandidates(call);
                // set answer SDP to localDescriptor for the offer
                peer.createAnswer(peer.remoteDescription,
                    function(oSdp) {
                        newSdp = getSdpFromObject(oSdp);
                        oSdp = null;
                        isVideoEnabled = isVideoEnabled && videoSourceAvailable && isSdpEnabled(call.sdp, video);
                        callSetLocalSendVideo(call, isVideoEnabled);

                        if (isVideoEnabled) {
                            if (isSdpVideoSendEnabled(call.sdp, video)) {
                                newSdp = updateSdpDirection(newSdp, video, MediaStates.SEND_RECEIVE);
                            } else {
                                newSdp = updateSdpDirection(newSdp, video, MediaStates.SEND_ONLY);
                            }
                        } else {
                            if (isSdpVideoSendEnabled(call.sdp, video)) {
                                newSdp = updateSdpDirection(newSdp, video, MediaStates.RECEIVE_ONLY);
                            } else {
                                newSdp = updateSdpDirection(newSdp, video, MediaStates.INACTIVE);
                            }
                        }

                        logger.debug("doAnswer(plugin) - isSdpEnabled audio : " + isSdpEnabled(newSdp, audio));
                        logger.debug("doAnswer(plugin) - isSdpEnabled video : " + isSdpEnabled(newSdp, video));

                        if (isSdpHas(newSdp, audio) || isSdpHas(newSdp, video)) {
                            newSdp = performVP8RTCPParameterWorkaround(newSdp);

                            if (webrtcdtls) {
                                newSdp = setMediaPassive(newSdp);
                            }

                            newSdp = fixLocalTelephoneEventPayloadType(call, newSdp);

                            newOffer = webRTCSdp(typeAns, newSdp);
                            call.answer = newOffer;

                            peer.setLocalDescription(newOffer,
                                function(){
                                    //Due to stun requests, successCallback will be called by onEnablerIceCandidate()
                                },
                                function(e) {
                                    logger.error("createEnablerAnswer: setLocalDescription failed: " + e);
                                    failureCallback(logPrefix + "createEnablerAnswer: setLocalDescription failed");}
                                );
                        } else {
                            logger.error("createEnablerAnswer: createAnswer failed!!");
                            failureCallback(logPrefix + "No codec negotiation");
                        }
                    },function(e){
                        logger.error("createEnablerAnswer: failed!!" + e);
                        failureCallback(logPrefix + "Session cannot be created ");
                    },
                    {
                        'mandatory': {
                            'OfferToReceiveAudio':mediaAudio,
                            'OfferToReceiveVideo':getGlobalSendVideo()
                            }
                    });
            }
            ,function(e) {
                logger.error("createEnablerAnswer setRemoteDescription failed : " + e);}
            );
    }

    /**
     *  createNativeAnswer to be used when native webrtc is enabled.
     */
    function createNativeAnswer(call, successCallback, failureCallback, isVideoEnabled) {
        logger.debug("createNativeAnswer: isVideoEnabled= " + isVideoEnabled + " state= " + call.peer.signalingState);
        var peer = call.peer;

        peer.addStream(localStream);        

        call.sdp = removeG722Codec(call.sdp);
        call.sdp = performG722ParameterWorkaround(call.sdp);
        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);
        call.sdp = checkSupportedVideoCodecs(call.sdp, null);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);
        //basar c2c
        call.sdp = changeDirection(call.sdp, MediaStates.INACTIVE, MediaStates.SEND_RECEIVE, audio);
        //basar
        
        if (webrtcdtls) {
            call.sdp = setMediaActPass(call.sdp);
        }
        
        peer.setRemoteDescription(nativeWebRTCSdp(typeOff, call.sdp),
            function(){
                callSetReceiveVideo(call);
                addCandidates(call);
                call.remoteVideoState = getSdpDirection(call.sdp, video);

                peer.createAnswer(
                    function(oSdp) {
                        isVideoEnabled = isVideoEnabled && videoSourceAvailable && isSdpEnabled(call.sdp, video);
                        callSetLocalSendVideo(call, isVideoEnabled);

                        if (isVideoEnabled) {
                            if (isSdpVideoSendEnabled(call.sdp, video)) {
                                oSdp.sdp = updateSdpDirection(oSdp.sdp, video, MediaStates.SEND_RECEIVE);
                            } else {
                                oSdp.sdp = updateSdpDirection(oSdp.sdp, video, MediaStates.SEND_ONLY);
                            }
                        } else {
                            if (isSdpVideoSendEnabled(call.sdp, video)) {
                                oSdp.sdp = updateSdpDirection(oSdp.sdp, video, MediaStates.RECEIVE_ONLY);
                            } else {
                                oSdp.sdp = updateSdpDirection(oSdp.sdp, video, MediaStates.INACTIVE);
                            }
                        }

                        oSdp.sdp = performVP8RTCPParameterWorkaround(oSdp.sdp);
                        muteOnHold(call, false);

                        if (webrtcdtls) {
                            oSdp.sdp = setMediaPassive(oSdp.sdp);
                        }

                        oSdp.sdp = fixLocalTelephoneEventPayloadType(call, oSdp.sdp);

                        peer.setLocalDescription(nativeWebRTCSdp(typeAns, oSdp.sdp),
                            function(){
                                //Due to stun requests, successCallback will be called by onNativeIceCandidate()
                            },
                            function(e) {
                                logger.error("createNativeAnswer: setLocalDescription failed : " + e);
                                failureCallback(logPrefix + "createNativeAnswer setLocalDescription failed");
                            });
                    },
                    function(e){
                        logger.error("createNativeAnswer: createAnswer failed!! Error: " + e);
                        failureCallback(logPrefix + "Session cannot be created");
                    },
                    {
                        'mandatory': {
                            'OfferToReceiveAudio':mediaAudio,
                            'OfferToReceiveVideo':getGlobalSendVideo()
                        }
                    });
            },
            function(e){
                logger.error("createNativeAnswer: setremotedescription failed!! Error: " + e);
            });                    
    }

    /**
     * createDisablerAnswer to be used when the disabler plugin is enabled
     */
    function createDisablerAnswer(call, successCallback, failureCallback, isVideoEnabled) {
        logger.debug("createDisablerAnswer: isVideoEnabled= " + isVideoEnabled);
        var candidates, i, off, peer = call.peer;

        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);
        call.sdp = checkSupportedVideoCodecs(call.sdp, null);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);
        
        callSetReceiveVideo(call);

        off = webRTCSdp(typeOff, call.sdp);

        peer.setRemoteDescription(off,
            function(){
                peer.addStream(localStream);
                call.localStream = localStream;

                // set answer SDP to localDescriptor for the offer
                peer.createAnswer(peer.remoteDescription,
                    function(oSdp) {
                        isVideoEnabled = isVideoEnabled && videoSourceAvailable && isSdpEnabled(call.sdp, video);
                        enableVideo(oSdp,isSdpEnabled(oSdp.sdp, video)); // Disable video if offer has disabled video
                        callSetLocalSendVideo(call, isVideoEnabled);

                        if (isVideoEnabled) {
                            if (isSdpVideoSendEnabled(call.sdp, video)) {
                                oSdp.videoDirection = MediaStates.SEND_RECEIVE;
                            } else {
                                oSdp.videoDirection = MediaStates.SEND_ONLY;
                            }
                        } else {
                            if (isSdpVideoSendEnabled(call.sdp, video)) {
                                oSdp.videoDirection = MediaStates.RECEIVE_ONLY;
                            } else {
                                oSdp.videoDirection = MediaStates.INACTIVE;
                            }
                        }

                        logger.debug("doAnswer(disablerplugin) - isSdpEnabled audio : " + isSdpEnabled(oSdp.sdp, audio));
                        logger.debug("doAnswer(disablerplugin) - isSdpEnabled video : " + isSdpEnabled(oSdp.sdp, video));

                        if (isSdpHas(oSdp.sdp, audio) || isSdpHas(oSdp.sdp, video)) {

                            call.audio_candidate = false;
                            call.video_candidate = false;

                            call.answer = oSdp;

                            peer.setLocalDescription(call.answer,
                                function(){
                                    candidates = off.createCandidates();
                                    for(i=0; i<candidates.length; ++i) {
                                        peer.addIceCandidate(candidates[i]);
                                    }
                                    muteCall(call, false);
                                }
                                ,function(e) {
                                    logger.error("createDisablerAnswer: setLocalDescription failed : " + e);
                                    failureCallback(logPrefix + "createDisablerAnswer: setLocalDescription failed");}
                                );
                        } else {
                            logger.error("createDisablerAnswer: createAnswer failed!!");
                            failureCallback(logPrefix + "No codec negotiation");
                        }
                    },function(e){
                        logger.error("createDisablerAnswer: failed!! " + e);
                        failureCallback(logPrefix + "Session cannot be created");
                    },
                    {
                        "audio":mediaAudio,
                        "video":getGlobalSendVideo()
                    });
            }
            ,function(e) {
                logger.error("createDisablerAnswer: setRemoteDescription failed : " + e);}
            );
    }

    /**
     * Create an answer sdp in reply to an offer sdp in the call object
     *
     * @ignore
     * @name rtc.doAnswer
     * @function
     * @param {Object} call internalCall
     * @param {function(sdp)} successCallback The success callback function to be called
     * @param {function()} failureCallback The failure callback function to be called
     * @param isVideoEnabled according to this value video will be sent
     */
    this.doAnswer = function(call, successCallback, failureCallback, isVideoEnabled){

        logger.info("creating answer SDP: callid= " + call.id);
        logger.info("creating answer SDP: isVideoEnabled= " + isVideoEnabled);

        if (!webRTCInitialized) {
            logger.warn(NOTINITIALIZED);
            failureCallback(logPrefix + "is not initialized");
            return;
        }

        call.successCallback = successCallback;
        call.failureCallback = failureCallback;

        if (!call.peer) {
            createPeer(call,
                function(){},
                function(){
                    failureCallback(2);
                }
            );
        }

        if(call.peer) {
            switch(pluginMode) {
                case PluginModes.AUTO:
                    createNativeAnswer(call, successCallback, failureCallback, isVideoEnabled);
                    break;
                case PluginModes.LEGACY:
                case PluginModes.LEGACYH264:
                    createDisablerAnswer(call, successCallback, failureCallback, isVideoEnabled);
                    break;
                case PluginModes.WEBRTC:
                case PluginModes.WEBRTCH264:
                case PluginModes.WEBRTC22:
                case PluginModes.WEBRTC21:
                    createEnablerAnswer(call, successCallback, failureCallback, isVideoEnabled);
                    break;
                default:
                    createEnablerAnswer(call, successCallback, failureCallback, isVideoEnabled);
                    break;
            }
        }
    };

    /**
     * createEnablerOffer to be used when the enabler plugin is enabled.
     */
    function createEnablerOffer(call, successCallback, failureCallback, sendInitialVideo) {
        logger.debug("createEnablerOffer: sendInitialVideo= " + sendInitialVideo + " state= " + call.peer.signalingState);
        var peer = call.peer, newSdp;

        peer.addStream(localStream);
        call.localStream = localStream;

        peer.createOffer(function (oSdp){
            sendInitialVideo = sendInitialVideo && videoSourceAvailable;
            newSdp = getSdpFromObject(oSdp);
            oSdp = null;
            if(sendInitialVideo){
                newSdp = updateSdpDirection(newSdp, video, MediaStates.SEND_RECEIVE);
            } else {
                newSdp = updateSdpDirection(newSdp, video, MediaStates.RECEIVE_ONLY);
            }
            
            newSdp = newSdp.replace(/(a=crypto:0[\w\W]*?(:\r|\n))/, "");
            newSdp = performVP8RTCPParameterWorkaround(newSdp);
            newSdp = updateAudioCodec(newSdp);
            
            if (webrtcdtls) {
                if(pluginMode === PluginModes.WEBRTCH264 || pluginMode === PluginModes.WEBRTC22) {
                    newSdp = deleteCryptoFromSdp(newSdp);
                }
                newSdp = setMediaActPass(newSdp);
            }
            
            newSdp = fixLocalTelephoneEventPayloadType(call, newSdp);

            call.offer = webRTCSdp(typeOff, newSdp);
            peer.setLocalDescription(call.offer,
                function(){
                    //Due to stun requests, successCallback will be called by onEnablerIceCandidate()
                },
                function(e) {
                    logger.error("createEnablerOffer: setLocalDescription failed : " + e);
                    failureCallback(logPrefix + "createEnablerOffer: setLocalDescription failed");}
                );

        },function(e){
            logger.error("createEnablerOffer: createOffer failed!! " + e);
            failureCallback();
        },
        {
            'mandatory': {
                'OfferToReceiveAudio':mediaAudio,
                'OfferToReceiveVideo':getGlobalSendVideo()
                }
        });
        callSetLocalSendVideo(call, sendInitialVideo);
    }

    /**
     * createNativeOffer to be used when native webrtc is enabled.
     */
    function createNativeOffer(call, successCallback, failureCallback, sendInitialVideo) {
        logger.debug("createNativeOffer: sendInitialVideo= " + sendInitialVideo + " state= " + call.peer.signalingState);
        var peer = call.peer;

        peer.addStream(localStream);
        call.localStream = localStream;

        peer.createOffer(
            function (oSdp){
                sendInitialVideo = sendInitialVideo && videoSourceAvailable;
                if(sendInitialVideo){
                    oSdp.sdp = updateSdpDirection(oSdp.sdp, video, MediaStates.SEND_RECEIVE);
                } else {
                    oSdp.sdp = updateSdpDirection(oSdp.sdp, video, MediaStates.RECEIVE_ONLY);
                }

                oSdp.sdp = oSdp.sdp.replace(/(a=crypto:0[\w\W]*?(:\r|\n))/, "");

                oSdp.sdp = performVP8RTCPParameterWorkaround(oSdp.sdp);
                oSdp.sdp = updateAudioCodec(oSdp.sdp);
                
                if (webrtcdtls) {
                    oSdp.sdp = deleteCryptoFromSdp(oSdp.sdp);
                    oSdp.sdp = setMediaActPass(oSdp.sdp);
                }

                oSdp.sdp = fixLocalTelephoneEventPayloadType(call, oSdp.sdp);

                peer.setLocalDescription(nativeWebRTCSdp(typeOff, oSdp.sdp),
                    function(){
                        //Due to stun requests, successCallback will be called by onNativeIceCandidate()
                    }
                    ,function(error) {
                        logger.error("createNativeOffer: setLocalDescription failed : " + error);
                        failureCallback(logPrefix + "createNativeOffer: setLocalDescription failed");
                    });

            },function(e){
                logger.error("createNativeOffer: createOffer failed!! " + e);
                failureCallback();
            },
            {
                'mandatory': {
                    'OfferToReceiveAudio':mediaAudio,
                    'OfferToReceiveVideo':getGlobalSendVideo()
                }
            });
        callSetLocalSendVideo(call, sendInitialVideo);
    }

    /**
     * createDisablerOffer to be used when the disabler plugin is enabled.
     */
    function createDisablerOffer(call, successCallback, failureCallback, sendInitialVideo) {
        logger.debug("createDisablerOffer: sendInitialVideo = " + sendInitialVideo);
        var peer = call.peer, newSdp;

        peer.addStream(localStream);
        call.localStream = localStream;

        peer.createOffer(function (oSdp){
            sendInitialVideo = sendInitialVideo && videoSourceAvailable;
            if(sendInitialVideo){
                oSdp.videoDirection = MediaStates.SEND_RECEIVE;
            } else {
                oSdp.videoDirection = MediaStates.RECEIVE_ONLY;
            }

            call.offer = oSdp;
            call.audio_candidate = false;
            call.video_candidate = false;

            peer.setLocalDescription(call.offer,
                function(){
                    muteCall(call, false);
                }
                ,function(e) {
                    logger.error("createDisablerOffer: setLocalDescription failed : " + e);
                    failureCallback(logPrefix + "createDisablerOffer: setLocalDescription failed");}
                );

        },function(e){
            logger.error("createDisablerOffer: createOffer failed!!" + e);
            failureCallback();
        },
        {
            "audio":mediaAudio,
            "video":true
        });
        callSetLocalSendVideo(call, sendInitialVideo);
    }

    /**
     * create an offer sdp in the call object options are audio/video
     *
     * @ignore
     * @name rtc.doOffer
     * @function
     * @param {Object} call outgoingCall
     * @param {function(sdp)} successCallback The success callback function to be called
     * @param {function()} failureCallback The failure callback function to be called
     * @param sendInitialVideo according to this value video will be sent
     */
    this.doOffer = function(call, successCallback, failureCallback, sendInitialVideo){
        logger.info("create offer SDP: sendInitialVideo= " + sendInitialVideo);

        if (!webRTCInitialized) {
            logger.warn(NOTINITIALIZED);
            failureCallback();
            return;
        }

        if (!call.peer) {
            createPeer(call,
                function(){},
                function(){
                    failureCallback(2);
                }
            );
        }

        call.successCallback = successCallback;
        call.failureCallback = failureCallback;

        if(call.peer){            
            switch(pluginMode) {
                case PluginModes.AUTO:
                    createNativeOffer(call, successCallback, failureCallback, sendInitialVideo);
                    break;
                case PluginModes.LEGACY:
                case PluginModes.LEGACYH264:
                    createDisablerOffer(call, successCallback, failureCallback, sendInitialVideo);
                    break;
                case PluginModes.WEBRTC:
                case PluginModes.WEBRTCH264:
                case PluginModes.WEBRTC22:
                case PluginModes.WEBRTC21:
                    createEnablerOffer(call, successCallback, failureCallback, sendInitialVideo);
                    break;
                default:
                    createEnablerOffer(call, successCallback, failureCallback, sendInitialVideo);
                    break;
            }
        }
    };


    /**
     * process the end call that was received
     *
     * @ignore
     * @name rtc.processEnd.stop
     */
    this.processEnd = function(call){
        if (call.peer) {
            logger.info("close peer connection " + call.id);
            // void close()
            call.peer.close();
            if(call.localStream) {
                call.localStream = null;
            }

            if (defaultVideoContainer) {
                if(defaultVideoContainer.firstElementChild) {
                    disposeStreamRenderer(defaultVideoContainer.firstElementChild);
                }
            } else if (remoteVideoContainer) {
                disposeStreamRenderer(remoteVideoContainer);
            }

            peerCount--;
            if(peerCount <=0) {
                if(localStream && localStream.stop) {
                    localStream.stop();
                    if (defaultVideoContainer) {
                        disposeStreamRenderer(defaultVideoContainer.lastElementChild);
                    } else if(localVideoContainer) {
                        disposeStreamRenderer(localVideoContainer);
                    }
                }
                localStream = null;
            }
        }

    };


    /**
     * createEnablerHoldUpdate to be used when the enabler plugin is enabled
     */
    function createEnablerHoldUpdate(call, hold, remote_hold_status, successCallback, failureCallback) {
        logger.debug("createEnablerHoldUpdate: local hold= " + hold + " remote hold= " + remote_hold_status + " state= " + call.peer.signalingState);
        var peer = call.peer,
                audioDirection,
                videoDirection,
                localSdp,
                externalSdp,
                tempSdp,
                successSdp,
                muteCall;

        tempSdp = incrementVersion(getSdpFromObject(call.peer.localDescription));

        if (webrtcdtls) {
            tempSdp = setMediaActPass(tempSdp);
        }

        //two sdp-s are created here
        //one is to be used by rest-request (externalSdp)
        //one is to set the audio-video direction of the local call (localSdp)
        //this is needed in order to adapt to the rfc (needs sendrecv to sendonly transition) 
        //and to the plugin (needs inactive to mute audio and video connection)
        externalSdp = tempSdp;
        localSdp = tempSdp;

        if(hold || remote_hold_status){
            audioDirection = getSdpDirection(externalSdp, audio);
            if (audioDirection === MediaStates.SEND_RECEIVE) {
                externalSdp = updateSdpDirection(externalSdp, audio, MediaStates.SEND_ONLY);
            } else {
                if (!hold && remote_hold_status) {
                    externalSdp = updateSdpDirection(externalSdp, audio, MediaStates.RECEIVE_ONLY);
                } else {
                    externalSdp = updateSdpDirection(externalSdp, audio, MediaStates.INACTIVE);
                }
            }
            videoDirection = getSdpDirection(externalSdp, video);
            if (videoDirection === MediaStates.SEND_RECEIVE) {
                externalSdp = updateSdpDirection(externalSdp, video, MediaStates.SEND_ONLY);
            } else {
                if (!hold && remote_hold_status) {
                    externalSdp = updateSdpDirection(externalSdp, video, MediaStates.RECEIVE_ONLY);
                } else {
                    externalSdp = updateSdpDirection(externalSdp, video, MediaStates.INACTIVE);
                }
            }
            localSdp = updateSdpDirection(externalSdp, audio, MediaStates.INACTIVE);
            localSdp = updateSdpDirection(externalSdp, video, MediaStates.INACTIVE);
            
            muteCall = true;
            
            //Ersan - Multiple Call Plugin Issue Tries
            //
            //localStream.stop();
            
            //if (defaultVideoContainer) {
            //    if(defaultVideoContainer.lastElementChild) {
            //        disposeStreamRenderer(defaultVideoContainer.lastElementChild);
            //    }
            //} else if (localVideoContainer) {
            //    disposeStreamRenderer(localVideoContainer);
            //}
            
        } else {
            externalSdp = updateSdpDirection(externalSdp, audio, MediaStates.SEND_RECEIVE);

            if (callCanLocalSendVideo(call)) {
                externalSdp = updateSdpDirection(externalSdp, video, MediaStates.SEND_RECEIVE);
                callSetLocalSendVideo(call, true);
                //onLocalStreamAdded(call);     //Ersan - Multiple Call Plugin Issue Tries
            } else {
                externalSdp = updateSdpDirection(externalSdp, video, MediaStates.RECEIVE_ONLY);
                callSetLocalSendVideo(call, false);
            }
            localSdp = externalSdp;
            muteCall = false;
        }

        localSdp = fixLocalTelephoneEventPayloadType(call, localSdp);

        peer.setLocalDescription(webRTCSdp(typeOff, localSdp),
            function() {
                logger.debug("createEnablerHoldUpdate: setLocalDescription success");
                successSdp = updateH264Level(externalSdp);
                successCallback(successSdp);
            },
            function(e) {
                logger.error("createEnablerHoldUpdate: setLocalDescription failed : " + e);
                failureCallback();
            });
        muteOnHold(call, muteCall);
    }

    /**
     * createNativeHoldUpdate to be used when native webrtc is enabled
     */
    function createNativeHoldUpdate(call, hold, remote_hold_status, successCallback, failureCallback) {
        logger.error("createNativeHoldUpdate: local hold= " + hold + " remote hold= " + remote_hold_status + " state= " + call.peer.signalingState);
        var peer = call.peer,
            audioDirection, 
            videoDirection, 
            localSdp,
            externalSdp,
            tempSdp,
            muteCall;

        tempSdp = incrementVersion(call.peer.localDescription.sdp);

        if (webrtcdtls) {
            tempSdp = setMediaActPass(tempSdp);
        }
        
        //two sdp-s are created here
        //one is to be used by rest-request (externalSdp)
        //one is to set the audio-video direction of the local call (localSdp)
        //this is needed in order to adapt to the rfc (needs sendrecv to sendonly transition) 
        //and to the plugin (needs inactive to mute audio and video connection)
        externalSdp = tempSdp;
        localSdp = tempSdp;

        if(hold || remote_hold_status){
            audioDirection = getSdpDirection(externalSdp, audio);
            if (audioDirection === MediaStates.SEND_RECEIVE) {
                externalSdp = updateSdpDirection(externalSdp, audio, MediaStates.SEND_ONLY);
            } else {
                if (!hold && remote_hold_status) {
                    externalSdp = updateSdpDirection(externalSdp, audio, MediaStates.RECEIVE_ONLY);
                } else {
                    externalSdp = updateSdpDirection(externalSdp, audio, MediaStates.INACTIVE);
                }
            }
            videoDirection = getSdpDirection(externalSdp, video);
            if (videoDirection === MediaStates.SEND_RECEIVE) {
                externalSdp = updateSdpDirection(externalSdp, video, MediaStates.SEND_ONLY);
            } else {
                if (!hold && remote_hold_status) {
                    externalSdp = updateSdpDirection(externalSdp, video, MediaStates.RECEIVE_ONLY);
                } else {
                    externalSdp = updateSdpDirection(externalSdp, video, MediaStates.INACTIVE);
                }
            }
            localSdp = updateSdpDirection(externalSdp, audio, MediaStates.INACTIVE);
            localSdp = updateSdpDirection(externalSdp, video, MediaStates.INACTIVE);
            muteCall = true;
        } else {
            externalSdp = updateSdpDirection(externalSdp, audio, MediaStates.SEND_RECEIVE);
            if (callCanLocalSendVideo(call)) {
                externalSdp = updateSdpDirection(externalSdp, video, MediaStates.SEND_RECEIVE);
            } else {
                externalSdp = updateSdpDirection(externalSdp, video, MediaStates.RECEIVE_ONLY);
            }

            localSdp = externalSdp;
            muteCall = false;
        }

        localSdp = fixLocalTelephoneEventPayloadType(call, localSdp);

        peer.setLocalDescription(nativeWebRTCSdp(typeOff, localSdp),
            function() {
                logger.debug("createNativeHoldUpdate: setLocalDescription success");
                successCallback(externalSdp);
            },
            function(error){
                logger.error("createNativeHoldUpdate: setLocalDescription failed: " + error);
                failureCallback();
            });
        muteOnHold(call, muteCall);
    }

    /**
     * createDisablerHoldUpdate to be used when the disabler plugin is enabled
     */
    function createDisablerHoldUpdate(call, hold, remote_hold_status, successCallback, failureCallback) {
        logger.debug("createDisablerHoldUpdate: local hold= " + hold + " remote hold= " + remote_hold_status);
        var peer = call.peer, successSdp;

        peer.createOffer(function(obj){

            //TODO: set the audio and video states according to incoming sdp
            //      look for 'createEnablerHoldUpdate' as example
            if(hold){
                obj.audioDirection = MediaStates.INACTIVE;    //sendonly originally
                obj.videoDirection = MediaStates.INACTIVE;    //sendonly originally
                logger.debug(obj.sdp);
            } else{
                obj.audioDirection = MediaStates.SEND_RECEIVE;
                if(callCanLocalSendVideo(call)){
                    obj.videoDirection = MediaStates.SEND_RECEIVE;
                } else {
                    obj.videoDirection = MediaStates.RECEIVE_ONLY;
                }

                //logger.debug(obj.sdp);
                peer.refreshRenderer();
            }

            peer.setLocalDescription(obj,
                function(){
                    logger.debug("createDisablerHoldUpdate: createOffer setLocalDescription success");
                    
                    successSdp = updateH264Level(obj.sdp);
                    
                    restoreMuteStateOfCall(call);
                    successCallback(successSdp);
                },
                function(e) {
                    logger.error("createDisablerHoldUpdate: createOffer setLocalDescription failed: " + e);
                    failureCallback();
                }
            );
        },function(e){
            logger.error("createDisablerHoldUpdate: createOffer failed!!" + e );
            failureCallback();
        },
        {
            "audio":mediaAudio,
            "video":getGlobalSendVideo()
        });
    }

    /**
     * Process the create hold update call sdp
     *
     * @ignore
     * @name rtc.createHoldUpdate
     * @function
     * @param {Object} call IncomingCall
     * @param {boolean} hold Hold/Resume [true:hold, false:unhold ]
     * @param {boolean} remote_hold_status set sdp direction according to remote hold
     * @param {function(sdp)} successCallback The success callback function to be called
     * @param {function()} failureCallback The failure callback function to be called
     */
    this.createHoldUpdate = function(call, hold, remote_hold_status, successCallback, failureCallback){
        logger.info("create hold update local hold= " + hold + " remote hold= " + remote_hold_status);
        if (!webRTCInitialized) {
            logger.warn(NOTINITIALIZED);
            failureCallback();
            return;
        }
        if(call.peer){
            switch(pluginMode) {
                case PluginModes.AUTO:
                    createNativeHoldUpdate(call, hold, remote_hold_status, successCallback, failureCallback);
                    break;
                case PluginModes.LEGACY:
                case PluginModes.LEGACYH264:
                    createDisablerHoldUpdate(call, hold, remote_hold_status, successCallback, failureCallback);
                    break;
                case PluginModes.WEBRTC:
                case PluginModes.WEBRTCH264:
                case PluginModes.WEBRTC22:
                case PluginModes.WEBRTC21:
                    createEnablerHoldUpdate(call, hold, remote_hold_status, successCallback, failureCallback);
                    break;
                default:
                    createEnablerHoldUpdate(call, hold, remote_hold_status, successCallback, failureCallback);
                    break;
            }
        }
    };

    /**
     * createEnablerUpdate to be used when the video start or stop
     */
    function createEnablerUpdate(call, successCallback, failureCallback, isVideoStart) {
        logger.debug("createEnablerUpdate: isVideoStart= " + isVideoStart + " state= " + call.peer.signalingState);
        var peer = call.peer, localSdp, obj, newSdp, successSdp;

        callSetLocalSendVideo(call, isVideoStart);

        localSdp = incrementVersion(getSdpFromObject(call.peer.localDescription));
        
        if (webrtcdtls) {
            if(pluginMode === PluginModes.WEBRTCH264 || pluginMode === PluginModes.WEBRTC22) {
                localSdp = deleteCryptoFromSdp(localSdp);
            }
            localSdp = setMediaActPass(localSdp);
        }
            
        localSdp = fixLocalTelephoneEventPayloadType(call, localSdp);

        obj = webRTCSdp(typeOff, localSdp);

        if(isSdpHas(obj.sdp, video)) {
            //added as native
            if (getLocalVideoTrack(call.peer)) {
                getLocalVideoTrack(call.peer).enabled = isVideoStart;
            }
            if(isVideoStart){
                obj.videoDirection = MediaStates.SEND_RECEIVE;
            } else {
                obj.videoDirection = MediaStates.RECEIVE_ONLY;
            }

            peer.setLocalDescription(obj,
                function(){
                    //since the candidates are same we can call the successCallback
                    logger.debug("createEnablerUpdate: setLocalDescription success ");
                    successSdp = updateH264Level(getSdpFromObject(obj));
                    successCallback(successSdp);
                },
                function(e) {
                    logger.debug("createEnablerUpdate: setLocalDescription failed : " + e);
                    failureCallback();
                });
        } else {
            peer.createOffer(function(obj) {
                if(isVideoStart){
                    obj.videoDirection = MediaStates.SEND_RECEIVE;
                } else {
                    obj.videoDirection = MediaStates.RECEIVE_ONLY;
                }
                
                newSdp = performVP8RTCPParameterWorkaround(getSdpFromObject(obj));
                obj = null;
                newSdp = updateH264Level(newSdp);
                
                if (webrtcdtls) {
                    if(pluginMode === PluginModes.WEBRTCH264 || pluginMode === PluginModes.WEBRTC22) {
                        newSdp = deleteCryptoFromSdp(newSdp);
                    }
                    newSdp = setMediaActPass(newSdp);
                }
                            
                newSdp = fixLocalTelephoneEventPayloadType(call, newSdp);

                call.offer = webRTCSdp(typeOff, newSdp);
                
                //logger.debug("BEFORE ENABLE VIDEO:" + obj.sdp);

                peer.setLocalDescription(call.offer,
                    function(){
                        //since the candidates have changed we will call the successCallback at onEnablerIceCandidate
                        //logger.debug("AFTER SET LOCAL DESC:" + obj.sdp);
                        logger.debug("createEnablerUpdate: createOffer setLocalDescription success ");
                    },
                    function(e) {
                        logger.error("createEnablerUpdate: createOffer setLocalDescription failed: " + e);
                        failureCallback();
                    });
            },
            function(e){
                logger.error("createEnablerUpdate: createOffer failed!!" + e);
                failureCallback();
            },
            {
                'mandatory': {
                    'OfferToReceiveAudio':mediaAudio,
                    'OfferToReceiveVideo':getGlobalSendVideo()
                }
            });
        }

    }

    /**
     * createNativeUpdate to be used when the video start or stop
     */
    function createNativeUpdate(call, successCallback, failureCallback, isVideoStart) {
        logger.debug("createNativeUpdate: isVideoStart= " + isVideoStart + " state= " + call.peer.signalingState);
        var peer = call.peer, obj, localSdp;
        
        localSdp = call.peer.localDescription.sdp;
        localSdp = fixLocalTelephoneEventPayloadType(call, localSdp);

        callSetLocalSendVideo(call,isVideoStart);

        localSdp = incrementVersion(localSdp);
        
        if (webrtcdtls) {
            localSdp = setMediaActPass(localSdp);
        }

        if(isSdpHas(localSdp, video)) {
            if (getLocalVideoTrack(call.peer)) {
                getLocalVideoTrack(call.peer).enabled = isVideoStart;
            }
            if (isVideoStart) {
                localSdp = updateSdpDirection(localSdp, video, MediaStates.SEND_RECEIVE);
            } else {
                localSdp = deescalateSdpDirection(localSdp, video);
            }

            obj = nativeWebRTCSdp(typeOff, localSdp);

            peer.setLocalDescription(obj,
                    function() {
                        //since the candidates are same we can call the successCallback
                        logger.debug("createNativeUpdate: setLocalDescription success ");
                        successCallback(obj.sdp);
                    },
                    function(e) {
                        logger.error("createNativeUpdate: setLocalDescription failed : " + e);
                        failureCallback();
                    });
        } else {
            peer.createOffer(
                    function(obj) {
                        if (isVideoStart) {
                            obj.sdp = escalateSdpDirection(obj.sdp, video);
                        } else {
                            obj.sdp = deescalateSdpDirection(obj.sdp, video);
                        }

                        obj.sdp = performVP8RTCPParameterWorkaround(obj.sdp);

                        if (webrtcdtls) {
                            obj.sdp = setMediaActPass(obj.sdp);
                        }
                
                        obj.sdp = fixLocalTelephoneEventPayloadType(call, obj.sdp);

                        peer.setLocalDescription(obj,
                                function() {
                                    //since the candidates have changed we will call the successCallback at onNativeIceCandidate
                                    // successCallback(obj.sdp);
                                    logger.debug("createNativeUpdate: createOffer setLocalDescription success ");
                                },
                                function(e) {
                                    logger.debug("createNativeUpdate: createOffer setLocalDescription failed: " + e);
                                    failureCallback();
                                });
                    },
                    function(e) {
                        logger.debug("createNativeUpdate: createOffer failed!!: " + e);
                        failureCallback();
                    },
                    {
                        'mandatory': {
                            'OfferToReceiveAudio': mediaAudio,
                            'OfferToReceiveVideo': getGlobalSendVideo()
                        }
                    }
            );
        }

    }

    /**
     * createDisablerUpdate to be used when the video start or stop
     */
    function createDisablerUpdate(call, successCallback, failureCallback, isVideoStart) {
        logger.debug("createDisablerUpdate: isVideoStart= " + isVideoStart);
        var peer = call.peer, candidates, i, successSdp,
            updateSdp = webRTCSdp(typeOff, call.sdp);

        peer.createOffer(function(obj){
            callSetLocalSendVideo(call, isVideoStart);
            if(isVideoStart){
                obj.videoDirection = MediaStates.SEND_RECEIVE;
            } else {
                obj.videoDirection = MediaStates.RECEIVE_ONLY;
            }

            peer.setLocalDescription(obj,
                function(){
                    candidates = updateSdp.createCandidates();
                    for(i=0; i<candidates.length; ++i) {
                        peer.addIceCandidate(candidates[i]);
                    }
                    successSdp = updateH264Level(obj.sdp);
                    restoreMuteStateOfCall(call);
                    successCallback(successSdp);
                },
                function(e) {
                    logger.debug("createDisablerUpdate: createOffer setLocalDescription failed: " + e );
                    failureCallback();
                });
        },
        function(e){
            logger.debug("createDisablerUpdate: createOffer failed!! " + e);
            failureCallback();
        },
        {
            "audio":mediaAudio,
            "video":getGlobalSendVideo()
        });
    }


    /**
     * Process the create update call sdp
     *
     * @ignore
     * @name rtc.createUpdate
     * @function
     * @param {Object} call IncomingCall
     * @param {function(sdp)} successCallback The success callback function to be called
     * @param {function()} failureCallback The failure callback function to be called
     * @param {boolean} isVideoStart video start/video stop: [true: video start, false:video stop ]
     */
    this.createUpdate = function(call, successCallback, failureCallback, isVideoStart){
        logger.info("createUpdate: isVideoStart= " + isVideoStart);
        if (!webRTCInitialized) {
            logger.warn(NOTINITIALIZED);
            failureCallback();
            return;
        }

        call.successCallback = successCallback;
        call.failureCallback = failureCallback;

        if(call.peer){
            switch(pluginMode) {
                case PluginModes.AUTO:
                    createNativeUpdate(call, successCallback, failureCallback, isVideoStart);
                    break;
                case PluginModes.LEGACY:
                case PluginModes.LEGACYH264:
                    createDisablerUpdate(call, successCallback, failureCallback, isVideoStart);
                    break;
                case PluginModes.WEBRTC:
                case PluginModes.WEBRTCH264:
                case PluginModes.WEBRTC22:
                case PluginModes.WEBRTC21:
                    createEnablerUpdate(call, successCallback, failureCallback, isVideoStart);
                    break;
                default:
                    createEnablerUpdate(call, successCallback, failureCallback, isVideoStart);
                    break;
            }
        }
    };

    /**
     * processEnablerHold to be used when the enabler plugin is enabled.
     */
    function processEnablerHold(call, hold, local_hold_status, successCallback, failureCallback) {
        logger.debug("processEnablerHold: local hold= " + local_hold_status + " remote hold= " + hold + " state= " + call.peer.signalingState);
        var peer=call.peer, updateSdp, sr_indx, so_indx, ro_indx, in_indx, audioDirection, videoDirection, 
            localSdp, successSdp, answerSdp, ice_ufrag, ice_pwd, newSdp, offerSdp;

        if(!local_hold_status && !hold){
            muteOnHold(call, false);
        }

        /* Added for the case in http://jira/browse/ABE-788
         * In this case slow start is received when in REMOTE_HOLD state
         * Client should return all codecs to slow start invite
         * and unhold the call.
         * 
         * This code should be removed from here with http://jira/browse/ABE-1192.
         */
        if (call.slowStartInvite) {
            peer.createOffer(function(oSdp) {
                newSdp = fixLocalTelephoneEventPayloadType(call, getSdpFromObject(oSdp));
                offerSdp = webRTCSdp(typeOff, newSdp);
                oSdp = null;
                peer.setLocalDescription(offerSdp, function() {
                    logger.debug("slow start processEnablerHold setLocalDescription success");
                    successSdp = updateH264Level(getSdpFromObject(offerSdp));
                    successCallback(successSdp);
                }, function(error) {
                    failureCallback(logPrefix + "slow start processEnablerHold setLocalDescription failed: " + error);
                });
            }, function(error) {
                logger.error("slow start processEnablerHold createOffer failed!! " + error);
                failureCallback();
            }, {
                'mandatory': {
                    'OfferToReceiveAudio': mediaAudio,
                    'OfferToReceiveVideo': getGlobalSendVideo()
                }
            });
            return;
        }
        
        call.sdp = checkSupportedVideoCodecs(call.sdp, null);
        call.sdp = performVideoPortZeroWorkaround(call.sdp);
        call.sdp = checkandRestoreICEParams(call.sdp, call.peer.localDescription.sdp);
        call.sdp = removeG722Codec(call.sdp);
        call.sdp = performG722ParameterWorkaround(call.sdp);
        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);
        call.sdp = removeRTXCodec(call.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);

        if (webrtcdtls) {
            call.sdp = setMediaActPass(call.sdp);
        }
        
        updateSdp = webRTCSdp(typeOff, call.sdp);

        audioDirection = getSdpDirection(call.sdp, audio);
        videoDirection = getSdpDirection(call.sdp, video);

        sr_indx = call.sdp.indexOf(aLine + MediaStates.SEND_RECEIVE, 0);
        so_indx = call.sdp.indexOf(aLine + MediaStates.SEND_ONLY, 0);
        ro_indx = call.sdp.indexOf(aLine + MediaStates.RECEIVE_ONLY, 0);
        in_indx = call.sdp.indexOf(aLine + MediaStates.INACTIVE, 0);

        if ( (sr_indx+1) + (so_indx+1) + (ro_indx+1) + (in_indx+1) === 0) {
            if (hold || local_hold_status) {
                logger.debug("processEnablerHold: call.sdp has no direction so setting as inactive for " + (hold ? "remote hold" : "remote unhold with local hold"));
                updateSdp.audioDirection = MediaStates.INACTIVE;  //sendonly originally
                updateSdp.videoDirection = MediaStates.INACTIVE;  //sendonly originally
            } else {
                logger.debug("processEnablerHold: call.sdp has no direction so setting as sendrecv for unhold");
                updateSdp.audioDirection = MediaStates.SEND_RECEIVE;
                updateSdp.videoDirection = MediaStates.SEND_RECEIVE;
            }
        }

        callSetReceiveVideo(call);

        peer.setRemoteDescription(updateSdp,
            function(){
                peer.createAnswer(peer.remoteDescription,function(obj){

                    localSdp = getSdpFromObject(obj);
                    obj = null;
                        
                    logger.debug("processEnablerHold: isSdpEnabled audio= " + isSdpEnabled(localSdp, audio));
                    logger.debug("processEnablerHold: isSdpEnabled video= " + isSdpEnabled(localSdp, video));

                    if(hold){
                        logger.debug("processEnablerHold: " + (hold ? "Remote HOLD" : "Remote UNHOLD with Local Hold"));

                        if(audioDirection === MediaStates.SEND_ONLY){
                            logger.debug("processEnablerHold: audio sendonly -> recvonly");
                            localSdp = updateSdpDirection(localSdp, audio, MediaStates.RECEIVE_ONLY);
                        }
                        if(videoDirection === MediaStates.SEND_ONLY){
                            logger.debug("processEnablerHold: video sendonly -> recvonly");
                            localSdp = updateSdpDirection(localSdp, video, MediaStates.RECEIVE_ONLY);
                        }

                        if(audioDirection === MediaStates.RECEIVE_ONLY){
                            logger.debug("processEnablerHold: audio recvonly -> sendonly");
                            localSdp = updateSdpDirection(localSdp, audio, MediaStates.SEND_ONLY);
                        }
                        if(videoDirection === MediaStates.RECEIVE_ONLY){
                            logger.debug("processEnablerHold: video recvonly -> sendonly");
                            localSdp = updateSdpDirection(localSdp, video, MediaStates.SEND_ONLY);
                        }

                        if(audioDirection === MediaStates.SEND_RECEIVE){
                            logger.debug("processEnablerHold: audio sendrecv -> sendrecv");
                            localSdp = updateSdpDirection(localSdp, audio, MediaStates.SEND_RECEIVE);
                        }
                        if(videoDirection === MediaStates.SEND_RECEIVE){
                            logger.debug("processEnablerHold: video sendrecv -> sendrecv");
                            localSdp = updateSdpDirection(localSdp, video, MediaStates.SEND_RECEIVE);
                        }

                        if(audioDirection === MediaStates.INACTIVE){
                            logger.debug("processEnablerHold: audio inactive -> inactive");
                            localSdp = updateSdpDirection(localSdp, audio, MediaStates.INACTIVE);
                        }
                        if(videoDirection === MediaStates.INACTIVE){
                            logger.debug("processEnablerHold: video inactive -> inactive");
                            localSdp = updateSdpDirection(localSdp, video, MediaStates.INACTIVE);
                        }

                        if ( (sr_indx+1) + (so_indx+1) + (ro_indx+1) + (in_indx+1) === 0) {
                            logger.debug("processEnablerHold: no direction detected so setting as inactive");
                            localSdp = updateSdpDirection(localSdp, audio, MediaStates.INACTIVE);
                            localSdp = updateSdpDirection(localSdp, video, MediaStates.INACTIVE);
                        }
                    } else if(local_hold_status) {
                        if(audioDirection === MediaStates.INACTIVE) {
                            localSdp = updateSdpDirection(localSdp, audio, MediaStates.INACTIVE);                 
                        } else {
                            localSdp = updateSdpDirection(localSdp, audio, MediaStates.SEND_ONLY);
                        }
                                    
                        if (callCanLocalSendVideo(call)) {
                            logger.debug("processEnablerHold: Remote UNHOLD with local Hold: sendrecv -> recvonly");
                            localSdp = updateSdpDirection(localSdp, video, MediaStates.SEND_ONLY);
                            callSetLocalSendVideo(call, true);
                        } else {
                            logger.debug("processEnablerHold: Remote UNHOLD with local Hold: sendrecv -> inactive");
                            localSdp = updateSdpDirection(localSdp, video, MediaStates.INACTIVE);
                            callSetLocalSendVideo(call, false);
                        }                     
                    } else {
                        if (callCanLocalSendVideo(call)) {
                            if (isSdpVideoSendEnabled(call.sdp, video)) {
                                localSdp = updateSdpDirection(localSdp, video, MediaStates.SEND_RECEIVE);
                            } else {
                                localSdp = updateSdpDirection(localSdp, video, MediaStates.SEND_ONLY);
                            }
                        } else {
                            if (isSdpVideoSendEnabled(call.sdp, video)) {
                                localSdp = updateSdpDirection(localSdp, video, MediaStates.RECEIVE_ONLY);
                            } else {
                                localSdp = updateSdpDirection(localSdp, video, MediaStates.INACTIVE);
                            }
                        }
                        //change audio's direction to sendrecv for ssl attendees in a 3wc
                        //obj.sdp = changeDirection(obj.sdp, MediaStates.RECEIVE_ONLY, MediaStates.SEND_RECEIVE, audio);
                        localSdp = updateSdpDirection(localSdp, audio, MediaStates.SEND_RECEIVE);

                        logger.debug("processEnablerHold: UNHOLD: direction left as it is");
                    }
                    //TODO: Since there is no setter method for obj.sdp from the plugin side,
                    //      we create a temporary local variable and pass obj.sdp's value into it.
                    //      Rewrite the below part of code when the setter method is applied to the plugin side
                    localSdp = performVP8RTCPParameterWorkaround(localSdp);
                    localSdp = updateVersion(peer.localDescription.sdp, localSdp);

                    ice_ufrag = getICEParams(localSdp, ICEParams.ICE_UFRAG, true);
                    ice_pwd = getICEParams(localSdp, ICEParams.ICE_PWD, true);
                                
                    if(ice_ufrag && ice_ufrag.length < 4) { /*RFC 5245 the ice-ufrag attribute can be 4 to 256 bytes long*/
                        ice_ufrag = getICEParams(updateSdp.sdp, ICEParams.ICE_UFRAG, true);
                        if(ice_ufrag) {
                            localSdp = updateICEParams(localSdp, ICEParams.ICE_UFRAG, ice_ufrag);
                        }
                    }

                    if(ice_pwd && ice_pwd.length  < 22) { /*RFC 5245 the ice-pwd attribute can be 22 to 256 bytes long*/
                        ice_pwd = getICEParams(updateSdp.sdp, ICEParams.ICE_PWD, true);
                        if(ice_pwd < 22) {
                            localSdp = updateICEParams(localSdp, ICEParams.ICE_PWD, ice_pwd);
                        }
                    }
                                
                    if (webrtcdtls) {
                        localSdp = setMediaPassive(localSdp);
                    }

                    localSdp = fixLocalTelephoneEventPayloadType(call, localSdp);

                    answerSdp = webRTCSdp(typeAns, localSdp);
                        
                    call.answer = answerSdp;       // ABE-1328

                    peer.setLocalDescription(answerSdp,
                        function(){
                            successSdp = updateH264Level(getSdpFromObject(answerSdp));
                            successCallback(successSdp);
                            call.successCallback = null;
                            call.answer = null;                              
                        },
                        function(e) {
                            logger.debug("processEnablerHold: setLocalDescription failed: " + e);
                            failureCallback(logPrefix + "processEnablerHold: setLocalDescription failed");
                            call.answer = null;                              
                        });
                },
                function(e){
                    logger.debug("processEnablerHold: createAnswer failed!!: " + e);
                    failureCallback(logPrefix + "Session cannot be created");
                },
                {
                    'mandatory': {
                        'OfferToReceiveAudio': mediaAudio,
                        'OfferToReceiveVideo': getGlobalSendVideo()
                    }
                });
            },
            function(e) {
                logger.debug("processEnablerHold: setRemoteDescription failed: " + e);
            });
    }

    /**
     * processEnabler30Hold to be used when the enabler plugin is enabled.
     */
    function processEnabler30Hold(call, hold, local_hold_status, successCallback, failureCallback) {
        logger.debug("processEnabler30Hold: local hold= " + local_hold_status + " remote hold= " + hold + " state= " + call.peer.signalingState);
        var peer=call.peer, updateSdp, sr_indx, so_indx, ro_indx, in_indx, audioDirection, videoDirection, 
            localSdp, successSdp, answerSdp, ice_ufrag, ice_pwd, newSdp, offerSdp;

        if(!local_hold_status && !hold){
            muteOnHold(call, false);
        }

        /* Added for the case in http://jira/browse/ABE-788
         * In this case slow start is received when in REMOTE_HOLD state
         * Client should return all codecs to slow start invite
         * and unhold the call.
         * 
         * This code should be removed from here with http://jira/browse/ABE-1192.
         */
        if (call.slowStartInvite) {
            peer.createOffer(function(oSdp) {
                newSdp = fixLocalTelephoneEventPayloadType(call, getSdpFromObject(oSdp));
                offerSdp = webRTCSdp(typeOff, newSdp);
                oSdp = null;
                peer.setLocalDescription(offerSdp, function() {
                    logger.debug("slow start processEnablerHold setLocalDescription success");
                    successSdp = updateH264Level(getSdpFromObject(offerSdp));
                    successCallback(successSdp);
                }, function(error) {
                    failureCallback(logPrefix + "slow start processEnablerHold setLocalDescription failed: " + error);
                });
            }, function(error) {
                logger.error("slow start processEnablerHold createOffer failed!! " + error);
                failureCallback();
            }, {
                'mandatory': {
                    'OfferToReceiveAudio': mediaAudio,
                    'OfferToReceiveVideo': getGlobalSendVideo()
                }
            });
            return;
        }
        
        call.sdp = checkSupportedVideoCodecs(call.sdp, null);
        call.sdp = performVideoPortZeroWorkaround(call.sdp);
        call.sdp = checkandRestoreICEParams(call.sdp, call.peer.localDescription.sdp);
        call.sdp = removeG722Codec(call.sdp);
        call.sdp = performG722ParameterWorkaround(call.sdp);
        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);
        call.sdp = removeRTXCodec(call.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);

        if (webrtcdtls) {
            call.sdp = setMediaActPass(call.sdp);
        }
        
        updateSdp = webRTCSdp(typeOff, call.sdp);

        audioDirection = getSdpDirection(call.sdp, audio);
        videoDirection = getSdpDirection(call.sdp, video);

        sr_indx = call.sdp.indexOf(aLine + MediaStates.SEND_RECEIVE, 0);
        so_indx = call.sdp.indexOf(aLine + MediaStates.SEND_ONLY, 0);
        ro_indx = call.sdp.indexOf(aLine + MediaStates.RECEIVE_ONLY, 0);
        in_indx = call.sdp.indexOf(aLine + MediaStates.INACTIVE, 0);

        if ( (sr_indx+1) + (so_indx+1) + (ro_indx+1) + (in_indx+1) === 0) {
            if (hold || local_hold_status) {
                logger.debug("processEnabler30Hold: call.sdp has no direction so setting as inactive for " + (hold ? "remote hold" : "remote unhold with local hold"));
                updateSdp.audioDirection = MediaStates.INACTIVE;  //sendonly originally
                updateSdp.videoDirection = MediaStates.INACTIVE;  //sendonly originally
            } else {
                logger.debug("processEnabler30Hold: call.sdp has no direction so setting as sendrecv for unhold");
                updateSdp.audioDirection = MediaStates.SEND_RECEIVE;
                updateSdp.videoDirection = MediaStates.SEND_RECEIVE;
            }
        }

        // basar
        if (audioDirection === MediaStates.SEND_RECEIVE) {
            updateSdp.audioDirection = MediaStates.INACTIVE;    //Chrome38 fix
        }

        if (videoDirection === MediaStates.SEND_RECEIVE) {
            updateSdp.videoDirection = MediaStates.INACTIVE;    //chrome38 fix
        } 
        // basar

        // 1st setRemoteDescription to make webrtc remove the audio and/or video streams
        // 2nd setRemote will add the audio stream back so that services like MOH can work
        // This code will also run in UnHold scenario, and it will remove & add video stream
        peer.setRemoteDescription(updateSdp,
            function(){
                // basar 
                updateSdp.audioDirection = MediaStates.SEND_RECEIVE;
                updateSdp.videoDirection = videoDirection;
                // basar                
            
                peer.setRemoteDescription(updateSdp,
                    function(){
                        if(!hold && !local_hold_status && (videoDirection === MediaStates.INACTIVE)) {
                            call.remoteVideoState = MediaStates.RECEIVE_ONLY;
                        }else{    
                            call.remoteVideoState = updateSdp.videoDirection;
                        }
                        //check if remote party sends video
                        callSetReceiveVideo(call);
                        peer.createAnswer(peer.remoteDescription,
                            function(obj){
                                localSdp = getSdpFromObject(obj);
                                obj = null;
                                logger.debug("processEnabler30Hold: isSdpEnabled audio= " + isSdpEnabled(localSdp, audio));
                                logger.debug("processEnabler30Hold: isSdpEnabled video= " + isSdpEnabled(localSdp, video));

                                if(hold){
                                    logger.debug("processEnabler30Hold: " + (hold ? "Remote HOLD" : "Remote UNHOLD with Local Hold"));

                                    if(audioDirection === MediaStates.SEND_ONLY){
                                        logger.debug("processEnabler30Hold: audio sendonly -> recvonly");
                                        localSdp = updateSdpDirection(localSdp, audio, MediaStates.RECEIVE_ONLY);  
                                    }
                                    if(videoDirection === MediaStates.SEND_ONLY){
                                        logger.debug("processEnabler30Hold: video sendonly -> recvonly");
                                        localSdp = updateSdpDirection(localSdp, video, MediaStates.RECEIVE_ONLY);  
                                    }

                                    if(audioDirection === MediaStates.RECEIVE_ONLY){
                                        logger.debug("processEnabler30Hold: audio recvonly -> sendonly");
                                        localSdp = updateSdpDirection(localSdp, audio, MediaStates.SEND_ONLY);  
                                    }
                                    if(videoDirection === MediaStates.RECEIVE_ONLY){
                                        logger.debug("processEnabler30Hold: video recvonly -> sendonly");
                                        localSdp = updateSdpDirection(localSdp, video, MediaStates.SEND_ONLY);  
                                    }

                                    if(audioDirection === MediaStates.SEND_RECEIVE){
                                        logger.debug("processEnabler30Hold: audio sendrecv -> sendrecv");
                                        localSdp = updateSdpDirection(localSdp, audio, MediaStates.SEND_RECEIVE);  
                                    }
                                    if(videoDirection === MediaStates.SEND_RECEIVE){
                                        logger.debug("processEnabler30Hold: video sendrecv -> sendrecv");
                                        localSdp = updateSdpDirection(localSdp, video, MediaStates.SEND_RECEIVE);  
                                    }

                                    if(audioDirection === MediaStates.INACTIVE){
                                        logger.debug("processEnabler30Hold: audio inactive -> inactive");
                                        localSdp = updateSdpDirection(localSdp, audio, MediaStates.INACTIVE);  
                                    }
                                    if(videoDirection === MediaStates.INACTIVE){
                                        logger.debug("processEnabler30Hold: video inactive -> inactive");
                                        localSdp = updateSdpDirection(localSdp, video, MediaStates.INACTIVE);  
                                    }

                                    if ( (sr_indx+1) + (so_indx+1) + (ro_indx+1) + (in_indx+1) === 0) {
                                        logger.debug("processEnabler30Hold: no direction detected so setting as inactive");
                                        localSdp = updateSdpDirection(localSdp, audio, MediaStates.INACTIVE);  
                                        localSdp = updateSdpDirection(localSdp, video, MediaStates.INACTIVE);  
                                    }
                                } else if(local_hold_status) {
                                    if(audioDirection === MediaStates.INACTIVE) {
                                        logger.debug("processEnablerHold: Remote HOLD: sendonly-> inactive");
                                        localSdp = updateSdpDirection(localSdp, audio, MediaStates.INACTIVE);                 
                                    } else {
                                        localSdp = updateSdpDirection(localSdp, audio, MediaStates.SEND_ONLY);
                                    }
                                    
                                    if (callCanLocalSendVideo(call)) {
                                        logger.debug("processEnablerHold: Remote UNHOLD with local Hold: sendrecv -> recvonly");
                                        localSdp = updateSdpDirection(localSdp, video, MediaStates.SEND_ONLY);
                                        callSetLocalSendVideo(call, true);
                                    } else {
                                        logger.debug("processEnablerHold: Remote UNHOLD with local Hold: sendrecv -> inactive");
                                        localSdp = updateSdpDirection(localSdp, video, MediaStates.INACTIVE);
                                        callSetLocalSendVideo(call, false);
                                    }                     
                                } else {
                                    if (callCanLocalSendVideo(call)) {
                                        if (isSdpVideoSendEnabled(call.sdp, video)) {
                                            localSdp = updateSdpDirection(localSdp, video, MediaStates.SEND_RECEIVE);
                                        } else {
                                            localSdp = updateSdpDirection(localSdp, video, MediaStates.SEND_ONLY);
                                        }
                                    } else {
                                        if (isSdpVideoSendEnabled(call.sdp, video)) {
                                            localSdp = updateSdpDirection(localSdp, video, MediaStates.RECEIVE_ONLY);
                                        } else {
                                            localSdp = updateSdpDirection(localSdp, video, MediaStates.INACTIVE);
                                        }
                                    }
                                    //change audio's direction to sendrecv for ssl attendees in a 3wc
                                    localSdp = changeDirection(localSdp, MediaStates.RECEIVE_ONLY, MediaStates.SEND_RECEIVE, audio);

                                    logger.debug("processEnabler30Hold: UNHOLD: direction left as it is");
                                }
                                //TODO: Since there is no setter method for obj.sdp from the plugin side,
                                //      we create a temporary local variable and pass obj.sdp's value into it.
                                //      Rewrite the below part of code when the setter method is applied to the plugin side
                                localSdp = performVP8RTCPParameterWorkaround(localSdp);
                                localSdp = updateVersion(getSdpFromObject(peer.localDescription), localSdp);

                                ice_ufrag = getICEParams(localSdp, ICEParams.ICE_UFRAG, true);
                                ice_pwd = getICEParams(localSdp, ICEParams.ICE_PWD, true);
                                
                                if(ice_ufrag && ice_ufrag.length < 4) { /*RFC 5245 the ice-ufrag attribute can be 4 to 256 bytes long*/
                                    ice_ufrag = getICEParams(updateSdp.sdp, ICEParams.ICE_UFRAG, true);
                                    if(ice_ufrag) {
                                        localSdp = updateICEParams(localSdp, ICEParams.ICE_UFRAG, ice_ufrag);
                                    }
                                }

                                if(ice_pwd && ice_pwd.length  < 22) { /*RFC 5245 the ice-pwd attribute can be 22 to 256 bytes long*/
                                    ice_pwd = getICEParams(updateSdp.sdp, ICEParams.ICE_PWD, true);
                                    if(ice_pwd < 22) {
                                        localSdp = updateICEParams(localSdp, ICEParams.ICE_PWD, ice_pwd);
                                    }
                                }
                                
                                if (webrtcdtls) {
                                    localSdp = setMediaPassive(localSdp);
                                }

                                localSdp = fixLocalTelephoneEventPayloadType(call, localSdp);

                                answerSdp = webRTCSdp(typeAns, localSdp);
                        
                                call.answer = answerSdp;       // ABE-1328

                                peer.setLocalDescription(answerSdp,
                                    function(){
                                        successSdp = updateH264Level(getSdpFromObject(answerSdp));
                                        successCallback(successSdp);
                                        call.successCallback = null;
                                        call.answer = null;                              
                                    },
                                    function(e) {
                                        logger.debug("processEnabler30Hold: setLocalDescription failed: " + e);
                                        failureCallback(logPrefix + "processEnabler30Hold: setLocalDescription failed");
                                        call.answer = null;                              
                                    });
                            },
                            function(e){
                                logger.debug("processEnabler30Hold: createAnswer failed!!: " + e);
                                failureCallback(logPrefix + "Session cannot be created");
                            },
                            {
                                'mandatory': {
                                    'OfferToReceiveAudio': mediaAudio,
                                    'OfferToReceiveVideo': getGlobalSendVideo()
                                }
                            });
                    },
                    function(e) {
                        logger.debug("processEnabler30Hold: setRemoteDescription failed: " + e);
                    });
            },
            function(e) {
                logger.debug("processEnabler30Hold: setRemoteDescription failed!! " + e);
                failureCallback("Session cannot be created");
            });            
    }

    /**
     * processNativeHold to be used when native webrtc is enabled.
     */
    function processNativeHold(call, hold, local_hold_status, successCallback, failureCallback) {
        logger.debug("processNativeHold: local hold= " + local_hold_status + " remote hold= " + hold + " state= " + call.peer.signalingState);
        var peer = call.peer, updateSdp, sr_indx, so_indx, ro_indx, in_indx, audioDirection, videoDirection,
            ice_ufrag, ice_pwd;

        if(!local_hold_status && !hold){
            muteOnHold(call, false);
        }

        /* Added for the case in http://jira/browse/ABE-788
         * In this case slow start is received when in REMOTE_HOLD state
         * Client should return all codecs to slow start invite
         * and unhold the call.
         * 
         * This code should be removed from here with http://jira/browse/ABE-1192.
         */
        if (call.slowStartInvite) {
            peer.createOffer(function(oSdp) {
                oSdp.sdp = fixLocalTelephoneEventPayloadType(call, oSdp.sdp);

                peer.setLocalDescription(oSdp, function() {
                    logger.debug("slow start processNativeHold setLocalDescription success");
                    successCallback(oSdp.sdp);
                }, function(error) {
                    failureCallback(logPrefix + "slow start processNativeHold setLocalDescription failed: " + error);
                });
            }, function(error) {
                logger.error("slow start processNativeHold createOffer failed!! " + error);
                failureCallback();
            }, {
                'mandatory': {
                    'OfferToReceiveAudio': mediaAudio,
                    'OfferToReceiveVideo': getGlobalSendVideo()
                }
            });
            return;
        }
        
        call.sdp = checkSupportedVideoCodecs(call.sdp, null);
        call.sdp = performVideoPortZeroWorkaround(call.sdp);
        call.sdp = checkandRestoreICEParams(call.sdp, call.peer.localDescription.sdp);
        call.sdp = removeG722Codec(call.sdp);
        call.sdp = performG722ParameterWorkaround(call.sdp);
        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);

        if (webrtcdtls) {
            call.sdp = setMediaActPass(call.sdp);
        }

        updateSdp = nativeWebRTCSdp(typeOff, call.sdp);
        
        audioDirection = getSdpDirection(call.sdp, audio);
        videoDirection = getSdpDirection(call.sdp, video);

        sr_indx = call.sdp.indexOf(aLine + MediaStates.SEND_RECEIVE, 0);
        so_indx = call.sdp.indexOf(aLine + MediaStates.SEND_ONLY, 0);
        ro_indx = call.sdp.indexOf(aLine + MediaStates.RECEIVE_ONLY, 0);
        in_indx = call.sdp.indexOf(aLine + MediaStates.INACTIVE, 0);

        if ((sr_indx + 1) + (so_indx + 1) + (ro_indx + 1) + (in_indx + 1) === 0) {
            if (hold || local_hold_status) {
                logger.debug("processNativeHold: call.sdp has no direction so setting as inactive for " + (hold ? "remote hold" : "remote unhold with local hold"));
                updateSdp.sdp = updateSdpDirection(updateSdp.sdp, audio, MediaStates.INACTIVE);  //sendonly originally
                updateSdp.sdp = updateSdpDirection(updateSdp.sdp, video, MediaStates.INACTIVE);  //sendonly originally
            } else {
                logger.debug("processNativeHold: call.sdp has no direction so setting as sendrecv for unhold");
                updateSdp.sdp = updateSdpDirection(updateSdp.sdp, audio, MediaStates.SEND_RECEIVE);
                updateSdp.sdp = updateSdpDirection(updateSdp.sdp, video, MediaStates.SEND_RECEIVE);
            }
        }

        // basar
        if (audioDirection === MediaStates.SEND_RECEIVE) {
            updateSdp.sdp = updateSdpDirection(updateSdp.sdp, audio, MediaStates.INACTIVE); // chrome38 fix
        }

        if (videoDirection === MediaStates.SEND_RECEIVE) {
            updateSdp.sdp = updateSdpDirection(updateSdp.sdp, video, MediaStates.INACTIVE); // chrome38 fix
        } 
        // basar
        
        // 1st setRemoteDescription to make webrtc remove the audio and/or video streams
        // 2nd setRemote will add the audio stream back so that services like MOH can work
        // This code will also run in UnHold scenario, and it will remove & add video stream
        peer.setRemoteDescription(updateSdp,
            function() {
                // basar 
                updateSdp.sdp = updateSdpDirection(updateSdp.sdp, audio, MediaStates.SEND_RECEIVE);  
                updateSdp.sdp = updateSdpDirection(updateSdp.sdp, video, videoDirection);  
                // basar                
                peer.setRemoteDescription(updateSdp,
                    function() {
                        if(!hold && !local_hold_status && (videoDirection === MediaStates.INACTIVE)) {
                            call.remoteVideoState = MediaStates.RECEIVE_ONLY;
                        }else{    
                            call.remoteVideoState = getSdpDirection(updateSdp.sdp, video);
                        }
                        //check if remote party sends video
                        callSetReceiveVideo(call);
                        peer.createAnswer(
                            function(obj){
                                logger.debug("processNativeHold: isSdpEnabled audio= " + isSdpEnabled(obj.sdp, audio));
                                logger.debug("processNativeHold: isSdpEnabled video= " + isSdpEnabled(obj.sdp, video));

                                if (hold) {
                                    logger.debug("processNativeHold: " + (hold ? "Remote HOLD" : "Remote UNHOLD with Local HOLD"));

                                    if (audioDirection === MediaStates.SEND_ONLY) {
                                        logger.debug("processNativeHold: audio sendonly -> recvonly");
                                        obj.sdp = updateSdpDirection(obj.sdp, audio, MediaStates.RECEIVE_ONLY);
                                    }

                                    if (videoDirection === MediaStates.SEND_ONLY) {
                                        logger.debug("processNativeHold: video sendonly -> recvonly");
                                        obj.sdp = updateSdpDirection(obj.sdp, video, MediaStates.RECEIVE_ONLY);
                                    }

                                    if (audioDirection === MediaStates.RECEIVE_ONLY) {
                                        logger.debug("processNativeHold: audio recvonly -> sendonly");
                                        obj.sdp = updateSdpDirection(obj.sdp, audio, MediaStates.SEND_ONLY);
                                    }

                                    if (videoDirection === MediaStates.RECEIVE_ONLY) {
                                        logger.debug("processNativeHold: video recvonly -> sendonly");
                                        obj.sdp = updateSdpDirection(obj.sdp, video, MediaStates.SEND_ONLY);
                                    }

                                    if (audioDirection === MediaStates.SEND_RECEIVE) {
                                        logger.debug("processNativeHold: audio sendrecv -> sendrecv");
                                        obj.sdp = updateSdpDirection(obj.sdp, audio, MediaStates.SEND_RECEIVE);
                                    }

                                    if (videoDirection === MediaStates.SEND_RECEIVE) {
                                        logger.debug("processNativeHold: video sendrecv -> sendrecv");
                                        obj.sdp = updateSdpDirection(obj.sdp, video, MediaStates.SEND_RECEIVE);
                                    }

                                    if (audioDirection === MediaStates.INACTIVE) {
                                        logger.debug("processNativeHold: audio inactive -> inactive");
                                        obj.sdp = updateSdpDirection(obj.sdp, audio, MediaStates.INACTIVE);
                                    }

                                    if (videoDirection === MediaStates.INACTIVE) {
                                        logger.debug("processNativeHold: video inactive -> inactive");
                                        obj.sdp = updateSdpDirection(obj.sdp, video, MediaStates.INACTIVE);
                                    }

                                    if ((sr_indx + 1) + (so_indx + 1) + (ro_indx + 1) + (in_indx + 1) === 0) {
                                        logger.debug("processNativeHold: no direction detected so setting as inactive");
                                        obj.sdp = updateSdpDirection(obj.sdp, audio, MediaStates.INACTIVE);
                                        obj.sdp = updateSdpDirection(obj.sdp, video, MediaStates.INACTIVE);
                                    }

                                } else if(!local_hold_status) {
                                    if (callCanLocalSendVideo(call)) {
                                        if (isSdpVideoSendEnabled(call.sdp, video)) {
                                            obj.sdp = updateSdpDirection(obj.sdp, video, MediaStates.SEND_RECEIVE);
                                        } else {
                                            obj.sdp = updateSdpDirection(obj.sdp, video, MediaStates.SEND_ONLY);
                                        }
                                    } else {
                                        if (isSdpVideoSendEnabled(call.sdp, video)) {
                                            obj.sdp = updateSdpDirection(obj.sdp, video, MediaStates.RECEIVE_ONLY);
                                        } else {
                                            obj.sdp = updateSdpDirection(obj.sdp, video, MediaStates.INACTIVE);
                                        }
                                    }
                                    //change audio's direction to sendrecv for ssl attendees in a 3wc
                                    obj.sdp = changeDirection(obj.sdp, MediaStates.RECEIVE_ONLY, MediaStates.SEND_RECEIVE, audio);

                                    logger.debug("processNativeHold: Remote UNHOLD: direction left as it is");
                                }

                                if(local_hold_status)
                                {
                                    if(audioDirection === MediaStates.INACTIVE) {
                                        logger.debug("processNativeHold: Remote HOLD: sendonly-> inactive");
                                        obj.sdp = updateSdpDirection(obj.sdp, audio, MediaStates.INACTIVE);                 
                                    } else {
                                        obj.sdp = updateSdpDirection(obj.sdp, audio, MediaStates.SEND_ONLY);
                                    }

                                    if (callCanLocalSendVideo(call)) {
                                        logger.debug("processNativeHold: Remote UNHOLD: sendrecv-> recvonly");
                                        obj.sdp = updateSdpDirection(obj.sdp, video, MediaStates.SEND_ONLY);
                                    } else {
                                        logger.debug("processNativeHold: Remote UNHOLD: sendrecv-> inactive");
                                        obj.sdp = updateSdpDirection(obj.sdp, video, MediaStates.INACTIVE);
                                    }                     
                                }

                                obj.sdp = performVP8RTCPParameterWorkaround(obj.sdp);

                                obj.sdp = updateVersion(peer.localDescription.sdp, obj.sdp);

                                ice_ufrag = getICEParams(obj.sdp, ICEParams.ICE_UFRAG, true);
                                ice_pwd = getICEParams(obj.sdp, ICEParams.ICE_PWD, true);
                                
                                if(ice_ufrag && ice_ufrag.length < 4) { /*RFC 5245 the ice-ufrag attribute can be 4 to 256 bytes long*/
                                        ice_ufrag = getICEParams(updateSdp.sdp, ICEParams.ICE_UFRAG, true);
                                        if(ice_ufrag) {
                                            obj.sdp = updateICEParams(obj.sdp, ICEParams.ICE_UFRAG, ice_ufrag);
                                        }
                                }

                                if(ice_pwd && ice_pwd.length  < 22) { /*RFC 5245 the ice-pwd attribute can be 22 to 256 bytes long*/
                                    ice_pwd = getICEParams(updateSdp.sdp, ICEParams.ICE_PWD, true);
                                    if(ice_pwd < 22) {
                                        obj.sdp = updateICEParams(obj.sdp, ICEParams.ICE_PWD, ice_pwd);
                                    }
                                }
                                
                                obj.sdp = fixLocalTelephoneEventPayloadType(call, obj.sdp);

                                call.answer = obj.sdp;       // ABE-1328

                                peer.setLocalDescription(obj,
                                    function() {
                                        successCallback(obj.sdp);
                                        call.successCallback = null;
                                        call.answer = null;                              
                                    },
                                    function(e) {
                                        logger.debug("processNativeHold: setLocalDescription failed!! " + e);
                                        failureCallback(logPrefix + "Session cannot be created");
                                        call.answer = null;       // ABE-1328
                                    });
                            },
                            function(e){
                                logger.debug("processNativeHold: createAnswer failed!!: " + e);
                                failureCallback(logPrefix + "Session cannot be created");
                            },
                            {
                                'mandatory': {
                                    'OfferToReceiveAudio':mediaAudio,
                                    'OfferToReceiveVideo':getGlobalSendVideo()
                                }
                            });
                    },
                    function(e) {
                        logger.debug("processNativeHold: setRemoteDescription failed!! " + e);
                        failureCallback("Session cannot be created");
                    });
            },
            function(e) {
                logger.debug("processNativeHold: setRemoteDescription failed!! " + e);
                failureCallback("Session cannot be created");
            });
    }

    /**
     * processDisablerHold to be used when the disabler plugin is enabled.
     */
    function processDisablerHold(call, hold, local_hold_status, successCallback, failureCallback) {
        logger.debug("processDisablerHold: local hold= " + local_hold_status + " remote hold= " + hold);
        var peer=call.peer, updateSdp, sr_indx, so_indx, ro_indx, in_indx, 
            audioDirection, videoDirection, candidates, i, successSdp;

        /* Added for the case in http://jira/browse/ABE-1140
         * In this case slow start is received when in REMOTE_HOLD state
         * Client should return all codecs to slow start invite
         * and unhold the call.
         * 
         * This code should be removed from here with http://jira/browse/ABE-1192.
         */
        if (call.slowStartInvite) {
            peer.createOffer(function(obj) {
                obj.videoDirection = MediaStates.SEND_RECEIVE;
                peer.setLocalDescription(obj, function() {
                    candidates = obj.createCandidates();
                    for (i = 0; i < candidates.length; ++i) {
                        peer.addIceCandidate(candidates[i]);
                    }
                    successSdp = updateH264Level(obj.sdp);
                    restoreMuteStateOfCall(call);
                    successCallback(successSdp);
                }, function(e) {
                    failureCallback();
                });
            }, function(e) {
                failureCallback();
            }, {
                "audio": mediaAudio,
                "video": getGlobalSendVideo()
            });

            return;
        }
        /************************************************/

        if(call.sdp.indexOf(mLine + video + " 0 ") !== -1) {
            call.sdp = call.sdp.replace(mLine + video + " 0 ", mLine + video + " 1 ");
        }
        
        call.sdp = checkSupportedVideoCodecs(call.sdp, null);
        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);
        
        updateSdp = webRTCSdp(typeOff,call.sdp);

        audioDirection = getSdpDirection(call.sdp, audio);
        videoDirection = getSdpDirection(call.sdp, video);

        sr_indx = call.sdp.indexOf(aLine + MediaStates.SEND_RECEIVE, 0);
        so_indx = call.sdp.indexOf(aLine + MediaStates.SEND_ONLY, 0);
        ro_indx = call.sdp.indexOf(aLine + MediaStates.RECEIVE_ONLY, 0);
        in_indx = call.sdp.indexOf(aLine + MediaStates.INACTIVE, 0);

        if ( (sr_indx+1) + (so_indx+1) + (ro_indx+1) + (in_indx+1) === 0) {
            //if (hold || local_hold_status) {
            if (hold) {
                logger.debug("processDisablerHold: call.sdp has no direction so setting as inactive for " + (hold ? "remote hold" : "remote unhold with local hold"));
                updateSdp.audioDirection = MediaStates.INACTIVE;  //sendonly originally
                updateSdp.videoDirection = MediaStates.INACTIVE;  //sendonly originally
            } else {
                logger.debug("processDisablerHold: call.sdp has no direction so setting as sendrecv for unhold");
                updateSdp.audioDirection = MediaStates.SEND_RECEIVE;
                updateSdp.videoDirection = MediaStates.SEND_RECEIVE;
                
                peer.refreshRenderer();
            }
        }

        peer.setRemoteDescription(updateSdp,
            function(){
                candidates = updateSdp.createCandidates();
                for(i=0; i<candidates.length; ++i) {
                    peer.addIceCandidate(candidates[i]);
                }

                //check if remote party sends video
                callSetReceiveVideo(call);

                peer.createAnswer(peer.remoteDescription, function(obj){
                    logger.debug("processDisablerHold: isSdpEnabled audio= " + isSdpEnabled(obj.sdp, audio));
                    logger.debug("processDisablerHold: isSdpEnabled video= " + isSdpEnabled(obj.sdp, video));

                    if (isSdpEnabled(obj.sdp, audio) || isSdpEnabled(obj.sdp, video)) {
                        if(hold){
                            logger.debug("processDisablerHold: " + (hold ? "Remote HOLD" : "Remote UNHOLD with Local Hold"));

                            if(audioDirection === MediaStates.SEND_ONLY){
                                logger.debug("processDisablerHold: audio sendonly -> recvonly");
                                obj.audioDirection = MediaStates.RECEIVE_ONLY;
                            }
                            if(videoDirection === MediaStates.SEND_ONLY){
                                logger.debug("processDisablerHold: video sendonly -> recvonly");
                                obj.videoDirection = MediaStates.RECEIVE_ONLY;
                            }

                            if(audioDirection === MediaStates.RECEIVE_ONLY){
                                logger.debug("processDisablerHold: audio recvonly -> sendonly");
                                obj.audioDirection = MediaStates.SEND_ONLY;
                            }
                            if(videoDirection === MediaStates.RECEIVE_ONLY){
                                logger.debug("processDisablerHold: video recvonly -> sendonly");
                                obj.videoDirection = MediaStates.SEND_ONLY;
                            }

                            if(audioDirection === MediaStates.SEND_RECEIVE){
                                logger.debug("processDisablerHold: audio sendrecv -> sendrecv");
                                obj.audioDirection = MediaStates.SEND_RECEIVE;
                            }
                            if(videoDirection === MediaStates.SEND_RECEIVE){
                                logger.debug("processDisablerHold: video sendrecv -> sendrecv");
                                obj.videoDirection = MediaStates.SEND_RECEIVE;
                            }

                            if(audioDirection === MediaStates.INACTIVE){
                                logger.debug("processDisablerHold: audio inactive -> inactive");
                                obj.audioDirection = MediaStates.INACTIVE;
                            }
                            if(videoDirection === MediaStates.INACTIVE){
                                logger.debug("processDisablerHold: video inactive -> inactive");
                                obj.videoDirection = MediaStates.INACTIVE;
                            }

                            if ( (sr_indx+1) + (so_indx+1) + (ro_indx+1) + (in_indx+1) === 0) {
                                logger.debug("processDisablerHold: no direction detected so setting as inactive");
                                obj.audioDirection = MediaStates.INACTIVE;    //sendrecv originally
                                obj.videoDirection = MediaStates.INACTIVE;    //sendrecv originally
                            }
                        } else if(local_hold_status) {
                            obj.audioDirection = MediaStates.INACTIVE;    //sendrecv originally
                            obj.videoDirection = MediaStates.INACTIVE;    //sendrecv originally
                        } else {
                            if(callCanLocalSendVideo(call)){
                                obj.videoDirection = MediaStates.SEND_RECEIVE;
                            } else {
                                obj.videoDirection = MediaStates.RECEIVE_ONLY;
                            }

                            logger.debug("processDisablerHold: UNHOLD: direction left as it is");
                        }

                        call.answer = obj;       // ABE-1328

                        peer.setLocalDescription(obj,
                            function(){
                                successSdp = updateH264Level(obj.sdp);
                                restoreMuteStateOfCall(call);
                                successCallback(successSdp);
                                call.answer = null;
                            },
                            function(e) {
                                logger.debug("processDisablerHold: setLocalDescription failed: " + e);
                                failureCallback(logPrefix + "processDisablerHold setLocalDescription failed");
                                call.answer = null;
                            });

                    } else {
                        logger.debug("processDisablerHold: createAnswer failed!!");
                        failureCallback(logPrefix + "No codec negotiation");
                    }
                },
                function(e){
                    logger.debug("processDisablerHold: createAnswer failed!! " + e);
                    failureCallback(logPrefix + "Session cannot be created");
                },
                {
                    "audio":mediaAudio,
                    "video":getGlobalSendVideo()
                });

            }
            ,function(e) {
                logger.debug("processDisablerHold: setRemoteDescription failed: " + e);}
            );
    }

    /**
     * Process the update call sdp that was received
     * @ignore
     * @name rtc.processHold
     * @function
     * @param {call} call Incoming Call
     * @param {boolean} hold Hold/Resume: [true:hold, false:unhold ]
     * @param {boolean} local_hold_status if the call is hold by the user
     * @param {function(sdp)} successCallback The success callback function to be called
     * @param {function()} failureCallback The failure callback function to be called
     */
    this.processHold = function(call, hold, local_hold_status, successCallback, failureCallback){
        logger.info("processHold: local hold= " + local_hold_status + " remote hold= " + hold);
        if (!webRTCInitialized) {
            logger.warn(NOTINITIALIZED);
            failureCallback(NOTINITIALIZED);
            return;
        }
        if(call.peer){

            //Meetme issue
            //call.successCallback is assigned null at processNativeHold
            call.successCallback = successCallback;
                
            switch(pluginMode) {
                case PluginModes.AUTO:
                    processNativeHold(call, hold, local_hold_status, successCallback, failureCallback);
                    break;
                case PluginModes.LEGACY:
                case PluginModes.LEGACYH264:
                    processDisablerHold(call, hold, local_hold_status, successCallback, failureCallback);
                    break;
                case PluginModes.WEBRTC:
                case PluginModes.WEBRTCH264:
                case PluginModes.WEBRTC22:
                case PluginModes.WEBRTC21:
                    //processEnabler30Hold causes audio error Plugin21 to Native, Native side Hold/Retrieve
                    //processEnabler30Hold(call, hold, local_hold_status, successCallback, failureCallback);
                    processEnablerHold(call, hold, local_hold_status, successCallback, failureCallback);
                    break;
                default:
                    //processEnabler30Hold causes audio error Plugin21toNative Native side Hold/Retrieve
                    //processEnabler30Hold(call, hold, local_hold_status, successCallback, failureCallback);
                    processEnablerHold(call, hold, local_hold_status, successCallback, failureCallback);
                    break;
            }
        }
    };
    
    /**
     * Process the update call sdp that was received
     * @ignore
     * @name rtc.processHold
     * @function
     * @param {call} call Incoming Call
     * @param {boolean} hold Hold/Resume: [true:hold, false:unhold ]
     * @param {boolean} local_hold_status if the call is hold by the user
     * @param {function(sdp)} successCallback The success callback function to be called
     * @param {function()} failureCallback The failure callback function to be called
     */
    this.processRemoteOfferOnLocalHold = function(call,successCallback, failureCallback){
        logger.info("processRemoteOfferOnLocalHold");
        if (!webRTCInitialized) {
            logger.warn(NOTINITIALIZED);
            failureCallback(NOTINITIALIZED);
            return;
        }
        if(call.peer){
           successCallback(getSdpFromObject(call.peer.localDescription));
        }
        else{
            failureCallback("we dont have a peer object somehow");
        }        
    };    


    /**
     * processEnabler30Update to be used when the enabler plugin is enabled.
     */
    function processEnabler30Update(call, successCallback, failureCallback, local_hold_status) {
        logger.debug("processEnabler30Update: state= " + call.peer.signalingState);
        var peer = call.peer, localSdp, successSdp, remoteAudioState, remoteVideoState, remoteVideoDirection;
        
        if (peer.signalingState === RTCSignalingState.HAVE_LOCAL_OFFER) {
            call.sdp = checkSupportedVideoCodecs(call.sdp, getSdpFromObject(call.peer.localDescription));
        } else {
            call.sdp = checkSupportedVideoCodecs(call.sdp, null);            
        }
        // Meetme workaround. This workaround is added into native function
        call.sdp = addSdpMissingCryptoLine (call.sdp);
        call.sdp = removeSdpPli(call.sdp);
        call.sdp = removeG722Codec(call.sdp);
        call.sdp = performG722ParameterWorkaround(call.sdp);
        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);
        call.sdp = removeRTXCodec(call.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);

        remoteVideoDirection = getSdpDirection(call.sdp, video);
    
        if ((remoteVideoDirection === MediaStates.INACTIVE)&&(call.currentState === "COMPLETED")) 
        {
            switch(call.remoteVideoState){
                case MediaStates.INACTIVE:
                    call.sdp = updateSdpDirection(call.sdp, video, MediaStates.SEND_RECEIVE);
                    //call.remoteVideoState = MediaStates.SEND_RECEIVE;
                    break;
                case MediaStates.RECEIVE_ONLY:
                    call.sdp = updateSdpDirection(call.sdp, video, MediaStates.SEND_RECEIVE);
                    //call.remoteVideoState = MediaStates.SEND_RECEIVE;
                    break;   
                case MediaStates.SEND_RECEIVE:
                    call.sdp = updateSdpDirection(call.sdp, video, MediaStates.RECEIVE_ONLY);
                    //call.remoteVideoState = MediaStates.RECEIVE_ONLY;
                    break;
            }
        }

        if (local_hold_status) {
            call.sdp = updateSdpDirection(call.sdp, audio, MediaStates.INACTIVE);
            call.sdp = updateSdpDirection(call.sdp, video, MediaStates.INACTIVE);
        }

        callSetReceiveVideo(call);
        
        call.sdp = changeDirection(call.sdp, MediaStates.SEND_ONLY, MediaStates.SEND_RECEIVE, video);
        if (peer.signalingState === RTCSignalingState.HAVE_LOCAL_OFFER) {
            //if we are here we have been to createEnablerUpdate before this

            if (webrtcdtls) {
                call.sdp = setMediaPassive(call.sdp);
            }

            peer.setRemoteDescription(webRTCSdp(typeAns, call.sdp),
                    function() {
                        call.remoteVideoState = getSdpDirection(call.sdp, video);
                        addCandidates(call);
                        successCallback(call.sdp);
                        call.successCallback = null;
                    },
                    function(e) {
                        logger.debug("processEnabler30Update: setRemoteDescription failed!!" + e);
                        failureCallback(logPrefix + "processEnabler30Update: setRemoteDescription failed!!");
                    });
        } else {
            //this part is a work-around for webrtc bug
            //set remote description with inactive media lines first.
            //then set remote description with original media lines.

            //keep original values of remote audio and video states
            remoteAudioState = getSdpDirection(call.sdp, audio);
            remoteVideoState = getSdpDirection(call.sdp, video);

            //set media lines with sendonly state for work-around
            call.sdp = updateSdpDirection(call.sdp, audio, MediaStates.INACTIVE);   //chrome38 fix
            call.sdp = updateSdpDirection(call.sdp, video, MediaStates.INACTIVE);   //chrome38 fix
            
            if (webrtcdtls) {
                call.sdp = setMediaActPass(call.sdp);
            }

            peer.setRemoteDescription(webRTCSdp(typeOff, call.sdp), function() {
                logger.debug("processEnabler30Update: workaround setRemoteDescription success");

                //restore original values
                call.sdp = updateSdpDirection(call.sdp, audio, remoteAudioState);
                call.sdp = updateSdpDirection(call.sdp, video, remoteVideoState);
                
                peer.setRemoteDescription(webRTCSdp(typeOff, call.sdp), function(){
                    logger.debug("processEnabler30Update: setRemoteDescription success");
                    call.remoteVideoState = getSdpDirection(call.sdp, video);
                    addCandidates(call);

                    peer.createAnswer(peer.remoteDescription,
                        function(obj){
                            logger.debug("processEnabler30Update: isSdpEnabled audio= " + isSdpEnabled(obj.sdp, audio));
                            logger.debug("processEnabler30Update: isSdpEnabled video= " + isSdpEnabled(obj.sdp, video));

                            if (isSdpEnabled(obj.sdp, audio) || isSdpEnabled(obj.sdp, video)) {
                                if(getSdpDirection(call.sdp, audio) === MediaStates.SEND_ONLY){
                                    logger.debug("processEnabler30Update: audio sendonly -> recvonly");
                                    obj.audioDirection = MediaStates.RECEIVE_ONLY;
                                }

                                if(getSdpDirection(call.sdp, audio) === MediaStates.INACTIVE) {
                                    obj.audioDirection = MediaStates.INACTIVE;
                                }

                                if(getSdpDirection(call.sdp, video) === MediaStates.INACTIVE) {
                                    obj.videoDirection = MediaStates.INACTIVE;
                                } 
                            
                                if(getSdpDirection(call.sdp, video) === MediaStates.RECEIVE_ONLY) {
                                    if(callCanLocalSendVideo(call)){
                                        obj.videoDirection = MediaStates.SEND_ONLY;
                                    } else {
                                        obj.videoDirection = MediaStates.INACTIVE;
                                    }
                                } else if (callCanLocalSendVideo(call)){
                                    obj.videoDirection = MediaStates.SEND_RECEIVE;
                                } else {
                                    obj.videoDirection = MediaStates.RECEIVE_ONLY;
                                }
                                //TODO: Since there is no setter method for obj.sdp from the plugin side,
                                //      we create a temporary local variable and pass obj.sdp's value into it.
                                //      Rewrite the below part of code when the setter method is applied to the plugin side
                                localSdp = getSdpFromObject(obj);
                                obj = null;
                                localSdp = updateVersion(getSdpFromObject(peer.localDescription), localSdp);
                                localSdp = performVP8RTCPParameterWorkaround(localSdp);

                                if (webrtcdtls) {
                                    localSdp = setMediaPassive(localSdp);
                                }

                                localSdp = fixLocalTelephoneEventPayloadType(call, localSdp);

                                call.answer = webRTCSdp(typeAns, localSdp);
                            
                                peer.setLocalDescription(call.answer,
                                    function(){
                                        logger.debug("processEnabler30Update: setLocalDescription success");
                                        successSdp = updateH264Level(getSdpFromObject(call.answer));

                                        if (local_hold_status) {
                                            successSdp = updateSdpDirection(successSdp, audio, MediaStates.INACTIVE);
                                            successSdp = updateSdpDirection(successSdp, video, MediaStates.INACTIVE);
                                        }
                                        
                                        successCallback(successSdp);
                                        call.successCallback = null;
                                        call.answer = null;     // ABE-1328
                                    },
                                    function(e) {
                                        logger.debug("processEnabler30Update: setLocalDescription failed: " + e);
                                        failureCallback(logPrefix + "processEnabler30Update: setLocalDescription failed");
                                        call.answer = null;     // ABE-1328
                                    });
                            } else {
                                logger.debug("processEnabler30Update: createAnswer failed!!");
                                failureCallback(logPrefix + "No codec negotiation");
                            }
                    },
                    function(e){
                        logger.debug("processEnabler30Update: createAnswer failed!! " + e);
                        failureCallback(logPrefix + "Session cannot be created");
                    },
                    {
                        'mandatory': {
                            'OfferToReceiveAudio':mediaAudio,
                            'OfferToReceiveVideo':getGlobalSendVideo()
                        }
                    });
                },
                function(e) {
                    logger.debug("processEnabler30Update: setRemoteDescription failed: " + e);
                    failureCallback(logPrefix + "processEnabler30Update: setRemoteDescription failed!!");
                });
            }, function(e) {
                logger.debug("processEnabler30Update: workaround setRemoteDescription failed!!" + e);
                failureCallback(logPrefix + "processEnabler30Update: workaround setRemoteDescription failed!!");
            });
        }
    }

    /**
     * processEnablerUpdate to be used when the enabler plugin is enabled.
     */
    function processEnablerUpdate(call, successCallback, failureCallback, local_hold_status) {
        logger.debug("processEnablerUpdate: state= " + call.peer.signalingState);
        var peer = call.peer, localSdp, successSdp, remoteVideoDirection;
        
        if (peer.signalingState === RTCSignalingState.HAVE_LOCAL_OFFER) {
            call.sdp = checkSupportedVideoCodecs(call.sdp, getSdpFromObject(call.peer.localDescription));
        } else {
            call.sdp = checkSupportedVideoCodecs(call.sdp, null);            
        }
        // Meetme workaround. This workaround is added into native function
        call.sdp = addSdpMissingCryptoLine (call.sdp);
        call.sdp = removeG722Codec(call.sdp);
        call.sdp = performG722ParameterWorkaround(call.sdp);
        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);
        call.sdp = removeRTXCodec(call.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);

        remoteVideoDirection = getSdpDirection(call.sdp, video);
    
        if ((remoteVideoDirection === MediaStates.INACTIVE)&&(call.currentState === "COMPLETED")) 
        {
            switch(call.remoteVideoState){
                case MediaStates.INACTIVE:
                    call.sdp = updateSdpDirection(call.sdp, video, MediaStates.SEND_RECEIVE);
                    //call.remoteVideoState = MediaStates.SEND_RECEIVE;
                    break;
                case MediaStates.RECEIVE_ONLY:
                    call.sdp = updateSdpDirection(call.sdp, video, MediaStates.SEND_RECEIVE);
                    //call.remoteVideoState = MediaStates.SEND_RECEIVE;
                    break;   
                case MediaStates.SEND_RECEIVE:
                    call.sdp = updateSdpDirection(call.sdp, video, MediaStates.RECEIVE_ONLY);
                    //call.remoteVideoState = MediaStates.RECEIVE_ONLY;
                    break;
            }
        }

        if (local_hold_status) {
            call.sdp = updateSdpDirection(call.sdp, audio, MediaStates.INACTIVE);
            call.sdp = updateSdpDirection(call.sdp, video, MediaStates.INACTIVE);
        }

        //check if remote party sends video
        callSetReceiveVideo(call);
        call.sdp = changeDirection(call.sdp, MediaStates.SEND_ONLY, MediaStates.SEND_RECEIVE);
        if (peer.signalingState === RTCSignalingState.HAVE_LOCAL_OFFER) {
            //if we are here we have been to createEnablerUpdate before this

            if (webrtcdtls) {
                call.sdp = setMediaPassive(call.sdp);
            }

            peer.setRemoteDescription(webRTCSdp(typeAns, call.sdp),
                    function() {
                        call.remoteVideoState = getSdpDirection(call.sdp, video);
                        addCandidates(call);
                        successCallback(call.sdp);
                        call.successCallback = null;
                    },
                    function(e) {
                        logger.debug("processEnablerUpdate: setRemoteDescription failed!!" + e);
                        failureCallback(logPrefix + "processEnablerUpdate: setRemoteDescription failed!!");
                    });
        } else {

          if (webrtcdtls) {
            call.sdp = setMediaActPass(call.sdp);
          }
        
          peer.setRemoteDescription(webRTCSdp(typeOff, call.sdp),
            function(){
                //addCandidates(call);

                peer.createAnswer(peer.remoteDescription,
                    function(obj){
                        logger.debug("processEnablerUpdate: isSdpEnabled audio= " + isSdpEnabled(obj.sdp, audio));
                        logger.debug("processEnablerUpdate: isSdpEnabled video= " + isSdpEnabled(obj.sdp, video));

                        if (isSdpEnabled(obj.sdp, audio) || isSdpEnabled(obj.sdp, video)) {
                            if(getSdpDirection(call.sdp, audio) === MediaStates.SEND_ONLY){
                                logger.debug("processEnablerUpdate: audio sendonly -> recvonly");
                                obj.audioDirection = MediaStates.RECEIVE_ONLY;
                            }

                            if(getSdpDirection(call.sdp, audio) === MediaStates.INACTIVE) {
                                obj.audioDirection = MediaStates.INACTIVE;
                            }

                            if(getSdpDirection(call.sdp, video) === MediaStates.INACTIVE) {
                                obj.videoDirection = MediaStates.INACTIVE;
                            } else if(callCanLocalSendVideo(call)){
                                obj.videoDirection = MediaStates.SEND_RECEIVE;
                            } else {
                                obj.videoDirection = MediaStates.RECEIVE_ONLY;
                            }
                            //TODO: Since there is no setter method for obj.sdp from the plugin side,
                            //      we create a temporary local variable and pass obj.sdp's value into it.
                            //      Rewrite the below part of code when the setter method is applied to the plugin side
                            localSdp = getSdpFromObject(obj);
                            obj = null;
                            localSdp = updateVersion(getSdpFromObject(peer.localDescription), localSdp);
                            localSdp = performVP8RTCPParameterWorkaround(localSdp);

                            if (webrtcdtls) {
                                localSdp = setMediaPassive(localSdp);
                            }

                            localSdp = fixLocalTelephoneEventPayloadType(call, localSdp);

                            successSdp = webRTCSdp(typeAns, localSdp);
                            
                            call.answer = successSdp;       // ABE-1328

                            peer.setLocalDescription(successSdp,
                                function(){
                                    successCallback(getSdpFromObject(successSdp));
                                    call.successCallback = null;
                                    call.answer = null;     // ABE-1328
                                },
                                function(e) {
                                    logger.debug("processEnablerUpdate: setLocalDescription failed: " + e);
                                    failureCallback(logPrefix + "processEnablerUpdate: setLocalDescription failed");
                                    call.answer = null;     // ABE-1328
                                });
                        } else {
                            logger.debug("processEnablerUpdate: createAnswer failed!!");
                            failureCallback(logPrefix + "No codec negotiation");
                        }
                    },
                    function(e){
                        logger.debug("processEnablerUpdate: createAnswer failed!! " + e);
                        failureCallback(logPrefix + "Session cannot be created");
                    },
                    {
                        'mandatory': {
                            'OfferToReceiveAudio':mediaAudio,
                            'OfferToReceiveVideo':getGlobalSendVideo()
                        }
                    });
            },
            function(e) {
                logger.debug("processEnablerUpdate: setRemoteDescription failed: " + e);}
            );
        }
    }

    /**
     * processNativeUpdate to be used when native webrtc is enabled.
     */
    function processNativeUpdate(call, successCallback, failureCallback, local_hold_status) {
        logger.debug("processNativeUpdate: state= " + call.peer.signalingState);
        var peer = call.peer, remoteAudioState, remoteVideoState, remoteVideoDirection;
        
        if (peer.signalingState === RTCSignalingState.HAVE_LOCAL_OFFER) {
            call.sdp = checkSupportedVideoCodecs(call.sdp, call.peer.localDescription.sdp);
        } else {
            call.sdp = checkSupportedVideoCodecs(call.sdp, null);            
        }
        // Meetme workaround
        call.sdp = addSdpMissingCryptoLine (call.sdp);

        call.sdp = removeSdpPli(call.sdp);
        call.sdp = removeG722Codec(call.sdp);
        call.sdp = performG722ParameterWorkaround(call.sdp);
        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);

        remoteVideoDirection = getSdpDirection(call.sdp, video);
    
        if ((remoteVideoDirection === MediaStates.INACTIVE)&&(call.currentState === "COMPLETED")) 
        {
            switch(call.remoteVideoState){
                case MediaStates.INACTIVE:
                    call.sdp = updateSdpDirection(call.sdp, video, MediaStates.SEND_RECEIVE);
                    //call.remoteVideoState = MediaStates.SEND_RECEIVE;
                    break;
                case MediaStates.RECEIVE_ONLY:
                    call.sdp = updateSdpDirection(call.sdp, video, MediaStates.SEND_RECEIVE);
                    //call.remoteVideoState = MediaStates.SEND_RECEIVE;
                    break;   
                case MediaStates.SEND_RECEIVE:
                    call.sdp = updateSdpDirection(call.sdp, video, MediaStates.RECEIVE_ONLY);
                    //call.remoteVideoState = MediaStates.RECEIVE_ONLY;
                    break;
            }
        }

        if (local_hold_status) {
            call.sdp = updateSdpDirection(call.sdp, audio, MediaStates.INACTIVE);
            call.sdp = updateSdpDirection(call.sdp, video, MediaStates.INACTIVE);
        }

        call.sdp = changeDirection(call.sdp, MediaStates.SEND_ONLY, MediaStates.SEND_RECEIVE, video);

        callSetReceiveVideo(call);
        
        if (peer.signalingState === RTCSignalingState.HAVE_LOCAL_OFFER) {
            //if we are here we have been to createNativeUpdate before this

            if (webrtcdtls) {
                call.sdp = setMediaPassive(call.sdp);
            }

            peer.setRemoteDescription(nativeWebRTCSdp(typeAns, call.sdp),
                    function() {
                        call.remoteVideoState = getSdpDirection(call.sdp, video);
                        addCandidates(call);
                        successCallback(call.sdp);
                        call.successCallback = null;
                    },
                    function(e) {
                        logger.debug("processNativeUpdate: setRemoteDescription failed!!" + e);
                        failureCallback(logPrefix + "processNativeUpdate: setRemoteDescription failed!!");
                    });
        } else {
            //this part is a work-around for webrtc bug
            //set remote description with inactive media lines first.
            //then set remote description with original media lines.

            //keep original values of remote audio and video states
            remoteAudioState = getSdpDirection(call.sdp, audio);
            remoteVideoState = getSdpDirection(call.sdp, video);

            //set media lines with inactive state for workaround
            call.sdp = updateSdpDirection(call.sdp, audio, MediaStates.INACTIVE);
            call.sdp = updateSdpDirection(call.sdp, video, MediaStates.INACTIVE);
            
            //This is highly required for meetme on DTLS
            if (webrtcdtls) {
                call.sdp = setMediaActPass(call.sdp);
            }
            
            peer.setRemoteDescription(nativeWebRTCSdp(typeOff, call.sdp), function() {
                logger.debug("processNativeUpdate: workaround setRemoteDescription success");

                //restore original values
                call.sdp = updateSdpDirection(call.sdp, audio, remoteAudioState);
                call.sdp = updateSdpDirection(call.sdp, video, remoteVideoState);

                peer.setRemoteDescription(nativeWebRTCSdp(typeOff, call.sdp),
                    function() {
                        logger.debug("processNativeUpdate: setRemoteDescription success");
                        call.remoteVideoState = getSdpDirection(call.sdp, video);
                        addCandidates(call);

                        peer.createAnswer(
                                function(obj) {
                                    logger.debug("processNativeUpdate: isSdpEnabled audio= " + isSdpEnabled(obj.sdp, audio));
                                    logger.debug("processNativeUpdate: isSdpEnabled video= " + isSdpEnabled(obj.sdp, video));

                                    if (getSdpDirection(call.sdp, audio) === MediaStates.INACTIVE) {
                                        obj.sdp = updateSdpDirection(obj.sdp, audio, MediaStates.INACTIVE);
                                    }

                                    if (call.remoteVideoState === MediaStates.INACTIVE) {
                                        obj.sdp = updateSdpDirection(obj.sdp, video, MediaStates.INACTIVE);
                                    } else if (callCanLocalSendVideo(call)) {
                                        obj.sdp = updateSdpDirection(obj.sdp, video, MediaStates.SEND_RECEIVE);
                                    } else {
                                        obj.sdp = updateSdpDirection(obj.sdp, video, MediaStates.RECEIVE_ONLY);
                                    }
                                    obj.sdp = performVP8RTCPParameterWorkaround(obj.sdp);

                                    fireOnStreamAddedEvent(call);

                                    obj.sdp = updateVersion(call.peer.localDescription.sdp, obj.sdp);

                                    if (webrtcdtls) {
                                        obj.sdp = setMediaPassive(obj.sdp);
                                    }

                                    obj.sdp = fixLocalTelephoneEventPayloadType(call, obj.sdp);

                                    peer.setLocalDescription(nativeWebRTCSdp(typeAns, obj.sdp),
                                            function() {
                                                logger.debug("processNativeUpdate: setlocalDescription success");
                                                successCallback(obj.sdp);
                                                call.successCallback = null;
                                            },
                                            function(e) {
                                                logger.debug("processNativeUpdate: setlocalDescription failed!!" + e);
                                                failureCallback(logPrefix + "processNativeUpdate: setlocalDescription failed!!");
                                            });
                                },
                                function(e) {
                                    logger.debug("processNativeUpdate: createAnswer failed!! " + e);
                                    failureCallback(logPrefix + "Session cannot be created");
                                },
                                {
                                    'mandatory': {
                                        'OfferToReceiveAudio': mediaAudio,
                                        'OfferToReceiveVideo': getGlobalSendVideo()
                                    }
                                });
                    },
                    function(e) {
                        logger.debug("processNativeUpdate: setRemoteDescription failed!!" + e);
                        failureCallback(logPrefix + "processNativeUpdate: setRemoteDescription failed!!");
                    });
                }, function(e) {
                    logger.debug("processNativeUpdate: workaround setRemoteDescription failed!!" + e);
                    failureCallback(logPrefix + "processNativeUpdate: workaround setRemoteDescription failed!!");
                });
        }
    }

    /**
     * processDisablerUpdate to be used when the disabler plugin is enabled.
     */
    function processDisablerUpdate(call, successCallback, failureCallback, local_hold_status) {
        logger.debug("processDisablerUpdate: state= " + call.peer.signalingState);
        var peer = call.peer, updateSdp, candidates, i, successSdp;

        if(call.sdp.indexOf(mLine + video + " 0 ") !== -1) {
            call.sdp = call.sdp.replace(mLine + video + " 0 ", mLine + video + " 1 ");
        }

        if (local_hold_status) {
            call.sdp = updateSdpDirection(call.sdp, audio, MediaStates.INACTIVE);
            call.sdp = updateSdpDirection(call.sdp, video, MediaStates.INACTIVE);
        }

        call.sdp = checkSupportedVideoCodecs(call.sdp, null);
        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);

        updateSdp = webRTCSdp(typeOff, call.sdp);

        peer.setRemoteDescription(updateSdp,
            function(){
                peer.createAnswer(peer.remoteDescription,
                    function(obj){

                        logger.debug("processDisablerUpdate: isSdpEnabled audio= " + isSdpEnabled(obj.sdp, audio));
                        logger.debug("processDisablerUpdate: isSdpEnabled video= " + isSdpEnabled(obj.sdp, video));

                        callSetReceiveVideo(call);

                        if (isSdpEnabled(obj.sdp, audio) || isSdpEnabled(obj.sdp, video)) {
                            if(getSdpDirection(call.sdp, audio) === MediaStates.SEND_ONLY){
                                logger.debug("processDisablerUpdate: audio sendonly -> recvonly");
                                obj.audioDirection = MediaStates.RECEIVE_ONLY;
                            }

                            if(callCanLocalSendVideo(call)){
                                obj.videoDirection = MediaStates.SEND_RECEIVE;
                            } else {
                                obj.videoDirection = MediaStates.RECEIVE_ONLY;
                            }
                            
                            peer.setLocalDescription(obj,
                                function(){
                                    candidates = updateSdp.createCandidates();
                                    for(i=0; i<candidates.length; ++i) {
                                        peer.addIceCandidate(candidates[i]);
                                    }
                                    successSdp = updateH264Level(obj.sdp);

                                    if (local_hold_status) {
                                        successSdp = updateSdpDirection(successSdp, audio, MediaStates.INACTIVE);
                                        successSdp = updateSdpDirection(successSdp, video, MediaStates.INACTIVE);
                                    }

                                    restoreMuteStateOfCall(call);
                                    successCallback(successSdp);
                                },
                                function(e) {
                                    logger.debug("processDisablerUpdate: setLocalDescription failed: " + e);
                                    failureCallback(logPrefix + "processDisablerUpdate: setLocalDescription failed");
                                });
                        } else {
                            logger.debug("processDisablerUpdate: createAnswer failed!!");
                            failureCallback(logPrefix + "No codec negotiation");
                        }
                    },
                    function(e){
                        logger.debug("processDisablerUpdate: createAnswer failed!! " + e);
                        failureCallback(logPrefix + "Session cannot be created");
                    },
                    {
                        "audio":mediaAudio,
                        "video":getGlobalSendVideo()
                    });
            },
            function(e) {
                logger.debug("processDisablerUpdate: setRemoteDescription failed: " + e);
            });

    }

    /**
     * Process the update call sdp that was received
     * @ignore
     * @name rtc.processUpdate
     * @function
     * @param {call} call Incoming Call
     * @param {function(sdp)} successCallback The success callback function to be called
     * @param {function()} failureCallback The failure callback function to be called
     * @param {boolean} local_hold_status if the call is hold by the user
     */
    this.processUpdate = function(call, successCallback, failureCallback, local_hold_status){
        logger.info("processUpdate: local_hold_status:" + local_hold_status);
        if (!webRTCInitialized) {
            logger.warn(NOTINITIALIZED);
            failureCallback(NOTINITIALIZED);
            return;
        }

        call.successCallback = successCallback;
        call.failureCallback = failureCallback;

        if(call.peer){
            switch(pluginMode) {
                case PluginModes.AUTO:
                    processNativeUpdate(call, successCallback, failureCallback, local_hold_status);
                    break;
                case PluginModes.LEGACY:
                case PluginModes.LEGACYH264:
                    processDisablerUpdate(call, successCallback, failureCallback, local_hold_status);
                    break;
                case PluginModes.WEBRTC:
                case PluginModes.WEBRTC21:
                    processEnablerUpdate(call, successCallback, failureCallback, local_hold_status);
                    break;
                case PluginModes.WEBRTCH264:
                case PluginModes.WEBRTC22:
                    processEnabler30Update(call, successCallback, failureCallback, local_hold_status);
                    break;
                default:
                    processEnablerUpdate(call, successCallback, failureCallback, local_hold_status);
                    break;
            }
        }
    };

    /**
     * processEnabler30Answer to be used when the enabler plugin is enabled
     */
    function processEnabler30Answer(call, onSuccess, onFail) { 
        logger.debug("processEnabler30Answer: state= " + call.peer.signalingState);

        var restoreSdpOnSuccess, audioWorkaroundOnSuccess, onSuccessAfterWorkarounds, 
            remoteVideoDirection, localVideoDirection;

        onSuccessAfterWorkarounds = function() {
            call.remoteVideoState = getSdpDirection(call.sdp, video);
            addCandidates(call);
            utils.callFunctionIfExist(onSuccess);
        };

        call.sdp = checkSupportedVideoCodecs(call.sdp, getSdpFromObject(call.peer.localDescription));
        call.sdp = performVideoPortZeroWorkaround(call.sdp);
        call.sdp = removeSdpPli(call.sdp);
        call.sdp = removeG722Codec(call.sdp);
        call.sdp = performG722ParameterWorkaround(call.sdp);
        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);      
        call.sdp = performVP8BandwidthWorkaround(call.sdp);
        call.sdp = checkandRestoreICEParams(call.sdp, call.sdp);
        call.sdp = removeRTXCodec(call.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);

        callSetReceiveVideo(call);
            
        remoteVideoDirection = getSdpDirection(call.sdp, video);
        localVideoDirection = getSdpDirection(getSdpFromObject(call.peer.localDescription), video);
    
        // this is needed for buggy webrtc api. when term answers with video to audio only call
        // this scenario does not work without converting to sendrecv
        logger.debug("processEnabler30Answer: ice-lite: do remote video escalation");
        call.sdp = changeDirection(call.sdp, MediaStates.SEND_ONLY, MediaStates.SEND_RECEIVE);

        if (localVideoDirection === MediaStates.RECEIVE_ONLY &&
            (remoteVideoDirection === MediaStates.INACTIVE || remoteVideoDirection === MediaStates.RECEIVE_ONLY)) {
        
            // Audio <--> Audio : apply workaround step 1

            performEnablerOrigAudioWorkaround(call, onSuccessAfterWorkarounds, onFail);

        } else if (localVideoDirection === MediaStates.SEND_RECEIVE &&
                   (remoteVideoDirection === MediaStates.RECEIVE_ONLY || remoteVideoDirection === MediaStates.INACTIVE)) {

            // Audio-Video <--> Audio : apply workaround step 1 & 2

            audioWorkaroundOnSuccess = function() {
                restoreEnablerActualSdp(call, onSuccessAfterWorkarounds, onFail, localVideoDirection, remoteVideoDirection);
            };

            //performEnablerOrigAudioWorkaround(call, audioWorkaroundOnSuccess, onFail);
            performEnablerOrigAudioWorkaround(call, onSuccessAfterWorkarounds, onFail);

        } else if (localVideoDirection === MediaStates.RECEIVE_ONLY &&
                   (remoteVideoDirection === MediaStates.SEND_ONLY || remoteVideoDirection === MediaStates.SEND_RECEIVE)) {
               
            // Audio  <--> Audio-Video

            restoreSdpOnSuccess = function() {
                performEnablerVideoStartWorkaround(call, onSuccessAfterWorkarounds, onFail);
            };

            audioWorkaroundOnSuccess = function() {
                restoreEnablerActualSdp(call, restoreSdpOnSuccess, onFail, localVideoDirection, remoteVideoDirection);
            };

            //performEnablerOrigAudioWorkaround(call, audioWorkaroundOnSuccess, onFail);
            performEnablerOrigAudioWorkaround(call, restoreSdpOnSuccess, onFail);

        } else {

            // Audio-Video <--> Audio-Video
            // there is remote video, no need for orig side workaround

            if (webrtcdtls) {
                call.sdp = setMediaPassive(call.sdp);
            }

            call.peer.setRemoteDescription(webRTCSdp(typeAns, call.sdp),
                function() {
                    logger.debug("processEnabler30Answer: setRemoteDescription success");
                    onSuccessAfterWorkarounds();
                },
                function(e) {
                    logger.debug("processEnabler30Answer: setRemoteDescription failed: " + e);
                    utils.callFunctionIfExist(onFail);
                });
        }
    }

    /**
     * processEnablerAnswer to be used when the enabler plugin is enabled
     */
    function processEnablerAnswer(call, onSuccess, onFail) { 
        logger.debug("processEnablerAnswer: state= " + call.peer.signalingState);

        var updateSdp, remoteVideoDirection = getSdpDirection(call.sdp, video);

        call.sdp = checkSupportedVideoCodecs(call.sdp, getSdpFromObject(call.peer.localDescription));
        call.sdp = performVideoPortZeroWorkaround(call.sdp);
        call.sdp = removeG722Codec(call.sdp);
        call.sdp = performG722ParameterWorkaround(call.sdp);
        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);
        call.sdp = removeRTXCodec(call.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);
        
        callSetReceiveVideo(call);

        // this is needed for buggy webrtc api. when term answers with video to audio only call
        // this scenario does not work without converting to sendrecv
        call.sdp = changeDirection(call.sdp, MediaStates.SEND_ONLY, MediaStates.SEND_RECEIVE);

        // this is needed for buggy webrtc api.
        // Audio Only call answered with audio only 
        // video call answered with audio only 
        // video track later to be removed
        logger.debug("processEnablerAnswer: ice-lite: do remote video escalation");
        if (remoteVideoDirection === MediaStates.INACTIVE) {
            call.sdp = changeDirection(call.sdp, MediaStates.INACTIVE, MediaStates.SEND_ONLY, video);
        }

        if (webrtcdtls) {
            call.sdp = setMediaPassive(call.sdp);
        }

        updateSdp = webRTCSdp(typeAns, call.sdp);

        call.peer.setRemoteDescription(updateSdp,
            function(){
                addCandidates(call);
                utils.callFunctionIfExist(onSuccess);
            },
            function(e) {
                logger.debug("processEnablerAnswer: setRemoteDescription failed: " + e);
                utils.callFunctionIfExist(onFail);
            });
    }

    /**
     * processNativeAnswer to be used when native webrtc is enabled
     */
    function processNativeAnswer(call, onSuccess, onFail) {
        logger.debug("processNativeAnswer: state= " + call.peer.signalingState);
        var restoreSdpOnSuccess, audioWorkaroundOnSuccess, onSuccessAfterWorkarounds, 
            remoteVideoDirection, localVideoDirection;

        onSuccessAfterWorkarounds = function() {
            call.remoteVideoState = getSdpDirection(call.sdp, video);
            addCandidates(call);
            utils.callFunctionIfExist(onSuccess);
        };

        call.sdp = checkSupportedVideoCodecs(call.sdp, call.peer.localDescription.sdp);
        call.sdp = performVideoPortZeroWorkaround(call.sdp);
        call.sdp = removeSdpPli(call.sdp);
        call.sdp = removeG722Codec(call.sdp);
        call.sdp = performG722ParameterWorkaround(call.sdp);
        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);      
        call.sdp = performVP8BandwidthWorkaround(call.sdp);
        call.sdp = checkandRestoreICEParams(call.sdp, call.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);

        callSetReceiveVideo(call);
            
        remoteVideoDirection = getSdpDirection(call.sdp, video);
        localVideoDirection = getSdpDirection(call.peer.localDescription.sdp, video);

        // this is needed for buggy webrtc api. when term answers with video to audio only call
        // this scenario does not work without converting to sendrecv
        logger.debug("processNativeAnswer: ice-lite: do remote video escalation");
        call.sdp = changeDirection(call.sdp, MediaStates.SEND_ONLY, MediaStates.SEND_RECEIVE);

        if (localVideoDirection === MediaStates.RECEIVE_ONLY &&
            (remoteVideoDirection === MediaStates.INACTIVE || remoteVideoDirection === MediaStates.RECEIVE_ONLY)) {
               
            // Audio <--> Audio : apply workaround step 1

            performNativeOrigAudioWorkaround(call, onSuccessAfterWorkarounds, onFail);

        } else if (localVideoDirection === MediaStates.SEND_RECEIVE &&
                   (remoteVideoDirection === MediaStates.RECEIVE_ONLY || remoteVideoDirection === MediaStates.INACTIVE)) {

            // Audio-Video <--> Audio : apply workaround step 1 & 2

            audioWorkaroundOnSuccess = function() {
                restoreNativeActualSdp(call, onSuccessAfterWorkarounds, onFail, localVideoDirection, remoteVideoDirection);
            };

            //performNativeOrigAudioWorkaround(call, audioWorkaroundOnSuccess, onFail);
            performNativeOrigAudioWorkaround(call, onSuccessAfterWorkarounds, onFail);

        } else if (localVideoDirection === MediaStates.RECEIVE_ONLY &&
                   (remoteVideoDirection === MediaStates.SEND_ONLY || remoteVideoDirection === MediaStates.SEND_RECEIVE)) {
               
            // Audio  <--> Audio-Video

            restoreSdpOnSuccess = function() {
                performNativeVideoStartWorkaround(call, onSuccessAfterWorkarounds, onFail);
            };

            audioWorkaroundOnSuccess = function() {
                restoreNativeActualSdp(call, restoreSdpOnSuccess, onFail, localVideoDirection, remoteVideoDirection);
            };

            //performNativeOrigAudioWorkaround(call, audioWorkaroundOnSuccess, onFail);
            performNativeOrigAudioWorkaround(call, restoreSdpOnSuccess, onFail);

        } else {

            // Audio-Video <--> Audio-Video
            // there is remote video, no need for orig side workaround

            if (webrtcdtls) {
                call.sdp = setMediaPassive(call.sdp);
            }

            call.peer.setRemoteDescription(nativeWebRTCSdp(typeAns, call.sdp),
                function() {
                    logger.debug("processNativeAnswer: setRemoteDescription success");
                    onSuccessAfterWorkarounds();
                },
                function(e) {
                    logger.debug("processNativeAnswer: setRemoteDescription failed: " + e);
                    utils.callFunctionIfExist(onFail);
                });
        }
    }

    /**
     * processDisablerAnswer to be used when the disabler plugin is enabled
     */
    function processDisablerAnswer(call,onSuccess,onFail) {
        logger.debug("processDisablerAnswer: state= " + call.peer.signalingState);
        var ans, candidates, i;

        call.sdp = checkSupportedVideoCodecs(call.sdp, call.peer.localDescription.sdp);

        if(call.sdp.indexOf(mLine + video + " 0 ", 0) !== -1) {
            call.sdp = call.sdp.replace(mLine + video + " 0 ", mLine + video + " 1 ");
        }

        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);

        if (webrtcdtls) {
            call.sdp = setMediaPassive(call.sdp);
        }

        ans = webRTCSdp(typeAns, call.sdp);

        callSetReceiveVideo(call);

        call.peer.setRemoteDescription(ans,
            function(){
                candidates = ans.createCandidates();
                for(i=0; i<candidates.length; ++i) {
                    call.peer.addIceCandidate(candidates[i]);
                }
                
                restoreMuteStateOfCall(call);
                utils.callFunctionIfExist(onSuccess);
            },
            function(e) {
                logger.debug("processDisablerAnswer: setRemoteDescription failed: " + e);
                utils.callFunctionIfExist(onFail);
            });
    }

    /**
     * This is the answer from the Offer we sent.
     *
     * @ignore
     * @name rtc.processAnswer
     * @function
     * @param {call} call IncomingCall
     * @param {function()} onSuccess The success callback function to be called
     * @param {function()} onFail The failure callback function to be called
     */
    this.processAnswer = function(call, onSuccess, onFail){
        if (!webRTCInitialized) {
            logger.warn(NOTINITIALIZED);
            return;
        }
        
        if(call.peer){
            switch(pluginMode) {
                case PluginModes.AUTO:
                    processNativeAnswer(call, onSuccess, onFail);
                    break;
                case PluginModes.LEGACY:
                case PluginModes.LEGACYH264:
                    processDisablerAnswer(call, onSuccess, onFail);
                    break;
                case PluginModes.WEBRTC:
                case PluginModes.WEBRTC21:
                    processEnablerAnswer(call, onSuccess, onFail);
                    break;
                case PluginModes.WEBRTCH264:
                case PluginModes.WEBRTC22:
                    processEnabler30Answer(call, onSuccess, onFail);
                    break;
                default:
                    processEnablerAnswer(call, onSuccess, onFail);
                    break;
            }
        }
    };


    /**
     * processEnablerPreAnswer to be used when the enabler plugin is enabled
     */
    function processEnablerPreAnswer(call) {
        var ans;

        logger.debug("processEnablerPreAnswer: state= " + call.peer.signalingState);
        
        call.sdp = checkSupportedVideoCodecs(call.sdp, getSdpFromObject(call.peer.localDescription));
        call.sdp = removeG722Codec(call.sdp);
        call.sdp = performG722ParameterWorkaround(call.sdp);
        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);
        call.sdp = removeRTXCodec(call.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);

        callSetReceiveVideo(call);

        addCandidates(call);
        ans = webRTCSdp(typePreAns, call.sdp);

        call.peer.setRemoteDescription(ans,
            function(){
                call.remoteVideoState = getSdpDirection(call.sdp, video);
                logger.debug("processEnablerPreAnswer: setRemoteDescription success");
            },
            function(e) {
                logger.debug("processEnablerPreAnswer: setRemoteDescription failed: " + e );
            });
    }

    /**
     * processNativePreAnswer to be used when native webrtc is enabled
     */
    function processNativePreAnswer(call) {
        logger.debug("processNativePreAnswer: state= " + call.peer.signalingState);

        call.sdp = checkSupportedVideoCodecs(call.sdp, call.peer.localDescription.sdp);
        call.sdp = removeG722Codec(call.sdp);
        call.sdp = performG722ParameterWorkaround(call.sdp);
        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);

        callSetReceiveVideo(call);

        addCandidates(call);
        call.peer.setRemoteDescription(nativeWebRTCSdp(typePreAns, call.sdp),
            function(){
                call.remoteVideoState = getSdpDirection(call.sdp, video);
                logger.debug("processNativePreAnswer: setRemoteDescription success");
            },
            function(e) {
                logger.debug("processNativePreAnswer: setRemoteDescription failed: " + e );
            });
    }

    /**
     * processDisablerPreAnswer to be used when the plugin is enabled
     */
    function processDisablerPreAnswer(call) {
        var ans, candidates, i;

        logger.debug("processDisablerPreAnswer");

        call.sdp = checkSupportedVideoCodecs(call.sdp, call.peer.localDescription.sdp);
        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);

        ans = webRTCSdp(typePreAns, call.sdp);

        callSetReceiveVideo(call);

        call.peer.setRemoteDescription(ans,
            function(){
                candidates = ans.createCandidates();
                for(i=0; i<candidates.length; ++i) {
                    call.peer.addIceCandidate(candidates[i]);
                }
                restoreMuteStateOfCall(call);
            },
            function(e) {
                logger.debug("processDisablerPreAnswer: setRemoteDescription failed: " + e);}
            );
    }

    /**
     * This is the PreAnswer from the Offer we sent.
     *
     * @ignore
     * @name rtc.processPreAnswer
     * @function
     * @param {call} call IncomingCall
     */
    this.processPreAnswer = function(call){
        logger.info("processing preanswer from the offer we sent");
        if (!webRTCInitialized) {
            logger.warn(NOTINITIALIZED);
            return;
        }

        if(call.peer){
            switch(pluginMode) {
                case PluginModes.AUTO:
                    processNativePreAnswer(call);
                    break;
                case PluginModes.LEGACY:
                case PluginModes.LEGACYH264:
                    processDisablerPreAnswer(call);
                    break;
                case PluginModes.WEBRTC:
                case PluginModes.WEBRTC21:
                case PluginModes.WEBRTCH264:
                case PluginModes.WEBRTC22:
                    processEnablerPreAnswer(call);
                    break;
                default:
                    processEnablerPreAnswer(call);
                    break;
            }
        }
    };

    /**
     * processEnabler30Respond to be used when the enabler plugin is enabled
     */
    function processEnabler30Respond(call, onSuccess, onFailure, isJoin) {
        var remoteVideoDirection;

        logger.debug("processEnabler30Respond: state= " + call.peer.signalingState);

        call.sdp = checkSupportedVideoCodecs(call.sdp, getSdpFromObject(call.peer.localDescription));
        call.sdp = removeSdpPli(call.sdp);
        call.sdp = removeG722Codec(call.sdp);
        call.sdp = performG722ParameterWorkaround(call.sdp);
        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);
        call.sdp = performVP8BandwidthWorkaround(call.sdp);
        call.sdp = removeRTXCodec(call.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);

        remoteVideoDirection = getSdpDirection(call.sdp, video);
    
        callSetReceiveVideo(call);

        if ((remoteVideoDirection === MediaStates.INACTIVE)&&(call.currentState === "COMPLETED")) 
        {
            switch(call.remoteVideoState){
                case MediaStates.INACTIVE:
                    call.sdp = updateSdpDirection(call.sdp, video, MediaStates.RECEIVE_ONLY);
                    break;
                case MediaStates.RECEIVE_ONLY:
                    call.sdp = updateSdpDirection(call.sdp, video, MediaStates.RECEIVE_ONLY);
                    break;
            }
        }        
        
        call.remoteVideoState = getSdpDirection(call.sdp, video);
        call.sdp = changeDirection(call.sdp, MediaStates.SEND_ONLY, MediaStates.SEND_RECEIVE, video);
        if (isJoin) {
            call.sdp = changeDirection(call.sdp, MediaStates.RECEIVE_ONLY, MediaStates.SEND_RECEIVE, audio);
            muteOnHold(call, false);
        }

        if (call.peer.signalingState === RTCSignalingState.STABLE) {
            //if we are in stable state we should not change remotedescription
            onSuccess();
            return;
        }
        
        if (webrtcdtls) {
            call.sdp = setMediaPassive(call.sdp);
        }
        
        call.peer.setRemoteDescription(webRTCSdp(typeAns,call.sdp),
            function(){
                logger.debug("processEnabler30Respond: setRemoteDescription success");
                var onSuccessAfterWorkaround = function() {
                    call.remoteVideoState = getSdpDirection(call.sdp, video);
                    addCandidates(call);
                    onSuccess();
                };
                performEnablerVideoStartWorkaround(call, onSuccessAfterWorkaround, onFailure);
            },
            function(e) {
                logger.debug("processEnabler30Respond: setRemoteDescription failed: " + e);
                onFailure();
            });
    }

    /**
     * processEnablerRespond to be used when the enabler plugin is enabled
     */
    function processEnablerRespond(call, onSuccess, onFailure, isJoin) {
        var remoteVideoDirection;

        logger.debug("processEnablerRespond: state= " + call.peer.signalingState);

        call.sdp = checkSupportedVideoCodecs(call.sdp, getSdpFromObject(call.peer.localDescription));
        call.sdp = removeSdpPli(call.sdp);
        call.sdp = removeG722Codec(call.sdp);
        call.sdp = performG722ParameterWorkaround(call.sdp);
        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);
        call.sdp = performVP8BandwidthWorkaround(call.sdp);
        call.sdp = checkandRestoreICEParams(call.sdp, call.sdp);
        call.sdp = addSdpMissingCryptoLine(call.sdp);
        call.sdp = removeRTXCodec(call.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);

        remoteVideoDirection = getSdpDirection(call.sdp, video); 
    
        callSetReceiveVideo(call);

        if ((remoteVideoDirection === MediaStates.INACTIVE)&&(call.currentState === "COMPLETED")) 
        {
            switch(call.remoteVideoState){
                case MediaStates.INACTIVE:
                    call.sdp = updateSdpDirection(call.sdp, video, MediaStates.RECEIVE_ONLY);
                    break;
                case MediaStates.RECEIVE_ONLY:
                    call.sdp = updateSdpDirection(call.sdp, video, MediaStates.RECEIVE_ONLY);
                    break;
            }
        } 
        
        call.remoteVideoState = getSdpDirection(call.sdp, video);
        call.sdp = changeDirection(call.sdp, MediaStates.SEND_ONLY, MediaStates.SEND_RECEIVE);
        if (isJoin) {
            call.sdp = changeDirection(call.sdp, MediaStates.RECEIVE_ONLY, MediaStates.SEND_RECEIVE, audio);
            muteOnHold(call, false);
        }

        if (call.peer.signalingState === RTCSignalingState.STABLE) {
            //if we are in stable state we should not change remotedescription
            onSuccess();
            return;
        }
        
        if (webrtcdtls) {
            call.sdp = setMediaPassive(call.sdp);
        }
        
        call.peer.setRemoteDescription(webRTCSdp(typeAns,call.sdp),
            function(){
                addCandidates(call);
                logger.debug("processEnablerRespond: setRemoteDescription success");
                onSuccess();
            },
            function(e) {
                logger.debug("processEnablerRespond: setRemoteDescription failed: " + e);
                onFailure();
            });
    }

    /**
     * processNativeRespond to be used when native webrtc is enabled
     */
    function processNativeRespond(call, onSuccess, onFailure, isJoin) {
        var remoteVideoDirection;

        logger.debug("processNativeRespond: state= " + call.peer.signalingState);

        call.sdp = checkSupportedVideoCodecs(call.sdp, call.peer.localDescription.sdp);
        call.sdp = removeSdpPli(call.sdp);
        call.sdp = removeG722Codec(call.sdp);
        call.sdp = performG722ParameterWorkaround(call.sdp);
        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);
        call.sdp = performVP8BandwidthWorkaround(call.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);

        remoteVideoDirection = getSdpDirection(call.sdp, video);
    
        callSetReceiveVideo(call);

        if ((remoteVideoDirection === MediaStates.INACTIVE)&&(call.currentState === "COMPLETED")) 
        {
            switch(call.remoteVideoState){
                case MediaStates.INACTIVE:
                    call.sdp = updateSdpDirection(call.sdp, video, MediaStates.RECEIVE_ONLY);
                    break;
                case MediaStates.RECEIVE_ONLY:
                    call.sdp = updateSdpDirection(call.sdp, video, MediaStates.RECEIVE_ONLY);
                    break;
            }
        }        
        
        call.remoteVideoState = getSdpDirection(call.sdp, video);
        call.sdp = changeDirection(call.sdp, MediaStates.SEND_ONLY, MediaStates.SEND_RECEIVE, video);
        if (isJoin) {
            call.sdp = changeDirection(call.sdp, MediaStates.RECEIVE_ONLY, MediaStates.SEND_RECEIVE, audio);
            muteOnHold(call, false);
        }

        if (call.peer.signalingState === RTCSignalingState.STABLE) {
            //if we are in stable state we should not change remotedescription
            onSuccess();
            return;
        }
        
        if (webrtcdtls) {
            call.sdp = setMediaPassive(call.sdp);
        }

        call.peer.setRemoteDescription(nativeWebRTCSdp(typeAns, call.sdp),
            function(){
                logger.debug("processNativeRespond: setRemoteDescription success");
                var onSuccessAfterWorkaround = function() {
                    call.remoteVideoState = getSdpDirection(call.sdp, video);
                    addCandidates(call);
                    onSuccess();
                };
                performNativeVideoStartWorkaround(call, onSuccessAfterWorkaround, onFailure);
            },
            function(e) {
                logger.debug("processNativeRespond: setRemoteDescription failed: " + e);
                onFailure();
            });
    }

    /**
     * processDisablerRespond to be used when the disabler plugin is enabled
     */
    function processDisablerRespond(call, onSuccess, onFailure, isJoin) {
        var candidates, i, ans;
        logger.debug("processDisablerRespond");

        call.sdp = checkSupportedVideoCodecs(call.sdp, call.peer.localDescription.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);

        if(call.sdp.indexOf(mLine + video + " 0 ", 0) !== -1) {
            call.sdp = call.sdp.replace(mLine + video + " 0 ", mLine + video + " 1 ");
        }

        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);

        if (webrtcdtls) {
            call.sdp = setMediaPassive(call.sdp);
        }
        
        // this is required just before setRemoteDescription
        callSetReceiveVideo(call);

        ans = webRTCSdp(typeAns,call.sdp);

        call.peer.setRemoteDescription(ans,
            function(){
                logger.debug("processDisablerRespond: setRemoteDescription success");
                candidates = ans.createCandidates();
                for(i=0; i<candidates.length; ++i) {
                    call.peer.addIceCandidate(candidates[i]);
                }
                restoreMuteStateOfCall(call);
                onSuccess();
            },
            function(e) {
                logger.debug("processDisablerRespond: setRemoteDescription failed: " + e);
                onFailure();
            });
    }

    /**
     * This is the respond of the Offer we sent.
     *
     * @ignore
     * @name rtc.processRespond
     * @function
     * @param {call} call IncomingCall
     * @param onSuccess The success callback function to be called
     * @param onFailure The failure callback function to be called
     */
    this.processRespond = function(call, onSuccess, onFailure, isJoin){
        logger.info("Processing the response to sent offer");
        if (!webRTCInitialized) {
            logger.warn(NOTINITIALIZED);
            return;
        }

        if(call.peer){
            switch(pluginMode) {
                case PluginModes.AUTO:
                    processNativeRespond(call, onSuccess, onFailure, isJoin);
                    break;
                case PluginModes.LEGACY:
                case PluginModes.LEGACYH264:
                    processDisablerRespond(call, onSuccess, onFailure, isJoin);
                    break;
                case PluginModes.WEBRTC:
                case PluginModes.WEBRTC21:
                    processEnablerRespond(call, onSuccess, onFailure, isJoin);
                    break;
                case PluginModes.WEBRTCH264:
                case PluginModes.WEBRTC22:
                    processEnabler30Respond(call, onSuccess, onFailure, isJoin);
                    break;
                default:
                    processEnablerRespond(call, onSuccess, onFailure, isJoin);
                    break;
            }
        }
    };

    /**
     * processCommonHoldRespond to be used when native webrtc, enabler plugin and disabler plugin is enabled
     */
    function processCommonHoldRespond(call, onSuccess, onFailure, isJoin) {
        var callStates = fcs.call.States, 
            remoteAudioDirection, 
            remoteVideoDirection,
            localHoldFlag = false,
            remoteHoldFlag = false;
        
        logger.debug("processCommonHoldRespond: state= " + call.peer.signalingState + " call.currentState= " + call.currentState);

        sdpParser.init(call.sdp);
        remoteHoldFlag=sdpParser.isRemoteHold();
                
        localHoldFlag=(call.currentState === "LOCAL_HOLD");
                
        remoteAudioDirection = getSdpDirection(call.sdp, audio);
        remoteVideoDirection = getSdpDirection(call.sdp, video);

        logger.debug("processCommonHoldRespond: localHold= " + localHoldFlag + " remoteHold= " + remoteHoldFlag);

        /* Required for MOH - start */
        if(remoteHoldFlag === false){    
            if ((remoteAudioDirection === MediaStates.SEND_RECEIVE)&& (call.currentState === "REMOTE_HOLD")) {
                call.previousState = call.currentState;
                call.currentState = "COMPLETED";
                call.call.onStateChange(callStates.IN_CALL, call.statusCode);
            }
        }else{
            if (call.currentState === "COMPLETED") {
                call.previousState = call.currentState;
                call.currentState = "REMOTE_HOLD";
                call.call.onStateChange(callStates.ON_REMOTE_HOLD, call.statusCode);
            } 
        }         

        if(localHoldFlag || remoteHoldFlag){    
            logger.debug("processCommonHoldRespond: " + call.currentState + " : video -> inactive");
            call.sdp = updateSdpDirection(call.sdp, video, MediaStates.INACTIVE);                
        }
           
        if((remoteVideoDirection === MediaStates.INACTIVE)&&(call.currentState === "COMPLETED")) {
            logger.debug("processCommonHoldRespond: video inactive -> recvonly");
            call.sdp = updateSdpDirection(call.sdp, video, MediaStates.RECEIVE_ONLY);
        }          
        /* Required for MOH - end */
        
        rtc.processRespond(call, onSuccess, onFailure, isJoin);
    }

    /**
     * processEnablerHoldRespond to be used when the enabler plugin is enabled
     */
    function processEnablerHoldRespond(call, onSuccess, onFailure, isJoin) {
        var callStates = fcs.call.States, 
            remoteAudioDirection, 
            remoteVideoDirection,
            localHoldFlag = false,
            remoteHoldFlag = false;
        
        logger.debug("processEnablerHoldRespond: state= " + call.peer.signalingState + " call.currentState= " + call.currentState);

        call.sdp = checkSupportedVideoCodecs(call.sdp, getSdpFromObject(call.peer.localDescription));
        call.sdp = removeRTXCodec(call.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);
        call.sdp = removeG722Codec(call.sdp);
        call.sdp = performG722ParameterWorkaround(call.sdp);
        call.sdp = performVP8BandwidthWorkaround(call.sdp);
        
        sdpParser.init(call.sdp);
        remoteHoldFlag=sdpParser.isRemoteHold();
                
        localHoldFlag=(call.currentState === "LOCAL_HOLD");
                
        remoteAudioDirection = getSdpDirection(call.sdp, audio);
        remoteVideoDirection = getSdpDirection(call.sdp, video);

        logger.debug("processEnablerHoldRespond: localHold= " + localHoldFlag + " remoteHold= " + remoteHoldFlag);

        /* Required for MOH - start */
        if(remoteHoldFlag === false){    
            if ((remoteAudioDirection === MediaStates.SEND_RECEIVE)&& (call.currentState === "REMOTE_HOLD")) {
                call.previousState = call.currentState;
                call.currentState = "COMPLETED";
                call.call.onStateChange(callStates.IN_CALL, call.statusCode);
            }
        }else{
            if (call.currentState === "COMPLETED") {
                call.previousState = call.currentState;
                call.currentState = "REMOTE_HOLD";
                call.call.onStateChange(callStates.ON_REMOTE_HOLD, call.statusCode);
            } 
        }         

        if(localHoldFlag || remoteHoldFlag){    
            logger.debug("processEnablerHoldRespond: " + call.currentState + " : video -> inactive");
            call.sdp = updateSdpDirection(call.sdp, video, MediaStates.INACTIVE);
        }
           
        if((remoteVideoDirection === MediaStates.INACTIVE)&&(call.currentState === "COMPLETED")) {
            logger.debug("processEnablerHoldRespond: video inactive -> recvonly");
            call.sdp = updateSdpDirection(call.sdp, video, MediaStates.RECEIVE_ONLY);
        } 
        /* Required for MOH - end */
        
        rtc.processRespond(call, onSuccess, onFailure, isJoin);
    }

    /**
     * processNativeHoldRespond to be used when native webrtc is enabled
     */
    function processNativeHoldRespond(call, onSuccess, onFailure, isJoin) {
        var callStates = fcs.call.States,
            remoteAudioDirection, 
            remoteVideoDirection,
            localVideoDirection,
            onSuccessAfterWorkaround,
            localHoldFlag = false,
            remoteHoldFlag = false;

        onSuccessAfterWorkaround = function() {
            //call.remoteVideoState = getSdpDirection(call.sdp, video);
            addCandidates(call);
            onSuccess();                    
        };
                        
        logger.debug("processNativeHoldRespond: state= " + call.peer.signalingState + " call.currentState= " + call.currentState);

        call.sdp = checkSupportedVideoCodecs(call.sdp, call.peer.localDescription.sdp);
        call.sdp = removeSdpPli(call.sdp);
        call.sdp = removeG722Codec(call.sdp);
        call.sdp = performG722ParameterWorkaround(call.sdp);
        call.sdp = performVP8RTCPParameterWorkaround(call.sdp);     
        call.sdp = performVP8BandwidthWorkaround(call.sdp);
        call.sdp = fixRemoteTelephoneEventPayloadType(call, call.sdp);

        sdpParser.init(call.sdp);
        remoteHoldFlag=sdpParser.isRemoteHold();
                
        localHoldFlag=(call.currentState === "LOCAL_HOLD");
                
        remoteAudioDirection = getSdpDirection(call.sdp, audio);
        remoteVideoDirection = getSdpDirection(call.sdp, video);

        call.remoteVideoState = remoteVideoDirection;
        
        localVideoDirection = getSdpDirection(call.peer.localDescription.sdp, video);

        logger.debug("processNativeHoldRespond: localHold= " + localHoldFlag + " remoteHold= " + remoteHoldFlag);

        /* Required for MOH - start */
        if(remoteHoldFlag === false){    
            if ((remoteAudioDirection === MediaStates.SEND_RECEIVE) && (call.currentState === "REMOTE_HOLD")) {
                call.previousState = call.currentState;
                call.currentState = "COMPLETED";
                call.call.onStateChange(callStates.IN_CALL, call.statusCode);
            }
        } else {
            if (call.currentState === "COMPLETED") {
                call.previousState = call.currentState;
                call.currentState = "REMOTE_HOLD";
                call.call.onStateChange(callStates.ON_REMOTE_HOLD, call.statusCode);
            }                   
        }         

        if(localHoldFlag || remoteHoldFlag){    
            logger.debug("processNativeHoldRespond: " + call.currentState + " : video -> inactive");
            call.sdp = updateSdpDirection(call.sdp, video, MediaStates.INACTIVE);                
        }
           
        if((remoteVideoDirection === MediaStates.INACTIVE)&&(call.currentState === "COMPLETED")) {
            logger.debug("processNativeHoldRespond: video inactive -> recvonly");
            call.sdp = updateSdpDirection(call.sdp, video, MediaStates.RECEIVE_ONLY);
        }        
        /* Required for MOH - end */

        if (isJoin) {
            muteOnHold(call, false);
        }

        // this is required just before setRemoteDescription
        callSetReceiveVideo(call);

        if (call.peer.signalingState === RTCSignalingState.STABLE) {
            //if we are in stable state we should not change remotedescription
            onSuccess();
            return;
        }
        
        if (webrtcdtls) {
            call.sdp = setMediaPassive(call.sdp);
        }

        // this is required for displaying remote video when direction is send only
        call.sdp = changeDirection(call.sdp, MediaStates.SEND_ONLY, MediaStates.SEND_RECEIVE);

        call.peer.setRemoteDescription(nativeWebRTCSdp(typeAns, call.sdp),
            function() {
                logger.debug("processNativeHoldRespond: setRemoteDescription typeAns success");

                performNativeVideoStartWorkaround(call, onSuccessAfterWorkaround, onFailure);                
                //onSuccessAfterWorkaround();                
            },
            function(e) {
                logger.debug("processNativeHoldRespond: setRemoteDescription typeAns failed: " + e);
                onFailure();
            });
    }

    /**
     * processDisablerHoldRespond to be used when the disabler plugin is enabled
     */
    function processDisablerHoldRespond(call, onSuccess, onFailure, isJoin) {
        logger.debug("processDisablerHoldRespond");
        rtc.processRespond(call, onSuccess, onFailure, isJoin);
    }

    /**
     * This is the respond of the Offer we sent.
     *
     * @ignore
     * @name rtc.processHoldRespond
     * @function
     * @param {call} call IncomingCall
     * @param onSuccess The success callback function to be called
     * @param onFailure The failure callback function to be called
     */
    this.processHoldRespond = function(call, onSuccess, onFailure, isJoin){
        logger.info("Processing response to hold offer sent");
        if (!webRTCInitialized) {
            logger.warn(NOTINITIALIZED);
            return;
        }

        if(call.peer){
            switch(pluginMode) {
                case PluginModes.AUTO:
                    processNativeHoldRespond(call, onSuccess, onFailure, isJoin);
                    break;
                case PluginModes.LEGACY:
                case PluginModes.LEGACYH264:
                    processDisablerHoldRespond(call, onSuccess, onFailure, isJoin);
                    break;
                case PluginModes.WEBRTC:
                case PluginModes.WEBRTC21:
                case PluginModes.WEBRTCH264:
                case PluginModes.WEBRTC22:
                    processEnablerHoldRespond(call, onSuccess, onFailure, isJoin);
                    break;
                default:
                    processEnablerHoldRespond(call, onSuccess, onFailure, isJoin);
                    break;
            }
        }
    };

    /**
     * initPluginMedia to be used when the plugin is enabled.
     */
    function initPluginMedia(onSuccess, onFailure, options, configuredPluginVersion, applicationType) {
        var mainContainer = document.body,
        size = "1px",
        logLevel = 4,
        onloadParam,
        verifyPlugin = true,
        mediaErrors = fcs.call.MediaErrors;
        logger.debug("Configured plugin version: " + configuredPluginVersion.major + "." + configuredPluginVersion.minor + "." + configuredPluginVersion.current_revision);

        if(options){
            videoContainer = options.videoContainer;
            if (configuredPluginVersion.major !== "1") {
                localVideoContainer = options.localVideoContainer;
                remoteVideoContainer = options.remoteVideoContainer;
            }

            if(videoContainer){
                if (configuredPluginVersion.major === "1") {
                    mainContainer = videoContainer;
                    size = "100%";                    
                } else {
                    defaultVideoContainer = videoContainer;
                }
            }

            if(options.pluginLogLevel !== undefined){
                logLevel = options.pluginLogLevel;
            }
        }

        //Callback for when the plugin is loaded
        window.onFCSPLoaded = function(){
            // prevent multiple init calls
            if(webRTCInitialized || !verifyPlugin) {
                return;
            }
            verifyPlugin = false;
            logger.debug("Plugin callback");

            if(rtcPlugin.logSeverityLevel){
                rtcPlugin.logSeverityLevel = logLevel;
            }

            // Added until setPluginLanguage method is fixed for all plugin types.
            if (configuredPluginVersion.major === "1") {
                if (rtcPlugin) {
                    if (rtcPlugin.setLanguage) {
                        rtcPlugin.setLanguage(options.language);
                    }
                    else {
                        setPluginLanguage(options.language);
                    }
                }
            }

            // check plugin's version
            var pluginVersion = rtcPlugin.version.split(".");
            fcs.setPluginVersion(pluginVersion[0] + "." + pluginVersion[1] + "." + pluginVersion[2] + "." + pluginVersion[3]);
            logger.debug("Installed plugin version: " + pluginVersion[0] + "." + pluginVersion[1] + "." + pluginVersion[2] + "." + pluginVersion[3]);
            if ((pluginVersion.length < 1 ||
                    pluginVersion[0] !== configuredPluginVersion.major ||
                    pluginVersion[1] !== configuredPluginVersion.minor) ||
                    (pluginVersion[2].length < configuredPluginVersion.min_revision.length ||
                            (pluginVersion[2].length === configuredPluginVersion.min_revision.length &&
                                    (pluginVersion[2] < configuredPluginVersion.min_revision ||
                                            (pluginVersion[2] === configuredPluginVersion.min_revision &&
                                             pluginVersion[3] < configuredPluginVersion.min_build))))) {

                logger.debug("Plugin version not supported");
                onFailure(mediaErrors.WRONG_VERSION);
            } else {
                webRTCInitialized = true;
                if (pluginVersion[2].length < configuredPluginVersion.current_revision.length ||
                        (pluginVersion[2].length === configuredPluginVersion.current_revision.length &&
                                (pluginVersion[2] < configuredPluginVersion.current_revision ||
                                        (pluginVersion[2] === configuredPluginVersion.current_revision &&
                                         pluginVersion[3] < configuredPluginVersion.current_build)))) {
                    logger.debug("New plugin version warning");
                    onFailure(mediaErrors.NEW_VERSION_WARNING);
                } else {
                    onSuccess({
                        "pluginVersion": rtcPlugin.version
                    });
                }

                if (configuredPluginVersion.major !== "1") {
                    setPluginLanguage(options.language);
                }
            }

            localStream = null;
            checkMediaSourceAvailability();            
        };

        // only check if the function exists, not its type, because in IE it is "object" (host object)
        if (typeof mainContainer.appendChild === 'undefined') {
            logger.debug("Could not inject plugin in container");
            onFailure(mediaErrors.OPTIONS);
            return;
        }

        rtcPlugin = document.createElement('object');
        onloadParam = document.createElement('param');
        onloadParam.setAttribute("name", "onload");
        onloadParam.setAttribute("value", "onFCSPLoaded");
        rtcPlugin.appendChild(onloadParam);
        rtcPlugin.id = pluginid;
        rtcPlugin.width = rtcPlugin.height = size;

        if (configuredPluginVersion.major === "1") {
            mainContainer.setAttribute("style", "background-color:black;");            
        }
        
        // Order matters for the following:
        // For IE you need to append first so the dom is available when IE loads the plugin, which happens when the type is set.
        // For FF you need to set the type and then append or the plugin won't load.
        // Chrome seems happy either way.
        try {
            if (navigator.appName === 'Microsoft Internet Explorer') {
                mainContainer.appendChild(rtcPlugin);
                rtcPlugin.type = applicationType;
            } else {
                rtcPlugin.type = applicationType;
                mainContainer.appendChild(rtcPlugin);
            }
        } catch(e) {
            verifyPlugin = false;
            onFailure(mediaErrors.NOT_FOUND);
        }

        if(verifyPlugin) {
            if(typeof document.getElementById(pluginid).createPeerConnection !== 'undefined') {
                window.onFCSPLoaded();
            } else {
                //if the plugin is not initialized within 7 sec fail
                setTimeout(function(){
                    // for createPeerConnection, only check if it exists. It is "function" in FireFox and "object" in Chrome and IE
                    if(!webRTCInitialized) {
                        if(typeof document.getElementById(pluginid).createPeerConnection === 'undefined') {
                            onFailure(mediaErrors.NOT_FOUND);
                        } else {
                            window.onFCSPLoaded();
                        }
                    }
                }, 7000);
            }
        }
    }

    /**
     * initEnablerMedia to be used when the enabler plugin is enabled.
     */
    function initEnablerMedia(onSuccess, onFailure, options) {
        initPluginMedia(onSuccess, onFailure, options, webrtcPluginVersion, "application/x-gcfwenabler");
    }

    /**
     * initEnabler21Media to be used when the enabler plugin is enabled.
     */
    function initEnabler21Media(onSuccess, onFailure, options) {
        initPluginMedia(onSuccess, onFailure, options, webrtc21PluginVersion, "application/x-gcfwenabler");
    }

    /**
     * initEnabler30Media to be used when the enabler plugin is enabled.
     */
    function initEnabler30Media(onSuccess, onFailure, options) {
        initPluginMedia(onSuccess, onFailure, options, webrtcH264PluginVersion, "application/x-gcfwenabler");
    }

    /**
     * initEnabler22Media to be used when the enabler plugin is enabled.
     */
    function initEnabler22Media(onSuccess, onFailure, options) {
        initPluginMedia(onSuccess, onFailure, options, webrtc22PluginVersion, "application/x-gcfwenabler");
    }

    /**
     * initNativeMedia to be used when native webrtc is enabled.
     */
    function initNativeMedia(onSuccess, onFailure, options) {
        if(options){
            videoContainer = options.videoContainer;
            localVideoContainer = options.localVideoContainer;
            remoteVideoContainer = options.remoteVideoContainer;
 
            if(videoContainer){
                defaultVideoContainer = videoContainer;
            }
        }
        webRTCInitialized = true;
        checkMediaSourceAvailability();        
        onSuccess();
    }

    /**
     * initDisablerMedia to be used when the legacy plugin is enabled.
     */
    function initDisablerMedia(onSuccess, onFailure, options) {
        initPluginMedia(onSuccess, onFailure, options, legacyPluginVersion, "application/x-gcfwlegacy");
    }

    /**
     * initDisablerH264Media to be used when the lagacyH264 plugin is enabled.
     */
    function initDisablerH264Media(onSuccess, onFailure, options) {
        initPluginMedia(onSuccess, onFailure, options, legacyH264PluginVersion, "application/x-gcfwlegacyh264");
    }

    /**
    * Initialize WebRTC or Plugin
    *
    * @ignore
    * @name rtc.initMedia
    * @function
    * @param {function()} onSuccess The success callback function to be called
    * @param {function(error)} onFailure The failure callback function to be called
    * @param {object} options Media Options
    */
    this.initMedia = function(onSuccess, onFailure, options){
        logger.info("Initializing media for call");
        if(options){
            if(options.iceserver){
                iceServerUrl = options.iceserver;
            }

            if (options.webrtcdtls) {
                webrtcdtls = options.webrtcdtls;
            } else {
                webrtcdtls = false;

            }

            if((options.pluginMode === PluginModes.AUTO || 
                options.pluginMode === PluginModes.AUTOH264 ||
                options.pluginMode === PluginModes.AUTO22 ||
                options.pluginMode === PluginModes.AUTO21
               ) && navigator.webkitGetUserMedia) {
                pluginMode = PluginModes.AUTO;
            } else if((options.pluginMode === PluginModes.AUTO && !navigator.webkitGetUserMedia) || 
                       options.pluginMode === undefined || 
                       options.pluginMode === PluginModes.WEBRTC ) {
                pluginMode = defaultRTCPluginMode;
            } else if(options.pluginMode === PluginModes.AUTOH264 && !navigator.webkitGetUserMedia) {
                pluginMode = PluginModes.WEBRTCH264;
            } else if(options.pluginMode === PluginModes.AUTO22 && !navigator.webkitGetUserMedia) {
                pluginMode = PluginModes.WEBRTC22;
            } else if(options.pluginMode === PluginModes.AUTO21 && !navigator.webkitGetUserMedia) {
                pluginMode = PluginModes.WEBRTC21;
            } else {
                pluginMode = options.pluginMode;
            }
        }

        window.pluginMode = pluginMode;
        switch(pluginMode) {
            case PluginModes.AUTO:
                initNativeMedia(onSuccess, onFailure, options);
                break;
            case PluginModes.LEGACY:
                initDisablerMedia(onSuccess, onFailure, options);
                break;
            case PluginModes.LEGACYH264:
                initDisablerH264Media(onSuccess, onFailure, options);
                break;
            case PluginModes.WEBRTC:
                initEnablerMedia(onSuccess, onFailure, options);
                break;
            case PluginModes.WEBRTC21:
                initEnabler21Media(onSuccess, onFailure, options);
                break;
            case PluginModes.WEBRTCH264:
                initEnabler30Media(onSuccess, onFailure, options);
                break;
            case PluginModes.WEBRTC22:
                initEnabler22Media(onSuccess, onFailure, options);
                break;
            default:
                logger.debug("Invalid Plugin Mode Detected, Treated as WEBRTC");
                initEnablerMedia(onSuccess, onFailure, options);
                pluginMode = PluginModes.WEBRTC;
                window.pluginMode = pluginMode;
                break;
        }
    };


    /**
     * getEnablerUserMedia to be used when the enabler plugin is enabled.
     */
    function getEnablerUserMedia(onSuccess, onFailure, options) {
        var video_constraints, mediaInfo;
        
        logger.debug("Plugin version:" + rtcPlugin.version);
        
        if(getGlobalSendVideo() && videoSourceAvailable) {
            video_constraints = {
                mandatory: {
                    "maxWidth": pluginVideoWidth,
                    "maxHeight": pluginVideoHeight  //,
//                    "minWidth": pluginVideoWidth,
//                    "minHeight": pluginVideoHeight,
//                    "minFrameRate": "30"
                    }
            };
        } else {
            video_constraints = false;
        }
        //localStream = null;
        if(localStream) {
            mediaInfo = {
                "audio": mediaAudio,
                "video": getGlobalSendVideo() && videoSourceAvailable
            };
            onSuccess(mediaInfo);
            return;
        }
        rtcPlugin.getUserMedia(
        {
            "audio":mediaAudio,
            "video":video_constraints
        },
        //success callback
        function(stream) {
            logger.debug("user has granted access to local media.");
            localStream = stream;
            webRTCInitialized = true;
            mediaInfo = {
                "audio": mediaAudio,
                "video": getGlobalSendVideo() && videoSourceAvailable
            };
            onSuccess(mediaInfo);
        },//failure callback
        function(error) {
            logger.debug("Failed to get access to local media. Error code was " + error.code);
            onFailure(fcs.call.MediaErrors.NOT_ALLOWED);
        });
    }

    /**
     * getNativeUserMedia to be used when native webrtc is enabled.
     */
    function getNativeUserMedia(onSuccess, onFailure, options) {
        var video_constraints, mediaInfo;
        if(getGlobalSendVideo() && videoSourceAvailable) {
            video_constraints = {
                mandatory: {
                    "maxWidth": nativeVideoWidth,
                    "maxHeight": nativeVideoHeight,
                    "minWidth": nativeVideoWidth,
                    "minHeight": nativeVideoHeight  //,
                    //"minFrameRate": "30"
                    }
            };
        } else {
            video_constraints = false;
        }

        //localStream = null;

        navigator.webkitGetUserMedia(
        {
            audio :mediaAudio,
            video : video_constraints
        },
        //success callback
        function(stream) {
            logger.debug("user has granted access to local media.");
            localStream = stream;

            webRTCInitialized = true;
            mediaInfo = {
                "audio": mediaAudio,
                "video": getGlobalSendVideo()
            };
            onSuccess(mediaInfo);
        },//failure callback
        function(error) {
            logger.debug("Failed to get access to local media. Error code was " + error.code);
            onFailure(fcs.call.MediaErrors.NOT_ALLOWED);
        });
    }

    /**
     * getDisablerUserMedia to be used when the disabler plugin is enabled.
     */
    function getDisablerUserMedia(onSuccess, onFailure, options) {
        logger.debug("Plugin version:" + rtcPlugin.version);

        //localStream = null;
        if(localStream) {
            var mediaInfo = {
                "audio": mediaAudio,
                "video": getGlobalSendVideo() && videoSourceAvailable
            };
            onSuccess(mediaInfo);
            return;
        }
        rtcPlugin.getUserMedia(
        {
            "audio":mediaAudio,
            "video":getGlobalSendVideo()
        },
        //success callback
        function(stream) {
            logger.debug("user has granted access to local media.");
            localStream = stream;

            webRTCInitialized = true;
            var mediaInfo = {
                "audio": mediaAudio,
                "video": getGlobalSendVideo()
            };
            onSuccess(mediaInfo);
        },//failure callback
        function(error) {
            logger.debug("Failed to get access to local media. Error code was " + error.code);
            onFailure(fcs.call.MediaErrors.NOT_ALLOWED);
        });
    }

    /**
     * Loads WebRTC plugin and get user media
     *
     * @ignore
     * @name rtc.getUserMedia
     * @function
     * @param {function()} onSuccess The success callback function to be called
     * @param {function(error)} onFailure The failure callback function to be called
     * @param {Object} options MediaConstraints audio / video
     */
    this.getUserMedia = function(onSuccess, onFailure, options){
        
        logger.info("getting user media for call: started - userAgent: " + navigator.userAgent);

        if(options){
            if(options.audio !== undefined){
                mediaAudio = options.audio;
            }
            if(options.videoResolution !== undefined && options.videoResolution !== null) {
                if (options.videoResolution.split("x")[0] && options.videoResolution.split("x")[1]) {
                    nativeVideoWidth = options.videoResolution.split("x")[0];
                    nativeVideoHeight = options.videoResolution.split("x")[1];
                    pluginVideoWidth = options.videoResolution.split("x")[0];
                    pluginVideoHeight = options.videoResolution.split("x")[1];
                }
            }
        }

        switch(pluginMode) {
            case PluginModes.AUTO:
                checkMediaSourceAvailability(function() {
                    getNativeUserMedia(onSuccess, onFailure, options);
                });    
                break;
            case PluginModes.LEGACY:
            case PluginModes.LEGACYH264:
                if (rtcPlugin) {
                    checkMediaSourceAvailability(function() {
                        getDisablerUserMedia(onSuccess, onFailure, options);
                    });             
                }
                break;
            case PluginModes.WEBRTC:
            case PluginModes.WEBRTC21:
            case PluginModes.WEBRTCH264:
            case PluginModes.WEBRTC22:
                if (rtcPlugin) {
                    checkMediaSourceAvailability(function() {
                        getEnablerUserMedia(onSuccess, onFailure, options);
                    });              
                }
                break;
            default:
                if (rtcPlugin) {
                    checkMediaSourceAvailability(function() {
                        getEnablerUserMedia(onSuccess, onFailure, options);
                    });              
                }
                break;
        }
    };

    /**
    * Gets audioInDeviceCount
    *
    * @ignore
    * @name rtc.get_audioInDeviceCount
    * @function
    */

    this.get_audioInDeviceCount = function(){
        var audioInDeviceNames;

        if (pluginMode !== PluginModes.AUTO) {
            audioInDeviceNames = rtcPlugin.getAudioInDeviceNames();
            return audioInDeviceNames.length;
        } else {
            return 1;   // Use right method for Native
        }
    };

    /**
    * Gets audioOutDeviceCount
    *
    * @ignore
    * @name rtc.get_audioOutDeviceCount
    * @function
    */

    this.get_audioOutDeviceCount = function(){
        var audioOutDeviceNames;

        if (pluginMode !== PluginModes.AUTO) {
            audioOutDeviceNames = rtcPlugin.getAudioOutDeviceNames();
            return audioOutDeviceNames.length;
        } else {
            return 1;   // Use right method for Native
        }
    };

    /**
    * Gets videoDeviceCount
    *
    * @ignore
    * @name rtc.get_videoDeviceCount
    * @function
    */

    this.get_videoDeviceCount = function(){
        var videoDeviceNames;

        if (pluginMode !== PluginModes.AUTO) {
            videoDeviceNames = rtcPlugin.getVideoDeviceNames();
            return videoDeviceNames.length;
        } else {
            return 1;   // Use right method for Native
        }
    };

    /**
    * Sets log severity level for Webrtc Plugin (not used for native webrtc)
    * 5 levels(sensitive:0, verbose:1, info:2, warning:3, error:4)
    *
    * @ignore
    * @name rtc.set_logSeverityLevel
    * @function
    */

    this.set_logSeverityLevel = function(level){
        if (pluginMode !== PluginModes.AUTO) {
            rtcPlugin.logSeverityLevel = level;
        }
        else {
            logger.error("set_logSeverityLevel: Not Applicable in PluginMode AUTO");
        }
    };

    /**
    * Gets log severity level
    *
    * @ignore
    * @name rtc.get_logSeverityLevel
    * @function
    */

    this.get_logSeverityLevel = function(){
        if (pluginMode !== PluginModes.AUTO) {
            return rtcPlugin.logSeverityLevel;
        }
        else {
            logger.error("get_logSeverityLevel: Not Applicable in PluginMode AUTO");
        }
    };
    
    /**
    * Enables log callback for Webrtc Plugin (not used for native webrtc)
    *
    * @ignore
    * @name rtc.enable_logCallback
    * @function
    */

    this.enable_logCallback = function(){
        var rtcPluginLogger = fcs.logManager.getLogger("rtcPlugin");
        if (pluginMode !== PluginModes.AUTO) {
            rtcPlugin.logCallback = rtcPluginLogger.trace;
        }
        else {
            logger.error("enable_logCallback: Not Applicable in PluginMode AUTO");
        }
    };
    
    /**
    * Disables log callback for Webrtc Plugin (not used for native webrtc)
    *
    * @ignore
    * @name rtc.disable_logCallback
    * @function
    */

    this.disable_logCallback = function(){
        if (pluginMode !== PluginModes.AUTO) {
            rtcPlugin.logCallback = null;
        }
        else {
            logger.error("disable_logCallback: Not Applicable in PluginMode AUTO");
        }
    };
    
    /**
    * Shows device settings Window
    *
    * @ignore
    * @name rtc.showSettingsWindow
    * @function
    */
    this.showSettingsWindow = function(){
        return rtcPlugin.showSettingsWindow();
    };

     /**
     * Gets local video resolutions with the order below
     * localVideoHeight-localVideoWidth
     *
     * @ignore
     * @name rtc.getLocalVideoResolutions
     * @function
     */
     this.getLocalVideoResolutions = function() {
        var localResolution = [],
            localVideoHeight,
            localVideoWidth;

        if (pluginMode === PluginModes.AUTO) {
            return localResolution;
        }

        if (!webRTCInitialized) {
            logger.warn("Plugin is not installed");
            return localResolution;
        }

        if(pluginMode === PluginModes.LEGACY || pluginMode === PluginModes.LEGACYH264) {
            logger.debug("local video resolutions of plugin legacy...");
            logger.debug("localVideoWidth   : " + rtcPlugin.localVideoWidth);
            logger.debug("localVideoHeight  : " + rtcPlugin.localVideoHeight);
            
            localResolution.push(rtcPlugin.localVideoHeight);
            localResolution.push(rtcPlugin.localVideoWidth);
        }

        if (pluginMode === PluginModes.WEBRTC || 
            pluginMode === PluginModes.WEBRTCH264 ||
            pluginMode === PluginModes.WEBRTC22 ||
            pluginMode === PluginModes.WEBRTC21 ){
           
            if(localVideoContainer){
                if (!localVideoContainer.firstChild) {
                    return localResolution;
                }
                
                localVideoHeight = localVideoContainer.firstChild.videoHeight;
                localVideoWidth = localVideoContainer.firstChild.videoWidth;
                
            } else {
                if (!defaultVideoContainer.lastElementChild.firstChild) {
                    return localResolution;
                }
                
                localVideoHeight = defaultVideoContainer.lastElementChild.firstChild.videoHeight;
                localVideoWidth = defaultVideoContainer.lastElementChild.firstChild.videoWidth;
                
            }
        
            logger.debug("local video resolutions of plugin webrtc...");
            logger.debug("localVideoWidth  : " + localVideoWidth);
            logger.debug("localVideoHeight : " + localVideoHeight);
           
            localResolution.push(localVideoHeight);
            localResolution.push(localVideoWidth);
        }

        return localResolution;
         
     };

     /**
     * Gets remote video resolutions with the order below
     * remoteVideoHeight-remoteVideoWidth
     *
     * @ignore
     * @name rtc.getRemoteVideoResolutions
     * @function
     */
     this.getRemoteVideoResolutions = function() {
        var remoteResolution = [],
            remoteVideoHeight,
            remoteVideoWidth;

        if (pluginMode === PluginModes.AUTO) {
            return remoteResolution;
        }

        if (!webRTCInitialized) {
            logger.warn("Plugin is not installed");
            return remoteResolution;
        }


        if(pluginMode === PluginModes.LEGACY || pluginMode === PluginModes.LEGACYH264) {
            logger.debug("remote video resolutions of plugin legacy...");
            logger.debug("remoteVideoWidth  : " + rtcPlugin.remoteVideoWidth);
            logger.debug("remoteVideoHeight : " + rtcPlugin.remoteVideoHeight);
            
            remoteResolution.push(rtcPlugin.remoteVideoHeight);
            remoteResolution.push(rtcPlugin.remoteVideoWidth);
        }

        if (pluginMode === PluginModes.WEBRTC || 
            pluginMode === PluginModes.WEBRTCH264 ||
            pluginMode === PluginModes.WEBRTC22 ||
            pluginMode === PluginModes.WEBRTC21 ){
           
            if(remoteVideoContainer){
                if (!remoteVideoContainer.firstChild) {
                    return remoteResolution;
                }
                
                remoteVideoHeight = remoteVideoContainer.firstChild.videoHeight;
                remoteVideoWidth = remoteVideoContainer.firstChild.videoWidth;
                
            } else {
                if (!defaultVideoContainer.firstElementChild.firstChild) {
                    return remoteResolution;
                }
                
                remoteVideoHeight = defaultVideoContainer.firstElementChild.firstChild.videoHeight;
                remoteVideoWidth = defaultVideoContainer.firstElementChild.firstChild.videoWidth;
                
            }
        
            logger.debug("remote video resolutions of plugin webrtc...");
            logger.debug("remoteVideoWidth  : " + remoteVideoWidth);
            logger.debug("remoteVideoHeight : " + remoteVideoHeight);
           
            remoteResolution.push(remoteVideoHeight);
            remoteResolution.push(remoteVideoWidth);
        }
        
        rtc.getLocalVideoResolutions();
        
        return remoteResolution;
     };
     
     /**
     * Gets local and remote video resolutions with the order below
     * remoteVideoHeight-remoteVideoWidth
     *
     * @deprecated         
     * @ignore
     * @name rtc.getVideoResolutions
     * @function
     */
     this.getVideoResolutions = function() {
        return rtc.getRemoteVideoResolutions();
     };     

    /**
    * Shows if plugin is enabled
    *
    * @ignore
    * @name rtc.isPluginEnabled
    * @function
    */
    this.isPluginEnabled = function(){
        return (pluginMode === PluginModes.WEBRTC) || 
               (pluginMode === PluginModes.WEBRTC21) || 
               (pluginMode === PluginModes.WEBRTC22) || 
               (pluginMode === PluginModes.WEBRTCH264) || 
               (pluginMode === PluginModes.LEGACY) || 
               (pluginMode === PluginModes.LEGACYH264);
    };


    this.onLocalStreamAdded = function(call){
        onLocalStreamAdded(call);
    };

    this.createStreamRenderer = createStreamRenderer;
    
    this.disposeStreamRenderer = disposeStreamRenderer;

};
rtc = new WebRTCAbstraction();

/* 

 * Finite State machine that defines state transition of basic call model.

 * State machine fires events during state transitions. 

 * Components should register to FSM  in order to receive transition events 

 * 

 */



var CallFSM = function() {

    

    this.CallFSMState = {

        INIT: "INIT",

        RINGING: "RINGING",

        TRYING: "TRYING",

        ANSWERING : "ANSWERING",

        COMPLETED: "COMPLETED",

        RINGING_SLOW: "RINGING_SLOW",

        LOCAL_HOLD: "LOCAL_HOLD",

        REMOTE_HOLD: "REMOTE_HOLD",

        BOTH_HOLD: "BOTH_HOLD",

        JOINING: "JOINING",

        PROVISIONRECEIVED: "PROVISIONRECEIVED",

        REFER: "REFER",

        TRANSFERING: "TRANSFERING"

    };

    

    //CallFSM returns TransferEvent after state change

    this.TransferEvent = {

        callStart_fsm: "callStart_fsm",

        callReceived_fsm: "callReceived_fsm",

        answer_fsm: "answer_fsm",

        reject_GUI: "reject_GUI",

        callCompleted_fsm: "callCompleted_fsm",

        noAnswer_fsm: "noAnswer_fsm",

        localEnd_fsm: "localEnd_fsm",

        remoteEnd_fsm: "remoteEnd_fsm",

        answeringRingingSlow_fsm: "answeringRingingSlow_fsm",

        callCompletedAnswering_fsm: "callCompletedAnswering_fsm",

        localHold_fsm: "localHold_fsm",

        remoteHold_fsm: "remoteHold_fsm",

        localUnHold_fsm: "localUnHold_fsm",

        remoteUnHold_fsm: "remoteUnHold_fsm",

        joining_fsm: "joining_fsm",

        sessionComplete_fsm: "sessionComplete_fsm",

        joiningSuccess_fsm: "joiningSuccess_fsm",

        sessionFail_fsm: "sessionFail_fsm",

        ringing_fsm: "ringing_fsm",

        respondCallUpdate_fsm: "respondCallUpdate_fsm",

        remoteCallUpdate_fsm: "remoteCallUpdate_fsm",

        respondCallUpdateAck_fsm: "respondCallUpdateAck_fsm",

        preCallResponse_fsm: "preCallResponse_fsm",

        forward_fsm: "forward_fsm",

        refer_fsm: "refer_fsm",

        accepted_fsm: "accepted_fsm",

        transfering: "transfering",

        transferSuccess_fsm: "transferSuccess_fsm",

        transferFail_fsm: "transferFail_fsm",

        respondCallHoldUpdate_fsm: "respondCallHoldUpdate_fsm",

        remoteOfferDuringLocalHold_fsm: "remoteOfferDuringHold_fsm"

    };

    

    //CallFSM receives NotificationEvent

    this.NotificationEvent = {

        callStart_GUI: "callStart_GUI",

        callNotify: "callNotify",

        ringing_Notify: "ringing_Notify",

        answer_GUI: "answer_GUI",

        end_GUI: "end_GUI",

        respondCallUpdate_Notify: "respondCallUpdate_Notify",

        callCompleted_fsm: "callCompleted_fsm",

        callEnd_Notify: "callEnd_Notify",

        callNotify_noSDP: "callNotify_noSDP",

        startCallUpdate_Notify: "startCallUpdate_Notify",

        joining_Notify: "joining_Notify",

        sessionComplete_Notify: "sessionComplete_Notify",

        joiningSuccess_Notify: "joiningSuccess_Notify",

        sessionFail_Notify: "sessionFail_Notify",

        hold_GUI: "hold_GUI",

        unhold_GUI: "unhold_GUI",

        sessionProgress: "sessionProgress",

        callCancel_Notify: "callCancel_Notify",

        forward_GUI: "forward_GUI",

        refer_JSL: "refer_JSL",

        accepted_Notify: "accepted_Notify",

        transfering: "transfering"

    };

    var self = this, holdResponse = false, logger = logManager.getLogger("callFsm");

    

    function FSM (call, event, onSuccess) {

        var isHoldFlag, sessionProgress = "sessionProgress";

        switch (self.getCurrentState(call)) {

            case self.CallFSMState.INIT:

                //If the event is callStart_GUI on the INIT state, currentState goes to TRYING state with event callStart_fsm

                //If the event is call_Notify on the INIT state, currentState goes to RINGING state with event callReceived_fsm

                //If the event is callNotify_noSDP on the INIT state, currentState goes to RINGING_SLOW state with event callReceived_fsm

                //If the event is joiningSuccess_Notify on the INIT state, currentState goes to TRYING state with event joiningSuccess_fsm

                switch (event) {

                    case self.NotificationEvent.callStart_GUI:

                        call.currentState = self.CallFSMState.TRYING;

                        onSuccess(call, self.TransferEvent.callStart_fsm);

                        logger.debug("(Call FSM) State Passed from INIT to TRYING. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.callNotify:

                        call.currentState = self.CallFSMState.RINGING;

                        onSuccess(call, self.TransferEvent.callReceived_fsm);

                        logger.debug("(Call FSM) State Passed from INIT to RINGING. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.callNotify_noSDP:

                        call.currentState = self.CallFSMState.RINGING_SLOW;

                        onSuccess(call, self.TransferEvent.callReceived_fsm);

                        logger.debug("(Call FSM) State Passed from INIT to RINGING_SLOW. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.joiningSuccess_Notify:

                        call.currentState = self.CallFSMState.PROVISIONRECEIVED;

                        onSuccess(call, self.TransferEvent.joiningSuccess_fsm);

                        logger.debug("(Call FSM) State Passed from INIT to PROVISIONRECEIVED. Call Id: " + call.id);

                        break;

                    default:

                        logger.error("Undefined notification: " + event + " @ " + self.getCurrentState(call) + ". Call Id: " + call.id);

                        break;

                            

                }

                break;

            case self.CallFSMState.RINGING:

                //If the event is answer_GUI on the RINGING state, currentState goes to ANSWERING state with event answer_fsm

                //If the event is end_GUI on the RINGING state, currentState goes to INIT state with event reject_GUI

                //If the event is callEnd_Notify on the RINGING state, currentState goes to INIT state with event remoteEnd_fsm

                switch (event) {

                    case self.NotificationEvent.answer_GUI:

                        call.currentState = self.CallFSMState.COMPLETED;

                        onSuccess(call, self.TransferEvent.answer_fsm);

                        logger.debug("(Call FSM) State Passed from RINGING to COMPLETED. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.end_GUI:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.reject_GUI);

                        logger.debug("(Call FSM) State Passed from RINGING to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.callNotify_noSDP:

                        call.currentState = self.CallFSMState.RINGING_SLOW;

                        onSuccess(call, self.TransferEvent.callReceived_fsm);

                        logger.debug("(Call FSM) State Passed from RINGING to RINGING_SLOW. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.callEnd_Notify:

                    case self.NotificationEvent.callCancel_Notify:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.remoteEnd_fsm);

                        logger.debug("(Call FSM) State Passed from RINGING to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.forward_GUI:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.forward_fsm);

                        logger.debug("(Call FSM) State Passed from RINGING to INIT. Call Id: " + call.id);

                        break;                        

                    default:

                        logger.error("Undefined notification: " + event + " @ " + self.getCurrentState(call) + ". Call Id: " + call.id);

                        break;

                            

                }

                break;

            case self.CallFSMState.RINGING_SLOW:

                //If the event is answer_GUI on the RINGING_SLOW state, currentState goes to ANSWERING state with event answerRingingSlow_fsm

                //If the event is end_GUI on the RINGING_SLOW state, currentState goes to INIT state with event reject_GUI

                //If the event is callEnd_Notify on the RINGING_SLOW state, currentState goes to INIT state with event remoteEnd_fsm

                switch (event) {

                    case self.NotificationEvent.answer_GUI:

                        call.currentState = self.CallFSMState.ANSWERING;

                        onSuccess(call, self.TransferEvent.answerRingingSlow_fsm);

                        logger.debug("(Call FSM) State Passed from RINGING_SLOW to ANSWERING. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.end_GUI:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.reject_GUI);

                        logger.debug("(Call FSM) State Passed from RINGING_SLOW to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.callEnd_Notify:

                    case self.NotificationEvent.callCancel_Notify:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.remoteEnd_fsm);

                        logger.debug("(Call FSM) State Passed from RINGING_SLOW to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.forward_GUI:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.forward_fsm);

                        logger.debug("(Call FSM) State Passed from RINGING_SLOW to INIT. Call Id: " + call.id);

                        break;        

                    default:

                        logger.error("Undefined notification: " + event + " @ " + self.getCurrentState(call) + ". Call Id: " + call.id);

                        break;

                            

                }

                break;

            case self.CallFSMState.ANSWERING:

                //If the event is respondCallUpdate_Notify on the ANSWERING state, currentState goes to COMPLETED state with event callCompletedAnswering_fsm

                //If the event is end_GUI on the ANSWERING state, currentState goes to INIT state with event localEnd_fsm

                //If the event is callEnd_Notify on the ANSWERING state, currentState goes to INIT state with event remoteEnd_fsm

                switch (event) {

                    case self.NotificationEvent.respondCallUpdate_Notify:

                        call.currentState = self.CallFSMState.COMPLETED;

                        onSuccess(call, self.TransferEvent.callCompletedAnswering_fsm);

                        logger.debug("(Call FSM) State Passed from ANSWERING to COMPLETED. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.end_GUI:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.localEnd_fsm);

                        logger.debug("(Call FSM) State Passed from ANSWERING to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.callEnd_Notify:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.remoteEnd_fsm);

                        logger.debug("(Call FSM) State Passed from ANSWERING to INIT. Call Id: " + call.id);

                        break;

                    default:

                        logger.error("Undefined notification: " + event + " @ " + self.getCurrentState(call) + ". Call Id: " + call.id);

                        break; 

                }

                break;

            case self.CallFSMState.TRYING:

                //If the event is ringing_Notify on the TRYING state, currentState goes to PROVISIONRECEIVED state with event ringing_fsm

                //If the event is end_GUI on the TRYING state, currentState goes to INIT state with event localEnd_fsm

                //If the event is callEnd_Notify on the TRYING state, currentState goes to INIT state with event noAnswer_fsm

                switch (event) {

                    case self.NotificationEvent.sessionProgress:

                    case sessionProgress:

                        call.currentState = self.CallFSMState.PROVISIONRECEIVED;

                        onSuccess(call, self.TransferEvent.preCallResponse_fsm);

                        logger.debug("(Call FSM) State Passed from TRYING to PROVISIONRECEIVED. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.ringing_Notify:

                        call.currentState = self.CallFSMState.PROVISIONRECEIVED;

                        onSuccess(call, self.TransferEvent.ringing_fsm);

                        logger.debug("(Call FSM) State Passed from TRYING to PROVISIONRECEIVED. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.end_GUI:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.localEnd_fsm);

                        logger.debug("(Call FSM) State Passed from TRYING to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.callEnd_Notify:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.noAnswer_fsm);

                        logger.debug("(Call FSM) State Passed from TRYING to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.respondCallUpdate_Notify:

                        call.currentState = self.CallFSMState.COMPLETED;

                        onSuccess(call, self.TransferEvent.callCompleted_fsm);

                        logger.debug("(Call FSM) State Passed from TRYING to COMPLETED. Call Id: " + call.id);

                        break;

                    default:

                        logger.error("Undefined notification: " + event + " @ " + self.getCurrentState(call) + ". Call Id: " + call.id);

                        break;                            

                }

                break;

            case self.CallFSMState.PROVISIONRECEIVED:

                //If the event is respondCallUpdate_Notify on the PROVISIONRECEIVED state, currentState goes to COMPLETED state with event callCompleted_fsm

                //If the event is end_GUI on the PROVISIONRECEIVED state, currentState goes to INIT state with event localEnd_fsm

                //If the event is callEnd_Notify on the PROVISIONRECEIVED state, currentState goes to INIT state with event noAnswer_fsm

                switch (event) {

                    case self.NotificationEvent.respondCallUpdate_Notify:

                        call.currentState = self.CallFSMState.COMPLETED;

                        onSuccess(call, self.TransferEvent.callCompleted_fsm);

                        logger.debug("(Call FSM) State Passed from PROVISIONRECEIVED to COMPLETED. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.end_GUI:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.localEnd_fsm);

                        logger.debug("(Call FSM) State Passed from PROVISIONRECEIVED to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.callEnd_Notify:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.remoteEnd_fsm);

                        logger.debug("(Call FSM) State Passed from PROVISIONRECEIVED to INIT. Call Id: " + call.id);

                        break;                        

                    case self.NotificationEvent.ringing_Notify:

                        onSuccess(call, self.TransferEvent.ringing_fsm);

                        logger.debug("(Call FSM) State stayed same:" + call.currentState + ". Call Id: " + call.id );

                        break;

                    case self.NotificationEvent.sessionProgress:

                    case sessionProgress:

                        onSuccess(call, self.TransferEvent.preCallResponse_fsm);

                        logger.debug("(Call FSM) State stayed same:" + call.currentState + ". Call Id: " + call.id ); 

                        break;                        

                    default:

                        logger.debug("Undefined notification: " + event + " @ " + self.getCurrentState(call) + ". Call Id: " + call.id);

                        break;

                            

                }

                break;

            case self.CallFSMState.COMPLETED:

                //If the event is end_GUI on the COMPLETED state, currentState goes to INIT state with event localEnd_fsm

                //If the event is callEnd_Notify on the COMPLETED state, currentState goes to INIT state with event remoteEnd_fsm

                //If the event is startCallUpdate_Notify on the COMPLETED state, currentState goes to REMOTE_HOLD state with event remoteEnd_fsm

                //If the event is hold_GUI on the COMPLETED state, currentState goes to LOCAL_HOLD state with event localHold_fsm

                //If the event is transfering on the COMPLETED state, currentState goes to TRANSFERING state with event transfering_fsm

                switch (event) {

                    case self.NotificationEvent.end_GUI:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.localEnd_fsm);

                        logger.debug("(Call FSM) State Passed from COMPLETED to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.callEnd_Notify:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.remoteEnd_fsm);

                        logger.debug("(Call FSM) State Passed from COMPLETED to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.startCallUpdate_Notify:

                        if(call.sdp){

                            sdpParser.init(call.sdp);

                            isHoldFlag=sdpParser.isRemoteHold();

                        }

                        if(isHoldFlag){

                            call.previousState = call.currentState;

                            call.currentState=self.CallFSMState.REMOTE_HOLD;

                            onSuccess(call,self.TransferEvent.remoteHold_fsm);

                            logger.debug("(Call FSM) State Passed from COMPLETED to REMOTE_HOLD. Call Id: " + call.id); 

                        }

                        else{

                            onSuccess(call,self.TransferEvent.remoteCallUpdate_fsm);

                            logger.debug("(Call FSM) State stayed same: " + call.currentState + ". Call Id: " + call.id ); 

                        }    

                        break;

                    case self.NotificationEvent.hold_GUI:

                        call.previousState = call.currentState;

                        call.currentState=self.CallFSMState.LOCAL_HOLD;

                        onSuccess(call,self.TransferEvent.localHold_fsm);

                        logger.debug("(Call FSM) State Passed from COMPLETED to LOCAL_HOLD. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.respondCallUpdate_Notify:

                        if (holdResponse) {

                            holdResponse = false;

                            onSuccess(call, self.TransferEvent.respondCallHoldUpdate_fsm);

                        }

                        else {

                            onSuccess(call, self.TransferEvent.respondCallUpdate_fsm);

                        }

                        logger.debug("(Call FSM) State remains as COMPLETED. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.transfering:

                        call.previousState = call.currentState;

                        call.currentState = self.CallFSMState.TRANSFERING;

                        onSuccess(call, self.TransferEvent.transfering_fsm);

                        logger.debug("(Call FSM) State Passed from COMPLETED to TRANSFERING. Call Id: " + call.id);

                        break;

                    default:

                        logger.error("Undefined notification: " + event + " @ " + self.getCurrentState(call) + ". Call Id: " + call.id);

                        break;

                            

                }

                break;

            case self.CallFSMState.LOCAL_HOLD:

                //If the event is end_GUI on the LOCAL_HOLD state, currentState goes to INIT state with event localEnd_fsm

                //If the event is callEnd_Notify on the LOCAL_HOLD state, currentState goes to INIT state with event remoteEnd_fsm

                //If the event is startCallUpdate_Notify on the LOCAL_HOLD state, currentState goes to BOTH_HOLD state with event remoteHold_fsm

                //If the event is unhold_GUI on the LOCAL_HOLD state, currentState goes to COMPLETED state with event localUnHold_fsm

                //If the event is joining_Notify on the LOCAL_HOLD state, currentState goes to JOINING state with event joining_fsm

                //If the event is transfering on the COMPLETED state, currentState goes to TRANSFERING state with event transfering_fsm

                switch (event) {

                    case self.NotificationEvent.end_GUI:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.localEnd_fsm);

                        logger.debug("(Call FSM) State Passed from LOCAL_HOLD to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.callEnd_Notify:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.remoteEnd_fsm);

                        logger.debug("(Call FSM) State Passed from LOCAL_HOLD to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.startCallUpdate_Notify:

                        if(call.sdp){

                            sdpParser.init(call.sdp);

                            isHoldFlag=sdpParser.isRemoteHold();

                        }

                        if(isHoldFlag){                      

                        call.previousState = call.currentState;

                        call.currentState = self.CallFSMState.BOTH_HOLD;

                        onSuccess(call, self.TransferEvent.remoteHold_fsm);

                        logger.debug("(Call FSM) State Passed from LOCAL_HOLD to BOTH_HOLD. Call Id: " + call.id);

                        }else{

                            onSuccess(call, self.TransferEvent.remoteOfferDuringLocalHold_fsm);

                            logger.debug("(Call FSM) Remote offer during LOCAL_HOLD, no state change. Call Id: " + call.id);

                        }

                        break;

                    case self.NotificationEvent.unhold_GUI:

                        call.previousState = call.currentState;

                        call.currentState=self.CallFSMState.COMPLETED;

                        onSuccess(call,self.TransferEvent.localUnHold_fsm);

                        holdResponse = true;

                        logger.debug("(Call FSM) State Passed from LOCAL_HOLD to COMPLETED. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.joining_Notify:

                        call.previousState = call.currentState;

                        call.currentState=self.CallFSMState.JOINING;

                        onSuccess(call,self.TransferEvent.joining_fsm);

                        logger.debug("(Call FSM) State Passed from LOCAL_HOLD to JOINING. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.respondCallUpdate_Notify:

                        if (call.sdp) {

                            sdpParser.init(call.sdp);

                            isHoldFlag = sdpParser.isRemoteHold();

                        }

                        if (!isHoldFlag) {

                            onSuccess(call, self.TransferEvent.respondCallHoldUpdate_fsm);

                        } else {

                            onSuccess(call, self.TransferEvent.respondCallUpdate_fsm);

                        }

                        logger.debug("(Call FSM) State remains as LOCAL_HOLD. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.transfering:

                        call.previousState = call.currentState;

                        call.currentState = self.CallFSMState.TRANSFERING;

                        onSuccess(call, self.TransferEvent.transfering_fsm);

                        logger.debug("(Call FSM) State Passed from LOCAL_HOLD to TRANSFERING. Call Id: " + call.id);

                        break;

                    default:

                        logger.error("Undefined notification: " + event + " @ " + self.getCurrentState(call) + ". Call Id: " + call.id);

                        break;

                            

                }

                break;

            case self.CallFSMState.REMOTE_HOLD:

                //If the event is end_GUI on the REMOTE_HOLD state, currentState goes to INIT state with event localEnd_fsm

                //If the event is callEnd_Notify on the REMOTE_HOLD state, currentState goes to INIT state with event remoteEnd_fsm

                //If the event is startCallUpdate_Notify on the REMOTE_HOLD state, currentState goes to COMPLETED state with event remoteUnHold_fsm

                //If the event is hold_GUI on the REMOTE_HOLD state, currentState goes to BOTH_HOLD state with event localHold_fsm

                //If the event is joining_Notify on the REMOTE_HOLD state, currentState goes to JOINING state with event joining_fsm

                switch (event) {

                    case self.NotificationEvent.end_GUI:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.localEnd_fsm);

                        logger.debug("(Call FSM) State Passed from REMOTE_HOLD to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.callEnd_Notify:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.remoteEnd_fsm);

                        logger.debug("(Call FSM) State Passed from REMOTE_HOLD to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.startCallUpdate_Notify:

                        if(call.sdp){

                            sdpParser.init(call.sdp);

                            isHoldFlag=sdpParser.isRemoteHold();

                        }

                        if(!isHoldFlag || call.slowStartInvite){

                            call.previousState = call.currentState;

                            call.currentState=self.CallFSMState.COMPLETED;

                            onSuccess(call,self.TransferEvent.remoteUnHold_fsm);

                            logger.debug("(Call FSM) State Passed from REMOTE_HOLD to COMPLETED. Call Id: " + call.id);

                        }

                        else{

                            onSuccess(call,self.TransferEvent.remoteHold_fsm);                            

                            logger.debug("(Call FSM) State stayed same:" + call.currentState + ". Call Id: " + call.id ); 

                        }    

                        break;

                    case self.NotificationEvent.hold_GUI:

                        call.previousState = call.currentState;

                        call.currentState=self.CallFSMState.BOTH_HOLD;

                        onSuccess(call,self.TransferEvent.localHold_fsm);

                        logger.debug("(Call FSM) State Passed from REMOTE_HOLD to BOTH_HOLD. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.joining_Notify:

                        call.previousState = call.currentState;

                        call.currentState=self.CallFSMState.JOINING;

                        onSuccess(call,self.TransferEvent.joining_fsm);

                        logger.debug("(Call FSM) State Passed from REMOTE_HOLD to JOINING. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.respondCallUpdate_Notify:

//                        if(call.sdp){

//                            sdpParser.init(call.sdp);

//                            isHoldFlag=sdpParser.isRemoteHold();

//                        }

//                        if(!isHoldFlag){

//                            call.previousState = call.currentState;

//                            call.currentState=self.CallFSMState.COMPLETED;

//                            onSuccess(call,self.TransferEvent.respondCallUpdate_fsm);

//                            logger.info("(Call FSM) State Passed from REMOTE_HOLD to COMPLETED. Call Id: " + call.id);

//                        }

//                        else{

                            onSuccess(call,self.TransferEvent.respondCallHoldUpdate_fsm);

                            logger.debug("(Call FSM) State remains as REMOTE_HOLD. Call Id: " + call.id);

                        //}    

                        break;

                    default:

                        logger.error("Undefined notification: " + event + " @ " + self.getCurrentState(call) + ". Call Id: " + call.id);

                        break;

                            

                }

                break;

            case self.CallFSMState.BOTH_HOLD:

                //If the event is end_GUI on the BOTH_HOLD state, currentState goes to INIT state with event localEnd_fsm

                //If the event is callEnd_Notify on the BOTH_HOLD state, currentState goes to INIT state with event remoteEnd_fsm

                //If the event is startCallUpdate_Notify on the BOTH_HOLD state, currentState goes to LOCAL_HOLD state with event remoteUnHold_fsm

                //If the event is unhold_GUI on the BOTH_HOLD state, currentState goes to REMOTE_HOLD state with event localUnHold_fsm

                //If the event is joining_Notify on the BOTH_HOLD state, currentState goes to JOINING state with event joining_fsm

                //If the event is transfering on the COMPLETED state, currentState goes to TRANSFERING state with event transfering_fsm

                switch (event) {

                    case self.NotificationEvent.end_GUI:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.localEnd_fsm);

                        logger.debug("(Call FSM) State Passed from BOTH_HOLD to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.callEnd_Notify:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.remoteEnd_fsm);

                        logger.debug("(Call FSM) State Passed from BOTH_HOLD to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.startCallUpdate_Notify:

                        //call.previousState = call.currentState;

                        //call.currentState = self.CallFSMState.LOCAL_HOLD;

                        if(!isHoldFlag){

                            call.previousState = call.currentState;

                            call.currentState=self.CallFSMState.LOCAL_HOLD;                          

                            logger.debug("(Call FSM) State Passed from BOTH_HOLD to LOCAL_HOLD. Call Id: " + call.id);

                        }

                        else{

                            logger.debug("(Call FSM) State remains as BOTH_HOLD. Call Id: " + call.id);

                        }                         

                        onSuccess(call, self.TransferEvent.remoteUnHold_fsm);

                        logger.debug("(Call FSM) State Passed from BOTH_HOLD to LOCAL_HOLD. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.unhold_GUI:

                        call.previousState = call.currentState;

                        call.currentState=self.CallFSMState.REMOTE_HOLD;

                        onSuccess(call,self.TransferEvent.localUnHold_fsm);

                        logger.debug("(Call FSM) State Passed from BOTH_HOLD to REMOTE_HOLD. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.joining_Notify:

                        call.previousState = call.currentState;

                        call.currentState=self.CallFSMState.JOINING;

                        onSuccess(call,self.TransferEvent.joining_fsm);

                        logger.debug("(Call FSM) State Passed from BOTH_HOLD to JOINING. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.respondCallUpdate_Notify:

                        if(call.sdp){

                            sdpParser.init(call.sdp);

                            isHoldFlag=sdpParser.isRemoteHold();

                        }

                        if(!isHoldFlag){

                            call.previousState = call.currentState;

                            call.currentState=self.CallFSMState.LOCAL_HOLD;                          

                            logger.debug("(Call FSM) State Passed from BOTH_HOLD to LOCAL_HOLD. Call Id: " + call.id);

                        }

                        else{

                            logger.debug("(Call FSM) State remains as BOTH_HOLD. Call Id: " + call.id);

                        }    

                        onSuccess(call,self.TransferEvent.respondCallHoldUpdate_fsm);

                        break;

                    case self.NotificationEvent.transfering:

                        call.previousState = call.currentState;

                        call.currentState = self.CallFSMState.TRANSFERING;

                        onSuccess(call, self.TransferEvent.transfering_fsm);

                        logger.debug("(Call FSM) State Passed from BOTH_HOLD to TRANSFERING. Call Id: " + call.id);

                        break;

                    default:

                        logger.error("Undefined notification: " + event + " @ " + self.getCurrentState(call) + ". Call Id: " + call.id);

                        break;

                            

                }

                break;

            case self.CallFSMState.JOINING:

                //If the event is end_GUI on the JOINING state, currentState goes to INIT state with event localEnd_fsm

                //If the event is callEnd_Notify on the JOINING state, currentState goes to INIT state with event remoteEnd_fsm

                //If the event is sessionComplete_Notify on the JOINING state, currentState goes to INIT state with event sessionComplete_fsm

                //If the event is sessionFail_Notify on the JOINING state, currentState goes to LOCAL_HOLD state with event sessionFail_fsm

                

                switch (event) {

                    case self.NotificationEvent.end_GUI:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.localEnd_fsm);

                        logger.debug("(Call FSM) State Passed from JOINING to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.callEnd_Notify:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.remoteEnd_fsm);

                        logger.debug("(Call FSM) State Passed from JOINING to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.sessionComplete_Notify:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.sessionComplete_fsm);

                        logger.debug("(Call FSM) State Passed from JOINING to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.sessionFail_Notify:

                        call.currentState = call.previousState;

                        onSuccess(call, self.TransferEvent.sessionFail_fsm);

                        logger.debug("(Call FSM) State Passed from JOINING to LOCAL_HOLD. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.refer_JSL:

                        call.currentState = self.CallFSMState.REFER;

                        onSuccess(call, self.TransferEvent.refer_fsm);

                        logger.debug("(Call FSM) State Passed from JOINING to REFER. Call Id:" + call.id);

                        break;

                    default:

                        logger.error("Undefined notification: " + event + " @ " + self.getCurrentState(call) + ". Call Id: " + call.id);

                        break;       

                }

                break;

            case self.CallFSMState.REFER:

                //If the event is end_GUI on the REFER state, currentState goes to INIT state with event localEnd_fsm

                //If the event is callEnd_Notify on the REFER state, currentState goes to INIT state with event remoteEnd_fsm

                //If the event is sessionComplete_Notify on the REFER state, currentState goes to INIT state with event sessionComplete_fsm

                //If the event is sessionFail_Notify on the REFER state, currentState goes to LOCAL_HOLD state with event sessionFail_fsm

                //If the event is respondCallUpdate_Notify on the REFER state, currentState stays same

                

                switch (event) {

                    case self.NotificationEvent.end_GUI:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.localEnd_fsm);

                        logger.debug("(Call FSM) State Passed from REFER to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.callEnd_Notify:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.remoteEnd_fsm);

                        logger.debug("(Call FSM) State Passed from REFER to INIT. Call Id: " + call.id);

                        break;   

                    case self.NotificationEvent.sessionComplete_Notify:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.sessionComplete_fsm);

                        logger.debug("(Call FSM) State Passed from REFER to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.sessionFail_Notify:

                        call.currentState = call.previousState;

                        onSuccess(call, self.TransferEvent.sessionFail_fsm);

                        logger.debug("(Call FSM) State Passed from REFER to LOCAL_HOLD. Call Id: " + call.id);

                        break;  

                    //TODO Tolga - talk with lale

                    case self.NotificationEvent.accepted_Notify:

                        onSuccess(call, self.TransferEvent.accepted_fsm);

                        logger.debug("(Call FSM) State stayed same: " + call.currentState + ". Call Id:" + call.id );                        

                        break; 

                    default:

                        logger.error("Undefined notification: " + event + " @ " + self.getCurrentState(call) + ". Call Id: " + call.id);

                        break;       

                }

                break;

           case self.CallFSMState.TRANSFERING:

                //If the event is end_GUI on the TRANSFERING state, currentState goes to INIT state with event localEnd_fsm

                //If the event is callEnd_Notify on the TRANSFERING state, currentState goes to INIT state with event remoteEnd_fsm

                //If the event is sessionComplete_Notify on the TRANSFERING state, currentState goes to INIT state with event transferSuccess_fsm

                //If the event is sessionFail_Notify on the TRANSFERING state, currentState goes to LOCAL HOLD state with event transferFail_fsm

                //If the event is respondCallUpdate_Notify on the TRANSFERING state, currentState stays same

                //If the event is startCallUpdate_Notify on the TRANSFERING state, currentState stays same but reinvite handled

                switch (event) {

                    case self.NotificationEvent.end_GUI:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.localEnd_fsm);

                        logger.debug("(Call FSM) State Passed from TRANSFERING to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.callEnd_Notify:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.remoteEnd_fsm);

                        logger.debug("(Call FSM) State Passed from TRANSFERING to INIT. Call Id: " + call.id);

                        break;   

                    case self.NotificationEvent.sessionComplete_Notify:

                        call.currentState = self.CallFSMState.INIT;

                        onSuccess(call, self.TransferEvent.transferSuccess_fsm);

                        logger.debug("(Call FSM) State Passed from TRANSFERING to INIT. Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.sessionFail_Notify:

                        call.currentState = call.previousState;

                        onSuccess(call, self.TransferEvent.transferFail_fsm);

                        logger.debug("(Call FSM) State Passed from TRANSFERING to LOCAL_HOLD. Call Id: " + call.id);

                        break;  

                        //TODO this notification is consumed for now - it is there for completeness

                    case self.NotificationEvent.accepted_Notify:

                        onSuccess(call, self.TransferEvent.accepted_fsm);

                        logger.debug("(Call FSM) State stayed same: " + call.currentState + ". Call Id: " + call.id);

                        break;

                    case self.NotificationEvent.startCallUpdate_Notify:

                        // Some client send hold during transfer

                        onSuccess(call, self.TransferEvent.remoteCallUpdate_fsm);

                        logger.debug("(Call FSM) State stayed same: " + call.currentState + ". Call Id: " + call.id);

                        break;

                    default:

                        logger.error("Undefined notification: " + event + " @ " + self.getCurrentState(call) + ". Call Id: " + call.id );

                        break;       

                }

                break;

        }

    }



    self.getCurrentState = function(call){

        //logger.info("getCurrentState id:" + call.id + " state:" + (call.currentState ? call.currentState : self.CallFSMState.INIT));

        return (call.currentState ? call.currentState : self.CallFSMState.INIT);

    };



    this.handleEvent = function(call, event){

        if (call) {

            logger.info("FSM received NotificationEvent: " + event + " @ " + self.getCurrentState(call) + " state" + ". Call Id: " + call.id);

        

            FSM(call, 

                event, 

                function(call, event){

                    logger.info("FSM handleEvent successful. TransferEvent: " + event + " @ " + self.getCurrentState(call)+ ". Call Id: " + call.id);

                    callManager.onStateChange(call, event);

            

                });            

        }

    };

};

    

var callFSM = new CallFSM();


var CallManager = function() {



    function parseAddress(address, contact){

        

        if(address.indexOf("sip:", 0) > -1){

            address = address.replace("sip:","");

        }

        var displayName = "";

        if(contact === undefined || contact === null) {

            return (address.indexOf("@", 0) > -1) ? "sip:" + address : address;

        }

        if (contact.firstName && contact.firstName !== ""){

            displayName += contact.firstName;

        }

        if (contact.lastName && contact.lastName !== "") {

            if(displayName === "") {

                displayName += contact.lastName;

            }

            else {

                displayName += " " + contact.lastName;

            }

        }

        if(displayName === "") {

            return (address.indexOf("@", 0) > -1) ? "sip:" + address : address;

        }

        return displayName + "<" + ((address.indexOf("@", 0) > -1) ? "sip:" + address : address) + ">";

    }



    /* AUDIT_KICKOFF_TIMEOUT is the interval we use to kickoff call audit after the call is setup. 

     * The timeout is there to ensure we do not hit call setup race conditions when we try to kickoff the call audit */

    var calls = {}, logger = logManager.getLogger("callManager"), AUDIT_KICKOFF_TIMEOUT = 3000;



    /*

     * clear call resources

     * clear long call audit

     * clear webrtc resources

     * triger web part

     *

     * @param call call object

     * @param state state that will be returned to web part

     */

    function clearResources(call) {

        if (call.call) {

            call.call.clearAuditTimer();

        }

        //clear webRTC resources

        rtc.processEnd(call);

        //clear call object

        delete calls[call.id];

    }



    this.hasGotCalls = function() {

        var callid, internalCall;

        for (callid in calls) {

            if (calls.hasOwnProperty(callid)) {

                internalCall = calls[callid];

                if (internalCall) {

                    logger.info("has got call - id: " + callid + " - state: " + callFSM.getCurrentState(internalCall));

                    return true;

                }

            }

        }

        return false;

    };



    this.getCalls = function() {

        return calls;

    };



    this.sendIntraFrame = function(callid){

        var internalCall = calls[callid];

        if(internalCall) {

            rtc.sendIntraFrame(internalCall);

        }

    };



    this.sendBlackFrame = function(callid){

        var internalCall = calls[callid];

        if(internalCall) {

            rtc.sendBlackFrame(internalCall);

        }

    };



    this.answer = function(callid, onSuccess, onFailure, isVideoEnabled, videoQuality){

        var internalCall = calls[callid];



        if(internalCall) {

            if (internalCall.sdp){

                //check with the state machine if the current state would accept an answer.

                if (callFSM.getCurrentState(internalCall) !== callFSM.CallFSMState.RINGING) {

                    onFailure(fcs.Errors.State);

                }

                else {

                    rtc.getUserMedia(function() {

                        rtc.doAnswer(

                            internalCall,

                            function(sdp){

                                logger.info("[callManager.answer : sdp ]" + sdp);

                                //change call state

                                callFSM.handleEvent(internalCall, callFSM.NotificationEvent.answer_GUI);

                                //send answer call

                                callControlService.answerCall(

                                    internalCall.id,

                                    sdp,

                                    function() {

                                        //TODO: is this necessary

                                        rtc.onLocalStreamAdded(internalCall);

                                        onSuccess();

                                    },

                                    onFailure);

                            },

                            function(errStr){

                                logger.error("[callManager.answer] Error : " + errStr);

                                //Change state when the call have failed

                                //This will trigger send reject

                                callFSM.handleEvent(internalCall,callFSM.NotificationEvent.end_GUI);

                            },

                            isVideoEnabled);

                    },function(e){

                        onFailure(e);

                    },

                    {

                        "audio": true,

                        "video": isVideoEnabled ? true : false,

                        "audioIndex": 0,

                        "videoIndex": isVideoEnabled ? 0 : -1,

                        "videoResolution": videoQuality

                    });

                }

            }

            else {

                if (callFSM.getCurrentState(internalCall) !== callFSM.CallFSMState.RINGING_SLOW) {

                    onFailure(fcs.Errors.State);

                }

                else{

                    rtc.getUserMedia(function() {

                        rtc.doOffer(internalCall,function(sdp){

                            internalCall.sdp = sdp;

                            callFSM.handleEvent(internalCall, callFSM.NotificationEvent.answer_GUI);

                            callControlService.answerCall(internalCall.id, sdp, onSuccess, onFailure);

                        },function(){

                            callFSM.handleEvent(internalCall,callFSM.NotificationEvent.end_GUI);

                        },

                        isVideoEnabled);

                    },function(e){

                        onFailure(e);

                    },

                    {

                        "audio": true,

                        "video": isVideoEnabled ? true : false,

                        "audioIndex": 0,

                        "videoIndex": isVideoEnabled ? 0 : -1,

                        "videoResolution": videoQuality

                    });



                }

            }

        }



    };



    this.getIncomingCallById = function(callid) {

        var call = null, cachedCall, internalCall;



        cachedCall = JSON.parse(cache.getItem(callid));

        if (cachedCall) {

            

            call = new fcs.call.IncomingCall(callid, {reject:cachedCall.optionReject, forward:cachedCall.optionForward, answer:cachedCall.optionAnswer});

            

            call.setReceiveVideo(sdpParser.isSdpHasVideo(cachedCall.sdp));

            

            call.remoteConversationId = cachedCall.remoteConversationId;



            call.callerNumber = cachedCall.callerNumber;

            call.callerName = cachedCall.callerName;

            call.calleeNumber = cachedCall.calleeNumber;

            call.primaryContact = cachedCall.primaryContact;



            internalCall = {

                "call": call,

                "sdp": cachedCall.sdp,

                "id": callid

            };



            calls[callid] = internalCall;

            

            callFSM.handleEvent(internalCall, callFSM.NotificationEvent.callNotify);

        }

        

        return call;

    };

    

    function cacheCall(internalCall){

        var callToCache = {

            "sdp" : internalCall.sdp,

            "remoteConversationId" : internalCall.call.remoteConversationId,

            "callerNumber" : internalCall.call.callerNumber,

            "callerName" : internalCall.call.callerName,

            "calleeNumber" : internalCall.call.calleeNumber,

            "primaryContact" : internalCall.call.primaryContact, 

            "optionReject" : internalCall.call.canReject(),

            "optionForward" : internalCall.call.canForward(),

            "optionAnswer" : internalCall.call.canAnswer()

        };

        

        cache.setItem(internalCall.id, JSON.stringify(callToCache));

    }



    this.start = function(from, contact, to, onSuccess, onFailure, isVideoEnabled, sendInitialVideo, videoQuality, convID){

        var internalCall = {};



        logger.info("start call... from: " + from

                + " contact: " + JSON.stringify(contact)

                + " to: " + to

                + " isVideoEnabled: " + isVideoEnabled

                + " sendInitialVideo: " + sendInitialVideo

                + " videoQuality: " + videoQuality

                + " convID: " + convID);



        rtc.getUserMedia(function() {

            rtc.doOffer(internalCall,

                function(sdp){

                    logger.info("[callManager.start : sdp ]" + sdp);



                    internalCall.sdp = sdp;

                    callControlService.startCall(

                        parseAddress(from, contact),

                        parseAddress(to),

                        sdp,

                        function(callid){



                            internalCall.call = new fcs.call.OutgoingCall(callid);

                            internalCall.id = callid;



                            callFSM.handleEvent(internalCall, callFSM.NotificationEvent.callStart_GUI);

                            calls[callid] = internalCall;

                            internalCall.call.setSendVideo(sendInitialVideo);

                            //TODO: is this necessary

                            rtc.onLocalStreamAdded(internalCall);

                            onSuccess(internalCall.call);

                        },

                        function(e){

                            //TODO: update call state

                            onFailure(e);

                        },

                        convID

                        );

                },function(e){

                    logger.error("doOffer failed: " + e);

                    onFailure(e);

                },

                sendInitialVideo

                );

        },function(){

            onFailure();

        },

        {

            "audio": true,

            "video": isVideoEnabled ? true : false,

            "audioIndex": 0,

            "videoIndex": isVideoEnabled ? 0 : -1,

            "videoResolution": videoQuality

        }

        );



    };

    this.reject = function(callid, onSuccess, onFailure){

        var internalCall = calls[callid];

        if(!internalCall) {

            onFailure(fcs.Errors.State);

            return;

        }



        callControlService.reject(callid, function (){

            callFSM.handleEvent(internalCall, callFSM.NotificationEvent.end_GUI);

            onSuccess();

        },

        function() {

            onFailure();

        } );



    };



    this.ignore = function(callid, onSuccess, onFailure){

        var internalCall = calls[callid];

        if(!internalCall) {

            onFailure(fcs.Errors.State);

            return;

        }



        callFSM.handleEvent(internalCall, callFSM.NotificationEvent.end_GUI);

        onSuccess();



    };

    this.forward = function(callid, address, onSuccess, onFailure){

        var internalCall = calls[callid];

        if(!internalCall) {

            onFailure(fcs.Errors.State);

            return;

        }



        callControlService.forward(callid, address, function (){

            callFSM.handleEvent(internalCall, callFSM.NotificationEvent.forward_GUI);

            onSuccess();

        },

        function() {

            onFailure();

        } );

    };



    this.hold = function(callid, onSuccess, onFailure){

        var internalCall = calls[callid],

        sdp;

        if(!internalCall) {

            onFailure(fcs.Errors.State);

            return;

        }



        if (callFSM.getCurrentState(internalCall) === callFSM.CallFSMState.COMPLETED

            || callFSM.getCurrentState(internalCall) === callFSM.CallFSMState.REMOTE_HOLD) {

            //TODO: routing sdp from WebRTC

            rtc.createHoldUpdate(internalCall,true,(callFSM.getCurrentState(internalCall) === callFSM.CallFSMState.REMOTE_HOLD), function(sdp){

                logger.info("[callManager.hold->createHoldUpdate : sdp ]" + sdp);

                callControlService.hold(internalCall.id, sdp, function (){

                    callFSM.handleEvent(internalCall, callFSM.NotificationEvent.hold_GUI);

                    internalCall.call.setHold(true);

                    internalCall.call.setHoldState(callFSM.getCurrentState(internalCall));

                    onSuccess();

                },

                onFailure);

            },

            function() {

                onFailure(fcs.Errors.State);

            }

            );

        }else{

            onFailure(fcs.Errors.State);

        }

    };



    this.unhold = function(callid, onSuccess, onFailure){

        var internalCall = calls[callid];



        if(!internalCall) {

            onFailure(fcs.Errors.State);

            return;

        }



        if (callFSM.getCurrentState(internalCall) === callFSM.CallFSMState.LOCAL_HOLD

            || callFSM.getCurrentState(internalCall) === callFSM.CallFSMState.BOTH_HOLD) {

            //TODO: routing sdp from WebRTC

            rtc.createHoldUpdate(internalCall,false,(callFSM.getCurrentState(internalCall) === callFSM.CallFSMState.BOTH_HOLD),function(sdp){

                logger.info("[callManager.unhold->createHoldUpdate : sdp ]" + sdp);

                callControlService.unhold(internalCall.id, sdp, function (){

                    callFSM.handleEvent(internalCall, callFSM.NotificationEvent.unhold_GUI);

                    internalCall.call.setHold(false);

                    internalCall.call.setHoldState(callFSM.getCurrentState(internalCall));

                    //TODO: is this necessary

                    rtc.onLocalStreamAdded(internalCall);

                    onSuccess();

                },

                onFailure);

            },

            function() {

                onFailure(fcs.Errors.State);

            }

            );

        }else{

            onFailure(fcs.Errors.State);

        }

    };



    this.directTransfer = function(callid, address, onSuccess, onFailure){

        var internalCall = calls[callid];



        if(!internalCall) {

            onFailure(fcs.Errors.State);

            return;

        }



        if (callFSM.getCurrentState(internalCall) === callFSM.CallFSMState.LOCAL_HOLD

            ||  callFSM.getCurrentState(internalCall) === callFSM.CallFSMState.COMPLETED

            || callFSM.getCurrentState(internalCall) === callFSM.CallFSMState.BOTH_HOLD)

          {

            //TODO: force localhold - if the user is not on hold

            logger.info("[callManager.directTransfer->sendTransfer : transfer target ]" + address);

                callControlService.transfer(internalCall.id, address, function (){

                callFSM.handleEvent(internalCall, callFSM.NotificationEvent.transfering);

                 logger.info("[callManager.directTransfer->sentTransfer : transfer target ]" + address);



                },

                onFailure);

        }else{

            logger.error("directTransfer call is not in correct state: " + callFSM.getCurrentState(internalCall));

        }

    };



    this.videoStopStart = function(callid, onSuccess, onFailure, isVideoStart){

        var internalCall = calls[callid],

        sdp;

        if(!internalCall) {

            onFailure(fcs.Errors.State);

            return;

        }



        rtc.createUpdate(internalCall,

            function(sdp){

                callControlService.reinvite(internalCall.id, sdp, function (){

                    //TODO: is this necessary

                    rtc.onLocalStreamAdded(internalCall);

                    onSuccess();

                },

                function() {

                    onFailure(fcs.Errors.State);

                }

                );

            },

            function(){

                logger.error("reinvite->createUpdate : sdp " + sdp);

            },

            isVideoStart

        );







    };



    this.mute = function(callid, mute){

        var internalCall = calls[callid];



        if(internalCall) {

            rtc.mute(internalCall, mute);

        }

    };



    this.sendDTMF = function(callid, tone) {

        var internalCall = calls[callid];



        if(internalCall) {

            rtc.sendDTMF(internalCall, tone);

        }

    };



    this.join = function(callid1,callid2, onSuccess, onFailure){

        var internalCall1 = calls[callid1],

        internalCall2 = calls[callid2],

        newInternalCall = {},

        sdp;



        if((internalCall1)&&(internalCall2)){

            if ((callFSM.getCurrentState(internalCall1) === callFSM.CallFSMState.LOCAL_HOLD

                || callFSM.getCurrentState(internalCall1) === callFSM.CallFSMState.REMOTE_HOLD

                || callFSM.getCurrentState(internalCall1) === callFSM.CallFSMState.BOTH_HOLD)

            &&(callFSM.getCurrentState(internalCall2) === callFSM.CallFSMState.LOCAL_HOLD

                || callFSM.getCurrentState(internalCall2) === callFSM.CallFSMState.REMOTE_HOLD

                || callFSM.getCurrentState(internalCall2) === callFSM.CallFSMState.BOTH_HOLD) ){



                rtc.doOffer(newInternalCall,

                    function(sdp){

                        logger.info("join->doOffer : sdp " +  sdp);

                        newInternalCall.sdp = sdp;

                        callControlService.join(

                            internalCall1.id,

                            internalCall2.id,

                            sdp,

                            function(callid){



                                newInternalCall.call = new fcs.call.OutgoingCall(callid);

                                newInternalCall.id = callid;



                                // refer will be handled by client. We are going to need callID of partyB and partyC

                                if(fcsConfig.clientControlled === "true") {

                                    newInternalCall.isReferer = true;

                                    newInternalCall.refer1ID = internalCall1.id;

                                    newInternalCall.refer2ID = internalCall2.id;

                                }



                                callFSM.handleEvent(internalCall1, callFSM.NotificationEvent.joining_Notify);

                                callFSM.handleEvent(internalCall2, callFSM.NotificationEvent.joining_Notify);

                                callFSM.handleEvent(newInternalCall, callFSM.NotificationEvent.joiningSuccess_Notify);

                                calls[callid] = newInternalCall;



                                onSuccess(newInternalCall.call);

                            },

                            function(){

                                logger.error("callControlService.join Failed!! sdp " + sdp);

                                onFailure();

                            }

                            );

                    },function(){

                        logger.error("doOffer Failed!!");

                        onFailure();

                    },

                    false);

            }

        }

    };



    this.transfer = function(callid, address, onSuccess, onFailure){



    };



    this.end = function(callid, onSuccess){

        var internalCall = calls[callid];

        if(internalCall) {

            //check with the state machine if the current state would accept an endCall.

            if (callFSM.getCurrentState(internalCall) === callFSM.CallFSMState.INIT) {

                logger.error("Cannot end call in INIT callstate :" + fcs.Errors.State);

            } else {

                //send the end call to webrtc abstraction, change call state

                //this will trigger the send endcall or reject call

                callFSM.handleEvent(internalCall, callFSM.NotificationEvent.end_GUI);



                clearResources(internalCall);

                if (typeof onSuccess === 'function'){

                    onSuccess();

                }

            }

        }



    };



    this.incomingCall = function(call, sdp){



        logger.info("incomingCall : sdp = " + sdp);

        var internalCall = {

            "call": call,

            "sdp": sdp,

            "id" : call.getId()

        };

        logger.info("incomingCall: " + call.getId());



        if(fcsConfig.continuity && call.canAnswer()){

            cacheCall(internalCall);

        }



        calls[call.getId()] = internalCall;

        callFSM.handleEvent(internalCall, callFSM.NotificationEvent.callNotify);

    };





    this.updateCall = function(){

    };



    this.onNotificationEvent = function(type, sessionParams){

        var callid = sessionParams.sessionData,

        statusCode = sessionParams.statusCode,

        reasonText = sessionParams.reasonText,

        sdp = sessionParams.sdp,

        referTo = sessionParams.referTo,

        referredBy = sessionParams.referredBy;



        logger.info("Notification received " + type + " callid:" + callid );

        logger.info("onNotificationEvent : sdp " + sdp);

        if (calls[callid]) {

            if(sdp){

                calls[callid].sdp = sdp;

                calls[callid].slowStartInvite = false;

            } else {

                calls[callid].slowStartInvite = true;

            }

            if(referTo && referredBy) {

                calls[callid].referTo = referTo;

                calls[callid].referredBy = referredBy;

            }

            calls[callid].statusCode = statusCode;

            calls[callid].reasonText = reasonText;

        }

        callFSM.handleEvent(calls[callid],type);

    };



    this.onStateChange = function(call , event){

        var callStates = fcs.call.States,

        triggerCallState,

        transferEvent = callFSM.TransferEvent,

        i, isJoin, isLocalHold;



        calls[call.id] = call;



        //logger.info("onStateChange: " + event + " callid:" + call.id );



        triggerCallState = function(state){

            utils.callFunctionIfExist(call.call.onStateChange, state, call.statusCode, call.reasonText);

        };



        switch (event) {

            case transferEvent.callStart_fsm:

                logger.info("(Call Manager) Call Start Transfer Event. callId: " + call.id);

                break;

            case transferEvent.ringing_fsm:

                triggerCallState(callStates.RINGING);

                logger.info("(Call Manager) Call Start Transfer Event. callId: " + call.id);

                break;

            case transferEvent.callReceived_fsm:

                logger.info("(Call Manager) Call Received Transfer Event. callId: " + call.id);

                if(!(call.sdp)){

                    callFSM.handleEvent(call, callFSM.NotificationEvent.callNotify_noSDP);

                }

                triggerCallState(callStates.INCOMING);

                break;

            case transferEvent.answer_fsm:

                logger.info("(Call Manager) Answer Transfer Event. callId: " + call.id);



                setTimeout(function() {

                    callControlService.audit(call.id, function() {

                        logger.info("(Call Manager) Answer Transfer Event - Audit kicked off: Success for: " + call.id);

                    },

                            function() {

                                logger.error("(Call Manager) Answer Transfer Event - Audit: Fail for: " + call.id);

                                clearResources(call);

                                triggerCallState(callStates.ENDED);

                            });

                }, AUDIT_KICKOFF_TIMEOUT

                        );



                call.call.setAuditTimer(function() {

                    callControlService.audit(call.id, function() {

                        logger.info("(Call Manager) Answer Transfer Event - Audit: Success for: " + call.id);

                    },

                            function() {

                                logger.error("(Call Manager) Answer Transfer Event - Audit: Fail for: " + call.id);

                                clearResources(call);

                                triggerCallState(callStates.ENDED);

                            });

                }

                );

                break;

            case transferEvent.answerRingingSlow_fsm:

                logger.info("(Call Manager) Answer Ringing Slow Transfer Event. callId: " + call.id);

                break;

            case transferEvent.reject_GUI:

                logger.info("(Call Manager) Reject Transfer Event. callId: " + call.id);

                clearResources(call);

                break;

            case transferEvent.sessionComplete_fsm:

                logger.info("(Call Manager) Session Complete Transfer Event. callId: " + call.id);

                callControlService.endCall(call.id, function(){

                    logger.info("callControlService.endCall successful. callId: " + call.id);

                }, function(){

                    logger.error("callControlService.endCall FAILED!!.callId: " + call.id);

                });

                clearResources(call);

                triggerCallState(callStates.JOINED);



                logger.info("CallManager.endCall successful. callId: " + call.id);

                break;

            case transferEvent.sessionFail_fsm:

                logger.info("(Call Manager) Session Fail Transfer Event. callId: " + call.id);

                triggerCallState(callStates.ON_HOLD);

                break;

            case transferEvent.callCompleted_fsm:

                //startCall case: this is place where we must

                //have already got the remote sdp so need to let webrtc

                //process answer with latest sdp

                logger.info("(Call Manager) Call Completed Transfer Event. callId: " + call.id);

                setTimeout(function() {

                    callControlService.audit(call.id, function() {

                        logger.info("(Call Manager) Call Completed Transfer Event - Audit kicked off: Success for: " + call.id);

                    },

                            function() {

                                logger.error("(Call Manager) Call Completed Transfer Event - Audit: Fail for: " + call.id);

                                clearResources(call);

                                triggerCallState(callStates.ENDED);

                            });

                }, AUDIT_KICKOFF_TIMEOUT

                        );

                rtc.processAnswer(call, function() {

                    call.call.setAuditTimer(function () {

                        callControlService.audit(call.id, function() {

                            logger.info("Call Completed Transfer Event - Audit: Success for: " + call.id);

                        },

                        function (){

                            logger.error("Call Completed Transfer Event - Audit: Fail for: " + call.id);

                            clearResources(call);

                            triggerCallState(callStates.ENDED);

                        });

                    });

                },

                function() {

                    clearResources(call);

                    triggerCallState(callStates.ENDED);

                });

                triggerCallState(callStates.IN_CALL);



                //if client is handling the refers, we need to trigger the refers for partyB and partyC from referer

                if(call.isReferer) {

                    for (i in calls) {

                        if (calls.hasOwnProperty(i)) {

                            if(calls[i] && (calls[i].id === call.refer1ID || calls[i].id === call.refer2ID)) {

                                calls[i].referCall(call.referTo, call.referredBy);

                            }

                        }

                    }

                }



                break;

            case transferEvent.noAnswer_fsm:

                logger.info("(Call Manager) No Answer Transfer Event. callId: " + call.id);

                clearResources(call);

                triggerCallState(callStates.ENDED);

                break;

            case transferEvent.localEnd_fsm:

                logger.info("(Call Manager) Local End Transfer Event. callId: " + call.id);

                callControlService.endCall(call.id, function() {

                    logger.info("CallControlService endCall successful. callId: " + call.id);

                }, function() {

                    logger.error("Cannot callControlService endCall. callId: " + call.id);

                });

                break;

            case transferEvent.answeringRingingSlow_fsm:

                logger.info("(Call Manager) Answering Ringing Slow Transfer Event. callId: " + call.id);

                break;

            case transferEvent.callCompletedAnswering_fsm:

                logger.info("callManager: Call Completed Answering Event. callId: " + call.id);

                rtc.processAnswer(call, function() {

                    triggerCallState(callStates.IN_CALL);

                    setTimeout(function() {

                        callControlService.audit(call.id, function() {

                            logger.info("(Call Manager) Call Completed Answering Event - Audit kicked off: Success for: " + call.id);

                        },

                                function() {

                                    logger.error("(Call Manager) Call Completed Answering Event - Audit: Fail for: " + call.id);

                                    clearResources(call);

                                    triggerCallState(callStates.ENDED);

                                });

                    }, AUDIT_KICKOFF_TIMEOUT

                            );

                    call.call.setAuditTimer(function() {

                        callControlService.audit(call.id, function() {

                            logger.info("Call Completed Answering Event - Audit: Success for: " + call.id);

                        },

                        function (){

                            logger.error("Call Completed Answering Event - Audit: Fail for: " + call.id);

                            clearResources(call);

                            triggerCallState(callStates.ENDED);

                        });

                    });

                },

                function() {

                    clearResources(call);

                    triggerCallState(callStates.ENDED);

                });

                break;

            case transferEvent.remoteEnd_fsm:

                logger.info("Remote End Transfer Event. callId: " + call.id);

                //clear webRTC resources

                clearResources(call);

                triggerCallState(callStates.ENDED);

                break;

            case transferEvent.localHold_fsm:

                logger.info("Local Hold Transfer Event. callId: " + call.id);

                break;

            case transferEvent.localUnHold_fsm:

                logger.info("Local Unhold Transfer Event. callId: " + call.id);

                break;

            case transferEvent.remoteHold_fsm:

                logger.info("Remote Hold Transfer Event. callId: " + call.id);

                isLocalHold = (callFSM.getCurrentState(call) === callFSM.CallFSMState.LOCAL_HOLD) || (callFSM.getCurrentState(call) === callFSM.CallFSMState.BOTH_HOLD);

                rtc.processHold(call,true,isLocalHold, function(sdp){

                    logger.info("[callManager.onStateChange.transferEvent.remoteHold_fsm->processHold : sdp ]" + sdp);

                    callControlService.respondCallUpdate(call.id, sdp, function(){

                        logger.info("Remote Hold Transfer Event Successful. callId: " + call.id);

                        call.call.setHold(true);

                        call.call.setHoldState(callFSM.getCurrentState(call));

                        switch (callFSM.getCurrentState(call)) {

                            case callFSM.CallFSMState.REMOTE_HOLD:

                               triggerCallState(callStates.ON_REMOTE_HOLD);

                               break;

                            case callFSM.CallFSMState.BOTH_HOLD:

                               triggerCallState(callStates.ON_HOLD);

                               break;                               

                        }

                    }, function(errorStr){

                        logger.error("Remote Hold Transfer Event FAILED!! - " + errorStr);

                    });

                }, function(errorStr){

                    logger.error("Remote Hold FAILED!! - " + errorStr);

                });

                break;

            case transferEvent.remoteOfferDuringLocalHold_fsm:

                logger.info("Remote Offer during Local Hold Transfer Event");

                rtc.processRemoteOfferOnLocalHold(call,function(sdp){

                    logger.info("onStateChange.transferEvent.remoteUnHold_fsm->remoteOfferDuringHold_fsm : sdp " + sdp);

                    callControlService.respondCallUpdate(call.id, sdp, function(){

                        logger.info("Remote Offer During Local Hold Transfer Event successful. callId: " + call.id); 

                    }, function(errorStr){

                        logger.error("Remote Offer During Local Hold  Transfer Event FAILED!! - " + errorStr);

                    });

                }, function(errorStr){

                    logger.error("Remote Offer During Local Hold FAILED!! - " + errorStr);

                });

                break;

            case transferEvent.remoteUnHold_fsm:

                logger.info("Remote UnHold Transfer Event");

                isLocalHold = (callFSM.getCurrentState(call) === callFSM.CallFSMState.LOCAL_HOLD) || (callFSM.getCurrentState(call) === callFSM.CallFSMState.BOTH_HOLD);

                rtc.processHold(call,false,isLocalHold, function(sdp){

                    logger.info("onStateChange.transferEvent.remoteUnHold_fsm->processHold : sdp " + sdp);

                    callControlService.respondCallUpdate(call.id, sdp, function(){

                        logger.info("Remote UnHold Transfer Event successful. callId: " + call.id);

                        call.call.setHold(false);                

                        call.call.setHoldState(callFSM.getCurrentState(call));                                                        

                        switch (callFSM.getCurrentState(call)) {

                            case callFSM.CallFSMState.LOCAL_HOLD:

                               triggerCallState(callStates.ON_HOLD);

                               break;

                            case callFSM.CallFSMState.COMPLETED:

                               triggerCallState(callStates.IN_CALL);

                               break;                               

                        }  

                    }, function(errorStr){

                        logger.error("Remote UnHold Transfer Event FAILED!! - " + errorStr);

                    });

                }, function(errorStr){

                    logger.error("Remote UnHold FAILED!! - " + errorStr);

                });

                break;

            case transferEvent.remoteCallUpdate_fsm:

                logger.info("Remote Call Update Transfer Event. callId: " + call.id);

                rtc.processUpdate(call,function(sdp){

                    logger.info("onStateChange.transferEvent.remoteCallUpdate_fsm->processUpdate : sdp " + sdp);

                    callControlService.respondCallUpdate(call.id, sdp, function(){

                        logger.info("Remote Call Update Transfer Event Successful. callId: " + call.id);

                        triggerCallState(callStates.RENEGOTIATION);

                    }, function(errorStr){

                        logger.error("Remote Call Update Transfer Event FAILED!! - " + errorStr);

                    });

                }, function(errorStr){

                    logger.error("Remote Call Update FAILED!! - " + errorStr);

                }, call.currentState === callFSM.CallFSMState.LOCAL_HOLD ? true : false);

                break;

            case transferEvent.respondCallHoldUpdate_fsm:

                logger.info("Respond Call Hold Update Transfer Event. callId: " + call.id);

                isJoin = call.call.getJoin();

                rtc.processHoldRespond(call, function() {

                    logger.info("Respond Call Hold Update Event Successful. callId: " + call.id );

                    triggerCallState(callStates.RENEGOTIATION);

                },

                function(e){

                    logger.error("Respond Call Hold Update Event FAILED: " + e );

                }, isJoin);



                //enable clicking

                call.call.setButtonDisabler(false);

                call.call.clearBtnTimeout();



                if (isJoin === true) {

                    call.call.onJoin();

                }



                break;

            case transferEvent.respondCallUpdate_fsm:

                logger.info("Respond Call Update Transfer Event. callId: " + call.id);

                isJoin = call.call.getJoin();



                //enable clicking

                call.call.setButtonDisabler(false);

                call.call.clearBtnTimeout();



                //If this is a join call we need to send join request

                //onJoin() function is created at callController.js

                if (isJoin === true) {

                    rtc.processRespond(call, function() {

                        logger.info("Respond Call Update Event Successful. callId: " + call.id );

                        triggerCallState(callStates.RENEGOTIATION);

                    },

                    function(e){

                         logger.error("Respond Call Update Event FAILED: " + e );

                    }, isJoin);



                    call.call.onJoin();

                } else {

                    rtc.processRespond(call, function() {

                        logger.info("Respond Call Update Event Successful. callId: " + call.id );

                    },

                    function(e){

                         logger.error("Respond Call Update Event FAILED: " + e );

                    }, isJoin);

                    

                    triggerCallState(callStates.IN_CALL);

                }

                break;

            case transferEvent.respondCallUpdateAck_fsm:

                logger.info("Respond Call Update Ack Transfer Event. callId: " + call.id);

                rtc.processHold(call, false, (callFSM.getCurrentState(call) === callFSM.CallFSMState.LOCAL_HOLD), function(sdp) {

                    logger.info("onStateChange.transferEvent.respondCallUpdateAck_fsm->processHold : sdp " + sdp);

                    triggerCallState(callStates.IN_CALL);

                },

                function(errorStr){

                    logger.error("Respond Call Update Ack Transfer Event FAILED!!" + errorStr);

                });

                break;

            case transferEvent.preCallResponse_fsm:

                logger.info("Precall Response Transfer Event. callId: " + call.id);

                rtc.processPreAnswer(call);

                triggerCallState(callStates.RINGING);

                break;

            case transferEvent.forward_fsm:

                clearResources(call);

                break;

            case transferEvent.joining_fsm:

                logger.info("Joining Event");

                //if client is handling the refers from referer we need to trigger the refers for partyB and partyC

                if(fcsConfig.clientControlled === "true") {

                    call.referCall = function(referTo, referredBy) {

                        callControlService.refer(call.id, referTo, referredBy, function() {

                            logger.info("Joining Event Successful. callId: " + call.id);

                            callFSM.handleEvent(call, callFSM.NotificationEvent.refer_JSL);

                        },

                        function(errorStr){

                            logger.error("Joining Event FAILED!!" + errorStr);

                        });

                    };

                }

                break;

            case transferEvent.transfering_fsm:

                logger.info("Transfering Transfer Event. callId: " + call.id);

                break;

            case transferEvent.transferSuccess_fsm:

                logger.info("Session Complete Transfer Event. callId: " + call.id);

                callControlService.endCall(call.id, function(){

                    logger.info("callControlService.endCall successful. callId: " + call.id);

                }, function(){

                    logger.error("callControlService.endCall FAILED!! callId: " + call.id);

                });

                clearResources(call);

                triggerCallState(callStates.TRANSFERRED);

                logger.info("endCall successful. callId: " + call.id);

                break;

            case transferEvent.transferFail_fsm:

                logger.info("Transfer Fail Transfer Event. callId: " + call.id);

                triggerCallState(callStates.ON_HOLD);

                break;

            default:

                logger.error("Undefined transition event: " + event + " for " + call.id);

                break;



        }



    };

    

    //TODO CONTINUATION: deprecate once plugin updated

    this.refreshVideoRenderer = function(callid){

        var internalCall = calls[callid];

        if(internalCall) {

            rtc.refreshVideoRenderer(internalCall);

        }

    };    



    this.hasVideoDevice = function() {

        return rtc.isVideoSourceAvailable();

    };

    

    this.hasAudioDevice = function() {

        return rtc.isAudioSourceAvailable();

    };      

    

    this.getLocalVideoResolutions = function() {

        return rtc.getLocalVideoResolutions();

    };

     

    this.getRemoteVideoResolutions = function() {

        return rtc.getRemoteVideoResolutions();

    };



    this.isCallMuted = function(callid) {

        return rtc.isAudioMuted(calls[callid]);

    };



};

var callManager = new CallManager();

//will be removed

fcs.callManager = callManager;
/**
* Provides access to a user's call log.
* 
* @name calllog
* @namespace
* @memberOf fcs
* 
* @version 3.0.0
* @since 3.0.0
*/
var Calllog = function(){

   /**
    * Enum for the type of call log.
    * @name CallTypes
    * @enum {number}
    * @since 3.0.0
    * @readonly
    * @memberOf fcs.calllog
    * @property {number} [INCOMING=0] Incoming call.
    * @property {number} [MISSED=1] Missed call.
    * @property {number} [OUTGOING=2] Outgoing call.
    */
    this.CallTypes = {
        
        INCOMING: 0,
        
        MISSED: 1,
        
        OUTGOING: 2
    };

   /**
    * Retrieves the list of call logs from the server.
    *
    * @name fcs.calllog.retrieve
    * @function
    * @since 3.0.0
    * @param {function} onSuccess The onSuccess({@link Array.<fcs.calllog.Entry>}) callback to be called
    * @param {function} onFailure The onFailure({@link fcs.Errors}) callback to be called
    * @param {number} startIndex starting offset within the list of log records (records before this offset will not be returned)
    * @param {number} count The number of the log records to be returned
    * 
    * @example
    * var onSuccess = function(data){
    *    //do something here
    * };
    * var onError = function (err) {
    *   //do something here
    * };
    * 
    * fcs.addressbook.retrieve(onSuccess, onError, "0", "5");
    */
   

   /**
    * Deletes a call log from the server.
    *
    * @name fcs.calllog.remove
    * @function
    * @since 3.0.0
    * @param {string} calllogid The id of the call log to be deleted
    * @param {function} onSuccess The onSuccess() callback to be called
    * @param {function} onFailure The onFailure({@link fcs.Errors}) callback to be called
    * 
    * @example
    * var onSuccess = function(){
    *    //do something here
    * };
    * var onError = function (err) {
    *   //do something here
    * };
    * 
    * fcs.calllog.remove("calllogid", onSuccess, onError);
    */

   /**
    * Clears the entire call log from the server.
    *
    * @name fcs.calllog.removeAll
    * @function
    * @since 3.0.0
    * @param {function} onSuccess The onSuccess() callback to be called
    * @param {function} onFailure The onFailure({@link fcs.Errors}) callback to be called
    * 
    * @example
    * var onSuccess = function(){
    *    //do something here
    * };
    * var onError = function (err) {
    *   //do something here
    * };
    * 
    * fcs.calllog.removeAll( onSuccess, onError);
    */

   /**
    * @name Entry
    * @class
    * @memberOf fcs.calllog
    * @version 3.0.0
    * @since 3.0.0
    */
    this.Entry = function(){};

   /**
    * Unique record id of log.
    * 
    * @name fcs.calllog.Entry#recordId
    * @field
    * @since 3.0.0
    * @type {String}
    */

   /**
    * Display number of caller.
    * 
    * @name fcs.calllog.Entry#callerDisplayNumber
    * @field
    * @since 3.0.0
    * @type {String}
    */

   /**
    * Duration of call.
    * 
    * @name fcs.calllog.Entry#duration
    * @field
    * @since 3.0.0
    * @type {String}
    */

   /**
    * Name of caller.
    * 
    * @name fcs.calllog.Entry#callerName
    * @field
    * @since 3.0.0
    * @type {String}
    */

   /**
    * Start time of call.
    * 
    * @name fcs.calllog.Entry#startTime
    * @field
    * @since 3.0.0
    * @type {Date}
    */

   /**
    * Type of call.
    * 
    * @name fcs.calllog.Entry#type
    * @field
    * @since 3.0.0
    * @type {fcs.calllog.CallTypes}
    */
   
    /**
    * Resource location of call log.
    * 
    * @name fcs.calllog.Entry#resourceLocation
    * @field
    * @since 3.0.0
    * @type {String}
    */
};
var Calllogimpl = function() {

    var clUrl = "/logHistory",
        lrUrl = "/logRecord",
        callTypes = {},
        callTypesEnum = this.CallTypes;
        
    callTypes.incoming = callTypesEnum.INCOMING;
    callTypes.outgoing = callTypesEnum.OUTGOING;
    callTypes.missed = callTypesEnum.MISSED;

    function parseData(data) {
        var i, logs = [], log, params, type, date;
        if(data && data.logHistory && data.logHistory.logItems){
            for(i=0; i < data.logHistory.logItems.length;i++){
                params = data.logHistory.logItems[i].params;
                log =  new fcs.calllog.Entry(params);                    
                
                log.id = utils.getProperty(params, 'recordId');
                log.address = utils.getProperty(params, 'callerDisplayNumber');
                log.name = utils.getProperty(params, 'callerName');
                
                // convert string timestamp to Date object
                date = parseInt(params.startTime, 10);
                log.startTime = isNaN(date) ? null : new Date(date);
                
                // convert wam value to fcs.calllog.CallTypes value
                log.type = null;
                type = utils.getProperty(params, 'direction');                
                if(type !== null && callTypes[type] !== undefined){
                    log.type = callTypes[type];
                }
                
                logs.push(log);
            }
            // We need to sort *logs array to view call logs in descending time order inside CallLogTab 
            logs = logs.sort(function(a,b){return b.startTime - a.startTime;});
        }
        
        return logs;
    }

        /**
        * @ignore
        */
    this.retrieve = function(onSuccess, onFailure, startIndex, count) {
        
        var data = {};
        
        if(isFinite(startIndex)){
            data.startIndex = startIndex;
        }
        
        if(isFinite(count)){
            data.count = count;
        }
        
        server.sendGetRequest({
                url: getWAMUrl(1, clUrl),
                "data": data
            },
            onSuccess,
            onFailure,
            parseData
        );
        
    };
    
    this.retrievePartial = function(startIndex, count, onSuccess, onFailure) {
        
        var data = {};
        
        if(isFinite(startIndex)){
            data.startIndex = startIndex;
        }
        
        if(isFinite(count)){
            data.count = count;
        }
        
        server.sendGetRequest({
                url: getWAMUrl(1, clUrl),
                "data": data
            },
            onSuccess,
            onFailure,
            parseData
        );
        
    };

    this.removeAll = function(onSuccess, onFailure) {
        
        server.sendDeleteRequest({
                url: getWAMUrl(1, clUrl)
            },
            onSuccess,
            onFailure
        );
    };

    this.remove = function(calllogid,onSuccess, onFailure) {

        server.sendDeleteRequest({
                url: getWAMUrl(1, "/logRecord/" + calllogid)
            },
            onSuccess,
            onFailure
        );
    };
};

Calllogimpl.prototype = new Calllog();

fcs.calllog = new Calllogimpl();
    
var Addressbookimpl = function() {



    this.retrieve = function(parseData, onSuccess, onFailure) {

        server.sendGetRequest({

                    url: getWAMUrl(1, "/addressbook")

                },

                onSuccess,

                onFailure,

                parseData,

                undefined,

                undefined,

                "addressBookResponse");

    };



    this.searchDirectory = function(criteria, searchType, parseData, onSuccess, onFailure) {



        server.sendGetRequest({

                    "url": getWAMUrl(1, "/directory"),

                    "data": {"criteria": criteria, "criteriaType": searchType}

                },

                onSuccess,

                onFailure,

                parseData);

    };

};



var addressbookService = new Addressbookimpl();


var AddressbookManager = function() {

    var SearchType = {

        FIRSTNAME: 0,

        LASTNAME: 1,

        NAME: 2,

        PHONENUMBER: 3,

        USERNAME: 4,

        NA: 5

    }, Entry = function() {

    }, searchTypes = {};



    searchTypes[SearchType.FIRSTNAME] = "1";

    searchTypes[SearchType.LASTNAME] = "2";

    searchTypes[SearchType.NAME] = "3";

    searchTypes[SearchType.PHONENUMBER] = "4";

    searchTypes[SearchType.USERNAME] = "5";

    searchTypes[SearchType.NA] = "-1";



    function parseData(result) {

        var i, entries = [], entry, params, items;

        if (result) {

            if (result.directory) {

                items = result.directory.directoryItems;

            } else if (result.addressBookResponse) {

                items = result.addressBookResponse.addressBookEntries;

            }



            if (items) {

                for (i = 0; i < items.length; i++) {

                    params = items[i];

                    entry = new Entry();



                    entry.id = utils.getProperty(params, 'entryId');

                    entry.nickname = utils.getProperty(params, 'nickname');

                    entry.primaryContact = utils.getProperty(params, 'primaryContact');

                    entry.firstName = utils.getProperty(params, 'firstName');

                    entry.lastName = utils.getProperty(params, 'lastName');

                    entry.photoUrl = utils.getProperty(params, 'photoUrl');

                    entry.email = utils.getProperty(params, 'emailAddress');

                    entry.homePhone = utils.getProperty(params, 'homePhone');

                    entry.mobilePhone = utils.getProperty(params, 'mobilePhone');

                    entry.workPhone = utils.getProperty(params, params.workPhone ? 'workPhone' : 'businessPhone');

                    entry.friendStatus = utils.getProperty(params, 'friendStatus');

                    entry.accessCode = utils.getProperty(params, 'conferenceURL');

                    if (!entry.friendStatus) {

                        entry.friendStatus = false;

                    }

                    entry.fax = utils.getProperty(params, 'fax');

                    entry.pager = utils.getProperty(params, 'pager');



                    entries.push(entry);

                }

            }

        }



        return entries;

    }

    

    this.Entry = Entry;



    this.SearchType = SearchType;



    this.retrieve = function(onSuccess, onFailure) {

        addressbookService.retrieve(parseData, onSuccess, onFailure);

    };



    this.searchDirectory = function(criteria, searchType, onSuccess, onFailure) {

        var type = (searchTypes[searchType] === undefined) ? "-1" : searchTypes[searchType];

        addressbookService.searchDirectory(criteria, type, parseData, onSuccess, onFailure);

    };

    

};



var addressbookManager = new AddressbookManager();
/**

 * Addressbook and directory.

 * 

 * @name addressbook

 * @namespace

 * @memberOf fcs

 * @version 3.0.0

 * @since 3.0.0

 */

var Addressbook = function() {



    /**

     * Addressbook entry.

     * 

     * @typedef {Object} AddressbookEntry

     * @readonly

     * 

     * @property {?String}  entryId - Unique identifier for the entry.

     * @property {?String}  nickname - Name of the user as it will appear for a personal contact.

     * @property {?String}  primaryContact - User's primary contact number (this should be the prefered number for contacting the user).

     * @property {?String}  firstName - First name of the user.

     * @property {?String}  lastName - Last name of the user.

     * @property {?String}  photoUrl - URL from which to retrieve the picture of the user.

     * @property {?String}  emailAddress - Email address of the user.

     * @property {?String}  homePhone - Home phone number for the user.

     * @property {?String}  mobilePhone - Mobile phone number for the user.

     * @property {?String}  workPhone - Work phone number for the user.

     * @property {!boolean} friendStatus - Friend status of the user.

     * @property {?String}  fax - Fax number of the user.

     * @property {?String}  pager - Pager number of the user.

     * 

     */

    this.Entry = addressbookManager.Entry;



    /**

     * Enum for the search criteria filter used in directory searches.

     * 

     * @name SearchType

     * @readonly

     * @memberOf fcs.addressbook

     * @enum {number}

     * @since 3.0.0

     * 

     * @property {number} FIRSTNAME Search by first name

     * @property {number} LASTNAME Search by last name

     * @property {number} NAME Search by name

     * @property {number} PHONENUMBER Search by phone number

     * @property {number} USERNAME Search by username

     * @property {number} NA Not applicable

     */

    this.SearchType = addressbookManager.SearchType;



    /**

     * Success callback for addressbook retreive/search request.

     *

     * @callback addressbookRequestSuccess

     * @param {Array.<AddressbookEntry>} responseMessage

     */



    /**

     * Failure callback for addressbook retreive/search request.

     *

     * @callback addressbookRequestFailure

     * @param {fcs.Errors} responseCode

     */



    /**

     * Retrieves the list of address book entries from the server

     * and executes the success callback on completion or failure 

     * callback on error.

     * 

     * @name retrieve

     * @function

     * @since 3.0.0

     * @memberOf fcs.addressbook

     * 

     * @param {addressbookRequestSuccess} success callback function

     * @param {addressbookRequestFailure} failure callback function

     * 

     * @example

     * var onSuccess = function(entryArray){

     *    var index;

     *    for (index in entryArray) {

     *      console.log(entryArray[index].nickname +", " + entryArray[index].primaryContact);

     *    }

     * };

     * 

     * var onError = function (err) {

     *   console.log(err);

     * };

     * 

     * fcs.addressbook.retrieve(onSuccess, onError);

     * 

     */

    this.retrieve = addressbookManager.retrieve;



    /**

     * Searches the directory.

     * 

     * @name searchDirectory

     * @function

     * @since 3.0.0

     * @memberOf fcs.addressbook

     * 

     * @param {string} criteria The string to search in the directory

     * @param {fcs.addressbook.SearchType} searchType The criteria (filter) to be applied to the search

     * @param {addressbookRequestSuccess} success callback function

     * @param {addressbookRequestFailure} failure callback function

     * 

     * @example

     * var onSuccess = function(entryArray){

     *     var index;

     *     for (index in entryArray) {

     *         console.log(entryArray[index].firstName + ", " + entryArray[index].lastName);

     *     }

     * };

     * var onError = function (err) {

     *   console.log(err);

     * };

     * 

     * fcs.addressbook.searchDirectory("Michael", fcs.addressbook.SearchType.FIRSTNAME, onSuccess, onError);

     */

    this.searchDirectory = addressbookManager.searchDirectory;

};



fcs.addressbook = new Addressbook();


var CallTriggerService = function() {
    var logger = logManager.getLogger("callTriggerService");
    this.clickToCall = function(callingParty, calledParty, onSuccess, onFailure) {
        var data = {
            "clickToCallRequest":
            {
                "callingParty": callingParty,
                "calledParty": calledParty
            }
        };
        server.sendPostRequest({
            "url": getWAMUrl(1, "/clicktocall"),
            "data": data
        },
        onSuccess,
        onFailure
        );
    };
    
    this.getIMRN = function(realm, source, destination, onSuccess, onFailure) {
        logger.info("(Wam Call) getIMRN Function ");

        function parseIMRNResponse(IMRNdata) {
            var receivedIMRN;
            if (IMRNdata && IMRNdata.imrnResponse) {
                receivedIMRN = utils.getProperty(IMRNdata.imrnResponse, 'imrn');
            }
            return receivedIMRN;
        }
        
        if(destination.match('@')){            
         if(destination.split(':')[0]!=="sip"){
            destination = "sip:" + destination;
            }
        }
        
        var data = {
            "imrnRequest":{
                "realm": realm,
                "sourceAddress": source,
                "destinationAddress": destination
            }
        };
        server.sendPostRequest({
            "url": getWAMUrl(1, "/imrn"),
            "data": data
        },
        onSuccess,
        onFailure,
        parseIMRNResponse
        );
    };
    
};


var callTriggerService = new CallTriggerService();
var CallTrigger = function() {

    

    this.clickToCall = callTriggerService.clickToCall;

    

    this.getIMRN = callTriggerService.getIMRN;

    

};



fcs.call = new CallTrigger();


var CallControlService = function() {



    var logger = logManager.getLogger("callControlService");



    function addNotificationChannel(data){

        if(fcs.notification.isAnonymous() && window.cache.getItem("NotificationId")) {

            data.callMeRequest.notifyChannelId = window.cache.getItem("NotificationId");

        }

    }



    this.startCall = function(from, to, sdp, onSuccess, onFailure, convID) {



        logger.info("Call Start Function: " + from + " --> " + to);

        logger.info("Call Start Function: sdp : " + sdp);



        // response of the startCall contains callid/sessionData

        // callMe and callControl returns same response but object types have different namse

        function parseCallStart(data){

            var callid, response = fcs.notification.isAnonymous() ? data.callMeResponse:data.callControlResponse;

            if(response){

                callid = response.sessionData;

            }

            return callid;

        }



        function dataType() {

            var data;

            if (fcs.notification.isAnonymous()) {

                data = {

                    "callMeRequest":

                    {

                        "type":"callStart",

                        "from": from,

                        "to": to,

                        "sdp": sdp

                    }

                };

            }

            else {

                data = {

                    "callControlRequest":

                    {

                        "type":"callStart",

                        "from": from,

                        "to": to,

                        "sdp": sdp

                    }

                };

            }

            return data;

        }



        var data = dataType();

        addNotificationChannel(data);



        if(convID) {

            data.callControlRequest.conversation = "convid="+convID;

        }



        server.sendPostRequest({

            "url": getWAMUrl(1, fcs.notification.isAnonymous() ? "/callMe" : "/callControl"),

            "data": data

        },

        onSuccess,

        onFailure,

        parseCallStart

        );

    };



    this.audit = function(callid, onSuccess, onFailure){

        var data;



           if (fcs.notification.isAnonymous()) {

                data = {

                    "callMeRequest":

                    {

                        "type":"audit"

                    }

                };

            }

            else {

                data = {

                    "callControlRequest":

                    {

                        "type":"audit"

                    }

                };

            }



        server.sendPutRequest({

            "url": getWAMUrl(1, fcs.notification.isAnonymous() ? "/callme/callSessions/" : "/callControl/callSessions/") + callid,

            "data": data

        }, onSuccess, onFailure);

    };



    this.hold = function(callid , sdp , onSuccess , onFailure){

        logger.info("Hold Function : sdp : " + sdp);

        var data = {

            "callControlRequest":

            {

                "type":"startCallUpdate",

                "sdp": sdp

            }

        };



        server.sendPutRequest({

            "url": getWAMUrl(1, "/callControl/callSessions/" + callid),

            "data": data

        }, onSuccess, onFailure);

    };



    this.unhold = function(callid , sdp , onSuccess , onFailure){

        logger.info("UnHold Function : sdp : " + sdp);

        var data = {

            "callControlRequest":

            {

                "type":"startCallUpdate",

                "sdp": sdp

            }

        };

        server.sendPutRequest({

            "url": getWAMUrl(1, "/callControl/callSessions/" + callid),

            "data": data

        }, onSuccess, onFailure);

    };



    this.reinvite = function(callid , sdp , onSuccess , onFailure){

        logger.info("reinvite Function : sdp : " + sdp);



        var data = {

            "callControlRequest":

            {

                "type":"startCallUpdate",

                "sdp": sdp

            }

        };



        server.sendPutRequest({

            "url": getWAMUrl(1, "/callControl/callSessions/" + callid),

            "data": data

        }, onSuccess, onFailure);

    };



    this.respondCallUpdate = function(callid , sdp , onSuccess , onFailure){

        logger.info("Respond Call Update Function : sdp : " + sdp);

        var data = {

            "callControlRequest":

            {

                "type":"respondCallUpdate",

                "sdp": sdp

            }

        };

        server.sendPutRequest({

            "url": getWAMUrl(1, "/callControl/callSessions/" + callid),

            "data": data

        }, onSuccess, onFailure);

    };



    this.join = function (firstSessionData , secondSessionData , sdp , onSuccess , onFailure){

        logger.info("Join Function : sdp : " + sdp);

        function parseJoin(data){

            var callid, response = data.callControlResponse;



            if(response){

                callid = response.sessionData;

            }



            return callid;

        }



        var data = {

            "callControlRequest":

            {

                "type":"join",

                "firstSessionData":firstSessionData,

                "secondSessionData":secondSessionData,

                "sdp": sdp

            }

        };



        if(fcsConfig.clientControlled === "true") {

            data.callControlRequest.clientControlled = "true";

        }





        server.sendPostRequest({

            "url": getWAMUrl(1, "/callControl/"),

            "data": data

        },

        onSuccess,

        onFailure,

        parseJoin

        );

    };



    this.refer = function(callid, referTo, referredBy, onSuccess , onFailure){

        logger.info("Refer Function : refer to: " + referTo);

        var data = {

            "callControlRequest":

            {

                "type": "refer",

                "from": referredBy,

                "to": referTo

            }

        };



        server.sendPutRequest({

            "url": getWAMUrl(1, "/callControl/callSessions/" + callid),

            "data": data

        }, onSuccess, onFailure);

    };



    function makeCallControlRequest(type, callid , sdp, onSuccess, onFailure) {

        logger.info("makeCallControlRequest Function : sdp : " + sdp);

        var data = {

            "callControlRequest":{

                "type": type,

                "sdp": sdp

            }

        };



        server.sendPutRequest({

            "url": getWAMUrl(1, "/callControl/callSessions/" + callid),

            "data": data

        }, onSuccess, onFailure);

    }



    function makeCallControlEndRequest(callid, onSuccess, onFailure, synchronous) {

        var dummy;

        logger.info("makeCallControlEndRequest Function: " + callid);



        server.sendDeleteRequest({

            "url": getWAMUrl(1, fcs.notification.isAnonymous() ? "/callMe/callSessions/" : "/callControl/callSessions/") + callid,

            "data":{}

        },

        onSuccess,

        onFailure,

        dummy,

        dummy,

        synchronous

        );

    }



    this.endCall = function(callid, onSuccess, onFailure, synchronous) {

        logger.info("endCall Function: " + callid);

        makeCallControlEndRequest(callid, onSuccess, onFailure, synchronous);

    };



    this.answerCall = function(callid, sdp, onSuccess, onFailure) {

        logger.info("Answer Call Function : sdp : " + sdp);

        makeCallControlRequest("callAnswer", callid, sdp, onSuccess, onFailure);

    };



    function makeRequest(action, sessionData, onSuccess, onFailure, address, synchronous) {

        logger.info("makeRequest Function with action : " + action);

        var data = {

            "callDispositionRequest":{

                "action": action,

                "sessionData": sessionData

            }

        },dummy;

        if(address){

            data.callDispositionRequest.address = address;

        }

        server.sendPostRequest({

            "url": getWAMUrl(1, "/calldisposition"),

            "data":data

        },

        onSuccess,

        onFailure,

        dummy,

        dummy,

        synchronous

        );

    }



    this.reject = function(callid, onSuccess, onFailure, synchronous) {

        var dummy;

        logger.info("Reject Function: " + callid);

        makeRequest("reject", callid, onSuccess, onFailure, dummy, synchronous);

    };





    this.forward = function(callid, address , onSuccess, onFailure) {

        logger.info("Forward Function : address: " + address);

        makeRequest("forward", callid, onSuccess, onFailure, address);

    };



   this.transfer = function(callid , address , onSuccess , onFailure){

        logger.info("Call Transfer Function : target address: " + address);

        var data = {

            "callControlRequest":

            {

                "type":"transfer",

                "address": address

            }

        };



        server.sendPutRequest({

            "url": getWAMUrl(1, "/callControl/callSessions/" + callid),

            "data": data

        }, onSuccess, onFailure);

    };

};



var callControlService = new CallControlService();



NotificationCallBacks.call = function(data){

    // disabling the notifications for verizon demo

    if(!fcs.notification.isAnonymous()) {

        var sdp, actions, params, calls, remoteConversationId,

        call = null,

        callid = null,

        options = {},

        callParams = data.callNotificationParams,

        dispositionParams = data.callDispositionParams,

        sessionParams = data.sessionParams,

        logger = logManager.getLogger("callControlService");



        //Since session also include disposition use it as default

        params = sessionParams ? sessionParams : (dispositionParams ? dispositionParams : null);

        logger.info("params: " + params);



        if(params){

            actions = params.actions;

            logger.info("actions: " + actions);

            if(params.sessionData){

                callid = params.sessionData;

                calls = callManager.getCalls();

                if(calls[callid] !== undefined) {

                    logger.info("call already exists: " + callid);

                    return;

                }

                logger.info("sessionData: " + callid);

            }

            if(actions){

                options.reject = (actions.indexOf("reject", 0) > -1);

                options.forward = (actions.indexOf("forward", 0) > -1);

                options.answer = (actions.indexOf("answer", 0) > -1);

            }

            if(params.sdp){

                sdp = params.sdp;

            }

            if(params.conversation){

                remoteConversationId = params.conversation;

            }

        }



        call = new fcs.call.IncomingCall(callid, options);

        if (remoteConversationId && remoteConversationId.indexOf("convid=") > -1) {

            call.remoteConversationId = remoteConversationId.split("convid=")[1].split(",")[0];

        }

        call.callerNumber = utils.getProperty(callParams, 'callerDisplayNumber');

        call.callerName = utils.getProperty(callParams, 'callerName');

        call.calleeNumber = utils.getProperty(callParams, 'calleeDisplayNumber');

        call.primaryContact = utils.getProperty(callParams, 'primaryContact');

        if (call.primaryContact) {

            call.primaryContact = call.primaryContact.split(";")[0];

        }



        //create the call in the state machine

        callManager.incomingCall(call, sdp);

        

        //notify the callback

        utils.callFunctionIfExist(fcs.call.onReceived, call);

    }

};



function handleCallControlEvents(type, data){

    var sessionParams = data.sessionParams, logger = logManager.getLogger("callControlService");

    logger.info("CallControl notification received " + type + " sessionData:" + sessionParams.sessionData);

    if (sessionParams.referTo) {

        logger.info("CallControl notification received: " + "referTo:" + sessionParams.referTo + " referredBy: " + sessionParams.referredBy);

    } 

    if(sessionParams){

        callManager.onNotificationEvent(type, sessionParams);

    }

}



//Handle ringing event

NotificationCallBacks.ringing = function(data){

    logManager.getLogger("callControlService").info("NotificationCallBacks.ringing");

    handleCallControlEvents(callFSM.NotificationEvent.ringing_Notify, data);

};



NotificationCallBacks.sessionProgress = function(data){

    logManager.getLogger("callControlService").info("NotificationCallBacks.sessionProgress");



    //We are discarding the sessionProgress if the SDP is empty

    if(data.sessionParams.sdp !== "") {

        handleCallControlEvents(callFSM.NotificationEvent.sessionProgress, data);

    }

    else {

        logManager.getLogger("callControlService").info("Warning: SDP of sessionProgress is empty.");

    }

};



NotificationCallBacks.startCallUpdate = function(data){

    logManager.getLogger("callControlService").info("NotificationCallBacks.startCallUpdate");

    handleCallControlEvents(callFSM.NotificationEvent.startCallUpdate_Notify, data);

};



NotificationCallBacks.respondCallUpdate = function(data){

    logManager.getLogger("callControlService").info("NotificationCallBacks.respondCallUpdate");

    handleCallControlEvents(callFSM.NotificationEvent.respondCallUpdate_Notify, data);

};



NotificationCallBacks.sessionComplete = function(data){

    logManager.getLogger("callControlService").info("NotificationCallBacks.sessionComplete");

    handleCallControlEvents(callFSM.NotificationEvent.sessionComplete_Notify, data);

};



NotificationCallBacks.sessionFail = function(data){

    logManager.getLogger("callControlService").info("NotificationCallBacks.sessionFail");

    handleCallControlEvents(callFSM.NotificationEvent.sessionFail_Notify, data);

};



NotificationCallBacks.callEnd = function(data){

    logManager.getLogger("callControlService").info("NotificationCallBacks.callEnd");

    handleCallControlEvents(callFSM.NotificationEvent.callEnd_Notify, data);

};

NotificationCallBacks.trying = function(data){

    logManager.getLogger("CallControlService").info("NotificationCallBacks.trying");

    handleCallControlEvents(callFSM.NotificationEvent.trying_Notify, data);

};



NotificationCallBacks.callCancel = function(data){

    logManager.getLogger("callControlService").info("NotificationCallBacks.callCancel");

    handleCallControlEvents(callFSM.NotificationEvent.callCancel_Notify, data);

};



NotificationCallBacks.accepted = function(data){

    logManager.getLogger("callControlService").info("NotificationCallBacks.accepted");

    handleCallControlEvents(callFSM.NotificationEvent.accepted_Notify, data);

};


/**

* Call related resources (IMRN, Click To Call, Call Disposition).

*

* @name call

* @namespace

* @memberOf fcs

* 

* @version 3.0.0

* @since 3.0.0

*/



var Call = function() {



    var videoDeviceStatus = true;

    

   /**

    * This field provides the state of local video status like "recvonly", "sendrecv", "sendrecv" etc.

    *

    * @name fcs.call.localVideoState

    * @field

    * @type {number}

    * @since 3.0.0

    */

    this.localVideoState = 0;



   /**

    * This field provides the state of remote video status like "recvonly", "sendrecv", "sendrecv" etc.

    *

    * @name fcs.call.remoteVideoState

    * @field

    * @since 3.0.0

    * @type {number}

    */

    this.remoteVideoState = 0;



    /**

    * Sets the handler for received call notifications.

    *

    * @name onReceived

    * @event

    * @since 3.0.0

    * @memberOf fcs.call

    * @param {fcs.call.Call} call The call object

    *

    * @example

    * // This function listens received calls

    * function callReceived(call) {                    

    *    console.log("There is an incomming call...");                    

    *

    *    //This function listens call state changes in JSL API level 

    *    call.onStateChange = function(state) {

    *        onStateChange(call, state);

    *    };

    *

    *    //This function listens media streams in JSL API level

    *    call.onStreamAdded = function(streamURL) {

    *        // Remote Video is turned on by the other end of the call

    *        // Stream URL of Remote Video stream is passed into this function

    *        onStreamAdded(streamURL);

    *    };

    *    

    *    // Answering the incomming call

    *    call.answer(onAnswer, onFailure, isVideoAnswer);

    * }

    *

    * fcs.call.onReceived = callReceived;

    */

    this.onReceived = null;



    /**

    * Initialize the media components in order to provide real time communication.

    * When using FCS Plug-in with audio only the plugin will be added as an hidden object to root of the document.

    * When using FCS Plug-in with both audio and video, the object will be added to the videoContainer.

    *

    * @name fcs.call.initMedia

    * @function

    * @since 3.0.0

    * @param {function} [onSuccess] The onSuccess() to be called when the media have been successfully acquired

    * @param {function} [onFailure] The onFailure({@link fcs.call.MediaErrors}) to be called when media could not be aquired

    * @param {object} [options] The options used for initialization

    * @param {string} [options.type="plugin"] The type of media to use (for future use with webRTC)

    * @param {string} [options.pluginLogLevel="2"] The log level of webrtc plugin

    * @param {object} [options.videoContainer] html node in which to inject the video (deprecated)

    * @param {object} [options.removeVideoContainer] html node in which to inject the video

    * @param {object} [options.localVideoContainer] html node in which to inject the preview of the user camera

    * @param {object} [options.iceserver] ice server ip address ex: stun:206.165.51.23:3478

    * @param {object} [options.pluginMode=LEGACY] use downloaded plugin which disables webrtc capabilities of browser if avaliable

    * @param {object} [options.pluginMode=WEBRTC] use downloaded plugin which overrides webrtc capabilities of browser if avaliable

    * @param {object} [options.pluginMode=AUTO] use webrtc capabilities of browser if avaliable otherwise force user to download plugin

    * @param {object} [options.webrtcdtls=FALSE] webrtc disabled

    * @param {object} [options.webrtcdtls=TRUE] webrtc enabled

    * @param {object} [options.language="en"] language setting of the plugin

    *

    * @example

    * // Media options

    * var mediaOptions = {

    *    "ice": "STUN stun:206.165.51.69:3478",

    *    "notificationType": "websocket",

    *    "pluginMode": "auto",

    *    "iceserver": "stun:206.165.51.69:3478",

    *    "webrtcdtls": false,

    *    "language": "fr"

    * };                  

    *

    * // Initializing media

    * fcs.call.initMedia(

    *    function() {

    *        console.log("Media was initialized successfully!");

    *    }, 

    *    function(error) {

    *       switch(error) {

    *            case fcs.call.MediaErrors.WRONG_VERSION : // Alert

    *                console.log("Media Plugin Version Not Supported");

    *                break;

    *

    *            case fcs.call.MediaErrors.NEW_VERSION_WARNING : //Warning

    *                console.log("New Plugin Version is available");

    *                break;

    *

    *            case fcs.call.MediaErrors.NOT_INITIALIZED : // Alert             

    *                console.log("Media couldn't be initialized");

    *                break;

    *

    *            case fcs.call.MediaErrors.NOT_FOUND : // Alert

    *                console.log("Plugin couldn't be found!");

    *                break;

    *        }

    *    }, 

    *    mediaOptions

    * );  

    */



    this.initMedia = rtc.initMedia;



    /**

    * Starts a call.

    *

    * @name fcs.call.startCall

    * @function

    * @since 3.0.0

    * @param {string} from The caller's address (e.g. SIP URI) used to establish the call

    * @param {object} [contact] Contains users firstName and lastName

    * @param {string} [contact.firstName="John"] First Name of the user

    * @param {string} [contact.lastName="Doe"] Last Name of the user

    * @param {string} to The callee's address (e.g. SIP URI) used to establish the call

    * @param {function} onSuccess The onSuccess({@link fcs.call.OutgoingCall}) callback function to be called<

    * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called

    * @param {boolean} [isVideoEnabled] This will add m=video to SDP

    * @param {boolean} [sendInitialVideo] In order to make video call set this to true

    * @param {string} [videoQuality] Sets the quality of video

    * @param {string} convID This parameter will only used by smart office clients.

    *

    * @example

    * // Make Voice Call

    * // Start a voice call to the uri indicated with "to" argument

    * // Login is a prerequisite for making calls

    * // contact is an object with two fields contact.firstName and contact.lastName that specifies caller info

    * fcs.call.startCall(fcs.getUser(), contact, to,

    *      function(outgoingCall, onLocalStreamAdded){

    *                //get callid for your web app to be used later for handling popup windows

    *                var callId = outgoingCall.getId();

    * 

    *                outgoingCall.onStateChange = function(state,statusCode){

    *                //Add statusCode that returned from the server property to the call

    *                outgoingCall.statusCode = statusCode;

    *                //Put your web app code to handle call state change like ringing, onCall ...etc.

    *	    };

    *       

    *       outgoingCall.onStreamAdded = function(streamURL){

    *           // Setting up source (src tag) of remote video container

    *           $("#remoteVideo").attr("src", streamURL);

    *       };

    *    },

    *    function(){

    *       //put your web app failure handling code

    *       window.alert("CALL_FAILED");

    *    },

    *    false, false);    

    *     

    */



    this.startCall = callManager.start;



    /**

    * Sets log severity level for Webrtc Plugin (not used for native webrtc)

    * 5 levels(sensitive:0, verbose:1, info:2, warning:3, error:4)

    * 

    * @name rtc.set_logSeverityLevel

    * @function

    * @since 3.0.0

    */



    this.set_logSeverityLevel = rtc.set_logSeverityLevel;

    

    /**

    * Enables log callback for Webrtc Plugin (not used for native webrtc)

    *

    * @name rtc.enable_logCallback

    * @function

    * @since 3.0.0

    */



    this.enable_logCallback = rtc.enable_logCallback;



    /**

    * Disables log callback for Webrtc Plugin (not used for native webrtc)

    *

    * @name rtc.disable_logCallback

    * @function

    * @since 3.0.0

    */



    this.disable_logCallback = rtc.disable_logCallback;

   

    /**

    * Gets audioInDeviceCount

    *

    * @name fcs.call.get_audioInDeviceCount

    * @function

    * @since 3.0.0

    */



    this.get_audioInDeviceCount = rtc.get_audioInDeviceCount;



    /**

    * Gets audioOutDeviceCount

    *

    * @name fcs.call.get_autioOutDeviceCount

    * @function

    * @since 3.0.0

    */



    this.get_audioOutDeviceCount = rtc.get_audioOutDeviceCount;



    /**

    * Gets videoDeviceCount

    *

    * @name fcs.call.get_videoDeviceCount

    * @function

    * @since 3.0.0

    */



    this.get_videoDeviceCount = rtc.get_videoDeviceCount;



    /**

    * Gets Video Device availability status

    * Only works with PLUGIN

    * @deprecated 

    * @name fcs.call.initVideoDeviceStatus

    * @function

    * @since 3.0.0

    */

    this.initVideoDeviceStatus = function() {

        videoDeviceStatus = callManager.hasVideoDevice;

    };



    /**

    * Returns Video Device(Camera) availability

    * @name fcs.call.hasVideoDevice

    * @function

    * @since 3.0.0

    * @example 

    * if(fcs.call.hasVideoDevice()){

    *     // If there is a video device available, show local video container 

    *     callView.toggleLocalVideo(true);

    * }

    */

    this.hasVideoDevice = callManager.hasVideoDevice;

    

    /**

    * Returns Audio Device(Microphone) availability

    * @name fcs.call.hasAudioDevice

    * @function

    * @since 3.0.0

    * @example 

    * if(!fcs.call.hasAudioDevice()){

    *     window.alert("There is no available audio source!");

    * }

    */

    this.hasAudioDevice = callManager.hasAudioDevice;    

   



    /**

    * Gets User Media functionality for plugin

    * Only works with PLUGIN

    *

    * @name fcs.call.getUserMedia

    * @function

    * @since 3.0.0

    * @example 

    * fcs.call.getUserMedia(

    *    function(mediaInfo){

    *        window.console.log("media initialized. mediaInfo: " + JSON.stringify(mediaInfo));

    *    },

    *    function(err){

    *        window.console.log("media initialization error " + err);

    *    },

    *    {

    *        "audio": true,

    *        "video": true,

    *        "audioIndex":0, 

    *        "videoIndex":0

    *    }

    * );

    */



    this.getUserMedia = rtc.getUserMedia;



    /**

    * Shows device settings Window

    * Only works with PLUGIN

    *

    * @name fcs.call.showSettingsWindow

    * @function

    * @since 3.0.0

    * @example 

    * $("#device_settings_button").click(function() {

    *    fcs.call.showSettingsWindow();

    * });   

    */



    this.showSettingsWindow = rtc.showSettingsWindow;

    

    /**

    * Gets local and remote video resolutions with the order below

    * remoteVideoHeight-remoteVideoWidth

    * Only works with PLUGIN

    *

    * @deprecated 

    * @name fcs.call.getVideoResolutions

    * @function

    * @since 3.0.0

    */



    this.getVideoResolutions = rtc.getVideoResolutions;    



    /**

    * Gets local video resolutions with the order below

    * localVideoHeight-localVideoWidth

    * Only works with PLUGIN

    *

    * @name fcs.call.getLocalVideoResolutions

    * @function

    * @since 3.0.0

    * @example

    * var pluginLocalVideoResolution = fcs.call.getLocalVideoResolutions();

    * var localVideoHeight = pluginLocalVideoResolution[0];

    * var localVideoWidth = pluginLocalVideoResolution[1];

    * console.log("Local Video Dimensions: " + localVideoWidth + "," + localVideoHeight);

    */



    this.getLocalVideoResolutions = callManager.getLocalVideoResolutions;



    /**

    * Gets remote video resolutions with the order below

    * remoteVideoHeight-remoteVideoWidth

    * Only works with PLUGIN

    *

    * @name fcs.call.getRemoteVideoResolutions

    * @function

    * @since 3.0.0

    * @example 

    * var pluginRemoteVideoResolution = fcs.call.getRemoteVideoResolutions();

    * var remoteVideoHeight = pluginRemoteVideoResolution[0];

    * var remoteVideoWidth = pluginRemoteVideoResolution[1];

    * console.log("Remote Video Dimensions: " + remoteVideoWidth + "," + remoteVideoHeight);

    */



    this.getRemoteVideoResolutions = callManager.getRemoteVideoResolutions;



    /**

    * Shows if plugin is enabled.

    * Only works with PLUGIN

    *

    * @name fcs.call.isPluginEnabled

    * @function

    * @since 3.0.0

    * @example

    * if(fcs.call.isPluginEnabled()) {

    *     $("#device_settings_details").show();

    * }

    */



    this.isPluginEnabled = rtc.isPluginEnabled;



    this.hasGotCalls = callManager.hasGotCalls;



    /**

    * Retrived a call by Id.

    * 

    * This function allow to retrive a call which was cached by the call continuation feature.

    *

    * @name fcs.call.getIncomingCallById

    * @function

    * @since 3.0.0

    * @param {string} from The id of the incoming call

    * @returns {fcs.call.IncomingCall}

    *     

    */

    this.getIncomingCallById = function(id) {

        return callManager.getIncomingCallById(id);

    };

    

    /**

    * Create a renderer for an audio/video stream

    *

    * @name fcs.call.createStreamRenderer

    * @function

    * @since 3.0.0

    * @param {string} streamUrl The url of the stream 

    * @param {object} container The DOM node into which to create the renderer (the content of the node will be cleared)

    * @param {object} options The options to be used for the renderer

    * @returns {Object} renderer Renderer object 

    *     

    */

    this.createStreamRenderer = function(streamId, container, options) {

        return rtc.createStreamRenderer(streamId, container, options);

    };

    

    /**

    * Discpose of a previously created renderer

    *

    * @name fcs.call.disposeStreamRenderer

    * @function

    * @since 3.0.0 

    * @param {object} container The DOM node into which the renderer was previously created

    */

    this.disposeStreamRenderer = function(container) {

        rtc.disposeStreamRenderer(container);

    };

    

    /**

    * States of the Call.

    * @name States

    * @enum {number}

    * @since 3.0.0

    * @readonly

    * @memberOf fcs.call

    * @property {number} [IN_CALL=0] The call has been established.

    * @property {number} [ON_HOLD=1] The call has been put on hold.

    * @property {number} [RINGING=2] The outgoing call is ringing.

    * @property {number} [ENDED=3] The call has been terminated.

    * @property {number} [REJECTED=4] The outgoing call request has been rejected by the other party.

    * @property {number} [OUTGOING=5] The outgoing call request has been sent but no response have been received yet.

    * @property {number} [INCOMING=6] The incoming call has been received but has not been answered yet.

    * @property {number} [ANSWERING=7] The incoming call has been answered but the call as not been establish yet.

    * @property {number} [JOINED=8] The call is joined.

    * @property {number} [RENEGOTIATION=9] The call is re-established.

    * @property {number} [TRANSFERRED=10] The call is treansffered to a third party

    * @property {number} [ON_REMOTE_HOLD=11] The call has been put on hold remotely.

    */

    this.States = {



        IN_CALL: 0,



        ON_HOLD: 1,



        RINGING: 2,



        ENDED: 3,



        REJECTED: 4,



        OUTGOING: 5,



        INCOMING: 6,



        ANSWERING: 7,



        JOINED:8,



        RENEGOTIATION:9,



        TRANSFERRED: 10,

        

        ON_REMOTE_HOLD: 11



    };



    /**

    * Type of media initialization errors.

    * @name MediaErrors

    * @enum {number}

    * @since 3.0.0

    * @readonly

    * @memberOf fcs.call

    * @property {number} [NOT_FOUND=1] No media source available.

    * @property {number} [NOT_ALLOWED=2] User did not allow media use.

    * @property {number} [OPTIONS=3] Missing or wrong use of options.

    * @property {number} [WRONG_VERSION=4] The version of the plugin is not supported.

    * @property {number} [NOT_INITIALIZED=5] The media is not initialized.

    * @property {number} [NEW_VERSION_WARNING=6] New plugin version is available.

    */

    this.MediaErrors = {



        NOT_FOUND: 1,



        NOT_ALLOWED: 2,



        OPTIONS: 3,



        WRONG_VERSION: 4,



        NOT_INITIALIZED: 5,



        NEW_VERSION_WARNING: 6

    };



    /**

    * Call a party through a client device using the Click To Call service.

    *

    * @name fcs.call.clickToCall

    * @function

    * @since 3.0.0

    * @param {string} callingParty The caller's address (e.g. SIP) used to establish the call 

    * @param {string} calledParty The callee's address (e.g. SIP) used to establish the call

    * @param {function} onSuccess The onSuccess() callback to be called

    * @param {function} onFailure The onFailure({@link fcs.Errors}) callback to be called

    * 

    * @example

    * var onSuccess = function(){

    *    //do something here

    * };

    * var onError = function (err) {

    *   //do something here

    * };

    * 

    * fcs.call.clickToCall("user1@test.com", "user2@test.com", onSuccess, onError);

    */

   

   /**

    * Provide the user with a routable PSTN number as a result of an IMRN allocation request.

    *

    * @name fcs.call.getIMRN

    * @function

    * @param {string} realm The pool of numbers from which IMRN will be allocated

    * @param {string} source The URI of the individual placing the call

    * @param {string} destination The URI of the individual receiving the call

    * @param {function} onSuccess The onSuccess() callback to be called

    * @param {function} onFailure The onFailure({@link fcs.Errors}) callback to be called

    */



    /**

     * Call is super class of {@link fcs.call.IncomingCall} and {@link fcs.call.OutgoingCall}

     *

     * @name Call

     * @class

     * @since 3.0.0

     * @memberOf fcs.call

     * @param {String} callid Unique identifier for the call

     * @version 3.0.0

     * @since 3.0.0

     */

    this.Call = function(callid){};



    /**

    * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

    *

    * @name IncomingCall

    * @class

    * @since 3.0.0

    * @memberOf fcs.call

    * @augments fcs.call.Call

    * @param {String} callid Unique identifier for the call

    * @param {Object} data options

    * @param {Boolean} data.reject can reject. This is a call disposition option.

    * @param {Boolean} data.forward can forward. This is a call disposition option.

    * @param {Boolean} data.answer can answer. This is a call disposition option.

    * @version 3.0.0

    * @since 3.0.0

    */

    this.IncomingCall = function(callid, data){

        var id = callid, options = data, self = this, sendVideo = true, receiveVideo = true, receivingVideo = false, isJoin = false, onJoin, buttonDisabler = false, btnTimeout,

        auditTimer, isHold = false, holdState = null;



        /**

       * @name fcs.call.IncomingCall#calleeNumber

       * @field

       * @since 3.0.0

       * @type {String}

       *

       * @example

       *

       * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

       *

       * var incomingCall = {};

       * fcs.call.onReceived = function(call) {

       *    incomingCall = call;

       * };

       *

       * incomingCall.calleeNumber;

       */



        /**

       * @name fcs.call.IncomingCall#callerNumber

       * @field

       * @since 3.0.0

       * @type {String}

       *

       * @example

       *

       * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

       *

       * var incomingCall = {};

       * fcs.call.onReceived = function(call) {

       *    incomingCall = call;

       * };

       *

       * incomingCall.callerNumber;

       */



        /**

       * @name fcs.call.IncomingCall#callerName

       * @field

       * @since 3.0.0

       * @type {String}

       *

       * @example

       *

       * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

       *

       * var incomingCall = {};

       * fcs.call.onReceived = function(call) {

       *    incomingCall = call;

       * };

       *

       * incomingCall.callerName;

       */

      

        /**

       * @name fcs.call.IncomingCall#primaryContact

       * @field

       * @since 3.0.0

       * @type {String}

       *

       * @example

       *

       * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

       *

       * var incomingCall = {};

       * fcs.call.onReceived = function(call) {

       *    incomingCall = call;

       * };

       *

       * incomingCall.primaryContact;

       */

      



        /**

         * Puts the speaker into mute.

         *

         * @name fcs.call.IncomingCall#mute

         * @function

         * @since 3.0.0

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.mute();

         */

        this.mute = function(){

            callManager.mute(id, true);

        };



        /**

         * Puts the speaker into unmute.

         *

         * @name fcs.call.IncomingCall#unmute

         * @function

         * @since 3.0.0

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.unmute();

         */

        this.unmute = function(){

            callManager.mute(id, false);

        };



        /**

         * Answers the call.

         * @name fcs.call.IncomingCall#answer

         * @function

         * @since 3.0.0

         * @param {function} onSuccess The onSuccess() callback function to be called

         * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called

         * @param {boolean} [isVideoEnabled] Start call with video or not

         * @param {String} [videoQuality] Video quality 

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * var onSuccess = function(){

         *    //do something here

         * };

         * var onError = function (err) {

         *   //do something here

         * };

         *

         * incomingCall.answer(onSuccess, onFailure, true, "1280x720");

         */

        this.answer = function(onSuccess, onFailure, isVideoEnabled, videoQuality){

            if(options.answer){

                callManager.answer(id, onSuccess, onFailure, isVideoEnabled, videoQuality);

            } else {

                onFailure();

            }

        };



        /**

         * Rejects the call

         *

         * @name fcs.call.IncomingCall#reject

         * @function

         * @since 3.0.0

         * @param {function} onSuccess The onSuccess() callback function to be called

         * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * var onSuccess = function(){

         *    //do something here

         * };

         * var onError = function (err) {

         *   //do something here

         * };

         *

         * incomingCall.reject(onSuccess, onFailure);

         */

        this.reject = function(onSuccess, onFailure) {

            if(options.reject){

                callManager.reject(id, onSuccess, onFailure);

            } else {

                onFailure();

            }

        };



        /**

         * Ignores the call. Client will not send any rest request for this one. Ignore is on client side only.

         *

         * @name fcs.call.IncomingCall#ignore

         * @function

         * @since 3.0.0

         * @param {function} onSuccess The onSuccess() callback function to be called

         * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * var onSuccess = function(){

         *    //do something here

         * };

         * var onError = function (err) {

         *   //do something here

         * };

         *

         * incomingCall.ignore(onSuccess, onFailure);

         */

        this.ignore = function(onSuccess, onFailure) {

            callManager.ignore(id, onSuccess, onFailure);

        };



        /**

         * Forwards the call.

         *

         * @name fcs.call.IncomingCall#forward

         * @function

         * @since 3.0.0

         * @param {string} address The address where the call is transferred (e.g. SIP URI)

         * @param {function} onSuccess The onSuccess() callback function to be called

         * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * var onSuccess = function(){

         *    //do something here

         * };

         * var onError = function (err) {

         *   //do something here

         * };

         *

         * incomingCall.forward("user1@test.com", onSuccess, onFailure);

         */

        this.forward = function(address, onSuccess, onFailure) {

            if(options.forward){

                callManager.forward(id, address, onSuccess, onFailure);

            } else {

                onFailure();

            }

        };



        /**

         *

         * Checks the incoming call if it has reject option.

         *

         * @name fcs.call.IncomingCall#canReject

         * @function

         * @since 3.0.0

         * @returns {Boolean}

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.canReject();

         */

        this.canReject = function(){

            return options.reject === true;

        };



        /**

         *

         * Checks the incoming call if it has forward option.

         *

         * @name fcs.call.IncomingCall#canForward

         * @function

         * @since 3.0.0

         * @returns {Boolean}

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.canForward();

         */

        this.canForward = function(){

            return options.forward === true;

        };



        /**

         * Checks the incoming call if it has answer option.

         *

         * @name fcs.call.IncomingCall#canAnswer

         * @function

         * @since 3.0.0

         * @returns {Boolean}

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.canAnswer();

         */

        this.canAnswer = function(){

            return options.answer === true;

        };



        /**

         * Are we able to send video.

         * Ex: Client may try to send video but video cam can be unplugged. Returns false in that case

         *

         * @name fcs.call.IncomingCall#canSendVideo

         * @function

         * @since 3.0.0

         * @returns {Boolean}

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.canSendVideo();

         */

        this.canSendVideo = function(){

            return sendVideo;

        };

              

        /**

         * Are we able to send video. Checks the incoming SDP

         *

         * @name fcs.call.IncomingCall#canReceiveVideo

         * @function

         * @since 3.0.0

         * @returns {Boolean}

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.canReceiveVideo();

         */

        this.canReceiveVideo = function(){

            return receiveVideo;

        };



        /**

         * Are we able to receive video. Checks the incoming SDP

         *

         * @name fcs.call.IncomingCall#canReceivingVideo

         * @function

         * @since 3.0.0

         * @returns {Boolean}

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.canReceivingVideo();

         */

        this.canReceivingVideo = function(){

            return receivingVideo;

        };



        /**

         * sets the outgoing video condition.

         *

         * @name fcs.call.IncomingCall#setSendVideo

         * @function

         * @since 3.0.0

         * @param {Boolean} videoSendStatus video send status

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.setSendVideo(true);

         */

        this.setSendVideo = function(videoSendStatus){

            sendVideo = videoDeviceStatus && videoSendStatus;

        };



        /**

         * sets the outgoing video condition

         *

         * @name fcs.call.IncomingCall#setReceiveVideo

         * @function

         * @since 3.0.0

         * @param {Boolean} videoReceiveStatus video receive status

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.setReceiveVideo(true);

         */

        this.setReceiveVideo = function(videoReceiveStatus){

            receiveVideo = videoReceiveStatus;

        };



        /**

         * sets the incoming video condition

         *

         * @name fcs.call.IncomingCall#setReceivingVideo

         * @function

         * @since 3.0.0

         * @param {Boolean} isReceiving video receive status

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.setReceivingVideo(true);

         */

        this.setReceivingVideo = function(isReceiving){

            receivingVideo = isReceiving;

        };



        /**

         * sets if call is on hold or not

         *

         * @name fcs.call.IncomingCall#setHold

         * @function

         * @since 3.0.0

         * @param {Boolean} hold sets the call is (hold) or not

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.setHold(true);

         */

        this.setHold = function(hold) {

            isHold = hold;

        };



        /**

         * gets if call is on hold or not

         *

         * @name fcs.call.IncomingCall#getHold

         * @function

         * @since 3.0.0

         * @returns {Boolean} isHold returns the call is (hold) or not

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.getHold();

         */

        this.getHold = function() {

            return isHold;

        };    

        

        this.setHoldState = function(s) {

            holdState = s;

        }; 

        

        this.getHoldState = function() {

            return holdState;

        };            



        /**

         * Gets call id.

         *

         * @name fcs.call.IncomingCall#getId

         * @function

         * @since 3.0.0

         * @returns {id} Unique identifier for the call

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.getId();

         */

        this.getId = function(){

            return id;

        };



        /**

         * End the call

         *

         * @name fcs.call.IncomingCall#end

         * @function

         * @since 3.0.0

         * @param {function} onSuccess The onSuccess() callback function to be called

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * var onSuccess = function(){

         *    //do something here

         * };

         *

         * incomingCall.end(onSuccess);

         */

        this.end = function(onSuccess){

            callManager.end(id, onSuccess);

        };



        /**

          * Holds the call.

          *

          * @name fcs.call.IncomingCall#hold

          * @function

          * @since 3.0.0

          * @param {function} onSuccess The onSuccess() callback function to be called

          * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called

          *

          * @example

          *

          * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

          *

          * var incomingCall = {};

          * fcs.call.onReceived = function(call) {

          *    incomingCall = call;

          * };

          *

          * var onSuccess = function(){

          *    //do something here

          * };

          * var onFailure = function(err){

          *    //do something here

          * };

          *

          * incomingCall.hold(onSuccess, onFailure);

          */

        this.hold = function(onSuccess, onFailure){

            callManager.hold(callid, onSuccess, onFailure);

        };



        /**

         * Resume the call.

         *

         * @name fcs.call.IncomingCall#unhold

         * @function

         * @since 3.0.0

         * @param {function} onSuccess The onSuccess() callback function to be called

         * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * var onSuccess = function(){

         *    //do something here

         * };

         * var onFailure = function(err){

         *    //do something here

         * };

         *

         * incomingCall.unhold(onSuccess, onFailure);

         */

        this.unhold = function(onSuccess,onFailure){

            callManager.unhold(id, onSuccess,onFailure);

        };



        this.directTransfer = function(address,onSuccess,onFailure){

            callManager.directTransfer(id, address, onSuccess,onFailure);

        };



        /**

         * Stop the video for this call after the call is established

         *

         * @name fcs.call.IncomingCall#videoStop

         * @function

         * @since 3.0.0

         * @param {function} onSuccess The onSuccess() callback function to be called

         * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * var onSuccess = function(){

         *    //do something here

         * };

         * var onFailure = function(err){

         *    //do something here

         * };

         *

         * incomingCall.videoStop(onSuccess, onFailure);

         */

        this.videoStop = function(onSuccess, onFailure){

            callManager.videoStopStart(callid, onSuccess, onFailure, false);

        };



        /**

         * Start the video for this call after the call is established

         *

         * @name fcs.call.IncomingCall#videoStart

         * @function

         * @since 3.0.0

         * @param {function} onSuccess The onSuccess() callback function to be called

         * @param {function} onFailure The onFailure() callback function to be called

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * var onSuccess = function(){

         *    //do something here

         * };

         * var onFailure = function(err){

         *    //do something here

         * };

         *

         * incomingCall.videoStart(onSuccess, onFailure);

         */

        this.videoStart = function(onSuccess, onFailure){

            callManager.videoStopStart(callid, onSuccess, onFailure, true);

        };



        /**

         * Join 2 calls

         * You need two different calls to establish this functionality.

         * In order to join two calls. both calls must be put in to hold state first.

         * If not call servers will not your request.

         *

         * @name fcs.call.IncomingCall#join

         * @function

         * @since 3.0.0

         * @param {fcs.call.Call} anotherCall Call that we want the current call to be joined to.

         * @param {function} onSuccess The onSuccess({@link fcs.call.Call}) to be called when the call have been joined provide the joined call as parameter

         * @param {function} [onFailure] The onFailure() to be called when media could not be join

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * And another {@link fcs.call.OutgoingCall} or {@link fcs.call.IncomingCall} is requeired which is going to be joined.

         * var anotherCall; // assume this is previosuly created.

         *

         * var joinOnSuccess = function(joinedCall){

         *    joinedCall // newly created.

         *    //do something here

         * };

         * var joinOnFailure = function(){

         *    //do something here

         * };

         *

         * incomingCall.join(anotherCall, joinOnSuccess, joinOnFailure);

         *

         * When join() is successfuly compeled, joinOnSuccess({@link fcs.call.OutgoingCall}) will be invoked.

         */

        this.join = function(anotherCall, onSuccess, onFailure){

            callManager.join(id, anotherCall.getId(), onSuccess, onFailure);

        };



        /**

         * Send Dual-tone multi-frequency signaling.

         *

         * @name fcs.call.IncomingCall#sendDTMF

         * @function

         * @since 3.0.0

         * @param {String} tone Tone to be send as dtmf.

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.sendDTMF("0");

         */

        this.sendDTMF = function(tone){

            callManager.sendDTMF(id, tone);

        };



        /**

         * Force the plugin to send a IntraFrame

         * Only used by PLUGIN.

         * This needs to be called when sending video.

         * Solves video freeze issue

         *

         * @name fcs.call.IncomingCall#sendIntraFrame

         * @function

         * @since 3.0.0

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.sendIntraFrame();

         */

        this.sendIntraFrame = function(){

            if (sendVideo) {

                callManager.sendIntraFrame(id);

            }

        };



        /**

         * Force the plugin to send a BlackFrame

         * Only used by PLUGIN.

         * Some of the SBC's(Session Border Controllers) do not establish one way video.

         * audio only side has to send a blackFrame in order to see the incoming video

         *

         * @name fcs.call.IncomingCall#sendBlackFrame

         * @function

         * @since 3.0.0

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.sendBlackFrame();

         */

        this.sendBlackFrame = function(){

            callManager.sendBlackFrame(id);

        };

        

        /**

         * Force the plugin to refresh video renderer

         * with this call's remote video stream

         * Only used by PLUGIN.

         *

         * @name fcs.call.IncomingCall#refreshVideoRenderer

         * @function

         * @since 3.0.0

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.refreshVideoRenderer();

         */

        this.refreshVideoRenderer = function(){

            callManager.refreshVideoRenderer(id);

        };



        /**

         * Returns the call is a join call or not

         * Do not use this function if you really dont need it.

         * This will be handled by the framework

         *

         * @name fcs.call.IncomingCall#getJoin

         * @function

         * @since 3.0.0

         * @returns {Boolean} isJoin

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.getJoin();

         */

        this.getJoin = function() {

            return isJoin;

        };



        /**

         * Marks the call as a join call or not

         * Do not use this function if you really dont need it.

         * This will be handled by the framework

         *

         * @name fcs.call.IncomingCall#setJoin

         * @function

         * @since 3.0.0

         * @param {String} join

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.setJoin(true);

         */

        this.setJoin = function (join) {

            isJoin = join;

        };



        /**

         * Returns the button is a disabled or not

         * You may want to disable your buttons while waiting for a response.

         * Ex: this will prevent clicking multiple times for hold button until first hold response is not recieved

         *

         * @name fcs.call.IncomingCall#getButtonDisabler

         * @function

         * @since 3.0.0

         * @returns {Boolean} buttonDisabler

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.getButtonDisabler();

         */

        this.getButtonDisabler = function() {

            return buttonDisabler;

        };



        /**

         * Disable the button after waiting 4000 milliseconds.

         * You may want to disable your buttons while waiting for a response.

         * Ex: this will prevent clicking multiple times for hold button until first hold response is not recieved

         *

         * @name fcs.call.IncomingCall#setButtonDisabler

         * @function

         * @since 3.0.0

         * @param {Boolean} disable

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.setButtonDisabler(true);

         */

        this.setButtonDisabler = function(disable) {

            buttonDisabler = disable;

            if(buttonDisabler) {

                btnTimeout = setTimeout( function() {

                    buttonDisabler = false;

                },

                4000 );

            }

        };



        /**

         * Clears the timer set with fcs.call.IncomingCall#setButtonDisabler.

         * You may want to disable your buttons while waiting for a response.

         * Ex: this will prevent clicking multiple times for hold button until first hold response is not recieved

         *

         * @name fcs.call.IncomingCall#clearBtnTimeout

         * @function

         * @since 3.0.0

         *

         * @example

         *

         * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var incomingCall = {};

         * fcs.call.onReceived = function(call) {

         *    incomingCall = call;

         * };

         *

         * incomingCall.clearBtnTimeout();

         */

        this.clearBtnTimeout = function() {

            clearTimeout(btnTimeout);

        };





        /**

        * Long call audit

        * Creates a timer after call is established.

        * This timer sends a "PUT" request to server.

        * This will continue until one request fails.

        * Handled by framework. You dont need to call this function

        *

        * @name fcs.call.IncomingCall#setAuditTimer

        * @function

        * @since 3.0.0

        *

        * @example

        *

        * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

        * incomingCall.setAuditTimer(audit);

        */

        this.setAuditTimer = function (audit) {

            auditTimer = setInterval(function() {

                audit();

            },

            fcsConfig.callAuditTimer ? fcsConfig.callAuditTimer:30000);

        };





        /**

        * Clears the long call audit prior to clearing all call resources.

        * Handled by framework. you dont need to call this function

        *

        * @name fcs.call.IncomingCall#clearAuditTimer

        * @function

        * @since 3.0.0

        *

        * @example

        *

        * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

        */

        this.clearAuditTimer = function() {

            clearInterval(auditTimer);

        };



        this.isCallMuted = function(id) {

            return callManager.isCallMuted(id);

        };

    };



    this.IncomingCall.prototype = new this.Call();



    /**

    * @name OutgoingCall

    * @class

    * @memberOf fcs.call

    * @augments fcs.call.Call

    * @param {String} callid Unique identifier for the call

    * @version 3.0.0

    * @since 3.0.0

    */

    this.OutgoingCall = function(callid){

        var id = callid, self = this, sendVideo = true, receiveVideo = true, receivingVideo = false, isJoin = false, onJoin, buttonDisabler = false, btnTimeout,

        auditTimer, isHold = false, holdState = null;



        /**

         * Creates localStream

         * This will be called automaticly by API/framework.

         *

         * @name fcs.call.IncomingCall#onLocalStreamAdded

         * @function

         * @since 3.0.0

         *

         **/

        this.onLocalStreamAdded = function(call){

            rtc.onLocalStreamAdded(call);

        };



        /**

         * Are we able to send video.

         * Ex: Client may try to send video but video cam can be unplugged. Returns false in that case

         *

         * @name fcs.call.OutgoingCall#canSendVideo

         * @function

         * @since 3.0.0

         * @returns {Boolean}

         *

         * @example

         *

         * A previously created {@link fcs.call.OutgoingCall} is required. {@see {@link fcs.call.startCall}} for more details.

         *

         * var outgoingCall = {};

         * fcs.call.startCall(..., ..., ..., onSuccess(outgoingCall), ..., ...);

         * outgoingCall.canSend();

         */

        this.canSendVideo = function(){

            return sendVideo;

        };

               

        /**

         * Are we able to send video. Checks the incoming SDP

         *

         * @name fcs.call.OutgoingCall#canReceiveVideo

         * @function

         * @since 3.0.0

         * @returns {Boolean}

         *

         * @example

         *

         * A previously created {@link fcs.call.OutgoingCall} is required. {@see {@link fcs.call.startCall}} for more details.

         *

         * var outgoingCall = {};

         * fcs.call.startCall(..., ..., ..., onSuccess(outgoingCall), ..., ...);

         * outgoingCall.canReceiveVideo();

         */

        this.canReceiveVideo = function(){

            return receiveVideo;

        };



        /**

         * Are we able to receive video. Checks the incoming SDP

         *

         * @name fcs.call.OutgoingCall#canReceivingVideo

         * @function

         * @since 3.0.0

         * @returns {Boolean}

         *

         * @example

         *

         * A previously created {@link fcs.call.OutgoingCall} is required. {@see {@link fcs.call.startCall}} for more details.

         *

         * var outgoingCall = {};

         * fcs.call.startCall(..., ..., ..., onSuccess(outgoingCall), ..., ...);

         * outgoingCall.canReceivingVideo();

         */

        this.canReceivingVideo = function(){

            return receivingVideo;

        };



        /**

         * sets the outgoing video condition.

         *

         *

         * @name fcs.call.OutgoingCall#setSendVideo

         * @function

         * @since 3.0.0

         * @param {Boolean} videoSendStatus video send status

         *

         * @example

         *

         * A previously created {@link fcs.call.OutgoingCall} is required. {@see {@link fcs.call.startCall}} for more details.

         *

         * var outgoingCall = {};

         * fcs.call.startCall(..., ..., ..., onSuccess(outgoingCall), ..., ...);

         * outgoingCall.setSendVideo(true);

         */

        this.setSendVideo = function(videoSendStatus){

            sendVideo = videoDeviceStatus && videoSendStatus;

        };



        /**

         * sets the outgoing video condition

         *

         * @name fcs.call.OutgoingCall#setReceiveVideo

         * @function

         * @since 3.0.0

         * @param {Boolean} videoReceiveStatus video receive status

         *

         * @example

         *

         * A previously created {@link fcs.call.OutgoingCall} is required. {@see {@link fcs.call.startCall}} for more details.

         *

         * var outgoingCall = {};

         * fcs.call.startCall(..., ..., ..., onSuccess(outgoingCall), onFail(error), ...);

         * outgoingCall.setReceiveVideo(true);

         */

        this.setReceiveVideo = function(videoReceiveStatus){

            receiveVideo = videoReceiveStatus;

        };



        /**

         * sets the incoming video condition

         *

         * @name fcs.call.OutgoingCall#setReceivingVideo

         * @function

         * @since 3.0.0

         * @param {Boolean} isReceiving video receive status

         *

         * @example

         *

         * A previously created {@link fcs.call.OutgoingCall} is required. {@see {@link fcs.call.startCall}} for more details.

         *

         * var outgoingCall = {};

         * fcs.call.startCall(..., ..., ..., onSuccess(outgoingCall), ..., ...);

         * outgoingCall.isReceiving(true);

         */

        this.setReceivingVideo = function(isReceiving){

            receivingVideo = isReceiving;

        };



        /**

         * sets if call is on hold or not

         *

         * @name fcs.call.OutgoingCall#setHold

         * @function

         * @since 3.0.0

         * @param {Boolean} hold sets the call is (hold&&remotehold) or not

         */

        this.setHold = function(hold) {

            isHold = hold;

        };



        /**

         * gets if call is on hold or not

         *

         * @name fcs.call.OutgoingCall#getHold

         * @function

         * @since 3.0.0

         * @returns {Boolean} isHold returns the call is (hold) or not

         *

         * @example

         *

         * A previously created {@link fcs.call.OutgoingCall} is required. {@see {@link fcs.call.startCall}} for more details.

         *

         * var outgoingCall = {};

         * fcs.call.startCall(..., ..., ..., onSuccess(outgoingCall), ..., ...);

         * outgoingCall.getHold();

         */

        this.getHold = function() {

            return isHold;

        };    

        

        this.setHoldState = function(s) {

            holdState = s;

        }; 

        

        this.getHoldState = function() {

            return holdState;

        };           



        /**

         * Gets call id.

         *

         * @name fcs.call.OutgoingCall#getId

         * @function

         * @since 3.0.0

         * @returns {id} Unique identifier for the call

         *

         * @example

         *

         * A previously created {@link fcs.call.OutgoingCall} is required. {@see {@link fcs.call.startCall}} for more details.

         *

         * var outgoingCall = {};

         * fcs.call.startCall(..., ..., ..., onSuccess(outgoingCall), ..., ...);

         * outgoingCall.getId();

         */

        this.getId = function(){

            return id;

        };



        /**

         * Force the plugin to send a IntraFrame

         *

         * @name fcs.call.OutgoingCall#sendIntraFrame

         * @function

         * @since 3.0.0

         *

         * @example

         *

         * A previously created {@link fcs.call.OutgoingCall} is required. {@see {@link fcs.call.startCall}} for more details.

         *

         * var outgoingCall = {};

         * fcs.call.startCall(..., ..., ..., onSuccess(outgoingCall), ..., ...);

         * outgoingCall.sendIntraFrame();

         */

        this.sendIntraFrame = function(){

            if (sendVideo) {

                callManager.sendIntraFrame(id);

            }

        };



        /**

         * Force the plugin to send a BlackFrame

         *

         * @name fcs.call.OutgoingCall#sendBlackFrame

         * @function

         * @since 3.0.0

         *

         * @example

         *

         * A previously created {@link fcs.call.OutgoingCall} is required. {@see {@link fcs.call.startCall}} for more details.

         *

         * var outgoingCall = {};

         * fcs.call.startCall(..., ..., ..., onSuccess(outgoingCall), ..., ...);

         * outgoingCall.sendBlackFrame();

         */

        this.sendBlackFrame = function(){

            callManager.sendBlackFrame(id);

        };

        

        /**

         * Force the plugin to refresh video renderer

         * with this call's remote video stream

         *

         * @name fcs.call.OutgoingCall#refreshVideoRenderer

         * @function

         * @since 3.0.0

         *

         * @example

         *

         * A previously created {@link fcs.call.OutgoingCall} is required. {@see {@link fcs.call.startCall}} for more details.

         *

         * var outgoingCall = {};

         * fcs.call.startCall(..., ..., ..., onSuccess(outgoingCall), ..., ...);

         * outgoingCall.refreshVideoRenderer();

         */

        this.refreshVideoRenderer = function(){

                callManager.refreshVideoRenderer(id);

        };



        /**

         * Puts the speaker into mute.

         *

         * @name fcs.call.OutgoingCall#mute

         * @function

         * @since 3.0.0

         *

         * @example

         *

         * A previously created {@link fcs.call.OutgoingCall} is required. {@see {@link fcs.call.startCall}} for more details.

         *

         * var outgoingCall = {};

         * fcs.call.startCall(..., ..., ..., onSuccess(outgoingCall), ..., ...);

         * outgoingCall.mute();

         */

        this.mute = function(){

            callManager.mute(id, true);

        };



        /**

         * Puts the speaker into unmute.

         *

         * @name fcs.call.OutgoingCall#unmute

         * @function

         * @since 3.0.0

         *

         * @example

         *

         * A previously created {@link fcs.call.OutgoingCall} is required. {@see {@link fcs.call.startCall}} for more details.

         *

         * var outgoingCall = {};

         * fcs.call.startCall(..., ..., ..., onSuccess(outgoingCall), ..., ...);

         * outgoingCall.unmute();

         */

        this.unmute = function(){

            callManager.mute(id, false);

        };



        /**

         * End the call

         *

         * @name fcs.call.OutgoingCall#end

         * @param {function} onSuccess The onSuccess() callback function to be called

         * @function

         * @since 3.0.0

         *

         * @example

         *

         * A previously created {@link fcs.call.OutgoingCall} is required. {@see {@link fcs.call.startCall}} for more details.

         *

         * var outgoingCall = {};

         * fcs.call.startCall(..., ..., ..., onSuccess(outgoingCall), ..., ...);

         *

         * var endCallOnSuccess = function(){

         *    //do something here

         * };

         *

         * outgoingCall.end(endCallOnSuccess);

         */

        this.end = function(onSuccess){

            callManager.end(id, onSuccess);

        };



        /**

          * Holds the call.

          * @name fcs.call.OutgoingCall#hold

          * @function

          * @since 3.0.0

          * @param {function} onSuccess The onSuccess() callback function to be called

          * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called

          *

          * @example

          *

          * A previously created {@link fcs.call.OutgoingCall} is required. {@see {@link fcs.call.startCall}} for more details.

          *

          * var outgoingCall = {};

          * fcs.call.startCall(..., ..., ..., onSuccess(outgoingCall), ..., ...);

          *

          * var holdCallOnSuccess = function(){

          *    //do something here

          * };

          * var holdCallOnFailure = function(err){

          *    //do something here

          * };

          *

          * outgoingCall.hold(holdCallOnSuccess, holdCallOnFailure);

          */

        this.hold = function(onSuccess, onFailure){

            callManager.hold(callid, onSuccess, onFailure);

        };



        /**

         * Resume the call.

         * @name fcs.call.OutgoingCall#unhold

         * @function

         * @since 3.0.0

         * @param {function} onSuccess The onSuccess() callback function to be called

         * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called

         *

         * @example

         *

         * A previously created {@link fcs.call.OutgoingCall} is required. {@see {@link fcs.call.startCall}} for more details.

         *

         * var outgoingCall = {};

         * fcs.call.startCall(..., ..., ..., onSuccess(outgoingCall), ..., ...);

         *

         * var unholdCallOnSuccess = function(){

         *    //do something here

         * };

         * var unholdCallOnFailure = function(err){

         *    //do something here

         * };

         *

         * outgoingCall.unhold(unholdCallOnSuccess, unholdCallOnFailure);

         */

        this.unhold = function(onSuccess,onFailure){

            callManager.unhold(id, onSuccess,onFailure);

        };



        this.directTransfer = function(address,onSuccess,onFailure){

            callManager.directTransfer(id, address, onSuccess,onFailure);

        };



        /**

         * Stop the video for this call after the call is established

         *

         * @name fcs.call.OutgoingCall#videoStop

         * @function

         * @since 3.0.0

         * @param {function} [onSuccess] The onSuccess() to be called when the video is stopped<br />

         * function()

         * @param {function} [onFailure] The onFailure() to be called when the video could not be stopped<br />

         * function()

         *

         * @example

         *

         * A previously created {@link fcs.call.OutgoingCall} is required. {@see {@link fcs.call.startCall}} for more details.

         *

         * var outgoingCall = {};

         * fcs.call.startCall(..., ..., ..., onSuccess(outgoingCall), ..., ...);

         *

         * var videoStopOnSuccess = function(){

         *    //do something here

         * };

         * var videoStopOnFailure = function(){

         *    //do something here

         * };

         *

         * outgoingCall.videoStop(videoStopOnSuccess, videoStopOnFailure);

         */

        this.videoStop = function(onSuccess, onFailure){

            callManager.videoStopStart(callid, onSuccess, onFailure, false);

        };



        /**

         * Start the video for this call after the call is established

         *

         * @name fcs.call.OutgoingCall#videoStart

         * @function

         * @since 3.0.0

         * @param {function} [onSuccess] The onSuccess() to be called when the video is started

         * @param {function} [onFailure] The onFailure() to be called when the video could not be started

         *

         * @example

         *

         * A previously created {@link fcs.call.OutgoingCall} is required. {@see {@link fcs.call.startCall}} for more details.

         *

         * var outgoingCall = {};

         * fcs.call.startCall(..., ..., ..., onSuccess(outgoingCall), ..., ...);

         *

         * var videoStartOnSuccess = function(){

         *    //do something here

         * };

         * var videoStartOnFailure = function(){

         *    //do something here

         * };

         *

         * outgoingCall.videoStart(videoStopOnSuccess, videoStopOnFailure);

         */

        this.videoStart = function(onSuccess, onFailure){

            callManager.videoStopStart(callid, onSuccess, onFailure, true);

        };



        /**

         * Join 2 calls

         * You need two different calls to establish this functionality.

         * In order to join two calls. both calls must be put in to hold state first.

         * If not call servers will not your request.

         *

         * @name fcs.call.OutgoingCall#join

         * @function

         * @since 3.0.0

         * @param {fcs.call.Call} anotherCall Call that we want the current call to be joined to.

         * @param {function} onSuccess The onSuccess({@link fcs.call.OutgoingCall}) to be called when the call have been joined provide the joined call as parameter

         * @param {function} [onFailure] The onFailure() to be called when media could not be join

         *

         * @example

         *

         * A previously created {@link fcs.call.OutgoingCall} is required. {@see {@link fcs.call.startCall}} for more details.

         *

         * var outgoingCall = {};

         * fcs.call.startCall(..., ..., ..., onSuccess(outgoingCall), ..., ...);

         *

         * And another {@link fcs.call.OutgoingCall} or {@link fcs.call.IncomingCall} is requeired which is going to be joined.

         * var anotherCall; // assume this is previosuly created.

         *

         * var joinOnSuccess = function(joinedCall){

         *    joinedCall // newly created.

         *    //do something here

         * };

         * var joinOnFailure = function(){

         *    //do something here

         * };

         *

         * outgoingCall.join(anotherCall, joinOnSuccess, joinOnFailure);

         *

         * When join() is successfuly compeled, joinOnSuccess({@link fcs.call.OutgoingCall}) will be invoked.

         */

        this.join = function(anotherCall, onSuccess, onFailure){

            callManager.join(id, anotherCall.getId(), onSuccess, onFailure);

        };



        /**

         * Send Dual-tone multi-frequency signaling.

         *

         * @name fcs.call.OutgoingCall#sendDTMF

         * @function

         * @since 3.0.0

         * @param {String} tone Tone to be send as dtmf.

         *

         * @example

         *

         * A previously created {@link fcs.call.OutgoingCall} is required. {@see {@link fcs.call.startCall}} for more details.

         *

         * var outgoingCall = {};

         * fcs.call.startCall(..., ..., ..., onSuccess(outgoingCall), ..., ...);

         *

         * var videoStartOnSuccess = function(){

         *    //do something here

         * };

         * var videoStartOnFailure = function(){

         *    //do something here

         * };

         *

         * outgoingCall.sendDTMF("0");

         */

        this.sendDTMF = function(tone){

            callManager.sendDTMF(id, tone);

        };



        /**

         * Returns the call is a join call or not

         * Do not use this function if you really dont need it.

         * This will be handled by the framework

         *

         * @name fcs.call.OutgoingCall#getJoin

         * @function

         * @since 3.0.0

         * @returns {Boolean} isJoin

         *

         * @example

         *

         * A previously created {@link fcs.call.OutgoingCall} is required. {@see {@link fcs.call.startCall}} for more details.

         *

         * var outgoingCall = {};

         * fcs.call.startCall(..., ..., ..., onSuccess(outgoingCall), ..., ...);

         *

         * var videoStartOnSuccess = function(){

         *    //do something here

         * };

         * var videoStartOnFailure = function(){

         *    //do something here

         * };

         *

         * outgoingCall.getJoin();

         *

         * This method will return true if the outgoingCall is a previously joined call {@see {@link fcs.call.outgoingCall#join}}.

         */

        this.getJoin = function() {

            return isJoin;

        };



        /**

         * Marks the call as a join call or not

         * Do not use this function if you really dont need it.

         * This will be handled by the framework

         *

         * @name fcs.call.OutgoingCall#setJoin

         * @function

         * @since 3.0.0

         * @param {String} join

         *

         * @example

         *

         * When an outgoing call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var outgoingCall = {};

         * fcs.call.onReceived = function(call) {

         *    outgoingCall = call;

         * };

         *

         * outgoingCall.setJoin(true);

         */

        this.setJoin = function (join) {

            isJoin = join;

        };



        /**

         * Returns the button is a disabled or not

         * You may want to disable your buttons while waiting for a response.

         * Ex: this will prevent clicking multiple times for hold button until first hold response is not recieved

         *

         * @name fcs.call.OutgoingCall#getButtonDisabler

         * @function

         * @since 3.0.0

         * @returns {Boolean} buttonDisabler

         *

         * @example

         *

         * When an outgoing call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var outgoingCall = {};

         * fcs.call.onReceived = function(call) {

         *    outgoingCall = call;

         * };

         *

         * outgoingCall.getButtonDisabler();

         */

        this.getButtonDisabler = function() {

            return buttonDisabler;

        };



        /**

         * Clears the timer set with fcs.call.IncomingCall#setButtonDisabler.

         * You may want to disable your buttons while waiting for a response.

         * Ex: this will prevent clicking multiple times for hold button until first hold response is not recieved

         *

         * @name fcs.call.OutgoingCall#clearBtnTimeout

         * @function

         * @since 3.0.0

         *

         * @example

         *

         * When an outgoing call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var outgoingCall = {};

         * fcs.call.onReceived = function(call) {

         *    outgoingCall = call;

         * };

         *

         * outgoingCall.clearBtnTimeout();

         */

        this.setButtonDisabler = function(disable) {

            buttonDisabler = disable;

            if(buttonDisabler) {

                btnTimeout = setTimeout( function() {

                    buttonDisabler = false;

                },

                4000 );

            }

        };



        /**

         * Clears the timer set with fcs.call.IncomingCall#setButtonDisabler.

         * You may want to disable your buttons while waiting for a response.

         * Ex: this will prevent clicking multiple times for hold button until first hold response is not recieved

         *

         * @name fcs.call.OutgoingCall#clearBtnTimeout

         * @function

         * @since 3.0.0

         *

         * @example

         *

         * When an outgoing call is received, {@link fcs.call.event:onReceived} handler will be invoked.

         *

         * var outgoingCall = {};

         * fcs.call.onReceived = function(call) {

         *    outgoingCall = call;

         * };

         *

         * outgoingcall.clearBtnTimeout();

         */

        this.clearBtnTimeout = function() {

            clearTimeout(btnTimeout);

        };



        /**

        * Long call audit

        * Creates a timer after call is established.

        * This timer sends a "PUT" request to server.

        * This will continue until one request fails.

        * Handled by framework. You dont need to call this function

        *

        * @name fcs.call.OutgoingCall#setAuditTimer

        * @function

        * @since 3.0.0

        *

        * @example

        *

        * When an incoming call is received, {@link fcs.call.event:onReceived} handler will be invoked.

        * incomingCall.setAuditTimer(audit);

        */

        this.setAuditTimer = function (audit) {

            auditTimer = setInterval(function() {

                audit();

            },

            fcsConfig.callAuditTimer ? fcsConfig.callAuditTimer:30000);

        };





        /**

        * Clears the long call audit prior to clearing all call resources.

        * Handled by framework. you dont need to call this function

        *

        * @name fcs.call.OutgoingCall#clearAuditTimer

        * @function

        * @since 3.0.0

        *

        * @example

        *

        * When an outgoing call is received, {@link fcs.call.event:onReceived} handler will be invoked.

        */

        this.clearAuditTimer = function() {

            clearInterval(auditTimer);

        };



        this.isCallMuted = function(id) {

            return callManager.isCallMuted(id);

        };

    };



    this.OutgoingCall.prototype = new this.Call();



};



CallTrigger.prototype = new Call();

fcs.call = new CallTrigger();


/**
* Route Management facilities.
* 
* @name routes
* @namespace
* @memberOf fcs
* 
* @version 3.0.0
* @since 3.0.0
* 
*/
var RouteManagement = function() {

   /**
    * @name Entry
    * @class
    * @memberOf fcs.routes
    * @version 3.0.0
    * @since 3.0.0
    */
   this.Entry = function(){};
   
    /**
    * Name of route.
    *
    * @name fcs.routes.Entry#name
    * @field
    * @type {String}
    * @since 3.0.0
    */

    /**
    * Status of route.
    *
    * @name fcs.routes.Entry#status
    * @field
    * @type {Boolean}
    * @since 3.0.0
    */
   
   /**
    * Retrieves the list of routes associated with the user.
    *
    * @name fcs.routes.retrieve
    * @function
    * @param {function} onSuccess({Array.<String>}) The onSuccess() callback to be called
    * @param {function} onFailure The onFailure({@link fcs.Errors}) callback to be called
    * @since 3.0.0
    * @example
    * var onSuccess = function(data){
    *    //do something here
    * };
    * var onError = function (err) {
    *   //do something here
    * };
    * 
    * fcs.routes.retrieve(onSuccess, onError);
    */   

   /**
    * Activate the route(s) associated with the user.
    *
    * @name fcs.routes.activate
    * @function
    * @param {Array.<String>} routeList The list of routes to be modified    
    * @param {function} onSuccess The onSuccess() callback to be called
    * @param {function} onFailure The onFailure({@link fcs.Errors}) callback to be called
    * @since 3.0.0
    * @example
    * var onSuccess = function(){
    *    //do something here
    * };
    * var onError = function (err) {
    *   //do something here
    * };
    * 
    * fcs.routes.activate(["Route1","Route2"], onSuccess, onError);
    */  
   
   /**
    * Deactivate the route(s) associated with the user.
    *
    * @name fcs.routes.deactivate
    * @function
    * @param {Array.<String>} routeList The list of routes to be modified    
    * @param {function} onSuccess The onSuccess() callback to be called
    * @param {function} onFailure The onFailure({@link fcs.Errors}) callback to be called
    * @since 3.0.0
    * @example
    * var onSuccess = function(){
    *    //do something here
    * };
    * var onError = function (err) {
    *   //do something here
    * };
    * 
    * fcs.routes.deactivate(["Route1","Route2"], onSuccess, onError);
    */     
   
   /**
    * Reorder the route(s) associated with the user.
    *
    * @name fcs.routes.reorder
    * @function
    * @param {string[]} routeList The list of routes to be modified    
    * @param {function} onSuccess The onSuccess({Array.<String>}) callback to be called
    * @param {function} onFailure The onFailure({@link fcs.Errors}) callback to be called
    * @since 3.0.0
    * @example
    * var onSuccess = function(){
    *    //do something here
    * };
    * var onError = function (err) {
    *   //do something here
    * };
    * 
    * fcs.routes.reorder(["Route1","Route2"], onSuccess, onError);
    */       
};
var RouteManagementImpl = function() {

    var routeManagementUrl = "/routelist";

    function parseResponse(routeListData) {
        var receivedRouteList = [], items, params, entry, i;
        if(routeListData && routeListData.routeResponse){
            items = routeListData.routeResponse.routeList;
           // receivedRouteList = utils.getProperty(routeListData.routeResponse, 'routeList'); 
            
        if(items){
            for(i=0; i < items.length;i++){
                params =items[i];
                entry = new fcs.routes.Entry();
                entry.name = utils.getProperty(params, 'name');
                entry.status = utils.getProperty(params, 'status');
                receivedRouteList.push(entry);
            }
        }    
        }
        return receivedRouteList;
    }

    this.retrieve = function(onSuccess, onFailure) {

        server.sendGetRequest({
                        "url": getWAMUrl(1, routeManagementUrl)
                    },
                    onSuccess,
                    onFailure,
                    parseResponse
        );
    };

    function makeRequest(routeList, onSuccess, onFailure, action) {
        var data = {routeRequest:{"routeList": routeList, "action": action}};
        server.sendPutRequest({
            "url": getWAMUrl(1, routeManagementUrl),
            "data": data
        }, onSuccess, onFailure);
    }

    this.activate = function(routeList, onSuccess, onFailure) {
        makeRequest(routeList, onSuccess, onFailure, "activate");
    };


    this.deactivate = function(routeList, onSuccess, onFailure) {
        makeRequest(routeList, onSuccess, onFailure, "deactivate");
    };


    this.reorder = function(routeList, onSuccess, onFailure) {
        makeRequest(routeList, onSuccess, onFailure, "reorder");
    };

};

RouteManagementImpl.prototype = new RouteManagement();

fcs.routes = new RouteManagementImpl();

/**
 * User profile data resources.
 * 
 * @name userprofile
 * @namespace
 * @memberOf fcs
 * 
 * @version 3.0.0
 * @since 3.0.0
 * 
 */
var UserProfileData = function() {

   /**
    * Retrieves the user profile.
    *
    * @name fcs.userprofile.retrieve
    * @function
    * @param {function} onSuccess The onSuccess({@link fcs.userprofile.UserProfile}) callback to be called
    * @param {function} onFailure The onFailure({@link fcs.MediaErrors}) callback to be called
    * @since 3.0.0
    * @example
    * var onSuccess = function(data){
    *    //do something here
    * };
    * var onError = function (err) {
    *   //do something here
    * };
    * 
    * fcs.userprofile.retrieve(onSuccess, onError);
    */   


   /**
    * User Profile
    * 
    * @name UserProfile
    * @class
    * @memberOf fcs.userprofile
    * @version 3.0.0
    * @since 3.0.0
    */

    this.UserProfile = function() {
       /**
        * User's first name.
        * 
        * @name fcs.userprofile.UserProfile#firstName
        * @field
        * @type {string}
        * @since 3.0.0
        */

       /**
        * User's last name.
        * 
        * @name fcs.userprofile.UserProfile#lastName
        * @field
        * @type {string}
        * @since 3.0.0
        */

       /**
        * User's photo URL.
        * 
        * @name fcs.userprofile.UserProfile#photo
        * @field
        * @type {string}
        * @since 3.0.0
        */

       /**
        * User's home phone number.
        * 
        * @name fcs.userprofile.UserProfile#homePhone
        * @field
        * @type {string}
        * @since 3.0.0
        */

       /**
        * User's business phone number.
        * 
        * @name fcs.userprofile.UserProfile#workPhone
        * @field
        * @type {string}
        * @since 3.0.0
        */

       /**
        * User's mobile phone number.
        * 
        * @name fcs.userprofile.UserProfile#mobilePhone
        * @field
        * @type {string}
        * @since 3.0.0
        */

       /**
        * User's email address.
        * 
        * @name fcs.userprofile.UserProfile#emailAddress
        * @field
        * @type {string}
        * @since 3.0.0
        */

       /**
        * User's conference code.
        * 
        * @name fcs.userprofile.UserProfile#accessCode
        * @field
        * @type {string}
        * @since 3.0.0
        */

       /**
        * User's moderator code.
        * 
        * @name fcs.userprofile.UserProfile#modCode
        * @field
        * @type {string}
        * @since 3.0.0
        */
       
       /**
        * User's collaboration url.
        * 
        * @name fcs.userprofile.UserProfile#collabUrl
        * @field
        * @type {string}
        * @since 3.0.0
        */
       
        /**
        * The list of conference bridge numbers.
        * 
        * @name fcs.userprofile.UserProfile#confBridgeNumList
        * @field
        * @type {string[]}
        * @since 3.0.0
        */

        /**
        * Voice mail access numbers.
        * 
        * @name fcs.userprofile.UserProfile#voicemailAccessNumbers
        * @field
        * @type {string}
        * @since 3.0.0
        */

        /**
        * Voice mail user id.
        * 
        * @name fcs.userprofile.UserProfile#voicemailUserId
        * @field
        * @type {string}
        * @since 3.0.0
        */
       
        /**
        * Status codes for User Profile Data response.<br />
        * 
        * "0" - SUCCESSFUL.<br />
        * "2" - INSUFFICIENT_INFO.<br />
        * "4" - AUTHORIZATION_FAILURE.<br />
        * "35" - SERVICE_NOT_AUTHORIZED.<br />
        * "37" - INVALID_PARAMETER_VALUE.<br />
        * "26" - Internal server error.<br />
        * 
        * @name fcs.userprofile.UserProfile#statusCode
        * @field
        * @type {string}
        * @since 3.0.0
        */
    };

};

var UserProfileDataImpl = function() {

    var userProfileDataUrl = "/userProfileData";

    function parseResponse(userProfileReceived) {
        var userProfileItem, params;
        if(userProfileReceived && userProfileReceived.userProfileData){
            params = userProfileReceived.userProfileData;
            
            userProfileItem = new fcs.userprofile.UserProfile();

            userProfileItem.photo = utils.getProperty(params, 'photoURL');
            userProfileItem.homePhone = utils.getProperty(params, 'homePhone');
            userProfileItem.workPhone = utils.getProperty(params, 'workPhone');
            userProfileItem.mobilePhone = utils.getProperty(params, 'mobilePhone');
            userProfileItem.emailAddress = utils.getProperty(params, 'emailAddress');
            userProfileItem.voicemailAccessNumbers = "voicemail@"+fcs.getUser().split('@')[1];
            userProfileItem.voicemailUserId = utils.getProperty(params, 'vmailUserId');
            userProfileItem.confBridgeNumList = utils.getProperty(params, 'confBridgeNumList');
            userProfileItem.accessCode = utils.getProperty(params, 'accessCode');
            userProfileItem.modCode = utils.getProperty(params, 'modCode');
            userProfileItem.collabUrl = getAbsolutePath() +"collab/" + fcs.getUser();
            userProfileItem.firstName = utils.getProperty(params, 'firstName');
            userProfileItem.lastName = utils.getProperty(params, 'lastName');
            userProfileItem.assignedService = utils.getProperty(params, 'assignedService');
            userProfileItem.confServer = utils.getProperty(params, 'confServer');
            userProfileItem.statusCode = utils.getProperty(params, 'statusCode');
        }

        return userProfileItem;
    }

    this.retrieve = function(onSuccess, onFailure) {

        server.sendGetRequest({
                        "url":getWAMUrl(1, userProfileDataUrl)
                    },
                    onSuccess,
                    onFailure,
                    parseResponse
        );
    };

};

UserProfileDataImpl.prototype = new UserProfileData();

fcs.userprofile = new UserProfileDataImpl();

/**

* Handles sending/receiving of instant messages (IM).

* 

* @name im

* @namespace

* @memberOf fcs

* 

* @version 3.0.0

* @since 3.0.0

*/

var IM = function() {

   /**

    * Sends an IM to the specified user.

    *

    * @name fcs.im.send

    * @function

    * @param {fcs.im.Message} message The message to send 

    * @param {function} onSuccess The onSuccess() callback to be called

    * @param {function} onFailure The onFailure({@link fcs.Errors}) callback to be called

    * @param {function} imResponseFailureHandler The callback to be called if IM response fails

    * @since 3.0.0

    * @example

    * var im = new fcs.im.Message();

    * im.primaryContact = "user1@genband.com";

    * im.type = "A2";

    * im.msgText = text;

    * im.charset = "UTF-8";

    * 

    * var onSuccess = function(){

    *   console.log("The IM for " + primaryContact + " is sent successfully!");

    * };

    * var onError = function (err) {

    *   console.log("An error occured: " + err);

    * };

    * 

    * fcs.im.send(im, onSuccess, onError);

    */

   

   /**

    * Called on receipt of an instant message

    *

    * @name fcs.im.onReceived

    * @event

    * @param {fcs.im.Message} im Message received

    * @since 3.0.0

    * @example 

    * var messageReceived = function(msg){

    *    var from = msg.primaryContact;

    *    var messageContent = msg.msgText;

    *    console.log("A new IM received from: " + msg.primaryContact + " > " + messageContent);

    *    

    * };

    * 

    * fcs.im.onReceived = messageReceived;

    */

   

   /**

     * Response handler of removing IM

     * 

     * @name fcs.im.removeImResponseHandler

     * @function

     * @param {type} callId callId to be removed

     * @since 3.0.0

     */

    

    /**

     * Response handler of getting IM

     * 

     * @name fcs.im.getImResponseHandler

     * @function

     * @param {type} callId callId to be selected

     * @since 3.0.0

     */

    

    /**

     * Response handlers of getting IM

     * 

     * @name fcs.im.getImResponseHandlers

     * @function

     * @since 3.0.0

     */

   

   /**

    * @name Message

    * @class

    * @memberOf fcs.im

    * @version 3.0.0

    * @since 3.0.0

    */

   this.Message = function(){};

   /**

    * The fullName is a string used to identify name of primaryContact

    * 

    * @name fcs.im.Message#fullName

    * @field

    * @type {String}

    * @since 3.0.0

    */



    /**

    * The type is a string used to identify the receiving client type such as ��SA2���,���Facebook���. 

    * Only ��SA2��� is supported for SPiDR 1.0.

    * 

    * @name fcs.im.Message#type

    * @field

    * @type {String}

    * @since 3.0.0

    */

   

   /**

    * The msgText is a string used to identify the message content which will be send to target client.

    * 

    * @name fcs.im.Message#msgText

    * @field

    * @type {String}

    * @since 3.0.0

    */

   

   /**

    * The charset is a string used to identify character set type of the message.

    * 

    * @name fcs.im.Message#charset

    * @field

    * @type {String}

    * @since 3.0.0

    */

   

   /**

    * The primaryContact is a string used to identify target client which will receive the IM.

    * 

    * @name fcs.im.Message#primaryContact

    * @field

    * @type {String}

    * @since 3.0.0

    */

   

   /**

    * The chatroom is a string used to identify target chat room which will receive the IM.

    * 

    * @name fcs.im.Message#chatroom

    * @field

    * @type {String}

    * @since 3.0.0

    */

};


var chatRooms = {};

var IMImpl = function() {

    this.onReceived = null;



    var imResponseHandlers = {}, logger = fcs.logManager.getLogger("imService");



    this.getImResponseHandlers = function() {

        return imResponseHandlers;

    };



    this.getImResponseHandler = function(callId) {

        if (callId) {

            return imResponseHandlers[callId];

        }

        return null;

    };



    function registerImResponseHandler(callId, failureHandler) {

        if (callId) {

            imResponseHandlers[callId] = {

                "failureHandler": failureHandler

            };

        }

    }



    this.removeImResponseHandler = function(callId) {

        if (callId && imResponseHandlers[callId]) {

            delete imResponseHandlers[callId];

        }

    };



    function getChatRoomIMTemplate(){

        return {type : "A2", charset : "UTF-8", primaryContact : "chat@" + getDomain()};

        }



    function parseImSendResponse(result){

        if(result && result.imResponse && result.imResponse.messageId){

            return result.imResponse.messageId;

        }

    }



    function send(im, onSuccess, onFailure, imResponseFailureHandler) {

        var data = {

            "imRequest": {

                "toUrl":im.primaryContact,

                "type":im.type,

                "message":im.msgText,

                "charset":im.charset

            }

        }, chatroom;



        if(im.chatroom){

            chatroom = chatRooms[im.chatroom];

            if(chatroom && chatroom.masSId){

                data.imRequest.chatSession = chatroom.masSId;

            }

        }



        if(im.xntservice){

            data.imRequest.conversation = im.xntservice;

        }



        logger.info("IM -->  SENT : ", {IM_SENT: data});



        server.sendPostRequest({

                        "url":getWAMUrl(1, "/instantmessage"),

                        "data":data

                    },

                    function (callId) {

                        if (imResponseFailureHandler) {

                            registerImResponseHandler(callId, imResponseFailureHandler ? imResponseFailureHandler : null);

                        }

                        utils.callFunctionIfExist(onSuccess, callId);

                    },

                    onFailure,

                    parseImSendResponse

                );

    }



    this.chatroom = {

        //chatroom need to start with letter

        create: function(chatroomId, onSuccess, onFailure) {

            var im = getChatRoomIMTemplate();

            im.msgText = "/room " + chatroomId;



            send(im, function(data) {

                if (data) {

                    chatRooms[chatroomId] = {transactionId : data, createSuccess : onSuccess};

                } else {

                    utils.callFunctionIfExist(onFailure);

                }

            }, onFailure);

        },



        getRooms: function(chatroomId, onSuccess, onFailure) {

            var im = getChatRoomIMTemplate();

            im.msgText = "/rooms";



            send(im, function(data) {

                if (data) {

                    chatRooms[chatroomId] = {transactionId: data, createSuccess: onSuccess};

                } else {

                    utils.callFunctionIfExist(onFailure);

                }

            }, onFailure);

        },



        join: function(chatroomId, onSuccess, onFailure) {

            this.getRooms(chatroomId, function() {

                            var im = getChatRoomIMTemplate(), chatroom = chatRooms[chatroomId];

                            im.msgText = "/go " + chatroomId;

                            im.chatroom = chatroomId;

                            send(im, onSuccess(chatroomId), onFailure);

                        },

                        onFailure);

        },



        inviteUsers: function(chatroomId, users, onSuccess, onFailure) {

            var im, chatroom = chatRooms[chatroomId];

            if (chatroom && chatroom.masSId) {

                im = getChatRoomIMTemplate();

                im.msgText = "/invite " + users.join(" ");

                im.chatSession = chatroom.masSId;

                im.chatroom = chatroomId;

                send(im, onSuccess, onFailure);

            } else {

                utils.callFunctionIfExist(onFailure);

            }

        },



        getParticipants: function(onSuccess, onFailure) {

            //TODO test this

            var im = getChatRoomIMTemplate();

            im.msgText = "/who";

            send(im, onSuccess, onFailure);

        },



        //TODO: kick participant from the converastion (im send)

        kickParticipant: function(chatroomId, participant,onSuccess, onFailure, synchronous){

            var im = getChatRoomIMTemplate(),

                    chatroom = chatRooms[chatroomId];

            im.chatSession = chatroom.masSId;

            im.chatroom = chatroomId;

            im.msgText = "/kick "+participant;

            send(im, onSuccess, onFailure, synchronous);

        },



        leave: function(chatroomId, onSuccess, onFailure, synchronous) {

            var im = getChatRoomIMTemplate();

            im.msgText = "/bye";

            im.chatroom = chatroomId;

            send(im, utils.callFunctionIfExist(onSuccess, chatroomId), onFailure, synchronous);

        }

    };



    this.send = send;



};



IMImpl.prototype = new IM();

fcs.im = new IMImpl();



NotificationCallBacks.IM = function(data) {

    // disabling the notifications for verizon demo

    fcs.logManager.getLogger("imService").info("IM received : ", {IM_RECEIVED: data});

    if (!fcs.notification.isAnonymous()) {

        var im = new fcs.im.Message(),

                 imParams = data.imnotificationParams,

                 tempContact,

                 trimUserDomain,

                 pattern = "",

                 parser,

                 chatroomId,

                 participant,

                 init,

                 fin,

                 pMatch,

                 hasJoinIndex,                 

                 hasInvitedIndex,

                 hasGoodbyeIndex,

                 hasLeftIndex,

                 remoteConversationID=utils.getProperty(imParams, 'conversation'),

                 index;



        //TODO: find related conversation then bind  IM 2 it

        im.type = utils.getProperty(imParams, 'type');

        im.msgText = utils.getProperty(imParams, 'msgText');

        im.charset = utils.getProperty(imParams, 'charset');

        im.fullName = utils.getProperty(imParams, 'fullName');

        if(remoteConversationID){

            im.remoteConversationId =  remoteConversationID.split("convid=")[1].split(",")[0];

        }

     

        if(im.msgText.indexOf("room created.Welcome to")> -1){

            for (chatroomId in chatRooms) {

                if (chatRooms.hasOwnProperty(chatroomId)) {

                    if (chatRooms[chatroomId].masSId === imParams.remoteParty.split("x-nt-mas-sid=")[1]) {

                        conversationEvent.onChatRoomCreatedEvent(chatroomId);

                        return;

                    }

                }

            }

        }

        if (imParams.primaryContact.indexOf("sip:chat@")>-1) {

            index=im.msgText.indexOf(':');                    

            parser =[im.msgText.slice(0,index),im.msgText.slice(index+1)];

            

            pattern = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;



            pMatch = pattern.test(parser[0]);

            hasJoinIndex  = im.msgText.indexOf("has joined");

            

            hasLeftIndex = im.msgText.indexOf("has left");



            hasInvitedIndex =im.msgText.indexOf("has invited");

            

            hasGoodbyeIndex = im.msgText.indexOf("Goodbye.");



            if (hasJoinIndex === -1 && hasInvitedIndex === -1 && 

                    hasLeftIndex === -1 && hasGoodbyeIndex === -1 && !pMatch){

                return;

            }



            if (hasGoodbyeIndex > -1) {

                for (chatroomId in chatRooms) {

                    if (chatRooms.hasOwnProperty(chatroomId)) {

                        if (chatRooms[chatroomId].masSId === imParams.remoteParty.split("x-nt-mas-sid=")[1]) {

                            delete chatRooms[chatroomId];

                             conversationEvent.onChatRoomEndedEvent(chatroomId);

                        }

                    }

                }

                return;

            }



            if (hasJoinIndex> -1 || hasLeftIndex > -1) {

                init = im.msgText.indexOf('(');

                fin = im.msgText.indexOf(')');

                participant = im.msgText.substr(init + 1, fin - init - 1);

                for (chatroomId in chatRooms) {

                    if (chatRooms.hasOwnProperty(chatroomId)) {

                        if (chatRooms[chatroomId].masSId === imParams.remoteParty.split("x-nt-mas-sid=")[1]) {

                            if (hasJoinIndex > -1) {

                                conversationEvent.onChatRoomJoinEvent(chatroomId, participant);

                                break;

                            } else if (hasLeftIndex > -1) {

                                conversationEvent.onChatRoomLeaveEvent(chatroomId, participant);

                                break;

                            }   

                        }

                    }

                }

                return;

            }



           if (hasInvitedIndex > -1) {

//                invitedChatRoom = im.msgText.match(/"[\w\W]*?"/g)[1].replace(/"/g, "");

//                chatRooms[invitedChatRoom] = {masSId : imParams.remoteParty.split("x-nt-mas-sid=")[1]};

                return;

            }



            if (pMatch) {

                im.primaryContact = parser[0];

                im.msgText = parser[1];

                for (chatroomId in chatRooms) {

                    if (chatRooms.hasOwnProperty(chatroomId)) {

                        if (chatRooms[chatroomId].masSId === imParams.remoteParty.split("x-nt-mas-sid=")[1]) {

                            im.chatroom= chatroomId;

                            break;

                        }

                    }

                }

            }

        }

        else {

            tempContact = utils.getProperty(imParams, 'primaryContact');

            if (tempContact.indexOf("sip:") !== -1) {

                tempContact = tempContact.substring(4, tempContact.length);

            }



            trimUserDomain = tempContact.indexOf(";user=phone");

            if (trimUserDomain !== -1) {

                tempContact = tempContact.substr(0, trimUserDomain);

            }

            im.primaryContact = tempContact;

        }



        utils.callFunctionIfExist(fcs.im.onReceived, im);

    }

};



NotificationCallBacks.IMResponse = function(data){

    var imResponseParams, responseCode, chatroomId, response = {}, chatroom, handler, 

            logger = fcs.logManager.getLogger("imService");



    if (data) {

        imResponseParams = data.imresponseNotificationParams;



        if (!imResponseParams) {

            return;

        }

    } else {

        return;

    }



    logger.info("IMResponse received : ", {IM_RESPONSE: data});



    responseCode = imResponseParams.responseCode;



    //Handle Response from chatroom

    if (imResponseParams.userName === "chat@" + getDomain()) {



        if(imResponseParams.error){

            return;

        }



        for (chatroomId in chatRooms) {

            if (chatRooms.hasOwnProperty(chatroomId)) {

                chatroom = chatRooms[chatroomId];

                if (chatroom && chatroom.transactionId === imResponseParams.callid) {

                    chatroom.masSId = imResponseParams.remoteParty.split("x-nt-mas-sid=")[1];



                    delete chatroom.transactionId;



                    utils.callFunctionIfExist(chatroom.createSuccess, chatroomId);

                }

            }

        }

    }

    if(responseCode==="200" || responseCode === undefined){

        return;

    }

    else if (responseCode==="") {

        responseCode="480";

    }

    else if (responseCode >= "400") {

        handler = fcs.im.getImResponseHandler(imResponseParams.callid);

        if (handler) {

            switch(responseCode) {

                case "404":

                case "480":

                case "407":

                case "408":

                case "504":

                    break;

                default:

                    utils.callFunctionIfExist(handler.failureHandler, imResponseParams.userName);

                    break;

            }

            fcs.im.removeImResponseHandler(imResponseParams.callid);

        }

    }

    response.id = imResponseParams.callid;

    response.userName = imResponseParams.userName;

    response.error = responseCode;



    utils.callFunctionIfExist(fcs.im.onReceived, response);

};




/**
* Handles receiving of custom messages (Custom).
* 
* @name custom
* @namespace
* @memberOf fcs
* 
* @version 3.0.0
* @since 3.0.0
*/
var Custom = function() {
      
   /**
    * Called on receipt of an instant message
    *
    * @name fcs.custom.onReceived
    * @event
    * @param {fcs.custom.Message} custom Message received
    * @since 3.0.0
    * @example 
    * var messageReceived = function(msg){
    *    // do something here
    * };
    * 
    * fcs.custom.onReceived = messageReceived;
    */
      
};

var CustomImpl = function() {
    this.onReceived = null;
};

CustomImpl.prototype = new Custom();
fcs.custom = new CustomImpl();

NotificationCallBacks.custom = function(data) {
    utils.callFunctionIfExist(fcs.custom.onReceived, data);
};
var NotificationImpl = function() {



    var SUBSCRIPTION_URL = "/subscription",

        CONNECTION_URL = "/rest/version/latest/isAlive",

    SUBSCRITION_KEYS_FOR_ASSIGNED_SERVICES = {

        "CallControl": "call",

        "call" : "call",

        "IM": "IM",

        "Presence": "Presence",

        "custom": "custom",

        "callMe": "callMe",

        "Conversation": "conversation",

        "conversation": "conversation"

    },

    DEFAULT_SERVICES = [SUBSCRITION_KEYS_FOR_ASSIGNED_SERVICES.IM,

                        SUBSCRITION_KEYS_FOR_ASSIGNED_SERVICES.Presence,

                        SUBSCRITION_KEYS_FOR_ASSIGNED_SERVICES.CallControl],

    DEFAULT_ANONYMOUS_SERVICES = [SUBSCRITION_KEYS_FOR_ASSIGNED_SERVICES.callMe],

    DEFAULT_SUBSCRIPTION_EXPIRY_VALUE = 3600;



    function getNotificationType() {

        // if SNMP is set return specific data to be sent to the server

        if(fcsConfig.notificationType === fcs.notification.NotificationTypes.WEBSOCKET && window.WebSocket){

            return {

                notificationType: "WebSocket",

                clientIp: fcsConfig.clientIp

            };

        }

        else {

            fcsConfig.notificationType = "longpolling";

            return {

                notificationType: "LongPolling",

                pollingTimer: fcsConfig.polling

            };

        }

    }



    function composeServicesToSubscribeFromAssignedServices(assignedServices) {

        var i, services = [];

        for (i in SUBSCRITION_KEYS_FOR_ASSIGNED_SERVICES) {

            if (SUBSCRITION_KEYS_FOR_ASSIGNED_SERVICES.hasOwnProperty(i)) {

                if (assignedServices.indexOf(i) !== -1) {

                    services.push(SUBSCRITION_KEYS_FOR_ASSIGNED_SERVICES[i]);

                }

            }

        }



        return services;

    }



    function composeSubscribeRequestData(forceLogout) {

        var notificationTypeData = getNotificationType(),

        i,

        subscribeRequest;

        

        if (fcs.notification.isAnonymous()) {

            if (!fcsConfig.anonymousServices) {

                fcsConfig.anonymousServices = DEFAULT_ANONYMOUS_SERVICES;

            }

        }

        else {

            if (!fcsConfig.services) {

                fcsConfig.services = DEFAULT_SERVICES;

            }

        }

        

        subscribeRequest = {

            "expires": Math.floor(fcsConfig.expires),

            "service": fcs.notification.isAnonymous() ? composeServicesToSubscribeFromAssignedServices(fcsConfig.anonymousServices) : composeServicesToSubscribeFromAssignedServices(fcsConfig.services),

            "localization": "English_US"                        

        };

        

        if (forceLogout === true) {

            subscribeRequest.forceLogOut = "true";

        }

        

        for (i in notificationTypeData) {

            if(notificationTypeData.hasOwnProperty(i)) {

                subscribeRequest[i] = notificationTypeData[i];

            }

        }



        return subscribeRequest;

    }



    this.extendSubscription = function(subscriptionURL, onSuccess, onFailure) {

        if (fcsConfig.expires === 0) {

            fcsConfig.expires = DEFAULT_SUBSCRIPTION_EXPIRY_VALUE;

        }



        server.sendPutRequest(

            {

                url: getUrl() + subscriptionURL,

                data: {"subscribeRequest": composeSubscribeRequestData()}

            },

            function(data) {

                var response = data.subscribeResponse, params = response.subscriptionParams;

                onSuccess(params.notificationChannel, params.assignedService, params.service);

            },

            onFailure

            );

    };



    this.retrieveNotification = function(notificationChannelURL, onSuccess, onFailure) {

        return server.sendGetRequest(

            {

                url: getUrl() + notificationChannelURL

            },

            function(data){

                var type = null, notificationMessage;

                if(data !== null){

                    notificationMessage = data.notificationMessage;

                    if(notificationMessage){

                        type = notificationMessage.eventType;

                    }

                }

                onSuccess(type, notificationMessage);

            }

            ,

            onFailure

            );

    };



    this.subscribe = function(onSuccess, onFailure ,forceLogout, token) {

        fcsConfig.expires = DEFAULT_SUBSCRIPTION_EXPIRY_VALUE;

        server.sendPostRequest(

        {

            url: getWAMUrl(1, SUBSCRIPTION_URL),

            data: {"subscribeRequest": composeSubscribeRequestData(forceLogout)}

        },

        function(data) {

            var response = data.subscribeResponse, params = response.subscriptionParams;

            onSuccess(response.subscription,

                params.notificationChannel,

                params.expires,

                params.pollingTimer,

                params.assignedService,

                params.service,

                params.sessionId);

        },

        onFailure, null, null, null, null, null, token

        );

    };



    this.deleteSubscription = function(subscriptionURL, onSuccess, onFailure, synchronous) {

        var parser, requestTimeout;

        server.sendDeleteRequest({

            url: getUrl() + subscriptionURL

        },

        onSuccess,

        onFailure,

        parser,

        requestTimeout,

        synchronous

        );

    };



};



NotificationImpl.prototype = new Notification();



NotificationCallBacks.gone = function(data) {

    notificationManager.onGoneNotificationReceived(data);

};
var NotificationManager = function() {

    var logger = logManager.getLogger("notificationManager"),

            SUBSCRIBEURL = 'SubscriptionUrl',

            NOTIFYURL = 'NotificationUrl',

            NOTIFYID = 'NotificationId',

            SUBSCRIBEEXPIRY = 'SubscriptionExpiry',

            SUBSCRIBEEXTENDINTERVAL = 'SubscriptionExtendInterval',

            USERNAME = 'USERNAME',

            SESSION = 'SESSION',

            NOTIFICATION_EVENTS_QUEUE_MAX_LENGTH = 50,

            NOTIFICATION_EVENTS_QUEUE_CLEARING_AUDIT_INTERVAL = 600,

            CHECK_CONNECTIVITY_INTERVAL = 10000,

            RESTART_SUBSCRIPTION_TIMEOUT = CHECK_CONNECTIVITY_INTERVAL + 1000,

            notificationRetry = 4000,

            WEBSOCKET_CONSTANTS = CONSTANTS.WEBSOCKET,

            notifier = null,

            webSocket = null,

            self = this,

            isAnonymous = false,

            service = new NotificationImpl(),

            // function to be invoked on failure (must be set by the user)

            onNotificationFailure = null,

            onNotificationSuccess = null,

            isNotificationFailureDetected = false,

            extendNotificationSubscription, notificationSuccess, notificationFailure,

            extendNotificationSubscriptionTimer = null,

            webSocketConnect,

            onConnectionLost,

            onConnectionEstablished,

            triggeredFetch = false,

            onSubscriptionSuccess = null,

            onSubscriptionFailure = null,

            notificationEventsQueue = [],

            notificationEventsQueueClearingAuditTimer,

            notificationCachePrefix = "",

            startNotificationTimerAfterConnectionReEstablished,

            restartSubscriptionTimer,

            notificationFailureRestartSubscriptionTimeout,

            lastLongpollingRequest = null,

            originalNotificationType = null,

            token = null,

            session = null;

    

    function onTokenAuth(data){

        token = data.token;

    }

    

    function cancelLastLongpollingRequest() {

        if (lastLongpollingRequest) {

            logger.trace("aborting last long polling request.");

            lastLongpollingRequest.abort();

            lastLongpollingRequest = null;

        }

    }

    

    function onTokenOrSessionError(){

        notifier = null;

        triggeredFetch = false;



        cache.removeItem(notificationCachePrefix + NOTIFYURL);

        cache.removeItem(notificationCachePrefix + NOTIFYID);

        cache.removeItem(notificationCachePrefix + SUBSCRIBEURL);

        cache.removeItem(notificationCachePrefix + SUBSCRIBEEXPIRY);

        cache.removeItem(notificationCachePrefix + SUBSCRIBEEXTENDINTERVAL);

        cache.removeItem(notificationCachePrefix + SESSION);

        this.onGoneNotificationReceived();

        cancelLastLongpollingRequest();

    }

   

    function publishDeviceSubscriptionStartedMessage(message) {

        globalBroadcaster.publish(CONSTANTS.EVENT.DEVICE_SUBSCRIPTION_STARTED, message);

    }



    function publishDeviceSubscriptionEndedMessage() {

        globalBroadcaster.publish(CONSTANTS.EVENT.DEVICE_SUBSCRIPTION_ENDED);

    }



    function notificationEventsQueueClearingAudit() {

        if (notificationEventsQueue.length > 0) {

            var eventIdtoRemove = notificationEventsQueue.shift();

            logger.info("notification events queue clearing audit timer has expired, removing first eventId: " + eventIdtoRemove);

        }

    }



    notificationEventsQueueClearingAuditTimer = setInterval(notificationEventsQueueClearingAudit, NOTIFICATION_EVENTS_QUEUE_CLEARING_AUDIT_INTERVAL * 1000);



    this.NotificationTypes = {

        LONGPOLLING: "longpolling",

        SNMP: "snmp",

        WEBSOCKET: "websocket"

    };



    this.isAnonymous = function() {

        return isAnonymous;

    };



    function getNotificationType() {



        var type;

        for (type in self.NotificationTypes) {

            if (self.NotificationTypes.hasOwnProperty(type)) {

                if (fcsConfig.notificationType === self.NotificationTypes[type]) {

                    return fcsConfig.notificationType;

                }

            }

        }



        return self.NotificationTypes.WEBSOCKET;

    }



    function isNotificationTypeLongPolling() {

        // If user set long polling return true

        return (getNotificationType() === self.NotificationTypes.LONGPOLLING);

    }



    function isNotificationTypeWebSocket() {

        // If user set websocket return true

        return window.WebSocket && (getNotificationType() === self.NotificationTypes.WEBSOCKET);

    }



    function stopRestartSubscriptionTimer() {

        clearTimeout(restartSubscriptionTimer);

        restartSubscriptionTimer = null;

    }



    function restartSubscription(toLP) {

        stopRestartSubscriptionTimer();

        restartSubscriptionTimer = setTimeout(function() {

            if (!fcs.isConnected()) {

                logger.debug("Connection is lost, no need to restart subscription...");

                return;

            }



            logger.debug("Restarting subscription...");

            if (toLP) {

                logger.debug("Switching to Long Polling notification...");

                fcsConfig.notificationType = self.NotificationTypes.LONGPOLLING;

            }



            self.start(onSubscriptionSuccess, onSubscriptionFailure, isAnonymous, undefined, undefined, true);



        }, RESTART_SUBSCRIPTION_TIMEOUT);

    }



    function isWebsocketOpened() {

        if (webSocket && webSocket.readyState === webSocket.OPEN) {

            return true;

        }

        return false;

    }



    function validateWebsocketUrl() {

        if (!isWebsocketOpened()) {

            return false;

        }



        if (!notifier) {

            return false;

        }



        if (!notifier.notificationUrl) {

            return false;

        }



        if (webSocket.url.indexOf(notifier.notificationUrl) === -1) {

            return false;

        }



        return true;

    }



    function websocketConnectionCheck() {

        if (isWebsocketOpened()) {

            webSocket.send("test");

        }

    }



    function fetchNotification() {

        if (notifier) {

            if (lastLongpollingRequest) {

                logger.info("longpolling request exists, no need to trigger new one.");

                return;

            }

            //Fetching Notification

            lastLongpollingRequest = service.retrieveNotification(notifier.notificationUrl, notificationSuccess, notificationFailure);

        }

        else {

            logger.error("notifier is undefined, cannot fetch notification");

        }

    }



    // Handles successfully fetched notification

    notificationSuccess = function(type, data) {

        var eventIdtoRemove;

        if (data && type) {

            logger.info("received notification event:" + type, data);

            if (notificationEventsQueue.indexOf(data.eventId) !== -1) {

                logger.info("previously received notification eventId: " + data.eventId + ", do not execute notification callback function.");

            }

            else {

                logger.info("newly received notification eventId: " + data.eventId);

                notificationEventsQueue.push(data.eventId);

                if (notificationEventsQueue.length === NOTIFICATION_EVENTS_QUEUE_MAX_LENGTH) {

                    eventIdtoRemove = notificationEventsQueue.shift();

                    logger.info("notification events queue is full, remove first eventId: " + eventIdtoRemove);

                }

                utils.callFunctionIfExist(NotificationCallBacks[type], data);

            }

        }



        // if 'Long polling' is used, fetch the notification

        if (isNotificationTypeLongPolling()) {

            lastLongpollingRequest = null;

            fetchNotification();

        }



        if (isNotificationFailureDetected) {

            isNotificationFailureDetected = false;

            utils.callFunctionIfExist(onNotificationSuccess);

        }



    };



    function stopNotificationFailureRestartSubscriptionTimeoutTimer() {

        clearTimeout(notificationFailureRestartSubscriptionTimeout);

        notificationFailureRestartSubscriptionTimeout = null;

    }



    // Handles fail fetched notification

    notificationFailure = function(error) {

        logger.error("received notification error:" + error);



        if (!fcs.isConnected()) {

            logger.debug("Connection is lost, no need to handle notification failure...");

            return;

        }



        isNotificationFailureDetected = true;



        // if 'Long polling' is used, fetch the notification

        if (isNotificationTypeLongPolling()) {

            stopNotificationFailureRestartSubscriptionTimeoutTimer();

            notificationFailureRestartSubscriptionTimeout = setTimeout(function() {

                restartSubscription();

            }, notificationRetry);

        }



        utils.callFunctionIfExist(onNotificationFailure, error);

    };



    function websocketDisconnect() {

        if (webSocket) {

            webSocket.onmessage = null;

            webSocket.onopen = null;

            webSocket.onclose = null;

            webSocket.onerror = null;

            if (webSocket.close) {

                webSocket.close();

            }

            webSocket = null;

        }

    }



    webSocketConnect = function(onSuccess, onFailure) {

        var protocolValue = WEBSOCKET_CONSTANTS.PROTOCOL.NONSECURE;



        function callOnSuccess(status) {

            logger.trace("websocket connection created successfully: " + status);

            if (typeof onSuccess === 'function') {

                onSuccess(status);

            }

        }



        function callOnFailure(status) {

            logger.trace("websocket connection failed: " + status);

            // this is just for clearing local web socket variable.

            websocketDisconnect();

            if (typeof onFailure === 'function') {

                onFailure(status);

            }

        }



        if (isWebsocketOpened()) {

            if (validateWebsocketUrl()) {

                logger.info("WebSocket is already opened, no need to open new one.");

                callOnSuccess(WEBSOCKET_CONSTANTS.STATUS.ALREADY_OPENED);

                return;

            }



            logger.error("websocket connection with invalid url is found!");

            websocketDisconnect();

        }

        else {

            // this is just for clearing local web socket variable.

            websocketDisconnect();

        }



        try {

            if (fcsConfig.websocketProtocol) {

                if (fcsConfig.websocketProtocol === WEBSOCKET_CONSTANTS.PROTOCOL.SECURE) {

                    protocolValue = WEBSOCKET_CONSTANTS.PROTOCOL.SECURE;

                }

            }

            webSocket = new window.WebSocket(protocolValue + "://" + (fcsConfig.websocketIP ? fcsConfig.websocketIP : window.location.hostname) + ":" + (fcsConfig.websocketPort ? fcsConfig.websocketPort : WEBSOCKET_CONSTANTS.DEFAULT_PORT) + notifier.notificationUrl);

        }

        catch (exception) {

            logger.error("WebSocket create error: ", exception);

            callOnFailure(WEBSOCKET_CONSTANTS.STATUS.CREATE_ERROR);

            return;

        }



        if (webSocket !== null) {

            webSocket.onmessage = function(event) {

                var data = JSON.parse(event.data), notificationMessage, type;

                if (data) {

                    //logger.info("WebSocket notification event data:" + data);

                    notificationMessage = data.notificationMessage;

                    //logger.info("WebSocket notification event notificationMessage:" + notificationMessage);

                    if (notificationMessage) {

                        type = notificationMessage.eventType;

                        notificationSuccess(type, notificationMessage);

                    }

                }

            };

            webSocket.onopen = function(event) {

                logger.info("WebSocket opened");

                callOnSuccess(WEBSOCKET_CONSTANTS.STATUS.OPENED);

            };

            webSocket.onclose = function(event) {

                logger.info("WebSocket closed");

                websocketDisconnect();

            };

            webSocket.onerror = function(event) {

                logger.error("Error on Web Socket connection.");

                callOnFailure(WEBSOCKET_CONSTANTS.STATUS.CONNECTION_ERROR);

            };

        }

        else {

            callOnFailure(WEBSOCKET_CONSTANTS.STATUS.NOT_FOUND);

        }

    };



     function onNotificationSubscriptionSuccess() {

        publishDeviceSubscriptionStartedMessage({"connectivity": {

                "handler": websocketConnectionCheck,

                "interval": CHECK_CONNECTIVITY_INTERVAL

            },

            "session": session,

            "notificationId": notifier ? notifier.notificationId : ""

         });

        if (onSubscriptionSuccess) {

            utils.callFunctionIfExist(onSubscriptionSuccess);

            onSubscriptionSuccess = null;

        }

    }



    function onDeviceSubscriptionFailure(err) {

        if (fcs.isConnected()) {

            utils.callFunctionIfExist(onSubscriptionFailure, err);

        }

    }



    function stopExtendNotificationSubscriptionTimer() {

        logger.info("extend notification subscription timer is stopped.");

        clearInterval(extendNotificationSubscriptionTimer);

        extendNotificationSubscriptionTimer = null;

    }

 

    // Subscribe for getting notifications

    function deviceSubscribe(forceLogout) {

        if (!fcs.isConnected()) {

            logger.debug("Connection is lost, no need to subscribe...");

            return;

        }



        logger.debug("Subscribing...");

        service.subscribe(function(subscribeUrl, notificationUrl, exp, poll, assignedService, servicesReceivingNotification, sessionId) {

            token = null;

            fcs.setServices(assignedService);

            fcsConfig.services = assignedService;

            fcsConfig.servicesReceivingNotification = servicesReceivingNotification;



            fcsConfig.polling = poll;

            fcsConfig.expires = exp;

            fcsConfig.extendInterval = exp / 2;

            notifier = {};

            notifier.subscribeUrl = subscribeUrl;

            notifier.notificationUrl = notificationUrl;

            notifier.notificationId = notificationUrl.substr(notificationUrl.lastIndexOf("/") + 1);

            stopExtendNotificationSubscriptionTimer();

            extendNotificationSubscriptionTimer = setInterval(extendNotificationSubscription, fcsConfig.extendInterval * 1000);

            cache.setItem(notificationCachePrefix + NOTIFYURL, notificationUrl);

            cache.setItem(notificationCachePrefix + NOTIFYID, notifier.notificationId);

            cache.setItem(notificationCachePrefix + SUBSCRIBEURL, subscribeUrl);

            cache.setItem(notificationCachePrefix + SUBSCRIBEEXPIRY, fcsConfig.expires);

            cache.setItem(notificationCachePrefix + SUBSCRIBEEXTENDINTERVAL, fcsConfig.extendInterval);

            cache.setItem(notificationCachePrefix + USERNAME, fcs.getUser());

            if (sessionId) {

                session = sessionId;

                cache.setItem(notificationCachePrefix + SESSION, session);

            }



            logger.debug("Subscription successfull - notifier: ", notifier);



            // if 'WebSocket' initialize else 'LongPolling' is used, fetch the notification

            if (isNotificationTypeWebSocket()) {

                webSocketConnect(function () {

                    originalNotificationType = self.NotificationTypes.WEBSOCKET;

                    cancelLastLongpollingRequest();

                    onNotificationSubscriptionSuccess();

                }, function() {

                    restartSubscription(true);

                });

            }

            else {

                originalNotificationType = self.NotificationTypes.LONGPOLLING;

                cancelLastLongpollingRequest();

                onNotificationSubscriptionSuccess();

                fetchNotification();

            }

        }, function(err) {

            logger.error("Subscription is failed - error: " + err);



            onDeviceSubscriptionFailure(err);

        },forceLogout, token);

    }



    function sendExtendSubscriptionRequest() {

        if (!fcs.isConnected()) {

            logger.debug("Connection is lost, no need to extend subscribe...");

            return;

        }



        logger.debug("Extending subscription... - notifier: ", notifier);

        service.extendSubscription(notifier.subscribeUrl, function(notificationChannel, assignedService, servicesReceivingNotification) {

            fcs.setServices(assignedService);

            fcsConfig.services = assignedService;

            fcsConfig.servicesReceivingNotification = servicesReceivingNotification;



            notifier.notificationUrl = notificationChannel;

            cache.setItem(notificationCachePrefix + NOTIFYURL, notificationChannel);



            //we tried to use precached subscription and it succeed start fetching notifications

            stopExtendNotificationSubscriptionTimer();

            extendNotificationSubscriptionTimer = setInterval(extendNotificationSubscription, fcsConfig.extendInterval * 1000);



            logger.debug("Extending subscription successful - notifier: ", notifier);



            // if 'WebSocket' initialize else 'LongPolling' is used, fetch the notification

            if (isNotificationTypeWebSocket()) {

                webSocketConnect(function() {

                    cancelLastLongpollingRequest();

                    onNotificationSubscriptionSuccess();

                }, function() {

                    restartSubscription(true);

                });

            }

            else {

                cancelLastLongpollingRequest();

                fetchNotification();

                onNotificationSubscriptionSuccess();

            }

        }, function(err) {

            logger.error("Extending subscription is failed - error: " + err);

            logger.error("Fail reusing existing subscription, re-subscribing.");

            cancelLastLongpollingRequest();

            deviceSubscribe();

        });

    }



    extendNotificationSubscription = function(onSuccess, onFailure, restarting) {

        if (!fcs.isConnected()) {

            logger.debug("Connection is lost, no need to extend subscribe...");

            return;

        }



        if (onSuccess) {

            onSubscriptionSuccess = onSuccess;

            onSubscriptionFailure = onFailure;

        }



         if (notifier) {

            if (!restarting) {

                if (originalNotificationType === self.NotificationTypes.WEBSOCKET

                        && isNotificationTypeLongPolling()) {

                    logger.trace("original notification type is websocket, try websocket connection again.");

                    notifier.notificationUrl.replace("/notification/", "/websocket/");

                    webSocketConnect(function() {

                        logger.trace("websocket connection created successfully, use websocket from now on.");

                        cache.setItem(notificationCachePrefix + NOTIFYURL, notifier.notificationUrl);

                        fcsConfig.notificationType = self.NotificationTypes.WEBSOCKET;

                        sendExtendSubscriptionRequest();

                    }, function() {

                        logger.trace("websocket connection failed, keep using long polling.");

                        notifier.notificationUrl.replace("/websocket/", "/notification/");

                        sendExtendSubscriptionRequest();

                    });

                }

                else {

                    sendExtendSubscriptionRequest();

                }

            }

            else {

                logger.trace("subscription restart is triggered...");

                sendExtendSubscriptionRequest();

            }

            

        }

        else {

            logger.debug("Cannot reuse existing subscription, re-subscribing.");

            deviceSubscribe();

        }

    };



    this.stop = function(onStopSuccess, onStopFailure, synchronous) {

        if (!fcs.isConnected()) {

            logger.debug("Connection is lost, no need to unsubscribe...");

            return;

        }



        logger.debug("Unsubscribing... - notifier: ", notifier);

        if (notifier) {

            service.deleteSubscription(notifier.subscribeUrl, function() {

                logger.debug("Unsubscription successfull");

                

                stopExtendNotificationSubscriptionTimer();

                publishDeviceSubscriptionEndedMessage();

                cancelLastLongpollingRequest();

                notifier = null;

                triggeredFetch = false;

                

                cache.removeItem(notificationCachePrefix + NOTIFYURL);

                cache.removeItem(notificationCachePrefix + NOTIFYID);

                cache.removeItem(notificationCachePrefix + SUBSCRIBEURL);

                cache.removeItem(notificationCachePrefix + SUBSCRIBEEXPIRY);

                cache.removeItem(notificationCachePrefix + SUBSCRIBEEXTENDINTERVAL);

                cache.removeItem(notificationCachePrefix + SESSION);

                if (typeof onStopSuccess === 'function') {

                    onStopSuccess();

                }

            }, function(err) {

                logger.error("Unsubscribe if failed - error:" + err);

                triggeredFetch = false;

                if (typeof onStopFailure === 'function') {

                    onStopFailure();

                }

            }, synchronous);

        }

        else {

            logger.error("notifier is unknown, cannot send unsubscribe request.");

            triggeredFetch = false;

            if (typeof onStopFailure === 'function') {

                onStopFailure();

            }

        }

    };



    function startNotification(onSuccess, onFailure, anonymous, cachePrefix ,forceLogout, restarting) {

        onSubscriptionSuccess = onSuccess;

        onSubscriptionFailure = onFailure;

        isAnonymous = anonymous;



        if (cachePrefix) {

            notificationCachePrefix = cachePrefix;

        }



        if (!fcs.isConnected()) {

            logger.debug("Connection is lost, no need to subscribe...");

            return;

        }





        logger.debug("start - notification subscription...");



        var nurl = cache.getItem(notificationCachePrefix + NOTIFYURL),

                nid = cache.getItem(notificationCachePrefix + NOTIFYID),

                surl = cache.getItem(notificationCachePrefix + SUBSCRIBEURL),

                exp = cache.getItem(notificationCachePrefix + SUBSCRIBEEXPIRY),

                extendInterval = cache.getItem(notificationCachePrefix + SUBSCRIBEEXTENDINTERVAL),

                user = cache.getItem(notificationCachePrefix + USERNAME);



        logger.debug("start - cached data - nurl: " + nurl +

                " nid: " + nid + " surl: " + surl +

                " exp: " + exp + " extendInterval: " + extendInterval +" user: " + user);



        if (nurl && nid && surl && exp && extendInterval && (fcs.getUser() === user)) {

            notifier = {};

            notifier.subscribeUrl = surl;

            notifier.notificationUrl = nurl;

            notifier.notificationId = nid;

            fcsConfig.expires = exp;

            fcsConfig.extendInterval = extendInterval;

            extendNotificationSubscription(undefined, undefined, restarting);

        }

        else {

            deviceSubscribe(forceLogout);

        }

    }



    this.start = startNotification;



    /**

     * Extending subscription and fetch the notifications

     *

     * @name fcs.notification.extend

     * @function

     */

    this.extend = startNotification;



    function stopStartNotificationTimerAfterConnectionReEstablishedTimer() {

        clearTimeout(startNotificationTimerAfterConnectionReEstablished);

        startNotificationTimerAfterConnectionReEstablished = null;

    }



    function handleConnectionEstablished() {

        var startNotificationTimeout;

        startNotificationTimeout = Math.random() * RESTART_SUBSCRIPTION_TIMEOUT;

        logger.info("starting notification after timeout: " + startNotificationTimeout);

        stopStartNotificationTimerAfterConnectionReEstablishedTimer();

        startNotificationTimerAfterConnectionReEstablished = setTimeout(function() {

            startNotification(onSubscriptionSuccess,

                    onSubscriptionFailure);

            if (fcs.isConnected()) {

                utils.callFunctionIfExist(onConnectionEstablished);

            }

        }, startNotificationTimeout);

    }



    function handleConnectionLost(err) {

        stopExtendNotificationSubscriptionTimer();

        stopStartNotificationTimerAfterConnectionReEstablishedTimer();

        if (isNotificationTypeLongPolling()) {

            cancelLastLongpollingRequest();

        }



        utils.callFunctionIfExist(onConnectionLost);

    }



    this.setOnError = function(callback) {

        onNotificationFailure = callback;

    };



    this.setOnSuccess = function(callback) {

        onNotificationSuccess = callback;

    };



    this.setOnConnectionLost = function(callback) {

        onConnectionLost = callback;

    };



    this.setOnConnectionEstablished = function(callback) {

        onConnectionEstablished = callback;

    };



    this.trigger = function() {

        if (!triggeredFetch) {

            try {

                fetchNotification();

                triggeredFetch = true;

            }

            catch (err) {

                throw err;

            }

        }

    };



    this.onGoneNotificationReceived = function(data) {

        cache.removeItem("USERNAME");

        cache.removeItem("PASSWORD");

        cache.removeItem(notificationCachePrefix + SESSION);

        stopExtendNotificationSubscriptionTimer();

        publishDeviceSubscriptionEndedMessage();

        utils.callFunctionIfExist(fcs.notification.onGoneReceived, data);

    };



    this.getNotificationId = function() {

        if (notifier) {

            return notifier.notificationId;

        }

    };

    

    globalBroadcaster.subscribe(CONSTANTS.EVENT.CONNECTION_REESTABLISHED, handleConnectionEstablished);

    globalBroadcaster.subscribe(CONSTANTS.EVENT.CONNECTION_LOST, handleConnectionLost);

    globalBroadcaster.subscribe(CONSTANTS.EVENT.TOKEN_AUTH_STARTED, onTokenAuth, 10);

    globalBroadcaster.subscribe(CONSTANTS.EVENT.TOKEN_NOT_FOUND, onTokenOrSessionError);

    globalBroadcaster.subscribe(CONSTANTS.EVENT.SESSION_EXPIRED, onTokenOrSessionError);

    

    if (__testonly__) { this.getWebSocket = function() { return webSocket; }; }

    if (__testonly__) { this.webSocketConnect = webSocketConnect; }

    if (__testonly__) { this.websocketDisconnect = websocketDisconnect; }

    if (__testonly__) { this.WEBSOCKET_CONSTANTS = WEBSOCKET_CONSTANTS; }

    if (__testonly__) { this.setNotifier = function(data) { notifier = data; }; }

};

var notificationManager = new NotificationManager();

fcs.notification = notificationManager;


/**

* Groups presence related resources (Presence Update, Presence Watcher)

* 

* @name presence

* @namespace

* @memberOf fcs

* 

* @version 3.0.0

* @since 3.0.0

*/

var Presence = function() {

    

   /**

    * States for presences update requests.

    * 

    * @name State

    * @enum {number}

    * @since 3.0.0

    * @readonly

    * @memberOf fcs.presence

    * @property {number} [CONNECTED=0] The user is currently online

    * @property {number} [UNAVAILABLE=1] The user is currently unavailable

    * @property {number} [AWAY=2] The user is currently away

    * @property {number} [OUT_TO_LUNCH=3] The user is currently out for lunch

    * @property {number} [BUSY=4] The user is currently busy

    * @property {number} [ON_VACATION=5] The user is currently on vacation

    * @property {number} [BE_RIGHT_BACK=6] The user will be right back

    * @property {number} [ON_THE_PHONE=7] The user is on the phone

    * @property {number} [ACTIVE=8] The user is currently active

    * @property {number} [INACTIVE=9] The user is currently inactive

    * @property {number} [PENDING=10] Waiting for user authorization

    * @property {number} [OFFLINE=11] The user is currently offline

    * @property {number} [CONNECTEDNOTE=12] The user is connected and defined a note

    * @property {number} [UNAVAILABLENOTE=13] The user is unavailable and defined a note

    */

    this.State = {

        CONNECTED:       0,

        UNAVAILABLE:     1,

        AWAY:            2,

        OUT_TO_LUNCH:    3,

        BUSY:            4,

        ON_VACATION:     5,

        BE_RIGHT_BACK:   6,

        ON_THE_PHONE:    7,

        ACTIVE:          8,

        INACTIVE:        9,

        PENDING:         10,

        OFFLINE:         11,

        CONNECTEDNOTE:   12,

        UNAVAILABLENOTE: 13

    };



   /**

    * Sends the user's updated status and activity to the server.

    *

    * @name fcs.presence.update

    * @function

    * @param {fcs.presence.State} presenceState The user's presence state    

    * @param {function} onSuccess The onSuccess() callback to be called

    * @param {function} onFailure The onFailure({@link fcs.Errors}) callback to be called

    * @since 3.0.0

    * @example

    * var onSuccess = function(){

    *    //do something here

    * };

    * var onError = function (err) {

    *   //do something here

    * };

    * 

    * fcs.presence.update(fcs.presence.State.BE_RIGHT_BACK, onSuccess, onError );

    */  



   /**

    * Returns the last watched user list

    * 

    * @name fcs.presence.getLastWatchedUserList

    * @function

    * @since 3.0.0

    */

   

   /**

     * Stops the presence watch refresh timer

     * 

     * @name fcs.presence.stopPresenceWatchRefreshTimer

     * @function

     * @since 3.0.0

     */



   /**

    * Starts watching the presence status of users in the provided user list.

    *

    * @name fcs.presence.watch

    * @function

    * @param {Array.<String>} watchedUserList list of users whose status is to be watched    

    * @param {function} onSuccess The onSuccess() callback to be called

    * @param {function} onFailure The onFailure({@link fcs.Errors}) callback to be called

    * @since 3.0.0

    * @example

    * var onSuccess = function(){

    *    //do something here

    * };

    * var onError = function (err) {

    *   //do something here

    * };

    * 

    * fcs.presence.watch(["user1", "user2"], onSuccess, onError );

    */  



   /**

    * Stops watching the presence status of the users in the provided user list.

    *

    * @name fcs.presence.stopwatch

    * @function

    * @param {Array.<String>} unwatchedUserList list of users whose status is to be unwatched    

    * @param {function} onSuccess The onSuccess() callback to be called

    * @param {function} onFailure The onFailure({@link fcs.Errors}) callback to be called

    * @since 3.0.0

    * @example

    * var onSuccess = function(){

    *    //do something here

    * };

    * var onError = function (err) {

    *   //do something here

    * };

    * 

    * fcs.presence.stopwatch(["user1", "user2"], onSuccess, onError ); 

    */  

   

   /**

    * Sends a request to receive a notification for the presence status of the users in the provided user list.<br />

    * For each user in the provided list, {@link fcs.presence.event:onReceived} handler will be invoked.

    *

    * @name fcs.presence.retrieve

    * @function

    * @param {Array.<String>} userList list of users whose status is to be retrieved    

    * @param {function} onSuccess The onSuccess() callback to be called

    * @param {function} onFailure The onFailure({@link fcs.Errors}) callback to be called

    * @since 3.0.0

    * @example

    * var onSuccess = function(){

    *    //do something here

    * };

    * var onError = function (err) {

    *   //do something here

    * };

    * 

    * fcs.presence.retrieve(["user1", "user2"], onSuccess, onError ); 

    */

   

   /**

    * Handler called for when receiving a presence notification

    *

    * @name onReceived

    * @event

    * @memberOf fcs.presence

    * @param {fcs.presence.UpdateEvent} event The presence update event

    * @since 3.0.0

    * @example

    * 

    * fcs.presence.onReceived = function(data) {

    *    //do something here

    * }

    */

   

   

   /**

    * Represents a presence change event

    *

    * @name UpdateEvent

    * @class

    * @memberOf fcs.presence

    * @version 3.0.0

    * @since 3.0.0

    */

   this.UpdateEvent = function(){};

   /**

    * User name of the contact whose presence has changed.

    *

    * @name fcs.presence.UpdateEvent#name

    * @field

    * @type {String}

    * @since 3.0.0

    */



    /**

     * The presence state of the user.

     *

    * @name fcs.presence.UpdateEvent#state

    * @field

    * @type {fcs.presence.State}

    * @since 3.0.0

    */

   

   /**

    * The type of network for this presence.

    *

    * @name fcs.presence.UpdateEvent#type

    * @field

    * @type {String}

    * @since 3.0.0

    */

};
var PRESENCE_URL = "/presence", PRESENCE_WATCHER_URL = "/presenceWatcher", 

    REQUEST_TYPE_WATCH = "watch", REQUEST_TYPE_STOP_WATCH = "stopwatch", REQUEST_TYPE_GET = "get",

    presence = new Presence(),

    PRESENCE_STATE = presence.State,

    STATUS_OPEN = "open",

    STATUS_CLOSED = "closed",

    ACTIVITY_UNKNOWN = "unknown",

    ACTIVITY_AWAY = "away",

    ACTIVITY_LUNCH = "lunch",

    ACTIVITY_BUSY = "busy",

    ACTIVITY_VACATION = "vacation",

    ACTIVITY_ON_THE_PHONE = "on-the-phone",

    ACTIVITY_OTHER = "other",

    NOTE_BE_RIGHT_BACK = "Be Right Back",

    NOTE_OFFLINE = "Offline",

    USERINPUT_ACTIVE = "active",

    USERINPUT_INACTIVE = "inactive";



var PresenceStateParser =  function(){



    var stateRequest = [];

    

    stateRequest[PRESENCE_STATE.CONNECTED] = {status: STATUS_OPEN, activity: ACTIVITY_UNKNOWN};

    stateRequest[PRESENCE_STATE.UNAVAILABLE] = {status: STATUS_CLOSED, activity: ACTIVITY_UNKNOWN};

    stateRequest[PRESENCE_STATE.AWAY] = {status: STATUS_OPEN, activity: ACTIVITY_AWAY};

    stateRequest[PRESENCE_STATE.OUT_TO_LUNCH] = {status: STATUS_OPEN, activity: ACTIVITY_LUNCH};

    stateRequest[PRESENCE_STATE.BUSY] = {status: STATUS_CLOSED, activity: ACTIVITY_BUSY};

    stateRequest[PRESENCE_STATE.ON_VACATION] = {status: STATUS_CLOSED, activity: ACTIVITY_VACATION};

    stateRequest[PRESENCE_STATE.BE_RIGHT_BACK] = {status: STATUS_OPEN, activity: ACTIVITY_OTHER, note: NOTE_BE_RIGHT_BACK};

    stateRequest[PRESENCE_STATE.ON_THE_PHONE] = {status: STATUS_OPEN, activity: ACTIVITY_ON_THE_PHONE};

    stateRequest[PRESENCE_STATE.ACTIVE] = {status: STATUS_OPEN, activity: ACTIVITY_UNKNOWN, userInput: USERINPUT_ACTIVE};

    stateRequest[PRESENCE_STATE.INACTIVE] = {status: STATUS_CLOSED, activity: ACTIVITY_UNKNOWN, userInput: USERINPUT_INACTIVE};

    stateRequest[PRESENCE_STATE.OFFLINE] = {status: STATUS_CLOSED, activity: ACTIVITY_OTHER, note: NOTE_OFFLINE};

    stateRequest[PRESENCE_STATE.CONNECTEDNOTE] = {status: STATUS_OPEN, activity: ACTIVITY_OTHER};

    stateRequest[PRESENCE_STATE.UNAVAILABLENOTE] = {status: STATUS_CLOSED, activity: ACTIVITY_OTHER};

    

    this.getRequestObject = function(presenceState){

        var state = stateRequest[presenceState];

        

        if(state){

            return state;

        } else {

        throw new Error("Invalid Presence State");

        }

    };



    this.getState = function(presence) {

        switch (presence.userInput) {

            case USERINPUT_ACTIVE:

                return PRESENCE_STATE.ACTIVE;

            case USERINPUT_INACTIVE:

                return PRESENCE_STATE.INACTIVE;

        }



        switch (presence.note) {

            case NOTE_BE_RIGHT_BACK:

                return PRESENCE_STATE.BE_RIGHT_BACK;

            case NOTE_OFFLINE:

                return PRESENCE_STATE.OFFLINE;

        }

        if (presence.note) {

            if (presence.status === STATUS_OPEN) {

                return PRESENCE_STATE.CONNECTEDNOTE;

            }

            else {

                return PRESENCE_STATE.UNAVAILABLENOTE;

            }

        }



        switch (presence.activity) {

            case ACTIVITY_AWAY:

                return PRESENCE_STATE.AWAY;

            case ACTIVITY_LUNCH:

                return PRESENCE_STATE.OUT_TO_LUNCH;

            case ACTIVITY_BUSY:

                return PRESENCE_STATE.BUSY;

            case ACTIVITY_VACATION:

                return PRESENCE_STATE.ON_VACATION;

            case ACTIVITY_ON_THE_PHONE:

                return PRESENCE_STATE.ON_THE_PHONE;

            case ACTIVITY_UNKNOWN:

                if (presence.status === STATUS_OPEN) {

                    return PRESENCE_STATE.CONNECTED;

                }

                else {

                    return PRESENCE_STATE.UNAVAILABLE;

                }

        }

        return PRESENCE_STATE.CONNECTED;

    };

};



var presenceStateParser;



var PresenceImpl = function() {

    var lastWatchedUserList = null, subscriptionRefreshTimer = null,

            onPresenceWatchSuccess = null, onPresenceWatchFailure = null,

            logger = logManager.getLogger("presenceService"),

            subscriptionExpiryTimestamp = 0;





    this.getLastWatchedUserList = function () {

        return lastWatchedUserList;

    };



    this.onReceived = null;



    this.update = function(presenceState, onSuccess, onFailure) {



        server.sendPostRequest({

            "url": getWAMUrl(1, PRESENCE_URL),

            "data": {"presenceRequest": presenceStateParser.getRequestObject(presenceState)}

                },

                onSuccess,

                onFailure

        );



    };



    function makeRequest(watchedUserList, onSuccess, onFailure, action) {

        var data = {"presenceWatcherRequest":{"userList": watchedUserList, "action": action}};

        server.sendPostRequest({

                        "url": getWAMUrl(1, PRESENCE_WATCHER_URL),

                        "data": data

                    },

                    onSuccess,

                    onFailure

        );

    }



    function stopSubscriptionRefreshTimer() {

        if (subscriptionRefreshTimer) {

            logger.trace("presence watch timer is stopped: " + subscriptionRefreshTimer);

            clearTimeout(subscriptionRefreshTimer);

            subscriptionRefreshTimer = null;

        }

    }



    function startServiceSubscription(watchedUserList, onSuccess, onFailure) {

        var self = this, currentTimestamp = utils.getTimestamp();



        if (!watchedUserList) {

            if (lastWatchedUserList) {

                logger.trace("watchedUserList is empty, use lastWatchedUserList.");

                watchedUserList = lastWatchedUserList;

            }

            else {

                logger.trace("presence service subscription has not been initialized, do not trigger service subscription.");

                return;

            }

        }



        logger.info("presence service subscription, currentTimestamp: " + currentTimestamp + " expiryTimestamp: " + subscriptionExpiryTimestamp);

        if (currentTimestamp - subscriptionExpiryTimestamp < 0) {

            logger.trace("previous presence service subscription is still valid, do not trigger service subscription.");

            return;

        }



        if (onSuccess) {

            onPresenceWatchSuccess = onSuccess;

        }

        if (onFailure) {

            onPresenceWatchFailure = onFailure;

        }



        logger.info("subscribe presence status of users:", watchedUserList);

        makeRequest(watchedUserList, function(result) {

            var response, expiry;

            if (result) {

                response = result.presenceWatcherResponse;

                if (response) {

                    expiry = response.expiryValue / 2;

                    if (expiry) {

                        subscriptionExpiryTimestamp = utils.getTimestamp() + expiry * 1000;

                        stopSubscriptionRefreshTimer();

                        subscriptionRefreshTimer = setTimeout(function() {

                            self.watch(watchedUserList, null, onPresenceWatchFailure);

                        }, expiry * 1000);

                        logger.trace("presence watch, timer: " + subscriptionRefreshTimer + " expiryTimestamp: " + subscriptionExpiryTimestamp);

                    }

                }

            }

            lastWatchedUserList = watchedUserList;

            if (onPresenceWatchSuccess && typeof onPresenceWatchSuccess === 'function') {

                onPresenceWatchSuccess(result);

            }

        }, onPresenceWatchFailure, REQUEST_TYPE_WATCH);

    }



    this.watch = startServiceSubscription;

    

    this.stopwatch = function(watchedUserList, onSuccess, onFailure) {



        makeRequest(watchedUserList, onSuccess, onFailure, REQUEST_TYPE_STOP_WATCH);

    };





    this.retrieve = function(watchedUserList, onSuccess, onFailure) {



        makeRequest(watchedUserList, onSuccess, onFailure, REQUEST_TYPE_GET);

    };



    function presenceServiceOnSubscriptionStartedHandler() {

        startServiceSubscription(undefined, onPresenceWatchSuccess, onPresenceWatchFailure);

    }



    globalBroadcaster.subscribe(CONSTANTS.EVENT.DEVICE_SUBSCRIPTION_STARTED,

            presenceServiceOnSubscriptionStartedHandler);



    globalBroadcaster.subscribe(CONSTANTS.EVENT.DEVICE_SUBSCRIPTION_ENDED,

            stopSubscriptionRefreshTimer);



};



PresenceImpl.prototype = new Presence();

var presenceService = new PresenceImpl();

fcs.presence = presenceService;



presenceStateParser = new PresenceStateParser();



/*

 * In order to find the users presence client receives 3 parameters from WAM

 * status, activity, note and userInput.

 * status is received in every presence notification and can have two parameters: open and closed

 * For activity and note there can be only one of them in the presence notification.

 * userInput comes with activity but userInput is the  one that decides presence.

 * Presence is decided according to status and activity/note combination

 */

NotificationCallBacks.presenceWatcher = function(data){

    if(!fcs.notification.isAnonymous()) {

        var presence = new fcs.presence.UpdateEvent(), presenceParams = data.presenceWatcherNotificationParams;



        presence.name = utils.getProperty(presenceParams, 'name');

        presence.type = utils.getProperty(presenceParams, 'type');

        presence.status = utils.getProperty(presenceParams, 'status');

        presence.activity = utils.getProperty(presenceParams, 'activity');

        presence.note = utils.getProperty(presenceParams, 'note');

        presence.userInput = utils.getProperty(presenceParams, 'userInput');



        presence.state = presenceStateParser.getState(presence);



        utils.callFunctionIfExist(fcs.presence.onReceived, presence);

        

    }    

};
var CollaborationService = function() {

    var collabUrl = "/collaboration";

    function parseAuthTokenResponse(data) {
        var collaborationResponse, response = {};
        if(data){
            collaborationResponse = data.collaborationResponse;
            if(collaborationResponse){

                response.approvalScope = collaborationResponse.approvalScopeID;

                response.sharingScope = collaborationResponse.sharingScopeID;

                response.approvalSignature = collaborationResponse.approvalSignature;

                response.sharingSignature = collaborationResponse.sharingSignature;

                response.userId = collaborationResponse.userID;

                response.expires = parseInt(collaborationResponse.expires, 10);

                response.appId = collaborationResponse.appId;

                response.salt = collaborationResponse.salt;
                
                response.code = collaborationResponse.statusCode;
                
                response.firstName = collaborationResponse.firstName;
                
                response.lastName = collaborationResponse.lastName;
            }
        }

        return response;
    }

    function parseAppId(data) {
        var collaborationResponse, response = {};
        if (data) {
            collaborationResponse = data.collaborationResponse;
            if (collaborationResponse) {
                response.firstName = collaborationResponse.firstName;
                response.lastName = collaborationResponse.lastName;
                response.appId = collaborationResponse.appId;
                return response;
            }
        }

        return null;
    }

    function parseMaxParticipant(data) {
        var response = null, collaborationResponse;
        if(data){
            collaborationResponse = data.collaborationResponse;
            if(collaborationResponse){
                response = collaborationResponse.maxNumberOfParticipants;
            }
        }

        return response;
    }

    /**
    * @ignore
    */
    this.getMaxParticipants = function(onSuccess, onFailure) {

        server.sendGetRequest({
                url: getWAMUrl(1, collabUrl + "/maxparticipants")
            },
            onSuccess,
            onFailure,
            parseMaxParticipant
        );
    };

    /**
    * @ignore
    */
    this.start = function(onSuccess, onFailure) {

        server.sendGetRequest({
                url: getWAMUrl(1, collabUrl)
            },
            onSuccess,
            onFailure,
            parseAuthTokenResponse
        );
    };

    /**
    * @ignore
    */
    this.getAnonymousAuth = function(guestname, hostname ,onSuccess, onFailure) {

        server.sendGetRequest({
                url: getUrl() + "/rest/version/1/anonymous/" + hostname + "/collaboration/anonymous/" + guestname
            },
            onSuccess,
            onFailure,
            parseAuthTokenResponse
        );
    };

    /**
    * @ignore
    */
    this.getGuestAuth = function(guestname ,onSuccess, onFailure) {

        server.sendGetRequest({
                url: getWAMUrl(1, collabUrl + "/guest/" + guestname)
            },
            onSuccess,
            onFailure,
            parseAuthTokenResponse
        );
    };

    /**
    * @ignore
    */
    this.getPremiumAuth = function(scopeid ,onSuccess, onFailure) {

        server.sendGetRequest({
                url: getWAMUrl(1, collabUrl + "/premium/" + scopeid)
            },
            onSuccess,
            onFailure,
            parseAuthTokenResponse
        );
    };

    /**
    * @ignore
    */
    this.stop = function(onSuccess, onFailure, synchronous) {
        var dummy;
        server.sendDeleteRequest({
                url: getWAMUrl(1, collabUrl)
            },
            onSuccess,
            onFailure,
            dummy,
            dummy,
            synchronous
        );
    };
    
    /**
    * @ignore
    */
    this.getAppId = function(hostname ,onSuccess, onFailure) {

        server.sendGetRequest({
                url: getUrl() + "/rest/version/1/anonymous/" + hostname + "/collaboration/appid"
            },
            onSuccess,
            onFailure,
            parseAppId
        );
    };
};

var collaborationService = new CollaborationService();

var CollaborationManager = function() {



    var collaborations = {}, initialized = false, hostingSharingScopeId, hostingApprovalScopeId, sharingCollaboration = null,

            approvalCollaboration = null, isSharing = false, currentPresenter = null, startSharingOnSuccess = null,

            startSharingOnFailure = null, guestRequest, guestRequestResponse, moderatorUserId, presenterWindowId,

            NATIVE_WIDTH = 960, isTryingToPublish = false, reconnectRetry = 0, reconnectRetryMax = 6, reconnectRetryInterval = 10000,

            selfName = null, selfPhoto = null, reconnect = null, logger = logManager.getLogger("collaborationManager"), self = null;

    self = this;

    function getService() {

        return window.ADL.getService();

    }



    //This is unnecessairy right now since the collaborations key is the scope

    //but this could change

    function getCollaborationFromScope(scope) {

        return collaborations[scope];

    }



    function createResponder(resultHandler, errHandler, context) {

        return window.ADL.createResponder(resultHandler, errHandler, context);

    }



    function sendMessage(conn, msg, recipient) {

        conn.sendMessage(createResponder(), JSON.stringify(msg), recipient);

    }



    function getParticipantObjectOfUser(participants, user) {

        var participantKey;

        if (participants) {

            for (participantKey in participants) {

                if (participants[participantKey].address === user) {

                    return participants[participantKey];

                }

            }

        }

    }



    function onParticipantUpdated(id){

        var participant = sharingCollaboration.participants[id], participantID, participantList = [];

        if(participant){

            if(participant.address){

                //We have all the information so send an event

                utils.callFunctionIfExist(sharingCollaboration.collab.onParticipantUpdate, participant);



                //Convert list into array and send participant message

                for(participantID in sharingCollaboration.participants){

                    //Only send connected participants

                    if (sharingCollaboration.participants.hasOwnProperty(participantID)) {

                        if(sharingCollaboration.participants[participantID].connected){

                            participantList.push(sharingCollaboration.participants[participantID]);

                        }

                    }

                }

                sendMessage(sharingCollaboration.connection, {type: "participants", participants: participantList});

            }

        }

    }



    function onCollabStateChange(collaboration){

        utils.callFunctionIfExist(collaboration.collab.onStateChange, collaboration.state);

    }

    

    function optimizeAddliveConnection(scopeId) {

        

        if (fcsConfig.collabPluginEnablePaddingValue){

           window.ADL.getService().setProperty(window.ADL.r(), 

              scopeId + fcsConfig.collabPluginEnablePaddingKey, fcsConfig.collabPluginEnablePaddingValue);

           logger.trace("Addlive enable padding property was set , enable padding :" + fcsConfig.collabPluginEnablePaddingValue);   

        }

        

        if (fcsConfig.collabPluginMaxScreenFrameRateValue){

            window.ADL.getService().setProperty(window.ADL.r(), 

            scopeId + fcsConfig.collabPluginMaxScreenFrameRateKey, fcsConfig.collabPluginMaxScreenFrameRateValue);

            logger.trace("Addlive max screen frame rate property was set , FPS:" + fcsConfig.collabPluginMaxScreenFrameRateValue); 

        }

        

        if (fcsConfig.collabPluginMinKeyFramePeriodValue){

            window.ADL.getService().setProperty(window.ADL.r(), 

            scopeId + fcsConfig.collabPluginMinKeyFramePeriodKey, fcsConfig.collabPluginMinKeyFramePeriodValue);

            logger.trace("Addlive min key frame rate property was set , min key frame period:" + fcsConfig.collabPluginMinKeyFramePeriodValue); 

        }

    }

    

    function enableAddliveTCPConnection(){

        //set TCP communication for 3 or more clients

        if (fcsConfig.collabPluginEnableTcpKey) {

            getService().setProperty(window.ADL.r(), fcsConfig.collabPluginEnableTcpKey, fcsConfig.collabPluginEnableTcpValue);

            logger.trace("Addlive TCP property was set , tcp :" + fcsConfig.collabPluginEnableTcpKey+":"+fcsConfig.collabPluginEnableTcpValue);   

        }

        

        // disable p2p communication for 2 clients

        if (fcsConfig.collabPluginDisableP2PKey) {

            getService().setProperty(window.ADL.r(), fcsConfig.collabPluginDisableP2PKey, fcsConfig.collabPluginDisableP2PValue);

            logger.trace("Addlive  P2P property was disabled  :" + fcsConfig.collabPluginDisableP2PKey+":"+fcsConfig.collabPluginDisableP2PValue);   

        }

    

    }

    

    function onMessage(e) {

        var msg = JSON.parse(e.data), collab, participant, 

                collabErrorCodes = fcs.collaboration.ErrorCodes, 

                screenShareConstraints = {}, i,

                collabStates = fcs.collaboration.States;

        if (fcsConfig.screenSharingMaxWidth) {

            screenShareConstraints = {windowId: presenterWindowId, nativeWidth: fcsConfig.screenSharingMaxWidth};

        }

        else {

            screenShareConstraints = {windowId: presenterWindowId};

        }

        logger.info("onMessage scope: " + JSON.stringify(e));



        if (msg.type) {



            switch (msg.type) {

                case "accepted":

                    collab = getCollaborationFromScope(e.scopeId);

                    collab.canShare = true;

                    utils.callFunctionIfExist(collab.sharingRequest, true);

                    break;

                case "rejected":

                    collab = getCollaborationFromScope(e.scopeId);

                    collab.canShare = false;

                    utils.callFunctionIfExist(collab.sharingRequest, false);

                    break;

                case "continue":

                    //The host have set this user to be the only presenter

                    if (!isTryingToPublish) {

                        collab = getCollaborationFromScope(e.scopeId);

                        if (collab && collab.scopeId) {

                            if (isSharing) {

                                utils.callFunctionIfExist(startSharingOnFailure, collabErrorCodes.ALREADY_SHARING);

                            } else if(!collab.canShare){

                                utils.callFunctionIfExist(startSharingOnFailure, collabErrorCodes.NO_PERMISSION);

                            } else {

                                isTryingToPublish = true;

                                getService().publish(createResponder(function() {

                                    collab.isSharing = isSharing = true;

                                    isTryingToPublish = false;

                                    utils.callFunctionIfExist(startSharingOnSuccess);

                                }, function(err_code, err_msg) {

                                    logger.error("Could not Share : " + err_code + " : " + err_msg);

                                    utils.callFunctionIfExist(startSharingOnFailure);

                                }),

                                        collab.scopeId,

                                        window.ADL.MediaType.SCREEN,

                                        screenShareConstraints

                                );

                            }

                        } else {

                            utils.callFunctionIfExist(startSharingOnFailure, collabErrorCodes.NOT_FOUND);

                        }

                    }

                    break;

                case "wait":

                    // This means another participant has started to share before this one.

                    utils.callFunctionIfExist(startSharingOnFailure, collabErrorCodes.OTHER_SHARING);

                    break;

                case "kick":

                    collab = getCollaborationFromScope(e.scopeId);

                    if (collab.isSharing) {

                        getService().unpublish(createResponder(function() {

                            isTryingToPublish = false;

                            collab.isSharing = isSharing = false;

                            utils.callFunctionIfExist(collab.collab.onStateChange, fcs.collaboration.States.STOPPED);

                        }),

                                e.scopeId,

                                window.ADL.MediaType.SCREEN

                                );

                    }

                    //getService().disconnect(e.scopeId);

                    utils.callFunctionIfExist(collab.collab.onStateChange, fcs.collaboration.States.ENDED);

                    break;

                case "approved":

                    moderatorUserId = e.srcUserId;

                    guestRequestResponse = msg.response;

                    utils.callFunctionIfExist(guestRequest, true);

                    break;

                case "denied":

                    utils.callFunctionIfExist(guestRequest, false, msg.full);

                    break;

                case "participants":

                    collab = getCollaborationFromScope(e.scopeId);

                    if (collab && msg.participants.length > 0) {

                        if (!collab.participants) {

                            collab.participants = {};

                        }

                        utils.callFunctionIfExist(collab.collab.onParticipantChange, msg.participants);

                        for (i in msg.participants) {

                            collab.participants[msg.participants[i].id] = msg.participants[i];

                            if (msg.participants[i].address !== getUser() &&

                                msg.participants[i].presenter === true) {

                                collab.state = collabStates.PRESENTER_IDENTIFIED;

                                collab.collab.presenter = msg.participants[i].address;

                                onCollabStateChange(collab);

                            }

                        }

                    }

                    break;

                case "info":

                    if (sharingCollaboration) {

                        participant = sharingCollaboration.participants[e.srcUserId];

                        if (participant) {

                            participant.name = msg.name;

                            participant.address = msg.sip;

                            participant.photo = msg.photo;

                            participant.guest = false;

                            onParticipantUpdated(e.srcUserId);

                        }

                    }

                    break;

                case "takeback":

                    //stop sharing for scope id (e.scopeId)

                    collab = getCollaborationFromScope(e.scopeId);

                    if (collab.isSharing) {

                        getService().unpublish(createResponder(function() {

                            isTryingToPublish = false;

                            collab.isSharing = isSharing = false;

                            collab.collab.presenter = null;

                            utils.callFunctionIfExist(collab.collab.onStateChange, fcs.collaboration.States.STOPPED);

                        }),

                                e.scopeId,

                                window.ADL.MediaType.SCREEN

                                );

                    }

                    break;

                case "shareRequest":

                    //check if we are the host for this scope

                    if (hostingSharingScopeId === e.scopeId) {

                        if (typeof fcs.collaboration.onShareRequest === "function") {

                            participant = sharingCollaboration.participants[e.srcUserId];

                            fcs.collaboration.onShareRequest(participant, function() {

                                //accept function

                                sendMessage(sharingCollaboration.connection, {type: "accepted"}, e.srcUserId);

                            }, function() {

                                //reject function

                                sendMessage(sharingCollaboration.connection, {type: "rejected"}, e.srcUserId);

                            });

                        }

                    }

                    break;

                case "startShareRequest":

                    collab = getCollaborationFromScope(e.scopeId);

                    if (collab === sharingCollaboration) {

                        if (currentPresenter && currentPresenter !== e.srcUserId) {

                            sendMessage(collab.connection, {type: "wait"}, e.srcUserId);

                        }

                        else {

                            currentPresenter = e.srcUserId;

                            sendMessage(collab.connection, {type: "continue"}, e.srcUserId);

                        }

                    }

                    break;

                case "joinRequest":

                    //check if we are the host for this scope

                    if (hostingApprovalScopeId === e.scopeId) {

                        if (typeof fcs.collaboration.onJoinRequest === "function") {

                            fcs.collaboration.onJoinRequest(msg.name, msg.email, function() {

                                //accept function

                                collaborationService.getGuestAuth(msg.email, function(response) {

                                    if(response){

                                        //Add new guest user

                                        if(response.userId){

                                            sharingCollaboration.participants[response.userId] = {id:response.userId, guest : true, name : msg.name, address : msg.email};

                                        }

                                        sendMessage(approvalCollaboration.connection, {type: "approved", response: response}, e.srcUserId);

                                    } else {

                                        logger.info("Empty response for getGuestAuth, scopeId: " + e.scopeId);

                                    }

                                });

                            }, function(full) {

                                //reject function

                                sendMessage(approvalCollaboration.connection, {type: "denied", full: full}, e.srcUserId);

                            });

                        }

                    }

                    break;

                default:

                    logger.info("Got unsupported message " + JSON.stringify(e));

            }

        }

    }



    function tryToReconnect(collaboration){

        window.setTimeout(function(){

                reconnect(collaboration);

            }, reconnectRetryInterval);

    }



    reconnect = function(collaboration) {

        function success(){

            collaboration.state = fcs.collaboration.States.RECONNECTED;

            utils.callFunctionIfExist(collaboration.collab.onStateChange, collaboration.state);

        }

        

        function failure(){

            tryToReconnect(collaboration);

        }



        if (reconnectRetry < reconnectRetryMax) {

            if (collaboration === sharingCollaboration) {

                self.start(success, failure, selfName, selfPhoto);

            }

            else {

                if( collaboration && collaboration.scopeId ){

                    self.join(success, failure, selfName, selfPhoto, collaboration.scopeId);

                }

            }

        } else {

            collaboration.state = fcs.collaboration.States.DISCONNECTED;

            utils.callFunctionIfExist(collaboration.collab.onStateChange, collaboration.state);

        }



        reconnectRetry++;

    };



    function initializeListeners(onSuccess, onFailure) {



        var listener = new window.ADL.AddLiveServiceListener(), collabStates = fcs.collaboration.States;



        listener.onUserEvent = function(e) {

            var collab, participant;



            collab = getCollaborationFromScope(e.scopeId);





            //TODO: add participant to list

            //e.isConnected

            //e.userId

            //e.screenPublished

            if (e.screenPublished) {

                collab.sinkId = e.screenSinkId;

                collab.state = fcs.collaboration.States.STARTED;

                onCollabStateChange(collab);

            }



            //If i am the host

            if (hostingSharingScopeId === e.scopeId) {

                if(sharingCollaboration.participants){

                    participant = sharingCollaboration.participants[e.userId];

                    if(participant){

                        //Update status

                        participant.connected = e.isConnected;

                        participant.sharing = e.screenPublished;

                        //Send an update only if existed

                        onParticipantUpdated( e.userId);

                    } else {

                        sharingCollaboration.participants[e.userId] = {id : e.userId, connected : e.isConnected};

                    }

                }

            }

        };



        listener.onConnectionLost = function(e) {

            var collaboration = getCollaborationFromScope(e.scopeId);

            logger.error("Collaboration Connection Lost # " + e.errCode + " detected : " + e.errMessage + " scopeId: " + e.scopeId);

            

            if (collaboration) {

                collaboration.isSharing = false;

                //NOTE: willReconnect should always be false unless the A2 server provide a longer expiration

                if (!e.willReconnect) {

                    tryToReconnect(collaboration);

                }



                collaboration.state = collabStates.RECONNECTING;

                onCollabStateChange(collaboration);

            }

            else {

                logger.info("collaboration not found for scopeId: " + e.scopeId);

            }

        };



        listener.onMediaIssue = function(e) {

            var collaboration = getCollaborationFromScope(e.scopeId);



            logger.error("Collaboration Media Issue # " + e.issueCode + " detected : " + e.message);



            if (collaboration) {

                if( e.isActive ) {

                    switch(e.issueCode) {

                        case window.ADL.MediaIssueCodes.CONNECTION_FROZEN:

                            collaboration.state = collabStates.MEDIA_FROZEN;

                            break;

                        case window.ADL.MediaIssueCodes.NETWORK_PROBLEM:

                            collaboration.state = collabStates.MEDIA_NETWORK;

                            break;

                        case window.ADL.MediaIssueCodes.EXTERNAL_CPU_LOAD_HIGH:

                        case window.ADL.MediaIssueCodes.CPU_LOAD_HIGH:

                            collaboration.state = collabStates.MEDIA_CPU;

                            break;

                        default: collaboration.state = collabStates.MEDIA_ISSUE;

                    }

                }

                else {

                    collaboration.state = collabStates.MEDIA_NORMAL;

                }

                onCollabStateChange(collaboration);

            }

        };

        

        listener.onMediaStreamFailure = function(e) {

            var collaboration = getCollaborationFromScope(e.scopeId);

            

            logger.error("Collaboration Media Error # " + e.errCode + " detected : " + e.errMessage);

            

            if (collaboration) {

                collaboration.state = collabStates.MEDIA_ERROR;

                onCollabStateChange(collaboration);

            }

        };

        

        listener.onSessionReconnected = function(e) {

            var collaboration = getCollaborationFromScope(e.scopeId);

            if (collaboration) {

                collaboration.state = collabStates.RECONNECTED;

                onCollabStateChange(collaboration);

            }

        };



        listener.onMediaStreamEvent = function(e) {

            var collaboration = getCollaborationFromScope(e.scopeId), presenter;

            if (e.screenPublished) {

                collaboration.sinkId = e.screenSinkId;



                if (collaboration.participants && collaboration.participants[e.userId]) {

                    presenter = collaboration.participants[e.userId].address;

                    if (presenter !== getUser()) {

                        collaboration.state = collabStates.PRESENTER_IDENTIFIED;

                        collaboration.collab.presenter = presenter;

                        onCollabStateChange(collaboration);

                    }

                }

                else {

                    logger.trace("Cannot locate participant info of presenter, e.userId: " + e.userId);

                }



                if(collaboration.state !== collabStates.STARTED){

                    collaboration.state = collabStates.STARTED;

                    onCollabStateChange(collaboration);

                }

            } else {

                currentPresenter = null;

                collaboration.collab.presenter = null;

                collaboration.state = collabStates.STOPPED;

                onCollabStateChange(collaboration);

            }

        };



        listener.onVideoFrameSizeChanged = function(e) {

            var collaboration, coll;



            for (coll in collaborations) {

                if (collaborations.hasOwnProperty(coll)) {

                    collaboration = collaborations[coll];

                    if (collaboration && collaboration.sinkId === e.sinkId && collaboration.collab) {

                        if(e.width > 0 && e.height > 0) {

                            if(collaboration.isRendered === false){

                                collaboration.containerId = collaboration.initContainerId;

                                window.ADL.renderSink({sinkId: collaboration.sinkId, containerId: collaboration.containerId});

                                collaboration.isRendered = true;                            

                            }

                            utils.callFunctionIfExist(collaboration.collab.onSizeChange, e.width, e.height);

                            return;

                        }

                    }

                }

            }

        };



        listener.onMessage = onMessage;



        getService().addServiceListener(createResponder(function() {

            initialized = true;

            onSuccess();

        }, onFailure), listener);

    }



    function getConnectionDescriptor(response, approval) {

        return {

            autopublishVideo: false,

            autopublishAudio: false,

            scopeId: approval ? response.approvalScope : response.sharingScope,

            authDetails: {

                userId: parseInt(response.userId, 10),

                expires: parseInt(response.expires, 10),

                salt: response.salt,

                signature: approval ? response.approvalSignature : response.sharingSignature

            }

        };

    }



    function createInternalCollaborationObject(connection, scopeId) {

        var collab, internalCollaboration;

        if (collaborations[scopeId]) {

            logger.trace("found an existin copy of the collaboration object with scopeId: " + scopeId);

            internalCollaboration = collaborations[scopeId];

        }

        else {

            logger.trace("creating new internall collaboration object with scopeId: " + scopeId);

            collab = new fcs.collaboration.Collaboration(scopeId);



            //Add the collaboration object and the connection to the list of collaborations

            internalCollaboration = {collab: collab, connection: connection, scopeId: scopeId};

            collaborations[scopeId] = internalCollaboration;

        }



        return internalCollaboration;

    }



    //Connect to the session and create the collaboration object

    function joinSharingSession(response, onSuccess, onFailure) {

        var service = getService(), connection;

        service.connect(createResponder(function(conn) {

            connection = conn;

            onSuccess(createInternalCollaborationObject(connection, response.sharingScope));

            

        }, function(errCode, errMessage) {

            switch (errMessage) {

                case "Already connected to given scope":

                    logger.debug("Already connected to given sharing scope: " + response.sharingScope);

                    if (getService()._activeConnections &&

                            getService()._activeConnections[response.sharingScope]) {

                        logger.debug("Retrived connection descriptor from active connections.");

                        connection = getService()._activeConnections[response.sharingScope];

                        onSuccess(createInternalCollaborationObject(connection, response.sharingScope));

                    }

                    else {

                        logger.fatal("Can NOT retrieve connection descriptor, joining sharing session failed.");

                        utils.callFunctionIfExist(onFailure);

                    }

                    break;

                default:

                    utils.callFunctionIfExist(onFailure);

                    break;

            }

        }), getConnectionDescriptor(response, false));

    }



    function stopSharing(id, onSuccess, onFailure) {

        var collaboration = collaborations[id], participant;

        

        

        if (collaboration && collaboration.scopeId && isSharing) {

            getService().unpublish(createResponder(function() {

                currentPresenter = null;

                collaboration.collab.presenter = null;

                isTryingToPublish = false;

                collaboration.isSharing = isSharing = false; 

                participant = getParticipantObjectOfUser(collaboration.participants, getUser());

                if (participant) {

                    participant.presenter = false;

                }

                

                utils.callFunctionIfExist(onSuccess);

            }, function(e) {

                logger.error("Could not stop Sharing, unpublish error : " + e);

                utils.callFunctionIfExist(onFailure);

            }),

                    collaboration.scopeId,

                    window.ADL.MediaType.SCREEN

                    );

        } else {

            logger.debug("Could not stop sharing no sharing in progress. collab id: " + id);

            utils.callFunctionIfExist(onSuccess);

        }

    }

    

    function stopViewing(id) {

        var collaboration = collaborations[id];

        if (collaboration && collaboration.containerId) {

            try {

                window.ADL.disposeRenderer(collaboration.containerId);

                collaboration.containerId = null;

            } catch (e) {

                //This should only happen if

                logger.error("dispose renderer failed: " + e);

            }

        }

    }



    this.initPlateform = function(onInitStateChanged, hostname) {

        var initListener, options, adlState = window.ADL.InitState, states = fcs.collaboration.InitStates,initOptions;

        if (window.ADL) {



            window.ADL.initLogging(function(lev, msg) {

                switch (lev) {

                    case window.ADL.LogLevel.DEBUG:

                        logger.debug('[ADL] ' + msg);

                        break;

                    case window.ADL.LogLevel.INFO:

                        logger.debug('[ADL] ' + msg);

                        break;

                    case window.ADL.LogLevel.WARN:

                        logger.warn('[ADL] ' + msg);

                        break;

                    case window.ADL.LogLevel.ERROR:

                        logger.error('[ADL] ' + msg);

                        break;

                    default:

                        logger.warn('[ADL] Got unsupported log level: ' + lev + '. Message: ' + msg);

                }

            }, false);

            

            window.ADL.CrashHandler.registerCrashListener(function() {

                logger.fatal("[ADL] plugin crashed.");

            });

            

            

            initListener = new window.ADL.PlatformInitListener();

           

            

            

            //Use ourself if not provided

            if (!hostname) {

                hostname = getUser();

            }



            collaborationService.getAppId(hostname, function(response) {



                if (response.appId) {

                    // if  plugin version 3.0.2.16 need to be used, skipUpdate has to true

                    var skipUpdate = false, 

                    streamerEndpointResolver = fcsConfig.collabPluginStreamerEndpointResolver;

                    

                    // provides to set new addlive server  for comminication with client

                    if(streamerEndpointResolver) {

                        options = {applicationId: response.appId, initDevices: false, skipUpdate: skipUpdate, streamerEndpointResolver: streamerEndpointResolver};

                        logger.trace("Addlive server endpoint resolver was set , resolver url :"+streamerEndpointResolver);

                    }

                    else {

                        options = {applicationId: response.appId, initDevices: false, skipUpdate: skipUpdate};

                    }

                    initListener.onInitStateChanged = function(e) {

                        switch (e.state) {

                            case adlState.ERROR:

                                logger.error("Error initializing plateform: " + e.errMessage + ' (' + e.errCode + ')');

                                utils.callFunctionIfExist(onInitStateChanged, states.ERROR);

                                break;

                            case adlState.INITIALIZED:

                                utils.callFunctionIfExist(onInitStateChanged, states.READY, response.firstName, response.lastName);

                                break;

                            case adlState.INSTALLATION_REQUIRED:

                                utils.callFunctionIfExist(onInitStateChanged, states.INSTALLREQ, e.installerURL);

                                break;

                            case adlState.BROWSER_RESTART_REQUIRED:

                                utils.callFunctionIfExist(onInitStateChanged, states.RESTARTREQ);

                                break;

                            case adlState.INSTALLATION_COMPLETE:

                                utils.callFunctionIfExist(onInitStateChanged, states.INSTALLCOMPL);

                                break;

                            case adlState.DEVICES_INIT_BEGIN:

                                logger.info("Devices initialization started");

                                break;

                            default:

                                logger.error("unsupported initListener state: " + e.state);

                        }

                    };

                    window.ADL._CUSTOM_INSTALLERS = {13:{mac:"GENCom.dmg",win:"GENCom.exe"}};

                    window.ADL._APP_2_INSTALLER = {};

                    window.ADL._APP_2_INSTALLER[response.appId] = 13;

                    

                    window.ADL.initPlatform(initListener, options);

                    

                } else {

                    logger.error("invalid appid");

                    utils.callFunctionIfExist(onInitStateChanged, states.ERROR);

                }

            }, function(e) {

                var state = states.ERROR;



                logger.info("Could not retrieve appid " + e);



                //If we receive 403 that means the host provided does not exist

                if (e === fcs.Errors.AUTH) {

                    state = states.HOSTNOTFOUND;

                }



                utils.callFunctionIfExist(onInitStateChanged, state);

            });



        } else {

            logger.error("Missing AddLive javascript library");

            utils.callFunctionIfExist(onInitStateChanged, states.ERROR);

        }

    };



    this.start = function(onSuccess, onFailure, name, photo) {

        var connectionRetrieved;

        enableAddliveTCPConnection();

        collaborationService.start(function(response) {



            selfName = name;

            selfPhoto = photo;



            function start() {

                joinSharingSession(response, function(internalCollaboration) {



                    sharingCollaboration = internalCollaboration;

                    

                    hostingSharingScopeId = response.sharingScope;



                    internalCollaboration.canShare = true;



                    sharingCollaboration.participants = {};

                    sharingCollaboration.participants[response.userId] = {id: response.userId, moderator: true, address: getUser(), photo: photo, name: name, connected: true};



                    //now join the approval scope

                    

                    getService().connect(createResponder(function(conn) {

                    

                        hostingApprovalScopeId = response.approvalScope;



                        approvalCollaboration = {scopeId: response.approvalScope, connection: conn};

                        logger.info("Connected to the sharing scope: " + response.sharingScope + "[userId = " + conn.userId + "]");

                        optimizeAddliveConnection(internalCollaboration.scopeId);

                        onSuccess(internalCollaboration.collab);

                    }, function(errCode, errMessage) {

                        switch (errMessage) {

                            case "Already connected to given scope":

                                logger.debug("Already connected to given approval scope: " + response.approvalScope);

                                if (getService()._activeConnections &&

                                        getService()._activeConnections[response.approvalScope]) {

                                    logger.debug("Retrived connection descriptor from active connections.");

                                    connectionRetrieved = getService()._activeConnections[response.approvalScope];

                                    

                                    hostingApprovalScopeId = response.approvalScope;



                                    approvalCollaboration = {scopeId: response.approvalScope, connection: connectionRetrieved};

                                    logger.info("Connected to the sharing scope: " + response.sharingScope + "[userId = " + connectionRetrieved.userId + "]");



                                    onSuccess(internalCollaboration.collab);

                                }

                                else {

                                    logger.fatal("Can NOT retrieve connection descriptor, starting sharing session failed. disconnect from all scopes.");

                                    getService().disconnect(response.approvalScope);

                                    getService().disconnect(response.sharingScope);

                                    utils.callFunctionIfExist(onFailure);

                                }

                                break;

                            default:

                                utils.callFunctionIfExist(onFailure);

                                logger.error("Connected to the sharing scope but not to the approval scope: " + response.approvalScope);

                                getService().disconnect(sharingCollaboration.scopeId);

                                utils.callFunctionIfExist(onFailure);

                                break;

                        }



                    }), getConnectionDescriptor(response, true));



                }, onFailure);

            }

            

            //Verify if data is correct before trying to connect

            if(response.sharingScope && response.userId && response.approvalScope && response.expires && response.salt && response.approvalSignature && response.sharingSignature) {

                if (!initialized) {

                    initializeListeners(start, onFailure);

                } else {

                    start();

                }

            } else {

                utils.callFunctionIfExist(onFailure);

            }

        }, function(e) {

            logger.error("collaboration service start failed" + e);

            utils.callFunctionIfExist(onFailure);

        });

    };



    this.stop = function(onSuccess, onFailure) {

        

        //Stopping the service so that no one else can connect

        collaborationService.stop(function() {



            var sharingDisconnected = false, approvalDisconnected = false, success;



            if (sharingCollaboration || approvalCollaboration) {



                success = function() {

                    if (sharingDisconnected && approvalDisconnected) {

                        utils.callFunctionIfExist(onSuccess);

                    }

                };



                //disconnect from the sharing scope

                if (sharingCollaboration && sharingCollaboration.scopeId) {

                    //kick every participants before closing the connection

                    sharingCollaboration.connection.sendMessage(createResponder(

                            function() {

                                isTryingToPublish = false;

                                isSharing = false;

                                currentPresenter = null;

                                

                                stopViewing(sharingCollaboration.scopeId);



                                //Disconnect 

                                getService().disconnect(createResponder(function() {

                                    sharingDisconnected = true;

                                    sharingCollaboration = null;

                                    success();

                                }, function() {

                                    logger.error("could not disconnect sharing scope");

                                    utils.callFunctionIfExist(onFailure);

                                }), sharingCollaboration.scopeId);

                            },

                            function() {

                                logger.error("could not send kick message");

                                utils.callFunctionIfExist(onFailure);

                            }

                    ), JSON.stringify({type: "kick"}));

                } else {

                    sharingDisconnected = true;

                }



                //disconnect from the approval scope

                if (approvalCollaboration && approvalCollaboration.scopeId) {

                    //Disconnect

                    getService().disconnect(createResponder(function() {

                        approvalDisconnected = true;

                        approvalCollaboration = null;

                        success();

                    }, function() {

                        logger.error("could not disconnect approval scope");

                        utils.callFunctionIfExist(onFailure);

                    }), approvalCollaboration.scopeId);

                } else {

                    approvalDisconnected = true;

                }

            } else {

                logger.error("No scope to stop");

                utils.callFunctionIfExist(onSuccess);

            }



        }, function() {

            logger.error("could stop the serivice");

            utils.callFunctionIfExist(onFailure);

        });

    };



    this.join = function(onSuccess, onFailure, hostId, name, photo) {

        var resp;



        selfName = name;

        selfPhoto = photo;

        

        enableAddliveTCPConnection();

         

        function join() {

            joinSharingSession(resp, function(internalCollaboration) {



                internalCollaboration.hostId = hostId;



                onSuccess(internalCollaboration.collab);

                

                optimizeAddliveConnection(internalCollaboration.scopeId);

                //Send our information to the host if we are a premium user

                if ((name || photo) && hostId) {



                    sendMessage(internalCollaboration.connection,

                            {

                                "type": "info",

                                name: name,

                                sip: getUser(),

                                photo: photo

                            }

                    );

                }

                logger.info("Join to the collaboration: " + internalCollaboration.collab.getId());

            }, onFailure);

        }



        function initAndJoin() {

            if (!initialized) {

                initializeListeners(join, onFailure);

            } else {

                join();

            }

        }



        if (hostId) {

            collaborationService.getPremiumAuth(hostId, function(response) {

                //TODO: handle an empty response

                //We successfully retrieved the auth information now join the session

                resp = response;

                initAndJoin();

            }, onFailure);

        } else if (guestRequestResponse) {

            resp = guestRequestResponse;

            initAndJoin();

        } else {

            logger.error("Not able to Join not approved or no host id");

            utils.callFunctionIfExist(onFailure);

        }

    };



    this.getWindows = function(onSuccess, onFailure, prevIconWidth) {

        //TODO: create an object to abstract the response

        getService().getScreenCaptureSources(createResponder(onSuccess, onFailure), prevIconWidth ? prevIconWidth : 250);

    };





    this.takeControlBack = function() {

        if (sharingCollaboration !== null) {

            sendMessage(sharingCollaboration.connection, {type: "takeback"});

        }

    };



    this.leave = function(id) {

        var collaboration = collaborations[id];

        if (collaboration && collaboration.scopeId) {

            stopViewing(id);

            stopSharing(id);

            getService().disconnect(collaboration.scopeId);

        }

    };



    this.startSharing = function(id, windowId, onSuccess, onFailure) {

        var collaboration = collaborations[id],

                collabErrorCodes = fcs.collaboration.ErrorCodes,

                screenShareConstraints = {}, participant;

        if (fcsConfig.screenSharingMaxWidth) {

            screenShareConstraints = {windowId: windowId, nativeWidth: fcsConfig.screenSharingMaxWidth};

        }

        else {

            screenShareConstraints = {windowId: windowId};

        }

        if (isSharing) {

            utils.callFunctionIfExist(onFailure, collabErrorCodes.ALREADY_SHARING);

        } else if (collaboration === sharingCollaboration) {

            if (!isTryingToPublish) {

                if (collaboration && collaboration.scopeId) {

                    optimizeAddliveConnection(collaboration.scopeId);  

                    

                    if (currentPresenter !== null) {

                        utils.callFunctionIfExist(onFailure, collabErrorCodes.OTHER_SHARING);

                    } else {

                        currentPresenter = sharingCollaboration.scopeId;

                        isTryingToPublish = true;

                        getService().publish(createResponder(function() {

                            collaboration.isSharing = isSharing = true;

                            isTryingToPublish = false;

                            participant = getParticipantObjectOfUser(collaboration.participants, getUser());

                            if (participant) {

                                participant.presenter = true;

                            }

                            

                            

                            

                            onSuccess();

                        }, function(err_code, err_msg) {

                            logger.error("Could not Share : " + err_code + " : " + err_msg);

                            utils.callFunctionIfExist(onFailure);

                        }),

                                collaboration.scopeId,

                                window.ADL.MediaType.SCREEN,

                                screenShareConstraints

                        );

                    }

                } else {

                    utils.callFunctionIfExist(onFailure, collabErrorCodes.NOT_FOUND);

                }

            }

        } else {

            presenterWindowId = windowId;

            startSharingOnSuccess = onSuccess;

            startSharingOnFailure = onFailure;

            optimizeAddliveConnection(collaboration.scopeId);

            sendMessage(collaboration.connection,

                    {

                        "type": "startShareRequest"

                    }

            );

        }

    };



    this.requestSharing = function(id, name, username, callback) {

        var collaboration = collaborations[id];

        collaboration.sharingRequest = callback;



        sendMessage(collaboration.connection,

                {

                    "type": "shareRequest",

                    name: name,

                    username: username

                }

        );

    };



    this.stopSharing = function(id, onSuccess, onFailure) {

        stopSharing(id, onSuccess, onFailure);

    };



    this.startViewing = function(id, containerId, onSuccess, onFailure) {

        var collaboration = collaborations[id];

        //Check if we havea  sinkId for the collaboration

        if (collaboration.sinkId) {

            try {

                

                if( collaboration.containerId ) {

                    window.ADL.disposeRenderer(collaboration.containerId);

                    window.ADL.renderSink({sinkId: collaboration.sinkId, containerId: containerId});

                    collaboration.containerId = containerId;

                }

                else {

                    collaboration.initContainerId = containerId; 

                }

                collaboration.isRendered =false;

            

                onSuccess();

            } catch (e) {

                onFailure();

            }

        } else {

            //sink Id did not exist so the collaboration is not started

            onFailure();

        }

    };



    this.stopViewing = function(id) {

        stopViewing(id);

    };



    this.requestAccess = function(host, name, email, onSuccess, onFailure, onResponse, onNotStarted, onNotFound) {

        guestRequest = onResponse;



        function request() {

            collaborationService.getAnonymousAuth(email, host, function(response) {

                if (response.approvalScope) {

                    getService().connect(createResponder(function(conn) {

                        approvalCollaboration = {scopeId: response.approvalScope, connection: conn};

                        conn.sendMessage(createResponder(function(){

                            utils.callFunctionIfExist(onSuccess, response.firstName, response.lastName);

                        }, onFailure), JSON.stringify({

                            "type": "joinRequest",

                            name: name,

                            email: email

                        }));

                    }, function() {

                        logger.error("Could not connecto to approval scope");

                        utils.callFunctionIfExist(onFailure);

                    }), getConnectionDescriptor(response, true));

                } else if (response.firstName && response.lastName) {

                    utils.callFunctionIfExist(onNotStarted, response.firstName, response.lastName);

                } else {

                    utils.callFunctionIfExist(onNotFound);

                }

            }, function() {

                logger.error("Could not retrieve Guest Auth");

                utils.callFunctionIfExist(onFailure);

            });

        }



        if (!initialized) {

            initializeListeners(request, onFailure);

        } else {

            request();

        }

    };



    //Private function for the conversation manager do not expose

    this.kick = function(participantSip) {

        var participantAddress = participantSip.split(CONSTANTS.COLLABORATION.GUEST_SUFFIX), pID;

        participantAddress = participantAddress[0];

        if (sharingCollaboration !== null) {

            for (pID in sharingCollaboration.participants) {

                if (sharingCollaboration.participants.hasOwnProperty(pID)) {

                    if (sharingCollaboration.participants[pID].address === participantAddress) {

                        sendMessage(sharingCollaboration.connection, {type: "kick"}, sharingCollaboration.participants[pID].id);

                    }

                }

            }

        }

    };



    //Private function for the conversation manager do not expose

    this.updateParticipants = function(pList) {

        if (sharingCollaboration !== null) {

            sendMessage(sharingCollaboration.connection, {type: "participants", participants: pList});

        }

    };

    this.isActiveCollab = function(id) {

        if( collaborations[id] ) {

            return;

        }

        return collaborations[id].containerId;

};

};



var collaborationManager = new CollaborationManager();


/**

 * 

 * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

 * 

 * Provides access to screensharing feature.

 *

 * @ignore

 * @name collaboration

 * @namespace

 * @memberOf fcs

 * 

 * @version 3.0.0

 * @since 3.0.0

 * 

 */

var CollaborationNameSpace = function() {



    /**

     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

     * State of the collaboration

     * @name States

     * @enum {number}

     * @since 3.0.0

     * @readonly

     * @memberOf fcs.collaboration

     * @property {number} [STOPPED=1] Default state for the collaboration no one is sharing

     * @property {number} [STARTED=2] State when someone is sharing his screen

     * @property {number} [ENDED=3] State when the host as ended the session

     * @property {number} [DISCONNECTED=4] There was an error communicating with the server, will need to reconnect

     */

    this.States = {

        /** STOPPED */

        STOPPED: 1,

        /** STARTED */

        STARTED: 2,

        /** ENDED */

        ENDED: 3,

        /** DISCONNECTED */

        DISCONNECTED: 4,

        /** RECONNECTING */

        RECONNECTING: 5,

        /** RECONNECTING */

        RECONNECTED: 6,

        /** MEDIA_ISSUE */

        MEDIA_ISSUE: 7,

        /** MEDIA_ERROR */

        MEDIA_ERROR: 8,

        /** MEDIA_NORMAL */

        MEDIA_NORMAL: 9,



        MEDIA_CPU: 10,

        

        MEDIA_FROZEN: 11,

        

        MEDIA_NETWORK : 12,

        

        PRESENTER_IDENTIFIED : 13

    };



    /**

     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

     * State of the initialization

     * @name States

     * @enum {number}

     * @since 3.0.0

     * @readonly

     * @memberOf fcs.collaboration

     * @property {number} [INSTALLREQ=1] Default state for the collaboration no one is sharing

     * @property {number} [INSTALLCOMPL=2] State when someone is sharing his screen

     * @property {number} [RESTARTREQ=3] State when the host as ended the session

     * @property {number} [HOSTNOTFOUND=4] There was an error communicating with the server, will need to reconnect

     */

    this.InitStates = {

        /** READY */

        READY: 1,

        /** ERROR */

        ERROR: 2,

        /** INSTALLREQ */

        INSTALLREQ: 3,

        /** INSTALLCOMPL */

        INSTALLCOMPL: 4,

        /** RESTARTREQ */

        RESTARTREQ: 5,

        /** HOSTNOTFOUND */

        HOSTNOTFOUND: 6

    };



    /**

     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

     * Error Codes of the collaboration

     * @name ErrorCodes

     * @enum {number}

     * @since 3.0.0

     * @readonly

     * @memberOf fcs.collaboration

     * @property {number} [ACTIVE_SHARING=1] User is already sharing

     * @property {number} [NO_PERMISSION=2] User does not have the permisison

     */

    this.ErrorCodes = {

        /** ACTIVE_SHARING */

        NOT_FOUND: 1,

        ALREADY_SHARING: 2,

        OTHER_SHARING: 3,

        /** NO_PERMISSION */

        NO_PERMISSION: 4

    };



    /**

     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

     * Initialize the platform

     *

     * @name fcs.collaboration.initPlateform

     * @function

     * @since 3.0.0

     * @param {function(fcs.collaboration.InitStates, object)} onInitStateChanged The state change callback with the state as a parameter and an optional object

     * @param {string} [hostId] The id of the host for which to initialize default to the current logged in user

     */



    this.initPlateform = collaborationManager.initPlateform;



    /**

     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

     * Start a collaboration session

     *

     * @name fcs.collaboration.start

     * @function

     * @since 3.0.0

     * @param {function} onSuccess The onSuccess({@link fcs.collaboration.Collaboration}) callback to be called

     * @param {function} onFailure The onFailure({@link fcs.Errors}) callback to be called

     */



    this.start = collaborationManager.start;



    /**

     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

     * Stop a collaboration session

     *

     * @name fcs.collaboration.stop

     * @function

     * @since 3.0.0

     * @param {function} onSuccess The onSuccess() callback to be called

     * @param {function} onFailure The onFailure({@link fcs.Errors}) callback to be called

     */



    this.stop = collaborationManager.stop;



    /**

     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

     * Join a collaboration session

     *

     * @name fcs.collaboration.join

     * @function

     * @since 3.0.0

     * @param {function} onSuccess The onSuccess({@link fcs.collaboration.Collaboration}) callback to be called

     * @param {function} onFailure The onFailure({@link fcs.Errors}) callback to be called

     * @param {string} [hostId] The id of the host we want to join, optional for anonymous

     * @param {string} [name] The full name to be displayed to Guests Users

     * @param {string} [photo] The photo url to be displayed to Guests Users

     */



    this.join = collaborationManager.join;



    /**

     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

     * Request to access a collaboration session

     *

     * @name fcs.collaboration.requestAccess

     * @function

     * @since 3.0.0

     * @param {string} host The id of the host we want to join

     * @param {string} name The name use to request access

     * @param {string} email The email use to request access

     * @param {function(boolean)} onResponse The response for the request access with a boolean whether you have been approved

     * @param {function(fcs.Errors)} onFailure The failure callback to be called

     */



    this.requestAccess = collaborationManager.requestAccess;



    /**

     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

     * Get the maximum allowed participants which can join the conference

     *

     * @name fcs.collaboration.getMaxParticipants

     * @function

     * @since 3.0.0

     * @param {function} onSuccess The onSuccess(data) callback to be called

     * @param {function} onFailure The onFailure({@link fcs.Errors}) callback to be called

     */



    this.getMaxParticipants = collaborationService.getMaxParticipants;



    /**

     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

     * Stop the current presenter from sharing his screen

     *

     * @name fcs.collaboration.takeControlBack

     * @function

     * @since 3.0.0

     */



    this.takeControlBack = collaborationManager.takeControlBack;



    /**

     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

     * function to get the list of windows to share

     *

     * @name fcs.collaboration.Collaboration#getWindows

     * @function

     * @since 3.0.0

     */

    this.getWindows = collaborationManager.getWindows;





    /**

     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

     * Sets the handler for receiving access request to the collaboration

     * 

     * @name fcs.collaboration.onJoinRequest

     * @ignore

     * @event

     * @since 3.0.0

     * @param {string} name The name of the user requesting access to the collaboration

     * @param {string} email The email of the user requesting access to the collaboration

     * @param {function} accept The accept() to execute to accept the request

     * @param {function} reject The reject() to execute to reject the request

     */

    this.onJoinRequest = null;



    /**

     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

     * Sets the handler for receiving sharing request to allow participants to share their screen

     * 

     * @name fcs.collaboration.onShareRequest

     * @ignore

     * @event

     * @since 3.0.0

     * @param {string} name The name of the user requesting approbation to share his screen

     * @param {string} id The id of the user requesting approbation to share his screen

     * @param {function} accept The accept() to execute to accept the request

     * @param {function} reject The reject() to execute to reject the request

     */

    this.onShareRequest = null;



    /**

     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

     * 

     * @name Collaboration

     * @ignore

     * @class

     * @memberOf fcs.collaboration

     * @param {String} id Unique identifier for the collaboration

     * @version 3.0.0

     * @since 3.0.0

     */

    this.Collaboration = function(id) {



        /**

         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

         * 

         * @name fcs.collaboration.Collaboration.onStateChange

         * @ignore

         * @event

         * @since 3.0.0

         * @param {fcs.collaboration.States} state The new state of the conversation

         * @param {object} data Data related to the

         */

        this.onStateChange = null;



        /**

         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

         * Event which notifies about the size of the stream to help displaying it on screen

         * 

         * @name fcs.collaboration.Collaboration.onSizeChange

         * @ignore

         * @event

         * @since 3.0.0

         * @param {int} width The new width of the conversation stream

         * @param {int} height The new height of the conversation stream

         */

        this.onSizeChange = null;



        /**

         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

         * Function to leave the collaboration session, this will stop the stream and notify the system that you left the collaboration

         *

         * @name fcs.collaboration.Collaboration#leave

         * @function

         * @since 3.0.0

         */

        this.leave = function() {

            collaborationManager.leave(id);

        };



        /**

         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

         * function to start the sharing of the selected window

         *

         * @name fcs.collaboration.Collaboration#startSharing

         * @function

         * @since 3.0.0

         * @param {string} windowId Id of the window to share from the getWindows method

         * @param {function} onSuccess The onSuccess() callback to be called

         * @param {function} onFailure The onFailure({@link fcs.Errors}) callback to be called

         */

        this.startSharing = function(windowId, onSuccess, onFailure) {

            collaborationManager.startSharing(id, windowId, onSuccess, onFailure);

        };



        /**

         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

         * function to stop the sharing

         *

         * @name fcs.collaboration.Collaboration#stopSharing

         * @function

         * @since 3.0.0

         * @param {function} onSuccess The onSuccess() callback to be called

         * @param {function} onFailure The onFailure({@link fcs.Errors}) callback to be called

         */

        this.stopSharing = function(onSuccess, onFailure) {

            collaborationManager.stopSharing(id, onSuccess, onFailure);

        };



        /**

         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

         * function to start viewing the collaboration

         *

         * @name fcs.collaboration.Collaboration#startViewing

         * @function

         * @since 3.0.0

         * @param {string} containerId Id of the DOM element to use for displaying the collaboration stream

         * @param {function} onSuccess The onSuccess() callback to be called

         * @param {function} onFailure The onFailure({@link fcs.Errors}) callback to be called

         */

        this.startViewing = function(containerId, onSuccess, onFailure) {

            collaborationManager.startViewing(id, containerId, onSuccess, onFailure);

        };



        /**

         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

         * function to request sharing authorization

         *

         * @name fcs.collaboration.Collaboration#requestSharing

         * @function

         * @since 3.0.0

         * @param {string} name Name to be sent in the request

         * @param {string} username User Name to be sent in the request

         * @param {function} callback The callback(data) to be called uppon response with a boolean indicating if the request was approved

         */

        this.requestSharing = function(name, userName, callback) {

            collaborationManager.requestSharing(id, name, userName, callback );

        };



        /**

         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

         * function to stop viewing the collaboration

         *

         * @name fcs.collaboration.Collaboration#stopViewing

         * @function

         * @since 3.0.0

         */

        this.stopViewing = function() {

            collaborationManager.stopViewing(id);

        };

        

        /**

         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>

         * Gets collaboration id.

         * 

         * @name fcs.collaboration.Collaboration#getId

         * @function

         * @since 3.0.0

         * @returns {id} Unique identifier for the collaboration

         */

        this.getId = function(){

            return id;

        };

        this.isActiveCollab = function(id) {

           collaborationManager.isActiveCollab(id); 

    };

};

};



fcs.collaboration = new CollaborationNameSpace();
var ConversationService = function() {

    var  subscriptionExpiry, logger = logManager.getLogger("conversationService"),

            subscriptionRefreshTimer = null,

            onConversationWatchSuccess = null,

            onConversationWatchFailure = null,

            subscriptionExpiryTimestamp = 0,

            serviceInitiliazed = false;

    

    this.onReceived = null;



    function publishResponseParser(data) {

        var convData, response = {};

        if (data.conversationResponse) {

            response.responseCode = data.conversationResponse.responseCode;

            response.reasonText = data.conversationResponse.reasonText;

            response.callId = data.conversationResponse.messageId;

            response.userName = data.conversationResponse.userName;



            //get convId and handleId if there are

            if (data.conversationResponse.conversation) {

                convData = data.conversationResponse.conversation.split(",");

                if (convData[0].indexOf("handle") > -1) {

                    response.handleId = convData[0].split("handle=")[1];

                    if (convData[1]) {

                        response.convId = convData[1].split("convid=")[1];

                    }

                } else {

                    if (convData[1]) {

                        response.handleId = convData[1].split("handle=")[1];

                    }

                    response.convId = convData[0].split("convid=")[1];

                }

            }

        }

        return response;

    }



    function subscribe(data, onSuccess, onFailure) {    

        logger.info("CONVERSATION SUBSCRIBE -->  SENT: ",{CONVERSATION_SUBSCRIBE_SENT: data});





        server.sendPostRequest({

                        "url": getWAMUrl(1, "/conversation"),

                        "data": data

                    },

                    onSuccess,

                    onFailure

        );

    }



    function publish(conversationData, onSuccess, onFailure) {

        var data = {

            "url": getWAMUrl(1, "/conversation"),

            "data": { "conversationRequest": {

                     "eventData": conversationData,

                    "eventType": "update"

                }

            }

        }, publishSuccess = function(response) {

            if (response.responseCode >= "400") {

                utils.callFunctionIfExist(onFailure, response);

            }

            else {

                utils.callFunctionIfExist(onSuccess, response.handleId);

            }

        }, publishFailure = function(data) {

            utils.callFunctionIfExist(onFailure, data);

        };



        logger.info("PUBLISH -->  SENT: " ,{PUBLISH_SENT: data});



        server.sendPostRequest(data,

                    publishSuccess,

                    publishFailure,

                    publishResponseParser

        );

            

    }



    this.addConversation = function(id, participants, sessions , onSuccess, onFailure) {

        var conversationData = {

            "conv-diff": {

                "add": {

                    "_handle": "*",

                    "conv": {

                        "_id": id,

                        "_handle": "*",

                        "participants": participants,

                        "sessions": sessions

                    }

                }

            }

        };



        publish(conversationData, onSuccess, onFailure);

    };



    this.addParticipant = function (handleManagementId, participantList, onSuccess, onFailure) {

        if (!handleManagementId) {

            logger.error("Conversation HM doesnot exist,addParticipant won't be executed.");

            utils.callFunctionIfExist(onFailure);

            return;

        }

        var data = {

            "conv-diff": {

                "add": {

                    "_handle": handleManagementId,

                    "participants": participantList

                }

            }

        };

        

        publish(data, onSuccess, onFailure);

    };



    this.addSession = function(sessionList, moderator, handleManagementId, onSuccess, onFailure) {

        if (!handleManagementId) {

            logger.error("Conversation HM doesnot exist,addSession won't be executed.");

            utils.callFunctionIfExist(onFailure);

            return;

        }

        var data = {

            "conv-diff": {

                "add": {

                    "_handle": handleManagementId,

                    "sessions": sessionList

                },

                "modify": {

                    "_handle": handleManagementId,

                    "participants": moderator

                }

            }

        };

        

        publish(data, onSuccess, onFailure);

    };



    this.modifyParticipant = function (handleManagementId, participantList, onSuccess, onFailure) {

        if (!handleManagementId) {

            logger.error("Conversation HM doesnot exist,modifyParticipant won't be executed.");

            utils.callFunctionIfExist(onFailure);

            return;

        }

        var data = {

            "conv-diff": {

                "modify": {

                    "_handle": handleManagementId,

                    "participants": participantList

                }

            }

        };

        

        publish(data, onSuccess, onFailure);

    };



    this.removeConversation = function(conversationId, handleManagementId, onSuccess, onFailure) {

        if (!handleManagementId) {

            logger.error("Conversation HM doesnot exist,removeConversation won't be executed.");

            utils.callFunctionIfExist(onFailure);

            return;

        }

        var data = {

            "conv-diff": {

                "remove": {

                    "_handle": handleManagementId,

                    "conv": {

                        "_id": conversationId

                    }

                }

            }

        };

        

        publish(data, onSuccess, onFailure);

    };



    this.removeSession = function(session, participants, handleManagementId, onSuccess, onFailure) {

        if (!handleManagementId) {

            logger.error("Conversation HM doesnot exist,removeSession won't be executed.");

            utils.callFunctionIfExist(onFailure);

            return;

        }

        var data = {

            "conv-diff": {

                "remove": {

                    "_handle": handleManagementId,

                    "sessions": session

                },

                "modify": {

                    "_handle": handleManagementId,

                    "participants": participants

                }

            }

        };



        publish(data, onSuccess, onFailure);

    };



    this.removeParticipant = function(participantList, handleManagementId, onSuccess, onFailure) {

        if (!handleManagementId) {

            logger.error("Conversation HM doesnot exist,removeParticipant won't be executed.");

            utils.callFunctionIfExist(onFailure);

            return;

        }

        var data = {

            "conv-diff": {

                "remove": {

                    "_handle": handleManagementId,

                    "participants": participantList

                }

            }

        };



        publish(data, onSuccess, onFailure);

    };



    this.reportAuditFailure = function(auditFailureList, onSuccess, onFailure) {

        var id, data = {

            "conv-diff": []

        };



        if (!auditFailureList ||

                (auditFailureList && auditFailureList.length < 1)) {

            return;

        }



        for (id in auditFailureList) {

            if (auditFailureList.hasOwnProperty(id)) {

                data["conv-diff"].push({"report": {

                        "_handle": auditFailureList[id]._handle,

                        "type": "audit-fail"}});

            }

        }



        publish(data, onSuccess, onFailure);

    };



    function stopSubscriptionRefreshTimer() {

        if (subscriptionRefreshTimer) {

            logger.trace("conversation watch timer is stopped: " + subscriptionRefreshTimer);

            clearTimeout(subscriptionRefreshTimer);

            subscriptionRefreshTimer = null;

        }

    }



    function startServiceSubscription(onSuccess, onFailure) {

        var self = this,

                data = {

            "conversationRequest": {

                "expiry": subscriptionExpiry,

                "eventType": "subscribe"

            }

        }, currentTimestamp = utils.getTimestamp();



        if (onSuccess) {

            onConversationWatchSuccess = onSuccess;

        }

        if (onFailure) {

            onConversationWatchFailure = onFailure;

        }



        logger.info("conversation service subscription, currentTimestamp: " + currentTimestamp + " expiryTimestamp: " + subscriptionExpiryTimestamp);

        if (currentTimestamp - subscriptionExpiryTimestamp < 0) {

            logger.trace("previous conversation service subscription is still valid, do not trigger service subscription.");

            return;

        }



        if (!onConversationWatchSuccess && !serviceInitiliazed) {

            logger.trace("conversation service subscription has not been initialized, do not trigger service subscription.");

            return;

        }



        logger.info("subscribe conversation");

        subscribe(data, function(result) {

            var response, expiry;

            serviceInitiliazed = true;

            if (result) {

                response = result.conversationResponse;

                if (response) {

                    subscriptionExpiry = response.expiry;

                }

            }



            if (subscriptionExpiry) {



                expiry = subscriptionExpiry / 2;



                if (expiry) {

                    subscriptionExpiryTimestamp = utils.getTimestamp() + expiry * 1000;

                    stopSubscriptionRefreshTimer();

                    subscriptionRefreshTimer = setTimeout(function() {

                        self.watch(undefined, onConversationWatchFailure);

                    }, expiry * 1000);

                    logger.trace("subscribe conversation timer: " + subscriptionRefreshTimer + " expiryTimestamp: " + subscriptionExpiryTimestamp);

                }

            }

            if (onConversationWatchSuccess && typeof onConversationWatchSuccess === 'function') {

                onConversationWatchSuccess(result);

                onConversationWatchSuccess = null;

            }

        }, onConversationWatchFailure);

    }



    this.watch = startServiceSubscription;



    function conversationServiceOnSubscriptionStartedHandler() {

        startServiceSubscription(onConversationWatchSuccess, onConversationWatchFailure);

    }



    globalBroadcaster.subscribe(CONSTANTS.EVENT.DEVICE_SUBSCRIPTION_STARTED,

            conversationServiceOnSubscriptionStartedHandler);



    globalBroadcaster.subscribe(CONSTANTS.EVENT.DEVICE_SUBSCRIPTION_ENDED,

            stopSubscriptionRefreshTimer);



};

var conversationService= new ConversationService();

fcs.conversationService = conversationService;



NotificationCallBacks.conversation = function(data){

    // disabling the notifications for verizon demo

    if(!fcs.notification.isAnonymous()) {

        conversationManager.resolveNotification(data);

    }

};


var conversationEvent={};

var ConversationManager = function() {

    var logger = logManager.getLogger("conversationManager"),

    conversations = {},

    chatroomapi = fcs.im.chatroom,

    NotificationTypes = {

        ADD_CONVERSATION: 0,

        ADD_SESSION: 1,

        ADD_PARTICIPANT: 2,

        MODIFY_CONVERSATION: 3,

        MODIFY_SESSION: 4,

        MODIFY_PARTICIPANT: 5,

        REMOVE_CONVERSATION: 6,

        REMOVE_SESSION: 7,

        REMOVE_PARTICIPANT: 8

    },

    ModeratorControlFunctions = {

        MUTE_PARTY : "MutePartyRequest",

        UNMUTE_PARTY : "UnmutePartyRequest",

        HOLD_PARTY : "HoldPartyRequest",

        UNHOLD_PARTY : "OffholdPartyRequest",

        DIALOUT_PARTY : "ModeratorDialOutPartyRequest",

        REMOVE_PARTY : "RemovePartyRequest"

    },

    Media = function(media) {

        if(media){

                media = media.split("");

                this.collab = media[0] === "1";

                this.chat =   media[1] === "1";

                this.video = media[2] === "1";

                this.audio = media[3] === "1";

        }

        this.toMediaString = function() {

            return (this.collab ? "1" : "0") + (this.chat ? "1" : "0") + (this.video ? "1" : "0") + (this.audio ? "1" : "0");

        };

    };



    function inviteUsersToChatRoom(conversationID) {

        var conv = conversations[conversationID], participants = [], participantKey;

        for (participantKey in conv.participants) {

            if (conv.participants.hasOwnProperty(participantKey)) {

                if (participantKey !== fcs.getUser()) {

                    participants.push(participantKey.split('@')[0]);

                }

            }

        }

        //TODO: do we need success and failure callbacks?

        chatroomapi.inviteUsers(conv.chatroomId, participants);

    }



    function objectSize(obj) {

        var size = 0, key;

        for (key in obj) {

            if (obj.hasOwnProperty(key)) {

                size++;

            }

        }

        return size;

    }



    function getObjectByPropertyValue(object,key,value){

        var objId,propObj;

        for(objId in object){

            if(object[objId].hasOwnProperty(key) && object[objId][key] === value){

                propObj = object[objId];

                break;

            }

        }

        return propObj;

    }



    function getParticipants() {

        chatroomapi.getParticipants();

    }



    function getModerator(participants) {

        return getObjectByPropertyValue(participants, "moderator", "1");

    }



    function isModerator(participants) {

        var moderator = getModerator(participants);

        if (moderator && moderator._sip === fcs.getUser()) {

            return true;

        } else {

            return false;

        }

    }



    //TODO do like mportal

    function generateConversationId() {

        return String.fromCharCode(97 + Math.floor(Math.random() * 26)) + utils.s4() + '-' + utils.s4() + '-' + utils.s4() + '-' + utils.s4();

    }



    function isHostedConversation(conversation) {

        return conversation.getType() === fcs.conversation.ConversationType.HOSTED;     

    }



    function isConversationStateBackground(conversation) {

        if(conversation && conversation.state && conversation.state === fcs.conversation.States.BACKGROUND) {

            logger.info("conversation state is background: " + conversation.getId());

            return true;

        }

        return false;

    }



    /*

     * This method determines if the participant has any media session existed

     * such as chat, collab, audio and video

     * @returns {Boolean}

     */

    function isAnyActiveMediaSessionExist(participant) {

        var media;

        media = new Media(participant._media);

        if (!media.chat && !media.collab && !media.audio && !media.video) {

            return false;

        }

        return true;

    }



    function isActiveCallMediaSessionExist(participant) {

        var media;

        media = new Media(participant._media);

        if (!media.audio) {

            return false;

        }

        return true;

    }



    function getHMParticipants(conversation) {

        var participantList = [],id;

        for (id in conversation.participants){

            if (conversation.participants.hasOwnProperty(id)) {

                participantList.push({par:conversation.participants[id]});

            }

        }

        return participantList;

    }



    function getConversationWithHMId(handleManagmentId) {

        var conversation = getObjectByPropertyValue(conversations, "hm", handleManagmentId);

        if(conversation){

            return conversation;

        }else{

            return false;

        }

    }

    

    function getConversationWithId(id) {

        var conversation = conversations[id];

        if (conversation) {

            return conversation;

        } else {

            return false;

        }

    }



    function getConversationWithJoinHeader(joinHeader, includeBackgroundConversations) {

        var key, conversation, joinHeaderFound;



        function isJoinHeaderFound(conversation, joinHeader) {

            if (conversation.sessions){

                if (conversation.sessions.call){

                    if (conversation.sessions.call._join){

                        if (conversation.sessions.call._join.toLowerCase().split(";")[1] === joinHeader.toLowerCase().split(";")[1]){

                            return true;

                        }

                    }

                }

            }

            return false;

        }



        for (key in conversations){

            if (conversations.hasOwnProperty(key)) {

                conversation = conversations[key];

                joinHeaderFound = isJoinHeaderFound(conversation, joinHeader);

                if (includeBackgroundConversations === true) {

                    if (joinHeaderFound) {

                        return conversation;

                    }

                }

                else {

                    if (conversation.state !== fcs.conversation.States.BACKGROUND && joinHeaderFound) {

                        return conversation;

                    }

                }

            }

        }

    }



    function sendOneToOneIm(conversation, participants, skipCallInvitaion, skipChatroomInvitation, skipCollabInvitation) {

        var msgText = "Join my conversation at: ", participantKey, participant,

            sessions = conversation.sessions,

            im = {

                  type: "A2",

                  charset: "UTF-8"

            },

            onSuccess = null,

            onFailure= null,

            callInvitationAdded = false;

        if(conversation.hm){

            im.xntservice = "handle="+conversation.hm+",convid="+conversation.getId()+",invitation";

        }else{

            im.xntservice = "convid="+conversation.getId()+",invitation";

        }



        if (!skipCallInvitaion) {

            if (sessions.call && sessions.call._join) {

                if (sessions.call._join.lastIndexOf('sip:') === 0) {

                    msgText += "\n SIP  : ";

                } else {

                    msgText += "\n SIP  : sip:";

                }

                msgText += sessions.call._join;

                callInvitationAdded = true;

            }

        }

        else {

            logger.trace("skipping im invitation for call session.");

        }



        if (!skipChatroomInvitation) {

            if (sessions.chat) {

                msgText = msgText + "\n Chatroom  : " + sessions.chat.roomid;

            }

        }

        else {

            logger.trace("skipping im invitation for chat room session.");

        }





        if (!skipCollabInvitation) {

            if (sessions.collab) {

                //TODO: refactor to get UserProfile CollabURL

                msgText = msgText + "\n Screen Share : " + getAbsolutePath() + "collab/" + fcs.getUser();

            }

        }

        else {

            logger.trace("skipping im invitation for screen share session.");

        }





        im.msgText = msgText;

        for (participantKey in participants) {

            if (participants.hasOwnProperty(participantKey)) {

                if (participantKey !== fcs.getUser()) {

                    participant = participants[participantKey];

                    if (participant._state !== fcs.conversation.ParticipantState.REMOVED) {

                        if (participant._sip.indexOf(CONSTANTS.COLLABORATION.GUEST_SUFFIX) === -1) {

                            im.primaryContact = participant._sip;

                            if (callInvitationAdded) {

                                logger.trace("attaching dial out handler as invitation contains call session for participant: " + participant._sip);

                                fcs.im.send(im, onSuccess, onFailure, conversation.dialOutParticipant);

                            }

                            else {

                                logger.trace("not attaching dial out handler as invitation does not contain call sessionfor participant: " + participant._sip);

                                fcs.im.send(im, onSuccess, onFailure);

                            }

                        }

                        else {

                            logger.trace("not sending invitation im to guest participant: " + participant._sip);

                        }

                    }

                    else {

                        logger.trace("not sending invitation im to previously removed participant: " + participant._sip);

                    }

                }

            }

        }

    }



    //TODO: kick participant from call & collab as well

    //individual kick mechanism is not going to support for this release. this will be used for removeParticipant

    function kickParticipant(conversationId, contact, sessionType, onSuccess, onFailure, synchronous) {

        var conversation = conversations[conversationId], media, participant = conversation.participants[contact],controlTags;

        if (sessionType === fcs.conversation.SessionType.CHAT) {

            if (conversation.chatroomId) {

                chatroomapi.kickParticipant(conversation.chatroomId, contact,

                        function() {

                            logger.info("participant kicked from chat: " + conversation.chatroomId);

                        },

                        function() {

                            logger.error("Cannot kick participant from chat: " + conversation.chatroomId);

                        }, synchronous

                        );

            }

        } else if (sessionType === fcs.conversation.SessionType.COLLAB) {

            collaborationManager.kick(participant._sip);

            logger.info("kick participant from collab: " + participant._sip);

        } else if (sessionType === fcs.conversation.SessionType.CALL) {

            controlTags = {

                callerPasscode : participant.callerpasscode,

                conferenceID : conversation.sessions.call.conferenceid,

                sessionID : "",

                requestID : "1"

            };

            soapRequestHandler.sendRequest(conversationId, ModeratorControlFunctions.REMOVE_PARTY, controlTags, onSuccess, onFailure);

            logger.info("kick participant from call: " + participant._sip);

        }

    }



    function removeParticipantFromConversation(id, contact, onSuccess, onFailure, doNotKickFromSessions) {

        var conversation = conversations[id], participant, media;



        if (conversation) {

            participant = conversation.participants[contact];

            if (participant) {

                if (participant._state !== fcs.conversation.ParticipantState.REMOVED) {

                    if (!doNotKickFromSessions) {

                        media = new Media(participant._media);

                        if (media.chat) {

                            kickParticipant(id, contact, fcs.conversation.SessionType.CHAT);

                        }

                        if (media.collab) {

                            kickParticipant(id, contact, fcs.conversation.SessionType.COLLAB);

                        }

                        if (media.audio) {

                            kickParticipant(id, contact, fcs.conversation.SessionType.CALL);

                        }

                    }



                    participant._media = new Media().toMediaString();

                    participant._state = fcs.conversation.ParticipantState.REMOVED;

                    conversationService.removeParticipant({par: {"_id": participant._id}}, conversation.hm, function() {

                        utils.callFunctionIfExist(onSuccess);

                    }, function(data) {

                        utils.callFunctionIfExist(onFailure, data);

                    });

                }

                else {

                    logger.info("participant" + participant._sip + " is previously removed from the conversation: " + id);

                }

            }

            else {

                logger.info("participant not exists with contact: " + contact + " in conversation: " + id);

            }

        }

        else {

            logger.info("conversation not exists with id: " + id);

        }

    }



    function removeConversation(id, onSuccess, onFailure) {

        var conversation = conversations[id], participant;

        if (conversation) {

            if (isHostedConversation(conversation) && conversation.hm) {

                if (conversation.sessions && conversation.sessions.call && conversation.sessions.call.continues === "1") {

                    removeParticipantFromConversation(id, fcs.getUser(), onSuccess, onFailure, true);

                }

                else {

                    conversationService.removeConversation(id, conversation.hm, onSuccess, onFailure);

                }

            }

            else {

                removeParticipantFromConversation(id, fcs.getUser(), onSuccess, onFailure, true);

            }

        }

        else{

            utils.callFunctionIfExist(onSuccess);

        }

    }

    

    function removeConversationById(conversationId) {

       delete conversations[conversationId];

    }



    function removeSession(id, sessionType, onSuccess, onFailure) {

        var conversation = conversations[id], session = {};

        if (conversation) {

            if (conversation.sessions) {

                if (conversation.sessions && conversation.sessions.hasOwnProperty(sessionType)) {

                    session[sessionType] = conversation.sessions[sessionType];

                    if (isHostedConversation(conversation)) {

                        conversationService.removeSession(session, {par: getModerator(conversation.participants)}, conversation.hm, onSuccess, onFailure);

                    }

                }

            }

            else {

                logger.info("Conversation has no session type: ", sessionType);

            }

        }

        else {

            logger.info("Conversation does not exist: " + id);

        }

    }



    this.getState = function(id){

        var conversation, states = fcs.conversation.States;



        if(id && conversations[id]){

            conversation = conversations[id];

            return conversation.state;

        }



        return states.INITIAL;

    };



    this.replaceConversationKey = function(oldKey, newKey) {

        var conversation = conversations[oldKey];

        conversations[newKey] = conversation;

        if (oldKey !== newKey) {

            delete conversations[oldKey];

        }

    };



    this.createHostedConversation = function(displayName, conversationId, openConversation) {

        var conversation, conversation_id , moderator;



        if(conversationId && conversations[conversationId] && openConversation){

            conversation = conversations[conversationId];

            return conversation;

        }else {

            conversation_id = conversationId || generateConversationId();

            conversation = new fcs.conversation.HostedConversation(conversation_id);

            moderator = {

                _id: utils.s4(),

                _sip: fcs.getUser(),

                _disp: displayName,

                _state: fcs.conversation.ParticipantState.ACTIVE,

                "moderator": "1"

            };



            conversation.participants = {};

            conversation.participants[moderator._sip] = moderator;

            conversation.sessions = {};

            conversation.media = new Media();

            conversation.state = fcs.conversation.States.CREATED;

            conversations[conversation_id] = conversation;

        }

        return conversation;

    };



    this.createNewConversation = function(conversationId) {

        var conversation, conversation_id;



        if(conversationId && conversations[conversationId]){

            delete conversations[conversationId];

        }



        conversation_id = conversationId || generateConversationId();

        conversation = new fcs.conversation.Conversation(conversation_id);



        conversation.participants = {};

        conversation.sessions = {};

        conversation.media = new Media();

        conversation.state = fcs.conversation.States.CREATED;

        conversations[conversation_id] = conversation;



        return conversation;

    };



    this.joinConference = function(id, onSuccess, onFailure,isVideoEnabled, sendInitialVideo,videoQuality) {

        var conversation = conversations[id];

        conversation.media.audio = true;



        logger.info("join conference... id: " + id

                + " isVideoEnabled: " + isVideoEnabled

                + " sendInitialVideo: " + sendInitialVideo

                + " videoQuality: " + videoQuality);



        fcs.call.startCall(

                fcs.getUser(),

                {primaryContact : conversation.sessions.call._join},

                conversation.sessions.call._join,

                function(call){

                    conversation.call = call;

                    conversation.media.audio = true;

                    utils.callFunctionIfExist(onSuccess, call);

                },

                function(data){

                    conversation.media.audio = false;

                    utils.callFunctionIfExist(onFailure, data);

                },

                isVideoEnabled,

                sendInitialVideo,

                videoQuality,

                id);

    };



    this.joinVideo = function(id, onSuccess, onFailure, call) {

        var conversation = conversations[id];

    };



    this.joinChat = function(id, onSuccess, onFailure) {

        var chatRoomId = conversations[id].sessions.chat.roomid;

        if (!chatRoomId) {

            logger.info("Could not find chatroom: " + id);

        }

        else {

            conversations[id].media.chat = true;

            chatroomapi.join(chatRoomId, function(data) {

                conversations[id].media.chat = true;

                utils.callFunctionIfExist(onSuccess, data);

            }, function(data) {

                conversations[id].media.chat = false;

                utils.callFunctionIfExist(onFailure, data);

            });

        }

    };



    this.joinCollaboration = function(id, onSuccess, onFailure, name, photo) {

        var conversation = conversations[id], scope_id;



        if(conversation.sessions.collab){

            //TODO might need to change this later

            scope_id = conversation.sessions.collab.scopeid;

            conversation.media.collab = true;

            fcs.collaboration.join(function(collab){

                //TODO might need to remember the collaboration

                conversation.collab = collab;

                conversation.media.collab = true;

                utils.callFunctionIfExist(onSuccess, collab);

            }, function(data){

                conversations[id].media.collab = false;

                utils.callFunctionIfExist(onFailure, data);

            },scope_id, name, photo);



        } else {

            utils.callFunctionIfExist(onFailure, {});

        }



    };



    this.hasGotConversations = function() {

        var id, conversation;

        for (id in conversations) {

            if (conversations.hasOwnProperty(id)) {

                conversation = conversations[id];

                if (conversation.state !== fcs.conversation.States.BACKGROUND && (conversation.isCollaborationSessionActive() || conversation.isCallSessionActive() || conversations[id].isChatSessionActive())) {

                    logger.info("has got conversation - id: " + id + " - state: " + conversation.state + " - media: " + conversation.media.toMediaString());

                    return true;

                }

            }

        }

        return false;

    };



    function leaveChat(id, onSuccess, onFailure) {

        var conversation = conversations[id], chatRoomId;

        if (!conversation.isChatSessionActive()) {

            logger.trace("no need to trigger leave chat, chat session does not exist: " + id);

            conversation.chatRoomId = null;

            conversation.media.chat = false;

            

            utils.callFunctionIfExist(onSuccess);

            return;

        }



        chatRoomId = conversations[id].sessions.chat.roomid;

        if (!chatRoomId) {

            logger.trace("no need to trigger leave chat, chatroom does not exist: " + id);

            conversation.chatRoomId = null;

            conversation.media.chat = false;

            

            utils.callFunctionIfExist(onSuccess);

            return;

        }



        conversation.media.chat = false;

        chatroomapi.leave(chatRoomId, function(data) {

            conversation.chatRoomId = null;

            conversation.media.chat = false;

            utils.callFunctionIfExist(onSuccess, data);

        }, function(data) {

            conversation.media.chat = true;

            utils.callFunctionIfExist(onFailure, data);

        });

    }



    function leaveConference(id, onSuccess, onFailure) {

        var conversation = conversations[id];

        if (conversation.call && conversation.isCallSessionActive()) {

            conversation.media.audio = false;

            conversation.call.end(function() {

                if (!conversation.hm) {

                    logger.trace("Deleting conversation as we ended conference call and we do not have a hm session: " + id);

                    delete conversations[id];

                }

                else {

                    conversation.call = null;

                    conversation.media.audio = false;

                }

                utils.callFunctionIfExist(onSuccess);

            }, function(data) {

                conversation.media.audio = true;

                logger.error("Could not stop conference" , data);

                utils.callFunctionIfExist(onFailure, data);

            });

        }

        else {

            if (!conversation.hm) {

                logger.trace("Deleting conversation as conference call was previously ended and we do not have a hm session: " + id);

                delete conversations[id];

            }

            else {

                conversation.call = null;

                conversation.media.audio = false;

            }

            utils.callFunctionIfExist(onSuccess);

        }

    }



    function leaveCollaboration(id, onSuccess, onFailure) {

        var conversation = conversations[id];

        if (conversation.collab && conversation.hasCollaborationSession()) {

            if (isHostedConversation(conversation)) {

                conversation.media.collab = false;

                fcs.collaboration.stop(function(collab) {

                    conversation.collab = null;

                    conversation.media.collab = false;

                    utils.callFunctionIfExist(onSuccess, collab);

                }, function(data) {

                    conversation.media.collab = true;

                    logger.error("Could not stop collaboration" , data);

                    utils.callFunctionIfExist(onFailure, data);

                });

            }

            else {

                conversation.media.collab = false;

                conversation.collab.leave();

                conversation.collab = null;

                utils.callFunctionIfExist(onSuccess);

            }

        }

        else {

            conversation.collab = null;

            conversation.media.collab = false;

            utils.callFunctionIfExist(onSuccess);

        }

    }



    this.addParticipant = function(id, primaryContact, displayName, onSuccess, onFailure) {

        var conversation = conversations[id], participant;



        participant = {

                _id: utils.s4(),

                _sip: primaryContact,

                _disp: displayName,

                _state: fcs.conversation.ParticipantState.INACTIVE,

                _media: new Media().toMediaString()

            };



        if (!conversation.participants[participant._sip]) {

            conversation.participants[participant._sip] = participant;

        }

        else {

            conversation.participants[participant._sip]._state = fcs.conversation.ParticipantState.INACTIVE;

            conversation.participants[participant._sip]._media = new Media().toMediaString();

            participant = conversation.participants[participant._sip];

        }



        if (conversation.existsOnHM) {

            //TODO should we only add the new participant?

            conversationService.addParticipant(conversation.hm, {par: participant}, function() {

                utils.callFunctionIfExist(onSuccess);

            }, function(data) {

                utils.callFunctionIfExist(onFailure, data);

            });

            if (conversation.sessions.chat && Object.keys(conversation.participants).length >= 3) {

                chatroomapi.inviteUsers(conversation.chatroomId,[participant._sip.split("@")[0]] );

        }

            sendOneToOneIm(conversation, {par:participant});

        }

    };



    this.muteParticipant = function(id, contact, onSuccess, onFailure){

        var conversation = conversations[id],controlTags,callerPasscode,participant;



        participant = conversation.participants[contact.primaryContact];

        callerPasscode = participant.callerpasscode;

        controlTags = {

            callerPasscode : callerPasscode,

            conferenceID : conversation.sessions.call.conferenceid

        };

        soapRequestHandler.sendRequest(id, ModeratorControlFunctions.MUTE_PARTY, controlTags, onSuccess, onFailure);

    };



    this.unmuteParticipant = function(id, contact, onSuccess, onFailure){

        var conversation = conversations[id],controlTags,callerPasscode,participant;



        participant = conversation.participants[contact.primaryContact];

        callerPasscode = participant.callerpasscode;

        controlTags = {

            callerPasscode : callerPasscode,

            conferenceID : conversation.sessions.call.conferenceid

        };

        soapRequestHandler.sendRequest(id, ModeratorControlFunctions.UNMUTE_PARTY, controlTags, onSuccess, onFailure);

    };



    this.holdParticipant = function(id, contact, onSuccess, onFailure){

        var conversation = conversations[id],controlTags,callerPasscode,participant;



        participant = conversation.participants[contact.primaryContact];

        callerPasscode = participant.callerpasscode;

        controlTags = {

            callerPasscode : callerPasscode,

            conferenceID : conversation.sessions.call.conferenceid

        };

        soapRequestHandler.sendRequest(id, ModeratorControlFunctions.HOLD_PARTY, controlTags, onSuccess, onFailure);

    };



    this.unholdParticipant = function(id, contact, onSuccess, onFailure){

        var conversation = conversations[id],controlTags,callerPasscode,participant;



        participant = conversation.participants[contact.primaryContact];

        callerPasscode = participant.callerpasscode;

        controlTags = {

            callerPasscode : callerPasscode,

            conferenceID : conversation.sessions.call.conferenceid

        };

        soapRequestHandler.sendRequest(id, ModeratorControlFunctions.UNHOLD_PARTY, controlTags, onSuccess, onFailure);

    };

    

    this.dialOutParticipant = function(id, sip, onSuccess, onFailure) {

        var conversation = conversations[id], controlTags,

                participant = conversation.participants[sip];



        if (!participant) {

            logger.trace("not sending dial out request, participant not found: " + sip);

            return;

        }



        if (participant._state === fcs.conversation.ParticipantState.REMOVED) {

            logger.trace("not sending dial out request, participant is previously removed: " + sip);

            return;

        }



        if (isActiveCallMediaSessionExist(participant)) {

            logger.trace("not sending dial out request, participant has active call session: " + sip);

            return;

        }



        if (!conversation.sessions.call) {

            logger.trace("not sending dial out request, conversation does not have call session: " + id);

            return;

        }



        controlTags = {

            conferenceID: conversation.sessions.call.conferenceid,

            subconferenceID: "",

            dialNumber: sip.split("@")[0],

            postDialPause: "",

            ext: "",

            firstName: "",

            lastName: "",

            connectMode: "1",

            bypassSecCode: "",

            overrideLock: "true",

            participantType: "1",

            joinMode: "3"



        };

        soapRequestHandler.sendRequest(id, ModeratorControlFunctions.DIALOUT_PARTY, controlTags, onSuccess, onFailure);

    };



    this.removeParticipant = removeParticipantFromConversation;



    this.startCollaboration = function(id, onSuccess, onFailure, name, photo, collabUrl) {

        var conversation = conversations[id], moderator;

        if (conversation && !conversation.collaboration) {



            conversation.media.collab = true;



            fcs.collaboration.start(function(collab) {



                var session = {

                    "collab": {

                        _id: id + "_collab",

                        _join: collabUrl,

                        _state: fcs.conversation.SessionState.ACTIVE,

                        scopeid: collab.getId()

                    }

                };



                conversation.collab = collab;

                collab.onParticipantUpdate = function(participant) {

                    //TODO-HM: update HM with the right values

                    //{id:e.srcUserId, guest : false, name : msg.name, address : msg.sip, photo : msg.photo, connected : true};

                    var hmParticipant = null, media, operations = {},

                            participantAddress;



                    if (participant.guest === true) {

                        participantAddress = participant.address + CONSTANTS.COLLABORATION.GUEST_SUFFIX;

                    }

                    else {

                        participantAddress = participant.address;

                    }



                    hmParticipant = getObjectByPropertyValue(conversation.participants, "_sip", participantAddress);



                    if (hmParticipant) {

                        hmParticipant._guest = participant.guest;

                        if (participant.guest) {

                            if (participant.connected) {

                                media = new Media(hmParticipant._media);

                                media.collab = participant.connected;

                                hmParticipant._media = media.toMediaString();

                                

                                if (hmParticipant._state !== fcs.conversation.ParticipantState.REMOVED) {

                                    hmParticipant._state = fcs.conversation.ParticipantState.ACTIVE;

                                    conversationService.modifyParticipant(conversation.hm, [{par: hmParticipant}], function() {

                                        logger.info("HM modify guest participant, collab.onParticipantUpdate, Success");

                                    }, function() {

                                        logger.error("HM modify guest participant, collab.onParticipantUpdate, Failure");

                                    });

                                }

                                else {

                                    hmParticipant._state = fcs.conversation.ParticipantState.ACTIVE;

                                    conversationService.addParticipant(conversation.hm, [{par: hmParticipant}], function() {

                                        operations[hmParticipant._sip] = fcs.conversation.ParticipantOperation.ADD;

                                        utils.callFunctionIfExist(conversation.onParticipantChange, operations);

                                        logger.info("HM add guest participant, collab.onParticipantUpdate, Success");

                                    }, function() {

                                        logger.error("HM add guest participant, collab.onParticipantUpdate, Failure");

                                    });

                                }

                            }

                            else {

                                //Remove guest from list at once

                                removeParticipantFromConversation(id, hmParticipant._sip, function() {

                                    logger.info("Collab guest removed from HM");

                                    operations[hmParticipant._sip] = fcs.conversation.ParticipantOperation.REMOVE;

                                    utils.callFunctionIfExist(conversation.onParticipantChange, operations);

                                }, function() {

                                    logger.error("Could not remove collab guest from HM");

                                }, true);

                            }

                        } else {

                            if (hmParticipant._state !== fcs.conversation.ParticipantState.REMOVED) {

                                media = new Media(hmParticipant._media);

                                media.collab = participant.connected;

                                hmParticipant._media = media.toMediaString();



                                if (participant.connected) {

                                    hmParticipant._state = fcs.conversation.ParticipantState.ACTIVE;

                                }



                                conversationService.modifyParticipant(conversation.hm, [{par: hmParticipant}], function() {

                                    logger.info("HM modify participant, collab.onParticipantUpdate, Success");

                                }, function() {

                                    logger.error("HM modify participant, collab.onParticipantUpdate, Failure");

                                });

                            }

                        }



                    } else {

                        if (participant.connected) {

                            media = new Media();

                            media.collab = participant.connected;

                            hmParticipant = {

                                _id: utils.s4(),

                                _sip: participantAddress,

                                _disp: participant.name,

                                _state: fcs.conversation.ParticipantState.ACTIVE,

                                _media: media.toMediaString(),

                                _guest: participant.guest

                            };

                            conversation.participants[hmParticipant._sip] = hmParticipant;



                            conversationService.addParticipant(conversation.hm, [{par: hmParticipant}], function() {

                                operations[hmParticipant._sip] = fcs.conversation.ParticipantOperation.ADD;

                                utils.callFunctionIfExist(conversation.onParticipantChange, operations);

                                logger.info("HM add guest participant, collab.onParticipantUpdate, Success");

                            }, function() {

                                logger.error("HM add guest participant, collab.onParticipantUpdate, Failure");

                            });

                        }

                    }



                };

                

                conversation.sessions.collab = session.collab;

                conversation.media.collab = true;

                moderator = getModerator(conversation.participants);

                moderator._media = conversation.media.toMediaString();

                sendOneToOneIm(conversation, conversation.participants, true);

                if (!conversation.existsOnHM) {

                    //conversationService.addConversation(id, [conversation.moderator], conversation.sessions, function() {

                    conversationService.addConversation(id, getHMParticipants(conversation), session, function(handleId) {

                        conversation.existsOnHM = true;

                        if (handleId) {

                            conversation.hm = handleId;

                        }

                        //utils.callFunctionIfExist(onSuccess, new fcs.collaboration.Collaboration("411c22553005f8fed666b7c378651b85"));

                        utils.callFunctionIfExist(onSuccess, collab);

                    }, function(data) {

                        logger.error("Could not add collaboration conversation: ", data);

                        conversation.media.collab = false;

                        conversation.collab = null;

                        utils.callFunctionIfExist(onFailure, data);

                    });

                } else {

                    conversationService.addSession(session, {par: getModerator(conversation.participants)}, conversation.hm, function() {

                        utils.callFunctionIfExist(onSuccess, collab);

                    }, function(data) {

                        logger.error("Could not add collaboration session: ", data);

                        conversation.media.collab = false;

                        conversation.collab = null;

                        utils.callFunctionIfExist(onFailure, data);

                    });

                }

            }, function(data) {

                logger.error("Could not start conversation collaboration" , data);

                conversation.media.collab = false;

                conversation.collab = null;

                utils.callFunctionIfExist(onFailure, data);

            }, name, photo);



        } else {

            logger.info("Collaboration already exist");

            utils.callFunctionIfExist(onFailure, {});

        }

    };



    this.stopCollaboration = function(id, onSuccess, onFailure) {

        var conversation = conversations[id], moderator;

        leaveCollaboration(id, function() {

            moderator = getModerator(conversation.participants);

            moderator._media = conversation.media.toMediaString();

            conversation.sessions.collab._state = fcs.conversation.SessionState.INACTIVE;

            removeSession(id, fcs.conversation.SessionType.COLLAB, function(){

                utils.callFunctionIfExist(onSuccess);

            }, function(data){

                utils.callFunctionIfExist(onFailure, data);

            });

        }, onFailure);

    };



    this.stopConference = function(id, onSuccess, onFailure) {

        var conversation = conversations[id], moderator;

        if (conversation.call && conversation.isCallSessionActive()) {

            conversation.media.audio = false;

            conversation.call.end(function() {

                conversation.media.audio = false;

                moderator = getModerator(conversation.participants);

                moderator._media = conversation.media.toMediaString();

                conversation.sessions.call._state = fcs.conversation.SessionState.INACTIVE;

                conversation.call = null;

                utils.callFunctionIfExist(onSuccess);

            }, function(data) {

                conversation.media.audio = true;

                logger.error("Could not end conference call", data);

                utils.callFunctionIfExist(onFailure, data);

            });

        }

        else {

            conversation.media.audio = false;

            utils.callFunctionIfExist(onSuccess);

        }

    };



    function inviteUsers(id, conversation, roomId, onSuccess, onFailure) {

        var session = {

            "chat": {

                _id: id + "_chat",

                _join: "sip:chat@" + getDomain(),

                _state: fcs.conversation.SessionState.ACTIVE,

                roomid: roomId

            }

        }, moderator;



        conversation.sessions.chat = session.chat;

        moderator = getModerator(conversation.participants);

        moderator._media = conversation.media.toMediaString();



            inviteUsersToChatRoom(id);

            if (!conversation.existsOnHM) {

                conversationService.addConversation(id, getHMParticipants(conversation), session, function(handleId) {

                    conversation.existsOnHM = true;

                    if (handleId) {

                        conversation.hm = handleId;

                    }

                    utils.callFunctionIfExist(onSuccess, roomId);

                }, onFailure);

            } else {

                //TODO verify this

                conversationService.addSession(session, {par: getModerator(conversation.participants)}, conversation.hm);

                utils.callFunctionIfExist(onSuccess, roomId);

            }



    }



    this.startChat = function(id, onSuccess, onFailure) {

        var conversation = conversations[id];



        if (!conversation.chatroomId) {

            conversation.media.chat = true;

            conversation.chatroomId = id;

            chatroomapi.create(id,function() {

                conversation.media.chat = true;

                utils.callFunctionIfExist(onSuccess, id);

            }, function(data) {

                conversation.media.chat = false;

                utils.callFunctionIfExist(onFailure, data);

            });

        }

        else {

            logger.info("Chatroom alredy created. Do not creat a new one: " + conversation.chatroomId);

            inviteUsers(id, conversation, conversation.chatroomId, function() {

                logger.info("Users are invited successfully.");

            }, function() {

                logger.error("Inviting users are failed.");

            });

        }

    };



    this.startConference = function(id, onSuccess, onFailure, modCode, modBridge, joinBridge, isVideoEnabled, sendInitialVideo,videoQuality) {

        var session, moderator,

                conversation = conversations[id], onHMSuccess, onHMFailure;



        logger.info("start conference... id: " + id

                + " modCode: " + modCode

                + " modBridge: " + modBridge

                + " joinBridge: " + joinBridge

                + " isVideoEnabled: " + isVideoEnabled

                + " sendInitialVideo: " + sendInitialVideo

                + " videoQuality: " + videoQuality);



        onHMSuccess = function(handleId) {

            conversation.existsOnHM = true;

            conversation.media.audio = true;

            if(handleId){

                conversation.hm = handleId;

            }

            sendOneToOneIm(conversation, conversation.participants, false, true, true);

            fcs.call.startCall(

                    fcs.getUser(),

                    {primaryContact: modBridge},

                    modBridge,

                    function(call) {

                        conversation.call = call;

                        conversation.media.audio = true;

                        utils.callFunctionIfExist(onSuccess, call);

                    },

                    function(data) {

                        conversation.media.audio = false;

                        logger.error("Start conference call operation has failed: ", data);

                        utils.callFunctionIfExist(onFailure, data);

                    },

                    isVideoEnabled,

                    sendInitialVideo,

                    videoQuality,

                    id);

        };



        onHMFailure = function(data) {

            logger.error("HM add conv/sess operation has failed: ", data);

            delete conversation.sessions.call;

            utils.callFunctionIfExist(onFailure, data);

        };



        session = {

            "call": {

                _id: id + "_call",

                _join: joinBridge,

                _state: fcs.conversation.SessionState.INACTIVE,

                audio: 1,

                video: sendInitialVideo ? 1 : 0

            }

        };



        conversation.sessions.call = session.call;

        moderator = getModerator(conversation.participants);

        moderator._media = conversation.media.toMediaString();

        moderator.callerpasscode = modCode;



        if (!conversation.existsOnHM) {

            conversationService.addConversation(id, getHMParticipants(conversation), session, onHMSuccess, onHMFailure);

        } else {

            //TODO verify this

            conversationService.addSession(session, {par: getModerator(conversation.participants)}, conversation.hm, onHMSuccess, onHMFailure);

        }

    };



    this.getParticipants = function(id){

        //TODO: returns an array of fcs.conversation.Participant

        var conversation = conversations[id], participant, participants = {},parid, media;



        if (conversation && conversation.participants) {

            for (parid in conversation.participants) {

                if (conversation.participants.hasOwnProperty(parid)) {

                //do not add yourself as participant

                    participant = conversation.participants[parid];

                    if (participant._sip !== fcs.getUser()) {

                        //TODO: complete that

                        media = new Media(participant._media);

                        participants[parid] = new fcs.conversation.Participant(

                                participant._disp,

                                participant._sip,

                                participant._guest === true ? false : true,

                                participant._state,

                                null, // connectionType

                                media.audio === true ? true : false, 

                                media.video === true ? true : false, 

                                media.collab === true ? true : false, 

                                media.chat === true ? true : false, 

                                participant.moderator ? true : false);

                    }

                }

            }

        }

        return participants;

    };



    this.getParticipant = function(id, primaryContact) {

        var conversation = conversations[id], participant, media;



        if (conversation && conversation.participants) {

            participant = conversation.participants[primaryContact];

            if (participant && participant._sip !== fcs.getUser()) {

                //TODO: complete that

                media = new Media(participant._media);

                return  new fcs.conversation.Participant(

                        participant._disp,

                        participant._sip,

                        participant._guest === true ? false : true,

                        participant._state,

                        null, // connectionType

                        media.audio === true ? true : false,

                        media.video === true ? true : false,

                        media.collab === true ? true : false,

                        media.chat === true ? true : false,

                        participant.moderator ? true : false);

            }

        }

        return {};

    };



    this.hasCall = function(id) {

        var conversation = conversations[id];

        return conversation && conversation.call ? true : false;

    };



    this.hasSession = function(id, sessionName) {

        var conversation = conversations[id];

        return conversation && conversation.sessions && conversation.sessions[sessionName] ? true : false;

    };



    this.isSessionActive = function(id, sessionName, mediaName) {

        var conversation = conversations[id];

        if (this.hasSession(id, sessionName) && conversation.media && conversation.media[mediaName]) {

            return true;

        }

        return false;

    };



    function leaveSessions (id, onSuccess, onFailure, ignoreErros) {

        var conversation = conversations[id], hasChatSession, hasCollaborationSession, hasCallSession, collabSuccess, chatSuccess, callSuccess, success;

        if (conversation && conversation.existsOnHM) {



            hasChatSession = conversation.hasChatSession();

            hasCallSession = conversation.hasCallSession();

            hasCollaborationSession = conversation.hasCollaborationSession();



            //Set the success boolean to true if the session des not exist so that the success be called anyway

            chatSuccess = !hasChatSession;

            callSuccess = !hasCallSession;

            collabSuccess = !hasCollaborationSession;



            success = function() {

                if (collabSuccess && chatSuccess && callSuccess) {

                    //Call only the success once everything is cleaned up

                    utils.callFunctionIfExist(onSuccess);

                }

            };



            if(chatSuccess && callSuccess && collabSuccess){

                utils.callFunctionIfExist(onSuccess);

                return;

            }



            if (hasChatSession) {

                leaveChat(id, function() {

                    chatSuccess = true;

                    success();

                }, onFailure);

            }



            if (hasCollaborationSession) {

                leaveCollaboration(id, function() {

                    collabSuccess = true;

                    success();

                }, onFailure);

            }



            if (hasCallSession) {

                leaveConference(id, function() {

                    callSuccess = true;

                    success();

                }, onFailure);

            }



            if (ignoreErros === true) {

                chatSuccess = true;

                collabSuccess = true;

                callSuccess = true;

                success();

            }



        } else {

            //TODO: this should be discussed

            utils.callFunctionIfExist(onSuccess);

        }

    }



    this.leave = function(id, onSuccess, onFailure, ignoreLeaveSessionsErrors) {

        var conversation = conversations[id];

        if (conversation && conversation.existsOnHM && conversation.hm) {

            leaveSessions(id, function() {

                removeConversation(id, function() {

                            utils.callFunctionIfExist(onSuccess);

                            logger.info("Leaved from conversations sessions and remove participant/conversation publish is sent");

                }, function(data) {

                    utils.callFunctionIfExist(onFailure, data);

                            logger.error("Remove conversation/participant publish failed: " + id);

                });

            }, function(data) {

                utils.callFunctionIfExist(onFailure, data);

                logger.error("Leaving from conversation session is failed: " + id);

            }, ignoreLeaveSessionsErrors);

        }

        else {

            utils.callFunctionIfExist(onSuccess);

        }

    };



    this.modifyMyStateAsActive = function(id, onSuccess, onFailure) {

        var conversation = conversations[id], currentParticipant;

        if (conversation && conversation.existsOnHM && conversation.hm) {

            currentParticipant = getObjectByPropertyValue(conversation.participants, "_sip", fcs.getUser());

            currentParticipant._state = fcs.conversation.ParticipantState.ACTIVE;



            conversationService.modifyParticipant(conversation.hm, [{par: currentParticipant}], function() {

                utils.callFunctionIfExist(onSuccess);

            }, function(data) {

                utils.callFunctionIfExist(onFailure, data);

            });

        }

    };



    conversationEvent.onChatRoomJoinEvent = function(chatroomId, participant) {

        var participantList = [],

                currentParticipant,

                onsuccess = null,

                onfailure = null,

                media = new Media(),

                conversation = getObjectByPropertyValue(conversations, "chatroomId", chatroomId);

        if (conversation && isHostedConversation(conversation)) {

            currentParticipant = conversation.participants[participant];

            if (currentParticipant._state !== fcs.conversation.ParticipantState.REMOVED) {

                media = new Media(currentParticipant._media);

                media.chat = true;

                currentParticipant._media = media.toMediaString();

                currentParticipant._state = fcs.conversation.ParticipantState.ACTIVE;

                participantList.push({par: currentParticipant});

                conversationService.modifyParticipant(conversation.hm, participantList, onsuccess, onfailure);

            }

            else {

                logger.info("received joined chatroom message for participant["+ currentParticipant._sip +"] but it is previously removed, do not send modify participant request.");

            }

        }

    };



    //TODO: invite users to chatroom when room created IM received

    conversationEvent.onChatRoomCreatedEvent = function(chatroomId, onSuccess, onFailure) {

        var idd;

        for (idd in conversations) {

            if (conversations.hasOwnProperty(idd)) {

                if (conversations[idd].chatroomId === chatroomId) {

                    inviteUsers(idd, conversations[idd], chatroomId, onSuccess, onFailure);

                    break;

                }

            }

        }

    };



    conversationEvent.onChatRoomEndedEvent = function(chatroomId) {

        var idd, conversation;

        for (idd in conversations) {

            if (conversations.hasOwnProperty(idd)) {

                if (conversations[idd].chatRoomId === chatroomId) {

                    conversation = conversations[idd];

                    conversation.chatRoomId = null;

                    conversation.media.chat = false;

                    break;

                }

            }

        }

    };



    conversationEvent.onChatRoomLeaveEvent = function(chatroomId, participantId, onSuccess, onFailure) {

        var id, participant, conversation, media;

        for (id in conversations) {



            if (conversations.hasOwnProperty(id)) {

                if (conversations[id].chatroomId === chatroomId) {

                    conversation = conversations[id];

                    participant = conversation.participants[participantId];

                    // Setting chat bit to "0"

                    media = new Media(participant._media);

                    media.chat = false;

                    participant._media = media.toMediaString();

                    logger.info("participant[" + participant._sip + "] has left the chatroom, media: " + participant._media);

                    if (!isAnyActiveMediaSessionExist(participant)) {

                        removeParticipantFromConversation(id, participant._sip, onSuccess, onFailure, true);

                    } else {

                        if (participant._state !== fcs.conversation.ParticipantState.REMOVED) {

                            conversationService.modifyParticipant(conversation.hm, [{par: participant}]);

                        }

                        else {

                            logger.info("received left chatroom message for participant[" + participant._sip + "] but it is previously removed, do not send modify participant request.");

                        }

                    }

                    break;

                }

            }

        }

    };



    //----------------------------- Notifications -----------------------------

    function parseNotificationType(notification) {



        var notificationType;



        if (notification.add) {

            if (notification.add.conv && notification.add.conv._handle) {

                notificationType = NotificationTypes.ADD_CONVERSATION;

            } else if (notification.add.participants) {

                notificationType = NotificationTypes.ADD_PARTICIPANT;

            } else if (notification.add.sessions || notification.modify) {

                notificationType = NotificationTypes.ADD_SESSION;

            } else {

                logger.info("UNKOWN ADD NOTIFICATION IS RECEIVED !!!: ", notification);

            }

        } else if (!notification.add && notification.modify && !notification.remove) {

            if (notification.modify.participants) {

                notificationType = NotificationTypes.MODIFY_PARTICIPANT;

            } else if (notification.modify.sessions) {

                notificationType = NotificationTypes.MODIFY_SESSION;

            } else if (notification.modify.conv) {

                notificationType = NotificationTypes.MODIFY_CONVERSATION;

            } else {

                logger.info("UNKOWN MODIY NOTIFICATION IS RECEIVED !!!: ", notification);

            }

        } else if (notification.remove) {

            if (notification.remove.participants) {

                notificationType = NotificationTypes.REMOVE_PARTICIPANT;

            } else if (notification.remove.sessions) {

                notificationType = NotificationTypes.REMOVE_SESSION;

            } else if (notification.remove.conv) {

                notificationType = NotificationTypes.REMOVE_CONVERSATION;

            } else {

                logger.info("UNKOWN REMOVE NOTIFICATION IS RECEIVED !!!: ", notification);

            }

        } else {

            logger.info("UNKOWN NOTIFICATION IS RECEIVED !!!: ", notification);

        }



        return notificationType;

    }



    this.resolveNotification = function(data) {



        function copySessionsFromNotification(conversation, sessions) {

            var sessionOperationArray = [];

            if (sessions) {

                if (!conversation.sessions) {

                    conversation.sessions = {};

                }

                if (sessions.chat) {

                    if (conversation.sessions.chat) {

                        sessionOperationArray[fcs.conversation.SessionType.CHAT] = fcs.conversation.SessionOperation.MODIFY;

                    }

                    else {

                        conversation.sessions.chat = {};

                        sessionOperationArray[fcs.conversation.SessionType.CHAT] = fcs.conversation.SessionOperation.ADD;

                    }

                    utils.extend(conversation.sessions.chat, sessions.chat);

                }

                if (sessions.call) {

                    if (conversation.sessions.call) {

                        sessionOperationArray[fcs.conversation.SessionType.CALL] = fcs.conversation.SessionOperation.MODIFY;

                    }

                    else {

                        conversation.sessions.call = {};

                        sessionOperationArray[fcs.conversation.SessionType.CALL] = fcs.conversation.SessionOperation.ADD;

                    }

                    utils.extend(conversation.sessions.call, sessions.call);

                }

                if (sessions.collab) {

                    if (conversation.sessions.collab) {

                        sessionOperationArray[fcs.conversation.SessionType.COLLAB] = fcs.conversation.SessionOperation.MODIFY;

                    }

                    else {

                        conversation.sessions.collab = {};

                        sessionOperationArray[fcs.conversation.SessionType.COLLAB] = fcs.conversation.SessionOperation.ADD;

                    }

                    utils.extend(conversation.sessions.collab, sessions.collab);

                }

            }

            return sessionOperationArray;

        }



        function setParticipantOperationToRemoveAndDeleteFromConversationForAllAliassesIfExist(conversation, participantOperationArray, aliasses) {

            var aliasKey;

            if (aliasses) {

                for (aliasKey in aliasses) {

                    if (aliasses.hasOwnProperty(aliasKey)) {

                        logger.info("alias exist: " + aliasses[aliasKey] + ", setting remove operation for it.");

                        participantOperationArray[aliasses[aliasKey]] = fcs.conversation.ParticipantOperation.REMOVE;

                        if (conversation.participants[aliasses[aliasKey]]) {

                            logger.info("deleting alias from participants: " + aliasses[aliasKey] + " in conversation: " + conversation.getId());

                            delete conversation.participants[aliasses[aliasKey]];

                        }

                    }

                }

            }

        }



        function processParticipantsFromNotification(conversation, participantsReceived, notificationType) {

            var participantOperationArray = [], key, participantReceived, participant, media;

            if (conversation) {

                if (participantsReceived) {

                    for (key in participantsReceived) {

                        if (participantsReceived.hasOwnProperty(key)) {

                            participantReceived = participantsReceived[key];



                            setParticipantOperationToRemoveAndDeleteFromConversationForAllAliassesIfExist(conversation, participantOperationArray,participantReceived.aliasses);



                            switch (notificationType) {

                                case NotificationTypes.REMOVE_PARTICIPANT:

                                    if (conversation.participants) {

                                        participant = getObjectByPropertyValue(conversation.participants, "_id", participantReceived._id);

                                        if (participant) {

                                            participantOperationArray[participant._sip] = fcs.conversation.ParticipantOperation.REMOVE;

                                            conversation.participants[participant._sip]._state = fcs.conversation.ParticipantState.REMOVED;

                                            conversation.participants[participant._sip]._media = new Media().toMediaString();

                                        }

                                        else {

                                            logger.info("Participant already removed ", participantReceived);

                                        }

                                    }

                                    else {

                                        logger.info("Conversation does not have any participants: " + conversation.getId());

                                    }

                                    break;

                                default:

                                    switch (participantReceived._state) {

                                        case fcs.conversation.ParticipantState.ACTIVE:

                                        case fcs.conversation.ParticipantState.INACTIVE:

                                            participant = getObjectByPropertyValue(conversation.participants, "_sip", participantReceived._sip);

                                            if (participant && participant._state !== fcs.conversation.ParticipantState.REMOVED) {

                                                participantOperationArray[participantReceived._sip] = fcs.conversation.ParticipantOperation.MODIFY;

                                            }

                                            else {

                                                conversation.participants[participantReceived._sip]={};

                                                participantOperationArray[participantReceived._sip] = fcs.conversation.ParticipantOperation.ADD;

                                            }

                                            utils.extend(conversation.participants[participantReceived._sip],participantReceived);

                                            conversation.participants[participantReceived._sip]._media = participantReceived._media;

                                            media = new Media(participantReceived._media);

                                            if (!participantReceived.callerpasscode && media && !media.audio) {

                                                delete conversation.participants[participantReceived._sip].callerpasscode;

                                                delete conversation.participants[participantReceived._sip].mute;

                                                delete conversation.participants[participantReceived._sip].hold;

                                            }

                                            break;

                                        case fcs.conversation.ParticipantState.REMOVED:

                                            participant = getObjectByPropertyValue(conversation.participants, "_sip", participantReceived._sip);

                                            if (participant) {

                                                participantOperationArray[participantReceived._sip] = fcs.conversation.ParticipantOperation.REMOVE;

                                                conversation.participants[participantReceived._sip]._state = fcs.conversation.ParticipantState.REMOVED;

                                                conversation.participants[participantReceived._sip]._media = new Media().toMediaString();

                                            }

                                            else {

                                                conversation.participants[participantReceived._sip]={};

                                                utils.extend(conversation.participants[participantReceived._sip],participantReceived);

                                                logger.info("Participant already removed ", participantReceived);

                                            }

                                            break;

                                        default:

                                    }

                            }

                        }

                    }

                }

            }

            return participantOperationArray;

        }



        if (!data || !data.conversationNotificationParams || !data.conversationNotificationParams.data) {

            return;

        }



        var conversation,

                cdata = data.conversationNotificationParams.data,

                Diff,

                cList,

                receivedConversationList = {},

                conversationsToRemove,

                conversationIdToRemove,

                notifType,

                operations,

                remove,

                id,

                onHmSuccess,

                onHmFailure,

                moderator,

                participant,

                isBackgroundConversation,

                receivedAuditList = [],

                auditFailureList = [];



        Diff = cdata.conv_diff;

        cList = cdata.conv_list;

        //List of existing conversation

        //TODO conv_list can either be an object or an array

        if (cList) {

            if (cList.conv && cList.conv._id && cList.conv._handle) {

                receivedConversationList[0] = cList.conv;

            }

            else {

                receivedConversationList = cList;

            }



            logger.info("CONVERSATION LIST notification received : ", receivedConversationList);



            onHmSuccess = function() {

                logger.info("Remove conversation publish is sent.");

            };



            onHmFailure = function() {

                delete conversations[conversation.getId()];

                logger.error("Failed to sent remove conversation request, delete it from api: " + conversation.getId());

            };



            conversationsToRemove = JSON.parse(window.cache.getItem("ZOMBIE_CONVS_" + fcs.getUser()));

            logger.info("ZOMBIE_CONVS_: ", conversationsToRemove);



            for (id in receivedConversationList) {

                if (receivedConversationList.hasOwnProperty(id)) {

                    conversation = conversations[receivedConversationList[id]._id];

                    if (!conversation) {

                        if (isModerator(receivedConversationList[id].participants)) {

                            // i am moderator of the received conversation

                            // create HostedConversation

                            conversation = new fcs.conversation.createHostedConversation(getModerator(receivedConversationList[id].participants)._disp, receivedConversationList[id]._id);

                            processParticipantsFromNotification(conversation, receivedConversationList[id].participants);

                            copySessionsFromNotification(conversation, receivedConversationList[id].sessions);

                            logger.info("conversation list contains a new conversation, creating a hosted conversation: " + conversation.getId());

                        }

                        else {

                            // i am a participant of the received conversation

                            // create HostedConversation

                            conversation = new fcs.conversation.createNewConversation(receivedConversationList[id]._id);

                            processParticipantsFromNotification(conversation, receivedConversationList[id].participants);

                            copySessionsFromNotification(conversation, receivedConversationList[id].sessions);

                            logger.info("conversation list contains a new conversation, creating a participant conversation: " + conversation.getId());

                        }

                        conversation.hm = receivedConversationList[id]._handle;

                        conversation.existsOnHM = true;

                        conversation.state = fcs.conversation.States.BACKGROUND;

                    }

                    else {

                        logger.info("conversation list contains existing conversation: " + conversation.getId());

                        processParticipantsFromNotification(conversation, receivedConversationList[id].participants);

                        copySessionsFromNotification(conversation, receivedConversationList[id].sessions);

                    }



                    remove = false;

                    for (conversationIdToRemove in conversationsToRemove) {

                        if (conversationsToRemove.hasOwnProperty(conversationIdToRemove)) {

                            if (conversationIdToRemove === conversation.getId() &&

                                    conversationsToRemove[conversationIdToRemove].hm === conversation.hm) {

                                remove = true;

                                break;

                            }

                        }

                    }



                    if (remove) {

                        logger.info("Conversation to remove: " + conversation.getId());                

                        removeConversation(conversation.getId(), onHmSuccess, onHmFailure);

                    }

                }

            }

            return;

        }

        else if (cdata.conv_diff.audit || (cdata.conv_diff[0] && cdata.conv_diff[0]._handle)) {

            if (cdata.conv_diff.audit && cdata.conv_diff.audit._handle) {

                receivedAuditList.push({"_handle" : cdata.conv_diff.audit._handle});

            }

            else {

                receivedAuditList = cdata.conv_diff;

            }

            

            logger.info("CONVERSATION AUDIT notification received : ", receivedAuditList);



            for (id in receivedAuditList) {

                if (receivedAuditList.hasOwnProperty(id)) {

                    conversation = getConversationWithHMId(receivedAuditList[id]._handle);

                    

                    if (!conversation || 

                        (conversation && conversation.state === fcs.conversation.States.BACKGROUND)) {

                        auditFailureList.push(receivedAuditList[id]);

                    }

                }

            }

            

            if (auditFailureList.length > 0) {

                logger.info("sending audit failure response for conversations: ", auditFailureList);

                conversationService.reportAuditFailure(auditFailureList);

            }

            return;

        }

        else if (!Diff) {

            logger.info("EMPTY CONVERSATION notification received !!! ");

            return;

        }



        notifType = parseNotificationType(Diff);



        //match the hm conversation with the api

        if (Diff.add && !Diff.add.conv) {

            conversation = getConversationWithHMId(Diff.add._handle);

        } else if (Diff.remove) {

            conversation = getConversationWithHMId(Diff.remove._handle);

        } else if (Diff.modify) {

            conversation = getConversationWithHMId(Diff.modify._handle);

        }



        switch (notifType) {

            case NotificationTypes.ADD_CONVERSATION:

                logger.info("ADD CONVERSATION notification received : ", Diff);

                conversation = conversations[Diff.add.conv._id];

                isBackgroundConversation = isConversationStateBackground(conversation);



                if (conversation && !isBackgroundConversation && isModerator(Diff.add.conv.participants)) {

                    // i am moderator of this conversation

                    conversation.hm = Diff.add.conv._handle;

                    operations = processParticipantsFromNotification(conversation, Diff.add.conv.participants);

                    utils.callFunctionIfExist(conversation.onParticipantChange, operations);

                    copySessionsFromNotification(conversation, Diff.add.conv.sessions);



                    sendOneToOneIm(conversation, conversation.participants);

                }

                else if (conversation && !isBackgroundConversation) {

                    // i am a participant of this conversation

                    fcs.conversation.decorate(conversation, fcs.conversation.ConversationType.PARTICIPANT);

                    conversation.participants = {};

                    processParticipantsFromNotification(conversation, Diff.add.conv.participants);

                    copySessionsFromNotification(conversation, Diff.add.conv.sessions);

                    participant = getObjectByPropertyValue(Diff.add.conv.participants, "_sip", fcs.getUser());

                    if (participant && participant._media) {

                        conversation.media = new Media(participant._media);

                    }

                    else {

                        conversation.media = new Media();

                    }

                    conversation.hm = Diff.add.conv._handle;

                    conversation.state = fcs.conversation.States.MODIFIED;

                    conversation.existsOnHM = true;

                    conversations[Diff.add.conv._id] = conversation;



                    utils.callFunctionIfExist(fcs.conversation.onReceived, conversation);

                }

                else {

                    conversation = undefined;

                    // new conversation id is received

                    // Scenario#1:

                    // User joins conference with conference code from web.

                    // It receives add conversation notification when it joins the conference.

                    // At this point, we already hava a conversation on api side, we only need to

                    // match the existing conversation on api side with the received notification.

                    // For finding corresponding conversation, we use _join header in call session.

                    //

                    // Check if notification contains a call session with join header.

                    if (Diff.add.conv.sessions && Diff.add.conv.sessions.call && Diff.add.conv.sessions.call._join) {

                        // We have received a notification containing a call session with join header.

                        // Now check if we have a conversation containing a call session with the same join header.

                        conversation = getConversationWithJoinHeader(Diff.add.conv.sessions.call._join);

                    }

                    //TODO: Kadir: If you need to add more scenarios here, please provide details about your scenario



                    if (!conversation) {

                        conversation = new fcs.conversation.Conversation(Diff.add.conv._id);

                        conversation.participants = {};

                        processParticipantsFromNotification(conversation, Diff.add.conv.participants);

                        copySessionsFromNotification(conversation, Diff.add.conv.sessions);

                        conversation.media = new Media();

                        conversation.hm = Diff.add.conv._handle;

                        conversation.state = fcs.conversation.States.CREATED;

                        conversation.existsOnHM = true;

                        conversations[Diff.add.conv._id] = conversation;

                    }

                    else {

                        // here we have a corresponding conversation stated in Scenario#1.

                        conversation.setId(Diff.add.conv._id);

                        conversation.participants = {};

                        processParticipantsFromNotification(conversation, Diff.add.conv.participants);

                        copySessionsFromNotification(conversation, Diff.add.conv.sessions);

                        conversation.hm = Diff.add.conv._handle;

                        conversation.state = fcs.conversation.States.REPLACED;

                        conversation.existsOnHM = true;

                    }



                    utils.callFunctionIfExist(fcs.conversation.onReceived, conversation);

                }

                break;

            case NotificationTypes.ADD_PARTICIPANT:

                logger.info("ADD PARTICIPANT notification received : ", Diff);

                operations = processParticipantsFromNotification(conversation, Diff.add.participants);

                if (!isConversationStateBackground(conversation)) {

                    utils.callFunctionIfExist(conversation.onParticipantChange, operations);

                }

                break;

            case NotificationTypes.ADD_SESSION:

                logger.info("ADD SESSION notification received : ", Diff);

                if (!isHostedConversation(conversation)) {

                    operations = copySessionsFromNotification(conversation, Diff.add.sessions);

                    if (!isConversationStateBackground(conversation)) {

                        conversation.onSessionChange(conversation.sessions, operations);

                    }

                }

                

                if (Diff.modify && Diff.modify.participants) {

                    operations = processParticipantsFromNotification(conversation, Diff.modify.participants);

                    if (!isConversationStateBackground(conversation)) {

                        utils.callFunctionIfExist(conversation.onParticipantChange, operations);

                    }

                }

                break;

            case NotificationTypes.MODIFY_CONVERSATION:

                logger.info("MODIFY CONVERSATION notification received : ", Diff);

                if (!isHostedConversation(conversation)) {

                    operations = copySessionsFromNotification(conversation, Diff.modify.conv.sessions);

                    if (!isConversationStateBackground(conversation)) {

                        utils.callFunctionIfExist(conversation.onSessionChange, Diff.modify.conv.sessions, operations);

                    }

                }



                operations = processParticipantsFromNotification(conversation, Diff.modify.conv.participants);

                if (!isConversationStateBackground(conversation)) {

                    utils.callFunctionIfExist(conversation.onParticipantChange, operations);

                }

                break;

            case NotificationTypes.MODIFY_PARTICIPANT:

                logger.info("MODIFY PARTICIPANT notification received : ", Diff);

                operations = processParticipantsFromNotification(conversation, Diff.modify.participants);

                if (!isConversationStateBackground(conversation)) {

                    utils.callFunctionIfExist(conversation.onParticipantChange, operations);

                }

                break;

            case NotificationTypes.MODIFY_SESSION:

                logger.info("MODIFY SESSION notification received : ", Diff);

                operations = copySessionsFromNotification(conversation, Diff.modify.sessions);

                if (!isHostedConversation(conversation)) {

                    if (!isConversationStateBackground(conversation)) {

                        utils.callFunctionIfExist(conversation.onSessionChange, Diff.modify.sessions, operations);

                    }

                }

                break;

            case NotificationTypes.REMOVE_CONVERSATION:

                logger.info("REMOVE CONVERSATION notification received : ", Diff);

                if (conversation) {

                    

                    if (conversation.call && !conversation.isCallSessionActive()){

                        // In this case, we have 1-1 call with a HM session.

                        // 1-1 call and a HM session can exists in same conversation only if a basic call is established first 

                        // and then term. or orig. user starts collaboration.

                        // As we received remove conversation notification, this means that moderator stops collaboration.

                        // 

                        // Steps to create this scenario:

                        // 1- UserA calls UserB.

                        // 2- UserB answers incoming call.

                        // 3- UserA starts collaboration.

                        // 4- UserA stops collaboration.

                        //

                        // At this step, we need to clear hm related data but keep conversation

                        // as there is still an active 1-1 call.

                        

                        // delete hm id

                        // delete existsOnHM flag

                        // if the current user is not the moderator, set the current user as modetor

                        // decorate the conversation with moderator functionalities

                        logger.info("Conversation is not deleted from api: " + conversation.getId());

                        delete conversation.hm;

                        delete conversation.existsOnHM;

                        moderator = getModerator(conversation.participants);

                        if (moderator._sip !== fcs.getUser()){

                            delete moderator.moderator;

                            conversation.participants[fcs.getUser()].moderator = "1";

                        }

                        fcs.conversation.decorate(conversation, fcs.conversation.ConversationType.HOSTED);

                        utils.callFunctionIfExist(conversation.onRemoveHMFromConversation);

                    }

                    else {

                        logger.info("Deleting conversation from api: " + conversation.getId());

                        leaveSessions(Diff.remove.conv._id, function() {

                            if (!isConversationStateBackground(conversation)) {

                                utils.callFunctionIfExist(conversation.onRemoveConversation);

                            }

                            delete conversations[Diff.remove.conv._id];

                        }, function() {

                            logger.error("Leave from conversation sessions is failed: " + conversation.getId());

                            delete conversations[Diff.remove.conv._id];

                        });

                    }

                    if (!isConversationStateBackground(conversation)) {

                        utils.callFunctionIfExist(conversation.onRemoveToast);

                    }

                }

                break;

            case NotificationTypes.REMOVE_PARTICIPANT:

                logger.info("REMOVE PARTICIPANT notification received : ", Diff);

                if (conversation) {

                    operations = processParticipantsFromNotification(conversation, Diff.remove.participants, NotificationTypes.REMOVE_PARTICIPANT);

                    if (!isConversationStateBackground(conversation)) {

                        utils.callFunctionIfExist(conversation.onParticipantChange, operations);

                    }

                }

                break;

            case NotificationTypes.REMOVE_SESSION:

                logger.info("REMOVE SESSION notification received : ", Diff);

                if (!isHostedConversation(conversation)) {

                    operations = [];

                    if (Diff.remove.sessions.chat) {

                        operations[fcs.conversation.SessionType.CHAT] = fcs.conversation.SessionOperation.REMOVE;

                    }

                    if (Diff.remove.sessions.call) {

                        operations[fcs.conversation.SessionType.CALL] = fcs.conversation.SessionOperation.REMOVE;

                    }

                    if (Diff.remove.sessions.collab) {

                        operations[fcs.conversation.SessionType.COLLAB] = fcs.conversation.SessionOperation.REMOVE;

                    }

                    if (!isConversationStateBackground(conversation)) {

                        utils.callFunctionIfExist(conversation.onSessionChange, conversation.sessions, operations);

                    }

                }



                operations = processParticipantsFromNotification(conversation, Diff.modify.participants);

                if (!isConversationStateBackground(conversation)) {

                    utils.callFunctionIfExist(conversation.onParticipantChange, operations);

                }

                break;

        }



    };

    

    this.getConvs = function(){

        return conversations;

    };

    

    this.removeConversation = removeConversation;

    this.removeConversationById = removeConversationById;

    this.removeSession = removeSession;

    this.leaveChat = leaveChat;

    this.leaveConference = leaveConference;

    this.getConversationWithId = getConversationWithId;

    this.getConversationWithJoinHeader = getConversationWithJoinHeader;

};



var conversationManager = new ConversationManager();

//will be removed

fcs.conversationManager = conversationManager;


/**
 * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
 * Conversation related resources
 *
 * @ignore
 * @name conversation
 * @namespace
 * @memberOf fcs
 * 
 * @version 3.0.0
 * @since 3.0.0
 */
var Conversation = function() {


    var SessionType = {
        /** CHAT */
        CHAT: "chat",
        /** COLLAB */
        COLLAB: "collab",
        /** CALL */
        CALL: "call"
    }, MediaType = {
        /** CHAT */
        CHAT: "chat",
        /** COLLAB */
        COLLAB: "collab",
        /** AUDIO */
        AUDIO: "audio",
        /** VIDEO */
        VIDEO: "video"
    }, ConversationType = {
        /** UNDEFINED */
        UNDEFINED: "undefined",
        /** HOSTED */
        HOSTED: "hosted",
        /** PARTICIPANT */
        PARTICIPANT: "participant"
    };

    /**
     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
     * Type of Connections for a Participant.
     * @name ConnectionType
     * @enum {number}
     * @since 3.0.0
     * @readonly
     * @memberOf fcs.conversation
     * @property {number} [SOP_C=1] The user is using SOP C
     * @property {number} [SIP_C=2] The user is using SIP C
     * @property {number} [PSTN=3] The user is using PSTN
     */
    this.ConnectionType = {
        /** SOP C */
        SOP_C: 1,
        /** SIP C */
        SIP_C: 2,
        /** PSTN */
        PSTN: 3

    };

    /**
     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
     * Type of sessions in a Conversation.
     * @name SessionType
     * @enum {number}
     * @since 3.0.0
     * @readonly
     * @memberOf fcs.conversation
     * @property {string} [CHAT=chat] The session is a chat session
     * @property {string} [COLLAB=collab] The collab is a chat session
     * @property {string} [CALL=call] The call is a chat session
     */
    this.SessionType = SessionType;

    /**
     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
     * Type of medias in a Conversation.
     * @name MediaType
     * @enum {number}
     * @since 3.0.0
     * @readonly
     * @memberOf fcs.conversation
     * @property {string} [CHAT=chat] The media is a chat
     * @property {string} [COLLAB=collab] The media is a collab
     * @property {string} [AUDIO=audio] The media is a audio
     * @property {string} [VIDEO=video] The media is a audio
     */
    this.MediaType = MediaType;

    /**
     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
     * Type of  a Conversation.
     * @name ConversationType
     * @enum {string}
     * @since 3.0.0
     * @readonly
     * @memberOf fcs.conversation
     * @property {string} [UNDEFINED=undefined] Conversation without any participant/moderator specific functionality
     * @property {string} [HOSTED=hosted] Conversation with any moderator specific functionality
     * @property {string} [PARTICIPANT=participant] Conversation with any participant specific functionality
     */
    this.ConversationType = ConversationType;

     /**
     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
     * Type of session operations in a Conversation.
     * @name SessionOperation
     * @enum {number}
     * @since 3.0.0
     * @readonly
     * @memberOf fcs.conversation
     * @property {string} [ADD=add] The session is added
     * @property {string} [MODIFY=modify] The session is modified
     * @property {string} [REMOVE=remove] The session is removed
     */
    this.SessionOperation = {
        /** ADD */
        ADD: "add",
        /** MODIFY */
        MODIFY: "modify",
        /** REMOVE */
        REMOVE: "remove"

    };

     /**
     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
     * Type of participant operations in a Conversation.
     * @name ParticipantOperation
     * @enum {number}
     * @since 3.0.0
     * @readonly
     * @memberOf fcs.conversation
     * @augments fcs.conversation.SessionOperation
     * @property {string} [ADD=add] The participant is added
     * @property {string} [MODIFY=modify] The participant is modified
     * @property {string} [REMOVE=remove] The participant is removed
     */
    this.ParticipantOperation = this.SessionOperation;

     /**
     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
     * Type of session states in a Conversation.
     * @name SessionState
     * @enum {number}
     * @since 3.0.0
     * @readonly
     * @memberOf fcs.conversation
     * @property {string} [ACTIVE=active] The session is active
     * @property {string} [INACTIVE=inactive] The session is inactive
     * @property {string} [REMOVE=remove] The session is removed
     */
    this.SessionState = {
        /** ACTIVE */
        ACTIVE: "active",
        /** INACTIVE */
        INACTIVE: "inactive",
        /** REMOVE */
        REMOVE: "remove"
    };

     /**
      * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
      * Type of participant states in a Conversation.
      * @name ParticipantState
      * @enum {number}
      * @since 3.0.0
      * @readonly
      * @memberOf fcs.conversation
      * @property {string} [ACTIVE=active] The participant is active
      * @property {string} [INACTIVE=inactive] The participant is inactive
      * @property {string} [REMOVE=removed] The participant is removed
      */
     this.ParticipantState = {
         /** ADD */
         ACTIVE: "active",
         /** INACTIVE */
         INACTIVE: "inactive",
         /** REMOVE */
         REMOVED: "removed"
     };

    /**
     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
     * States for a Conversation
     * @name States
     * @enum {number}
     * @since 3.0.0
     * @readonly
     * @memberOf fcs.conversation
     * @property {number} [INITIAL=1] Initial state when the constructor has been called but the conversation was not yet create on the server
     * @property {number} [CREATING=2] The request to create the conversation was sent but the response was not yet received
     * @property {number} [ACTIVE=3] The conversation is now active, it has been created on the server
     * @property {number} [INACTIVE=4] The conversation is inactive
     * @property {number} [REMOVING=5] The request to remove the conversation was sent but the response was not yet received
     * @property {number} [REMOVED=6] The conversation has been removed
     * @property {number} [CREATED=7] The conversation has been created
     * @property {number} [MODIFIED=8] The conversation has been created
     * @property {number} [REPLACED=9] The conversation has been created
     * @property {number} [BACKGROUND=10] The conversation is background, and notification will not trigger ui events
     */
    this.States = {
        INITIAL: 1,
        CREATING: 2,
        ACTIVE: 3,
        INACTIVE: 4,
        REMOVING: 5,
        REMOVED: 6,
        CREATED: 7,
        MODIFIED: 8,
        REPLACED: 9,
        BACKGROUND: 10
    };

    /**
     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
     * @ignore
     * @name Participant
     * @class
     * @memberOf fcs.conversation
     * @version 3.0.0
     * @since 3.0.0
     * @property {string} id The id of the participant.
     * @property {string} name The name of the participant.
     * @property {bool} premium Is this a premium user
     * @property {bool} active Is this participant active
     * @property {fcs.conversation.ConnectionType} connectionType The type of connection this participant is using
     * @property {bool} audio Is this participant connected to the audio session
     * @property {bool} video Is this participant connected to the video session
     * @property {bool} collaboration Is this participant connected to the collaboration session
     * @property {bool} chat Is this participant connected to the chat session
     * @property {bool} moderator Is this participant the moderator
     */

    this.Participant = function(name, id, premium, state, connType, audio, video, collab, chat, moderator) {

        this.name = name;

        this.id = id;

        this.premium = premium;

        this.state = state;

        this.connectionType = connType;

        this.audio = audio;

        this.video = video;

        this.collaboration = collab;

        this.chat = chat;

        this.moderator = moderator;
    };


    /**
     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
     * Sets the handler for received conversation notifications.
     * @ignore
     * @name fcs.conversation.onReceived
     * @event
     * @since 3.0.0
     * @param {fcs.conversation.Conversation} conversation The conversation object
     */
    this.onReceived = null;


    /**
     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
     * Starts a conversation.
     *
     * @name startConversation
     * @function
     * @since 3.0.0
     * @memberOf fcs.conversation
     * @param {Array.<fcs.conversation.Participant>} participants The list of participants for the conversation
     * @param {function} onSuccess The onSuccess({@link fcs.conversation.HostedConversation}) callback function to be called
     * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called
     */

    this.createHostedConversation = conversationManager.createHostedConversation;
    this.createNewConversation = conversationManager.createNewConversation;
    this.hasGotConversations = conversationManager.hasGotConversations;
    this.getConversationWithId = conversationManager.getConversationWithId;
    this.removeConversationById = conversationManager.removeConversationById;
    this.getConversationWithJoinHeader = conversationManager.getConversationWithJoinHeader;

    function BaseConversation(id) {

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.Conversation#getType
         * @function
         * @since 3.0.0
         * @returns {@exp;ConversationType@pro;UNDEFINED}
         */
        this.getType = function() {
            return ConversationType.UNDEFINED;
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.Conversation#getId
         * @function
         * @since 3.0.0
         * @returns {String} Unique identifier for the conversation
         */
        this.getId = function() {
            return id;
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.Conversation#getState
         * @function
         * @since 3.0.0
         * @returns {fcs.conversation.States} The state of the conversation
         */
        this.getState = function() {
            return conversationManager.getState(id);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.Conversation#setId
         * @function
         * @since 3.0.0
         */
        this.setId = function(ConvID) {
            conversationManager.replaceConversationKey(id, ConvID);
            id = ConvID;
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.Conversation.getParticipants
         * @function
         * @since 3.0.0
         * @returns {Array.<fcs.conversation.Participant>} participant list for handle management.
         */
        this.getParticipants = function() {
            return conversationManager.getParticipants(id);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.Conversation.getParticipant
         * @function
         * @since 3.0.0
         * @returns {fcs.conversation.Participant} participant.
         */
        this.getParticipant = function(primaryContact) {
            return conversationManager.getParticipant(id, primaryContact);
        };


        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.Conversation#hasCall
         * @function
         * @since 3.0.0
         * @returns {Boolean} Does this conversation have call
         */
        this.hasCall = function() {
            return conversationManager.hasCall(id);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.Conversation#hasCallSession
         * @function
         * @since 3.0.0
         * @returns {Boolean} Does this conversation have call session
         */
        this.hasCallSession = function() {
            return conversationManager.hasSession(id, SessionType.CALL);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.Conversation#isCallSessionActive
         * @function
         * @since 3.0.0
         * @returns {Boolean} Does this conversation have active call session
         */
        this.isCallSessionActive = function() {
            return conversationManager.isSessionActive(id, SessionType.CALL, MediaType.AUDIO);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.Conversation#hasCollaborationSession
         * @function
         * @since 3.0.0
         * @returns {bool} Does this conversation have collaboration session
         */
        this.hasCollaborationSession = function() {
            return conversationManager.hasSession(id, SessionType.COLLAB);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.Conversation#isCollaborationSessionActive
         * @function
         * @since 3.0.0
         * @returns {Boolean} Does this conversation have active collabration session
         */
        this.isCollaborationSessionActive = function() {
            return conversationManager.isSessionActive(id, SessionType.COLLAB, MediaType.COLLAB);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.Conversation#hasChatSession
         * @function
         * @since 3.0.0
         * @returns {Boolean} Does this conversation have a chat session
         */
        this.hasChatSession = function() {
            return conversationManager.hasSession(id, SessionType.CHAT);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.Conversation#isChatSessionActive
         * @function
         * @since 3.0.0
         * @returns {Boolean} Does this conversation have active chat session
         */
        this.isChatSessionActive = function() {

            return conversationManager.isSessionActive(id, SessionType.CHAT, MediaType.CHAT);
        };

        this.hasActiveSession = function() {
            if (this.isCallSessionActive() ||
                    this.isChatSessionActive() ||
                    this.isCollaborationSessionActive()) {
                return true;
            }
            return false;
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.Conversation#leaveConference
         * @function
         * @since 3.0.0
         * @param {function} onSuccess The onSuccess({@link fcs.call.Call}) callback function to be called
         * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called
         */
        this.leaveConference = function(onSuccess, onFailure) {
            conversationManager.leaveConference(id, onSuccess, onFailure);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * Remove conversation
         * @name fcs.conversation.Conversation#removeConversation
         * @function
         * @since 3.0.0
         * @param {function} onSuccess The onSuccess() callback function to be called<br />
         * @param {function} onFailure The onFailure() callback function to be called<br />
         */
        this.removeConversation = function(onSuccess, onFailure) {
            if (this.hasCollaborationSession()) {
                conversationManager.stopCollaboration(id, onSuccess, onFailure);
            }
            conversationManager.removeConversation(id, onSuccess, onFailure);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * Remove conversation
         * @name fcs.conversation.Conversation#leave
         * @function
         * @since 3.0.0
         * @param {function} onSuccess The onSuccess() callback function to be called<br />
         * @param {function} onFailure The onFailure() callback function to be called<br />
         * @param {Boleean} [ignoreLeaveSessionsErrors] optional parameter to force success callback execution<br />
         */
        this.leave = function(onSuccess, onFailure, ignoreLeaveSessionsErrors) {
            conversationManager.leave(id, onSuccess, onFailure, ignoreLeaveSessionsErrors);
        };

        this.dialOutParticipant = function(contact, onSuccess, onFailure) {
            conversationManager.dialOutParticipant(id, contact, onSuccess, onFailure);
        };

        this.onStateChange = null;
    }

    function participantOperationUndecorator(conversation) {
        delete conversation.joinConference;
        delete conversation.joinChat;
        delete conversation.leaveChat;
        delete conversation.joinCollaboration;
        delete conversation.modifyMyStateAsActive;

        return conversation;
    }

    function moderatorOperationUndecorator(conversation) {
        delete conversation.addParticipant;
        delete conversation.removeParticipant;
        delete conversation.startCollaboration;
        delete conversation.stopCollaboration;
        delete conversation.startChat;
        delete conversation.startConference;
        delete conversation.stopConference;
        delete conversation.removeSession;
        delete conversation.muteParticipant;
        delete conversation.unmuteParticipant;
        delete conversation.holdParticipant;
        delete conversation.unholdParticipant;
        delete conversation.kickParticipant;

        return conversation;
    }

    function participantOperationDecorator(baseconversation) {

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.Conversation#getType
         * @function
         * @since 3.0.0
         * @returns {@exp;ConversationType@pro;PARTICIPANT}
         */
        baseconversation.getType = function() {
            return ConversationType.PARTICIPANT;
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.Conversation#joinConference
         * @function
         * @since 3.0.0
         * @param {function} onSuccess The onSuccess({@link fcs.call.Call}) callback function to be called with the Call object
         * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called
         */
        baseconversation.joinConference = function(onSuccess, onFailure, isVideoEnabled, sendInitialVideo,videoQuality) {
            conversationManager.joinConference(this.getId(), onSuccess, onFailure, isVideoEnabled, sendInitialVideo,videoQuality);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.Conversation#joinChat
         * @function
         * @since 3.0.0
         * @param {function} onSuccess The onSuccess({string}) callback function to be called with the chat session url
         * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called
         */
        baseconversation.joinChat = function(onSuccess, onFailure) {
            conversationManager.joinChat(this.getId(), onSuccess, onFailure);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.Conversation#leaveChat
         * @function
         * @since 3.0.0
         * @param {function} onSuccess The onSuccess({string}) callback function to be called with the chat session url
         * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called
         */
        baseconversation.leaveChat = function(onSuccess, onFailure) {
            conversationManager.leaveChat(this.getId(), onSuccess, onFailure);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.Conversation#joinCollaboration
         * @function
         * @since 3.0.0
         * @param {function} onSuccess The onSuccess({object}) callback function to be called with the collaboration details
         * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called
         * @param {string} name The full name to be displayed to Guests Users
         * @param {string} photo The photo url to be displayed to Guests Users
         */
        baseconversation.joinCollaboration = function(onSuccess, onFailure, name, photo) {
            conversationManager.joinCollaboration(this.getId(), onSuccess, onFailure, name, photo);
        };

        baseconversation.modifyMyStateAsActive = function(onSuccess, onFailure) {
            conversationManager.modifyMyStateAsActive(this.getId(), onSuccess, onFailure);
        };

        return baseconversation;
    }

    function moderatorOperationDecorator(baseconversation) {

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.HostedConversation#getType
         * @function
         * @since 3.0.0
         * @returns {@exp;ConversationType@pro;HOSTED}
         */
        baseconversation.getType = function() {
            return ConversationType.HOSTED;
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * Add a participant to the conversation.
         * @name fcs.conversation.HostedConversation#addParticipant
         * @function
         * @since 3.0.0
         * @param {string} participant sip address of the participant to be added
         * @param {function} onSuccess The onSuccess() callback function to be called
         * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called<
         */
        baseconversation.addParticipant = function(primaryContact, displayName, onSuccess, onFailure) {
            conversationManager.addParticipant(this.getId(), primaryContact, displayName, onSuccess, onFailure);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * Remove a participant from the conversation.
         * @name fcs.conversation.HostedConversation#removeParticipant
         * @function
         * @since 3.0.0
         * @param {string} participant sip address of the participant to be removed
         * @param {function} onSuccess The onSuccess() callback function to be called
         * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called
         */
        baseconversation.removeParticipant = function(participant, onSuccess, onFailure) {
            conversationManager.removeParticipant(this.getId(), participant, onSuccess, onFailure);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * Start the collaboration session
         * @name fcs.conversation.HostedConversation#startCollaboration
         * @function
         * @since 3.0.0
         * @param {function} onSuccess The onSuccess({object}) callback function to be called with the collaboration details
         * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called
         * @param {string} name The full name to be displayed to Guests Users
         * @param {string} photo The photo url to be displayed to Guests Users
         */
        baseconversation.startCollaboration = function(onSuccess, onFailure, name, photo, collabUrl) {
            conversationManager.startCollaboration(this.getId(), onSuccess, onFailure, name, photo, collabUrl);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * Stops the collaboration session
         * @name fcs.conversation.HostedConversation#stopCollaboration
         * @function
         * @since 3.0.0
         * @param {function} onSuccess The onSuccess({object}) callback function to be called with the collaboration details
         * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called
         */
        baseconversation.stopCollaboration = function(onSuccess, onFailure) {
            conversationManager.stopCollaboration(this.getId(), onSuccess, onFailure);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * Start the chat session
         * @name fcs.conversation.HostedConversation#startChat
         * @function
         * @since 3.0.0
         * @param {function} onSuccess The onSuccess() callback function to be called with the chat url
         * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called
         */
        baseconversation.startChat = function(onSuccess, onFailure) {
            conversationManager.startChat(this.getId(), onSuccess, onFailure);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.HostedConversation#startConference
         * @param {type} onSuccess
         * @param {type} onFailure
         * @param {type} profile
         * @since 3.0.0
         * @returns {undefined}
         */
        baseconversation.startConference = function(onSuccess, onFailure, modCode, modBridge, joinBridge, isVideoEnabled, sendInitialVideo,videoQuality) {
            conversationManager.startConference(this.getId(), onSuccess, onFailure, modCode, modBridge, joinBridge, isVideoEnabled, sendInitialVideo,videoQuality);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * Stops the conversation session
         * @name fcs.conversation.HostedConversation#stopCollaboration
         * @function
         * @since 3.0.0
         * @param {function} onSuccess The onSuccess({object}) callback function to be called with the conversation details
         * @param {function} onFailure The onFailure({@link fcs.Errors}) callback function to be called
         */
        baseconversation.stopConference = function(onSuccess, onFailure) {
            conversationManager.stopConference(this.getId(), onSuccess, onFailure);
        };

        baseconversation.removeSession = function(sessionType, onSuccess, onFailure) {
            conversationManager.removeSession(this.getId(), sessionType, onSuccess, onFailure);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.HostedConversation#muteParticipant
         * @param {type} primaryContact
         * @param {type} onSuccess
         * @param {type} onFailure
         * @since 3.0.0
         * @returns {undefined}
         */
        baseconversation.muteParticipant = function(primaryContact, onSuccess, onFailure) {
            conversationManager.muteParticipant(this.getId(), primaryContact, onSuccess, onFailure);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.HostedConversation#unmuteParticipant
         * @param {type} primaryContact
         * @param {type} onSuccess
         * @param {type} onFailure
         * @since 3.0.0
         * @returns {undefined}
         */
        baseconversation.unmuteParticipant = function(primaryContact, onSuccess, onFailure) {
            conversationManager.unmuteParticipant(this.getId(), primaryContact, onSuccess, onFailure);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.HostedConversation#holdParticipant
         * @param {type} primaryContact
         * @param {type} onSuccess
         * @param {type} onFailure
         * @since 3.0.0
         * @returns {undefined}
         */
        baseconversation.holdParticipant = function(primaryContact, onSuccess, onFailure) {
            conversationManager.holdParticipant(this.getId(), primaryContact, onSuccess, onFailure);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.HostedConversation#unholdParticipant
         * @param {type} primaryContact
         * @param {type} onSuccess
         * @param {type} onFailure
         * @since 3.0.0
         * @returns {undefined}
         */
        baseconversation.unholdParticipant = function(primaryContact, onSuccess, onFailure) {
            conversationManager.unholdParticipant(this.getId(), primaryContact, onSuccess, onFailure);
        };

        /**
         * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
         * @name fcs.conversation.HostedConversation#kickParticipant
         * @param {type} conversationId
         * @param {type} participant
         * @param {type} sessionType
         * @param {type} onSuccess
         * @param {type} onFailure
         * @returns {undefined}
         * @since 3.0.0
         */
        baseconversation.kickParticipant = function(participant, sessionType, onSuccess, onFailure) {
            conversationManager.kickParticipant(this.getId(), participant, sessionType, onSuccess, onFailure);
        };

        return baseconversation;
    }

    /**
     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
     * @ignore
     * @name Conversation
     * @class
     * @memberOf fcs.conversation
     * @param {String} id Unique identifier for the conversation
     * @version 3.0.0
     * @since 3.0.0
     */
    this.Conversation = function(id) {
        return participantOperationDecorator(new BaseConversation(id));
    };

    /**
     * <br/>!!! DESIGN IN PROGRESS !!!<br/><br/>
     * @ignore
     * @name HostedConversation
     * @class
     * @version 3.0.0
     * @since 3.0.0
     * @memberOf fcs.conversation
     * @param {String} id Unique identifier for the conversation
     */
    this.HostedConversation = function(id) {
        return moderatorOperationDecorator(new BaseConversation(id));
    };

    this.decorate = function(conversation, type) {
        if (conversation.getType() === ConversationType.HOSTED) {
            if (type === ConversationType.PARTICIPANT) {
                moderatorOperationUndecorator(conversation);
                participantOperationDecorator(conversation);
            }
        }
        else if (conversation.getType() === ConversationType.PARTICIPANT) {
            if (type === ConversationType.HOSTED) {
                participantOperationUndecorator(conversation);
                moderatorOperationDecorator(conversation);
            }
        }
    };

};
fcs.conversation = new Conversation();
if ( typeof window.define === "function" && window.define.amd ) {
	define( "fcs", [], function () { return window.fcs; } );
}

})( window );