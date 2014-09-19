var url = require('url');
var tableController = require('./TableController')()
var commandController = require('./CommandController')()


function dispatcher(viewId, req, res)
{
	var paramsId = req.params.id;
	var controller = commandController;
	if(viewId == 'TABLE'){
		controller = tableController;
	}else if(viewId == 'TABLES'){
		controller = commandController;
	}else if(viewId == 'COMMAND'){
		controller = commandController;
	}
	
	if(paramsId != null){
		var cc = controller[paramsId];
		if(cc != undefined && typeof(cc) == 'function'){
			var queryData = url.parse(req.url, true).query;
			controller[paramsId](req, res, queryData);
		}else{
			res.end('The method ' + paramsId + ' is not supported yet. Please check your params id.');
		}
	}else{
		res.send(new Date())		
	}
}

exports.dispatcher = dispatcher;