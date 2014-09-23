require(CORE + "BaseController.js");

var request = require("request");
var cheerio = require("cheerio");
var fs = require("fs");

var PDFDocument = require('pdfkit');

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
    	
    	else if(command == "PMRREPORT") {
    		_self.generatePmrReport();
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
    
    this.listPmrs = function() {
    	
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
    
    this._listPmrs = function(fromDate, toDate, groups) {
    	
    	console.log("this._listPmrs++++++++++++++++++++++++++++++++++++++++++++++");
    	
    	
    	var _groups = new Array();
    	
    	if( (groups & 1 ) == 1 ) {
			// admin
    		_groups.push("Data Studio Administrator");
		}
		
		if( (groups & 2) == 2 ) {
			// core
			_groups.push("Optim Data Studio Core Development");
		}
		
		if( (groups & 4) == 4 ) {
			// developer
			_groups.push("Optim Development Studio / Data Studio (Developer)");
		}
		
		var conditions = {
				"$or":_groups
		};
		
		var fields= {
				l3RequestDate : 1,
				pmrNumber : 1,
				scratchPad : 1,
				customer : 1,
				version : 1,
				pmrStatus : 1,
				defect : 1
		};
		
		pmrProxy.getPmrsByCondition(conditions, fields, {}, _self._generatePmrReport);
		
    };
    
    this.generatePmrReport = function() {
		var req = _parent._req;
		var res = _parent._res;
		
		var _group = req.query.group;
		var _cols = req.query.cols;
		var _from = req.query.from;
		var _to = req.query.to;
		
		_self._listPmrs( _from, _to, _group);
		
    };
    
    this._generatePmrReport = function(err, data) {
    	
    	var resultResponse = {};
    	var res = _parent._res;
    	var req = _parent._req;

    	if(err) {
    		resultResponse = {
					type: 'ERROR',
					result: err
			}
        } else {
        	
        	_self.pdfPmrReport(data);
        	resultResponse = {
    				type: 'SUCCESS',
    				result: ""
    		}
        }

    	res.writeHead(200, {"Content-Type": "application/json"});
    	res.write(JSON.stringify(resultResponse));
    	res.end();
    	
    };
    
    this.pdfPmrReport = function(data) {
    	
    	var doc = new PDFDocument({bufferPages: true});
    	doc.pipe(fs.createWriteStream('c:/PMRReport/output1.pdf'));
    	
    	doc.image(config.pmrReportResource + '/images/128px-IBM_logo.png', 500, 60,  {width: 64});
    	doc.moveTo(30, 90);
    	doc.lineTo(565, 90);
    	doc.stroke();
    	
    	doc.fontSize(25);
    	doc.text('Data Studio PMR Report\n', 100, 130);
    	doc.fontSize(14);
    	doc.text('------'+'2014-09-01' + "~" + "2014-09-022", {
    		width: 410,
    		align: 'right'
    	});
    	doc.text('\n');
    	var lorem = 'The data of this PMR report is from the IBM CRM system. \nThe report is generated automatically by Data Console Sevice produced by Wang You Xiang CopyRight 2014.';
    	
    	doc.fontSize(10);
    	doc.text('' + lorem, {
    		width: 410,
    		align: 'left'
    	});
    	
    	// 2nd page
    	doc.addPage();
    	
    	doc.image(config.pmrReportResource + '/images/32_1px-IBM_logo.png', 550, 10,  {width: 32});
    	doc.moveTo(10, 30);
    	doc.lineTo(585, 30);
    	doc.stroke();

    	doc.fontSize(22).fillColor('blue');
    	doc.text('Executive Summary', 10, 40);
    	doc.moveDown();
    	doc.moveDown();

    	doc.fontSize(20).fillColor('black');

    	var inFlow = 'New PMR inflow in: 22\n';
    	var _contArray1 = [
    	                "Connection",
    	                "Parser",
    	                "Catalog loading",
    	                "SQL Editor",
    	                "Database objects"
    	                ];

    	var content1 =  inFlow;
    	for(var i=0 ; i < _contArray1.length; i++) {
    		content1 += "    " + _contArray1[i] + "\n"
    	}
    	doc.text(content1);

    	// 3rd page
    	doc.addPage();
    	doc.image(config.pmrReportResource + '/images/32_1px-IBM_logo.png', 550, 10,  {width: 32});
    	doc.moveTo(10, 30);
    	doc.lineTo(585, 30);
    	doc.stroke();


    	var options =
    	{
    	    columns:
    	        [
    	         { id: 'l3RequestDate', width: 8, name: 'Request Date'},
    	         { id: 'pmrNumber',     width: 11, align:'center',name: 'PMR Number' },
    	         { id: 'scratchPad', width: 50, align:'left', name: 'Description' },
    	         { id: 'customer',    width: 10, align:'center', name: 'Customer' },
    	         { id: 'version',    width: 10, align:'center', name: 'Version' },
    	         { id: 'pmrStatus',   width: 5, align:'center', name: 'Status' },
    	         { id: 'defect',   width: 6, align:'left', name: 'Defect' },
    	     ],


    	    margins: {
    	        left: 10,
    	        top: 10,
    	        right: 10,
    	        bottom: 10,
    	    },
    	    
    	    padding: {
    	        left: 2,
    	        top: 5,
    	        right: 2,
    	        bottom: 5,
    	    }
    	};

    	/*var pmrData = new Array();
    	for(var i = 0; i < data.length, i++) {
    		
    	}
    	*/
    	doc.fontSize(8).fillColor('black');
    	doc.table(data, options);
    	doc.end();
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
