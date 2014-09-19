var commandUtility = require('./CommandUtility');
var cons = require('./Constants');

function CommandController(){
	var controllers = {
			sendCommand: function(req, res){
				var message = req.body;
				commandUtility.sendMessage(message, function(error, bytes){
					if(error){
						res.end(cons.errorDef('0004', error));
					}else{
						res.end(JSON.stringify(message).toString());
					}
				})	
			},
			
			sendCommands: function(req, res){
				var message = req.body;
				if(Array.isArray(message)){
					for(var i = 0; i < message.length; i++){
						var command = message[i];
						commandUtility.sendMessage(command);
					}
					res.end(cons.resultResponse(message, 'Commit command successfully'));
				}else{
					this.sendCommand(req, res);
				}
			}
		}	
	return controllers;	
}


module.exports = CommandController;