require(CORE + "BaseController.js");

var request = require("request");
var cheerio = require("cheerio");
var fs = require("fs");

var async = require("async");
var Q = require("q");

var qs = require("querystring");

var config = require("../../config").config;


var PMRModel = require("../models").PmrInfo;
var pmrProxy = require('../proxy').PmrProxy;

function PMRResourceController() {
    
    var _parent = Object.getPrototypeOf(this);
    var _self = this;
    var req = _parent._req;
    var res = _parent._res;

    this.usage = function(){
    };
    
    this.executeCommand = function() {
    	
    	var req = _parent._req;
    	var res = _parent._res;
    	var command = req.params.command;
    	
    	command = command.toUpperCase();
    	
    	if(command == "LISTPMRS") {
    		_self.listPmrs();
    	}
    	
    	else if(command == "GETPMR") {
    		_self.getPmrInfo();
    	}
    	
    	else if(command == "PMRSREPORT") {
    		_self.listPmrs();
    	}
    	
    	else {
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end('Welcome to Data Service Console!');
		}
    };
    
    this.getPmrInfo = function(){
    	
		var req = _parent._req;
		var res = _parent._res;
		
		var type = req.query.type;
		var pmrNumber = req.query.pmrNumber;
		
		var localRepsPath = config.pmrRepository;
		//http://localhost:3200/resource/pmr/getpmr?type=1&pmrNumber=93617,110,846
		if(pmrNumber!=null && pmrNumber!='') {
			
			if(type!=null) {
				if(type == 1) {
					var localFilePath = localRepsPath + '/' + pmrNumber + '.html'; 
					// from local	
					fs.readFile(localFilePath, "utf-8", _self.returnData );					
				}
			}
		}
    };
    
    this.listPmrs = function(){
    	
		var req = _parent._req;
		var res = _parent._res;
		
		var scope;
		var type = req.query.type;
		
		var _group;
		var groups;
		
		if(type!=null) {
			if(type == 1) {
				// by group
				groups = new Array();
				_group = req.query.group;
				console.log(_group);
				if( (_group & 1 ) == 1 ) {
					// admin
					groups.push("Data Studio Administrator");
				}
				
				if( (_group & 2) == 2 ) {
					// core
					groups.push("Optim Data Studio Core Development");
				}
				
				if( (_group & 4) == 4 ) {
					// developer
					groups.push("Optim Development Studio / Data Studio (Developer)");
				}
				pmrProxy.getPmrsByGroup(groups, _self.returnPMRInfo);
			}
		}

    };
    
    this.returnPMRInfo = function(err, data) {
    	var resultResponse = {};
    	var res = _parent._res;
    	var req = _parent._req;
    	
    	if(err) {
    		resultResponse = {
					type: 'ERROR',
					result: err
			}
        } else {
        	
        	resultResponse = {
    				type: 'SUCCESS',
    				result: data
    		}
        }
    	
    	res.writeHead(200, {"Content-Type": "application/json"});
    	
    	
    	var callback = req.query.callback;
		if(callback!=undefined && callback!=null && callback!='') {
			// support JSONP
			res.write(callback);
			res.write('(');
		}
    	res.write(JSON.stringify(resultResponse));
    	
		if(callback!=undefined && callback!=null && callback!='') {
			// support JSONP
			res.write(')');
		}
    	
    	//_parent.wrapData(req, res, data);
    	res.end();
    },
    
    
    this.returnData = function(err, data) {
    	var resultResponse = {};
    	var res = _parent._res;
    	var req = _parent._req;
    	
    	if(err) {
    		resultResponse = {
					type: 'ERROR',
					result: err
			}
        } else {
        	
        	resultResponse = {
    				type: 'SUCCESS',
    				result: data
    		}
        }
    	
    	res.writeHead(200, {"Content-Type": "application/json"});
    	
    	
    	var callback = req.query.callback;
		if(callback!=undefined && callback!=null && callback!='') {
			// support JSONP
			res.write(callback);
			res.write('(');
		}
    	res.write(JSON.stringify(resultResponse));
    	
		if(callback!=undefined && callback!=null && callback!='') {
			// support JSONP
			res.write(')');
		}
    	res.end();
    }
};

PMRResourceController.prototype = new BaseController();
GLOBAL.PMRResourceController = PMRResourceController;
