var Connection = require('../models/Connection');
var command = require('./command');
var object = require('./object');
var controller = require('./controllers/Controller');

var that = exports;

exports.index = function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Welcome to DB2 EOS Service Console!');
};

module.exports = function(app) {
	
	app.get('/user/:id', function(req, res){
		controller.dispatcher('USER', req, res);
	});
	
	app.get('/table/:id', function(req, res){
		controller.dispatcher('TABLE', req, res);
	});
	
	app.get('/tables/:id', function(req, res){
		controller.dispatcher('TABLES', req, res);
	});
	
	app.get('/command/:id', function(req, res){
		controller.dispatcher('COMMAND', req, res);
	});

	app.get('/', that.index);
	app.get('/cmd/:command', command.executeCommand);
	app.get('/object/:type', object.loadProperties);
};