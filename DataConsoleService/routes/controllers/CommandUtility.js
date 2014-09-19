var dgram = require('dgram');
var setting = require('../../Settings.js');
var util = require('util');
var logger = require('../../utils/logger.js').logger;
var server = dgram.createSocket('udp4');
var port = setting.udpServerPort;
server.bind(port);

console.log('UDP server started using port %d', port);

server.on('message', function(message, rinfo) {
	var info = util.format('server got message: %s from %s:%d',
			message,
			rinfo.address,
			rinfo.port
	);
	console.log(info);
	server.send(message, 0, message.length, rinfo.port, rinfo.address);
	getMessageHandler(message, rinfo);
});


function sendMessage(messageContent, callback){
	var message = messageContent.message;
	var host = messageContent.ip;
	var port = messageContent.port;
	//Need the encode properties?
	var encode = messageContent.encode;
	console.dir(messageContent);
	var bufferMessage = new Buffer(message, encode);
	var client = dgram.createSocket('udp4');
	client.on("error", function (err) {
	    console.log("Socket error: " + err);
	});
	client.send(bufferMessage, 0, bufferMessage.length, port, host, function(error, bytes){
		if(error){
			logger.error(error);
		}
		client.close();
		if(callback != null && typeof(callback) == 'function'){
			callback(error, bytes);
		}	
	})
}

function getMessageHandler(message, rinfo){
	console.log(message.toString());
}

module.exports.sendMessage = sendMessage;