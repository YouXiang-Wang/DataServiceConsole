//=======================================================

GLOBAL.BASE_DIR    = __dirname;
GLOBAL.APP         = GLOBAL.BASE_DIR + "/application/";
GLOBAL.CONTROLLER  = GLOBAL.APP + "/controller/";
GLOBAL.PROXY  = GLOBAL.APP + "/proxy/";
GLOBAL.CORE        = GLOBAL.APP + "/core/";
GLOBAL.LAUNCHER    = GLOBAL.BASE_DIR + "/launcher/";
GLOBAL.MODEL       = GLOBAL.APP + "/model/";
GLOBAL.CONFIG      = GLOBAL.BASE_DIR + "/conf/";
GLOBAL.LOG         = GLOBAL.BASE_DIR + "/log/";
GLOBAL.PUBLIC      = GLOBAL.BASE_DIR + "/public/";
GLOBAL.VIEW        = GLOBAL.BASE_DIR + "/view/";




GLOBAL.Module = {
    express : require('express'),
    sio : require('socket.io'),
    fs : require('fs'),
    path : require('path'),
    url : require('url'),
    parseCookie : require('connect').utils.parseCookie,
    //MemoryStore : require('./node_modules/connect/lib/middleware/session/memory'),
    //Session : require('./node_modules/connect/lib/middleware/session/session'),
    sys : require('util')
}

GLOBAL.port = 3200;
GLOBAL.host = 'localhost';

GLOBAL.index = function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Welcome to DB2 EOS Service Console!');	
}


GLOBAL.GLOBAL_CONFIG = {
    routerConfig   : "",
    errorConfig    : "",
    serverConfig   : "",
    controllerConfig   : "",
    connectionManager : ""
}