require(CORE + "BaseController.js");

var request = require("request");
var cheerio = require("cheerio");
var fs = require("fs");

var PDFDocument = require('pdfkit');
var moment = require("moment");

var async = require("async");
var Q = require("q");

var qs = require("querystring");

var config = require("../../config").config;
var utils = require("../../utils/utils");
var MailService = require("../../services/MailService");

var PMRModel = require("../models").PmrInfo;
var pmrProxy = require('../proxy').PmrProxy;
var path = require("path");


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
					var localFilePath = localRepsPath + '/_' + pmrNumber + '.html'; 
					// from local
					fs.exists(localFilePath, function(exists) {
						if(exists) {
							fs.readFile(localFilePath, "utf-8", _self.returnData );	
						}
					});
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
    
    this._listPmrs = function(fromDate, toDate, groups, fields, callback) {
    	
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
				$or:_groups
		};
		
		
		if(fromDate !=0 && toDate !=0) {
			conditions._l3RequestDate = {$gt:fromDate,$lte:toDate};
		}
		
		//conditions._l3CloseDate = { $or:[{ _l3CloseDate: 0 }, {$gt:fromDate,$lte:toDate}]};
		
		
		pmrProxy.getPmrsByCondition(conditions, fields, {}, callback);
		
    };
    
    this.generatePmrReport = function() {
		var req = _parent._req;
		var res = _parent._res;
		
		var _group = req.query.group;
		var _cols = req.query.cols;
		
		var _from = req.query.from;
		
		var _fromLong;
		var _toLong;
		
		if(_from==undefined || _from == null || _from =='' ) {
			_from = '2011-01-01';
		}
		
		var _fromLong = (new moment(_from)).valueOf();
		
		var _to = req.query.to;
		
		if(_to==undefined || _to == null || _to =='' ) {
			_to = moment().format('YYYY-MM-DD');
		}
		
		var _toLong = (new moment(_to)).valueOf();
		
		var _fields= {
				_l3RequestDate : 1,
				_l3CloseDate: 1,
				l3RequestDate : 1,
				pmrNumber : 1,
				l3Group : 1,
				l3Owner : 1,
				scratchPad : 1,
				customer : 1,
				version : 1,
				pmrStatus : 1,
				defect : 1
		};
		
		_self._listPmrs( _fromLong, _toLong, _group, _fields, _self._generatePmrReport(_fromLong, _toLong, _fields));
		
    };
    
    this._generatePmrReport = function(fromLong, toLong, fields){ return function(err, data) {
    	
    	var resultResponse = {};
    	var res = _parent._res;
    	var req = _parent._req;

    	if(err) {
    		resultResponse = {
					type: 'ERROR',
					result: err
			}
        } else {
        	
        	_self.pdfPmrReport(fromLong, toLong, fields, data);
        	resultResponse = {
    				type: 'SUCCESS',
    				result: ""
    		}
        }

    	res.writeHead(200, {"Content-Type": "application/json"});
    	res.write(JSON.stringify(resultResponse));
    	res.end();
    	
    }};
    
    this.pdfPmrReport = function(from, to, fields, data) {
    	
    	var doc = new PDFDocument({bufferPages: true});
    	
    	var _reportTime = new moment().format("YYYYMMDD_HHmmss");
    	
    	var _from = (new moment(from)).format("YYYY-MM-DD");
    	var _to = (new moment(to)).format("YYYY-MM-DD");
    	
    	var _ibmLogo128Path = path.join(config.appResourceRepository, 'images', '128px-IBM_logo.png');
    	var _ibmLogo64Path = path.join(config.appResourceRepository, 'images', '64px-IBM_logo.png');
    	var _ibmLogo32Path = path.join(config.appResourceRepository, 'images', '32_1px-IBM_logo.png');
    	
    	var _shortName = 'PMRReprot_' + _reportTime + '.pdf';
    	var _fileName = path.join(config.pmrReportRepository, _shortName);
    	
    	var _metaData = _self._analyzeData(from, to, data);
    	
    	var stream = fs.createWriteStream(_fileName, 'utf8');
    	doc.pipe(stream);
    	
    	doc.image(_ibmLogo128Path, 500, 60,  {width: 64});
    	doc.moveTo(30, 90);
    	doc.lineTo(565, 90);
    	doc.stroke();
    	
    	doc.fontSize(25);
    	doc.text('Data Studio PMR Report\n', 100, 130);
    	doc.fontSize(14);
    	doc.text('------'+ _from + "~" + _to, {
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

    	doc.moveDown();
    	doc.moveDown();
    	doc.moveDown();
    	
    	doc.fontSize(18).fillColor('blue');
    	doc.text('Executive Summary:');

    	doc.fontSize(14).fillColor('black');
    	// analyze the data
    	
    	var _closedPmrs = _metaData.closedPmrs;

    	var _newPmrs = _metaData.newPmrs;
    	var _backlogPmrs = _metaData.backlogPmrs;
    	var _groups = _metaData.groups;
    	
    	var _colsedCount = utils.isEmptyValue(_closedPmrs) ? 0 : _closedPmrs.length;
    	var _newCount = utils.isEmptyValue(_newPmrs) ? 0 : _newPmrs.length;
    	var _backlongCount = utils.isEmptyValue(_backlogPmrs) ? 0 : _backlogPmrs.length;
    	
    	doc.moveDown();
    	
    	var inFlow = 'New PMR inflow is: '  + _newCount + '\n';
    	inFlow += 'Closed PMR is: '  + _colsedCount + '\n';
    	inFlow += 'Backlog PMR is: '  + _backlongCount + '\n';
    	doc.text(inFlow);
    	
    	doc.moveDown();
    	
    	doc.fontSize(18).fillColor('blue');
    	doc.text('Component Details:');
    	
    	var _groupsText='';
    	var _compontX = 100;
    	var _compontY = 390;
    	var _index = 0;
    	var _currentSpace = doc.currentLineHeight();
    	for(var attr in _groups) {
    		if ( _groups[attr]!=undefined && typeof(_groups[attr]) != "function") {
    			doc.fontSize(12).fillColor('black').text('Component [ ', _compontX, _compontY + _index * _currentSpace);
    			
    			var _x1 = doc.widthOfString('Component [ ');
    			doc.fontSize(12).fillColor('blue').text(_groups[attr].groupName, _compontX  + _x1, _compontY + _index * _currentSpace)
    			
    			var _x2 = doc.widthOfString(_groups[attr].groupName);
    			doc.fontSize(12).fillColor('black').text(' ] ', _compontX  + _x1 + _x2, _compontY + _index * _currentSpace);
    			
    			var _x3 = doc.widthOfString(' ] ');
    			doc.fontSize(12).fillColor('black').text('has  ', _compontX  + _x1 + _x2 + _x3, _compontY + _index * _currentSpace);
    			
    			var _x4 = doc.widthOfString('has  ');
    			doc.fontSize(12).fillColor('red').text(_groups[attr].data.length, _compontX  + _x1 + _x2 + _x3 + _x4, _compontY + _index * _currentSpace);
    			
    			_index++;
    			
    			/*
    			doc.fontSize(12).fillColor('black').text('Component [ '.slice(0, 20), { width: 100, continued : 'yes'});
    			doc.fontSize(12).fillColor('blue').text(_groups[attr].groupName, { width: 100, continued : 'yes'});
    			doc.fontSize(12).fillColor('black').text(' ] has:', { width: 100, continued : 'yes'});
    			doc.fontSize(12).fillColor('red').text(_groups[attr].data.length, { width: 100, continued : 'no'} );
    			*/
    		}
    	}
    	
    	// 3rd page
    	doc.addPage();
    	doc.image(_ibmLogo32Path, 570, 10,  {width: 32});
    	doc.moveTo(10, 30);
    	doc.lineTo(602, 30);
    	doc.stroke();
    	
    	var options =
    	{
    		columns:
    	        [
    	         { id: 'l3RequestDate', width: 8, name: 'Request Date'},
    	         { id: 'pmrNumber',     width: 11, align:'center',name: 'PMR Number' },
    	         { id: 'l3Group', width: 5, align:'left', name: 'Component' },
    	         { id: 'l3Owner', width: 10, align:'left', name: 'L3 Owner' },
    	         { id: 'scratchPad', width: 40, align:'left', name: 'Description' },
    	         { id: 'customer',    width: 10, align:'center', name: 'Customer' },
    	         { id: 'version',    width: 5, align:'center', name: 'Version' },
    	         { id: 'pmrStatus',   width: 5, align:'center', name: 'Status' },
    	         { id: 'defect',   width: 6, align:'left', name: 'Defect' },
    	     ],

    	     y : 40,
    	     pageHeader : {
    	     	image : {path: _ibmLogo32Path, x: 570, y: 10, style : {width: 32} },
    	     	line: {x1:10, y1:30, x2:602, y2:30 }
    	     },
    	     
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
    	
    	doc.fontSize(8).fillColor('black');
    	
    	
    	doc.table(data, options);
    	
    	stream.on('finish', function () {
    		//_self.sendMail(message);
    	});

    	
    	var _toMailList = ['wangyoux@cn.ibm.com'];
    	///var _ccMailList = ['wangyoux@cn.ibm.com', 'zengal@cn.ibm.com', 'wuping@cn.ibm.com'];
    	var _imagesPath = path.join( config.appResourceRepository, 'images' );
    	

    	
    	var _subject = 'Data Sutdio PMR Report ' + '(' +  _from + "~" + _to + ')';
    	
    	var _attachments = new Array();
    	var _pdfReport = {
    			fileName:  _shortName,
    			filePath:  _fileName,
    			cid: _shortName
    	}
    	
    	_attachments.push(_pdfReport);
    	
    	var message = {
    		to: _toMailList,
    		//cc: _ccMailList,
    		subject: _subject,
    		attachments: _attachments,
    		html:'<p>Embedded image: <img src="' + _ibmLogo64Path + '"/></p>'
    	}
    	
    	doc.end();
    	
    };
    
    this.sendMail = function(message) {
    	var mailService = new MailService('SMTP', config.ibm_mail_opts);
    	mailService.setMessage(message);
    	mailService.sendMail();
    };
    
    this.htmlPmrReport = function(from, to, data) {
    	
	};
    
    this._returnGroup = function(group) {
    	if(group !=undefined) {
    		if(group == 'Data Studio Administrator') {
        		return 'Administrator';
        	} else if (group == 'Optim Data Studio Core Development') {
        		return 'Core Development';
        	} else if (group == 'Optim Development Studio /  Data Studio (Developer)') {
        		return 'Developer';
        	} else {
        		return group;
        	}
    	} else {
    		return '';
    	}
	};
	
    this._analyzeData = function(from, to, data) {
    	var _closedPmrs = new Array();
    	var _newPmrs = new Array();
    	var _backlogPmrs = new Array();
    	
    	var _groups = {};
    	var _tmpGroup;
    	
    	var _len = data.length;
    	var _closedDate;
    	var _requestedDate;
    	
    	var _l3Group;
    	var _customer;
    	for(var i=0 ; i < _len; i++) {
    		
    		_l3Group = _self._returnGroup(data[i].l3Group);
    		data[i].l3Group = _l3Group;
    		
    		if(_groups[_l3Group] == undefined || _groups[_l3Group] == null || _groups[_l3Group] == '') {
    			var _component = {
    						groupName : _l3Group,
    						data : new Array()
    					};
    			
    			_groups[_l3Group] = _component;
    		}
    		_closedDate = data[i]._l3CloseDate;
    		
    		_requestedDate = data[i]._l3RequestDate;
    		
    		if(_requestedDate >= from ) {
    			_newPmrs.push(data[i]);
    		}
    		
    		if(_closedDate==undefined || _closedDate == null || _closedDate == 0) {
    			_backlogPmrs.push(data[i]);
    		}
    		
    		if(_closedDate >= from && _closedDate <= to) {
    			_closedPmrs.push(data[i]);
    		}
    		
    		_groups[_l3Group].data.push(data[i]);
    	}
    	
    	return metaInfo = {
    			closedPmrs: _closedPmrs,
    			newPmrs: _newPmrs,
    			backlogPmrs: _backlogPmrs,
    			groups: _groups
    	};
    };
    
    
    this._sendMail = function(data) {
    	var mailService = new MailService('SMTP', config.ibm_mail_opts);
    	var imagesPath = path.join( config.appResourceRepository, 'images' );
    	
    	var message = { 
    			from: 'Data Console Service',
    		    // Comma separated list of recipients
    		    to: 'wangyoux@cn.ibm.com',
    		    //cc: 'zengal@cn.ibm.com',
    		    //bcc: 'zengal@cn.ibm.com',
    		    // Subject of the message
    		    subject: 'Automatically embedded image', //
    		    
    		    // HTML body with image that will be converted to embedded attachment
    		    html:'<p>Embedded image: <img src="' + imagesPath + '64px-IBM_logo.png"/></p>',
    		    
    		    forceEmbeddedImages: true
    		};
    	
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
    };
    
    
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
