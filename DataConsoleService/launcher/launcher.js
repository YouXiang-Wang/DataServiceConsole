var app = module.export = Module.express();

var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var session = require('express-session');

//var RedisStore = require('connect-redis')(Module.express);

//GLOBAL.io = Module.sio.listen(app);

var systemConfig = function() {
	
		app.use(morgan('dev'));
		app.use(cookieParser());
		app.use(bodyParser());
			
		app.use(methodOverride());
		/*
		app.use(session({
			secret : "db2eos",
			store : new RedisStore
		}));
		*/
		/*
		app.use(function(req, res, next) {
            if(/\.ejs$/.test(req.url)) {
                next();
                return ;
            }
            res.sendFile(BASE_DIR + req.url);
        });
        */
		// static resource folder
		app.use(Module.express.static(BASE_DIR + "/view"));
		app.use(Module.express.static(PUBLIC));

};

var listenPort = function() {
	app.listen(GLOBAL.port);
	console.log('app listening on ' + GLOBAL.host + ':' + GLOBAL.port);
}

exports.start = function() {
	console.log('App starting......');
	systemConfig();
	var controllerMap = getControllerConfig();

	app.get('/', function(req, res) {
		console.log('/////////////////////');
		return res.redirect('view/index.html');
	});
	
	app.get('/favicon.ico', function(req, res) {
		return;
	});
	
	
	controllerMap.forEach(function(entry) {
		console.log('[Router info]' + entry.url);
		if(entry.rest == 'get') {
			
			app.get(entry.url, function(req, res) {
				console.log('--------------------------------');
				console.log(CONTROLLER );
				console.log(entry.path );
				require(CONTROLLER + entry.path);
				
				var controller = eval('new ' + entry.class);
				controller.init(req, res);
				controller[entry.procedure]();
			});
		}
		if(entry.rest == 'post') {
			app.post(entry.url, function(req, res) {
				require(CONTROLLER + entry.path);
				var controller = eval('new ' + entry.class);
				controller.init(req, res);
				controller[entry.procedure]();
			});
		}
	});
	
	listenPort();
};


function getControllerConfig() {
	
	var controllerMap = [];
	try {
		var str = Module.fs.readFileSync(CONFIG + 'controllers.json', 'utf8');
		controllerMap = JSON.parse(str);
	} catch (e) {
		Module.sys.debug("JSON parse configs/controllers.json fails")
	}
	GLOBAL_CONFIG.controllerConfig = controllerMap;
	return controllerMap;
}

function checkSession(req, fun) {
	
}