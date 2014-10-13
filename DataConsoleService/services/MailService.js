var nodemailer = require('nodemailer');
var utils = require("../utils/utils");

module.exports = function(type, config) {
	
	var transport;
	var message = {};
	var _self = this;
	
	if(type == 'SMTP') {
		_self.transport = nodemailer.createTransport("SMTP",config);
	}

	this.setMessage = function(message) {
		_self.message = message;
	};
	
	this.sendMail = function() {
		_self.transport.sendMail(_self.message, function(error){
		    if(error){
		        console.log('Error occured');
		        console.log(error.message);
		        return;
		    }
		    console.log('Message sent successfully!');
		    _self.transport.close();
		});
	}
};