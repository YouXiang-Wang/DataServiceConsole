require(CORE + "BaseController.js");

var request = require("request");
var cheerio = require("cheerio");
var fs = require("fs");

var async = require("async");
var Q = require("q");
var moment = require("moment");

var qs = require("querystring");

var config = require("../../config").config;
var utils = require("../../utils/utils");

var PMRModel = require("../models").PmrInfo;
var pmrProxy = require('../proxy').PmrProxy;

function TrackerController() {
    
    var _parent = Object.getPrototypeOf(this);
    var _self = this;
    
    var l3Groups = [
                    'Data Studio Administrator',
                    'Optim Data Studio Core Development',
                    'Optim Development Studio /  Data Studio (Developer)'
                    ];
    
    var baseUrlGroups = ['https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3groupBacklog.do?', 
                         'https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3groupClosed.do?'
                         ];
    
    var req = _parent._req;
    var res = _parent._res;
    
    this.usage = function(){
    };
    
    this.executeCommand = function(){
    	
    	var req = _parent._req;
    	var res = _parent._res;
    	var command = req.params.command;
    	
    	command = command.toUpperCase();
    	
    	if(command == "TRACKPMRS") {
    		_self.trackPMRs();
    	}
    	
    	else {
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end('Welcome to Data Service Console!');
		}
    };
    
    this.trackPMRs = function(){
    	
    	console.log("this.trackPMRs++++++++++++++++++++++++++++++++++++++++++++++");
    	
    	var req = _parent._req;
        var res = _parent._res;
        
        var type = req.query.type;
		var group = req.query.group;
		
		var allGroups = 1 + 2 + 4;
		var allTypes = 1 + 2;
		var _from = req.query.from;
		
		if(_from==undefined || _from == null || _from =='' ) {
			_from = '2011-01-01';
		}
		// var _from_ = moment(_from,'YYYY-MM-DD').valueOf();
		
		var _to = req.query.to;
		if(_to==undefined || _to == null || _to =='' ) {
			_to = moment().format('YYYY-MM-DD');
		}
				
        var _login_url = "https://w3-01.sso.ibm.com/pkmslogin.form";
        
        var _closeGroupUrl = "https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3groupClosed.do?";
        var _backlogGroupUrl = "https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3groupBacklog.do?";
        
        var pmrAnalysisEntries = new Array();
        
        var _bytes1 = utils.getIntArrayByByte(group);
        var _bytes2 = utils.getIntArrayByByte(type);
        var tmp1, tmp2;
        for(var i = 0; i < _bytes1.length ; i ++ ) {
        	tmp1 = _bytes1[i];
        	for(var j = 0; j < _bytes2.length ; j ++ ) {
            	tmp2 = _bytes2[j];
            	var a = {
        				baseURL: baseUrlGroups[tmp2 - 1],
        				group: l3Groups[tmp1 >> 1],
        				startDate: _from,
        				endDate: _to,
        				status: ( (tmp2 - 1 )== 0 )? "Opened" : "Closed",
        		}
            	pmrAnalysisEntries.push(a);
        	}
        }
        
        var username = config.pmrSystemCredential.username;
        var password = config.pmrSystemCredential.password;
        
        var _jar = request.jar();
        
        var _startDate = "2012-01-01";
        var _endDate = "2014-09-21";
        
        var form_data = qs.stringify({
            username : username,
            password : password,
            "login-form-type": "pwd"
            
        });
        
        var _headers = qs.stringify( {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(form_data)
          });
        
        var _post = {
                url: _login_url,    
                jar: _jar,
                headers: _headers,
                form: form_data
            };
        
        var _baseUrl = "https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3AnalystProfile.do?";
        
        var localRepsPath = config.pmrRepository;
        
        var reTrackArray = new Array();
        
        request.post({url: _login_url, jar: _jar, form: form_data}, function(err, res, body) {
            if(err) {
                return console.error(err);
            }
            
            var cookie_string = _jar.getCookieString(_login_url);
            
            console.log("cookie_string:", cookie_string);
            
            async.each(pmrAnalysisEntries, function(item, callback) {
            	var _url;
            	if(item.status=="Closed") {
            		_url = item.baseURL + "&startDate=" + item.startDate + "&endDate=" + item.endDate + "&l3group=" + item.group;
            	} else {
            		_url = item.baseURL + "&l3group=" + item.group;
            	}
            	
                request.get({url : _url, jar : _jar}, function(err, res, body) {
                    if(err) {
                    	console.log(err);
                        return console.error("Error1:" + "\nURL=" + _url + "\nReason:" + err);
                    }
                    
                    var $ = cheerio.load(body);
                    
	                    $(".ibm-data-table.ibm-sortable-table").each(function(index) {
	                    
	                        $(this).find("tr").each(function(trindex,tritem) {
	                            var _c1 = $(this).find("td").eq(0);
	                            var _c1_pmr_number = _c1.text();
	                            if(_c1 !=undefined && _c1_pmr_number!="" && _c1_pmr_number !="Comments") {
	                                
	                                var _pmr_url = _c1.find("a").attr("href");
	                                _pmr_url = "https://w3-01.sso.ibm.com" + _pmr_url;
	                                
	                                (function(url, jar) {
	                                	
	                                	request.get({url : url, jar : jar}, function(err, res, body) {
		                                    if(err) {
		                                    	console.trace();
		                                    	return console.error("Error2:" + "\nURL=" + url + "\nReason:" + err);
		                                    } else {
		                                    	
		                                    	if(url=='https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3PmrRecord1.do?&pmrno=50629&bno=075&cno=724&createDate=O14/02/21&method=retrieveCRMWithDate') 
		                                    	{
		                                    		console.log("inputUrl%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%" + url);
		                                    		console.log("_pmr_url%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%" + _pmr_url);
		                                            fs.writeFile('c:/ddd.body50629_2.html', body, function(error){
		                                                if(error){
		                                                    console.log(error);
		                                                }
		                                            });
		                                    		
		                                    	}
		                                    	
		                                        // parse the body for the information
		                                    	
		                                        var pmrInfo = _self.parseHTML(url, body);
		                                        pmrProxy.insert(pmrInfo);
		                                        
		                                        var fileName  = localRepsPath + "/" + pmrInfo.pmrNumber + ".html";
		                                        
		                                        fs.exists(fileName, function(exists) {
		                                     	   if(!exists) {
		                                     		   
		                                                fs.writeFile(fileName, body.toString(), function(error){
		                                                    if(error){
		                                                        console.log(error);
		                                                    }
		                                                });
		                                     	   }
		                                        });
		                                        
		                                    }
		                                
		                                });
	                                	} (_pmr_url,_jar));
	                                }
	                        });
	                        
                    });
	                    
                });
                callback();
            }, function(err) {
                if(err) {
                    console.error(err);
                }
            });
        });
        
        {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Welcome to Data Service Console!');
        }

    };

    this.parseHTML = function(pmrUrl, body) {
    	
    	console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^" + pmrUrl);
        var $ = cheerio.load(body);
        
        
        var localRepsPath = config.pmrRepository;
        
        var tdText;
        var vNext;
        
        var pmrNumber;
        var productName;
        var l2Owner;
        var l2OpenDate;
        var _l2OpenDate;
        var l2CloseDate;
        var _l2CloseDate;
        var l2Age;
        var l2Sevdays;
        var apar;
        var pmrStatus = 'O';
        var customer;
        var severity;
        var priority;
        var currentQueue;
        var l3Group;
        var l3Owner;
        var l3RequestDate;
        var _l3RequestDate;
        var l3CloseDate;
        var _l3CloseDate;
        var openDays;
        var billTime;
        var l3Status;
        var comments;
        var scratchPad;
        
        var fileContent;
        var _tmp_;
        var pmrInfo = new PMRModel();
        
        $(".ibm-data-table.ibm-alternating-col").each(function(index) {
        	
            if(index == 0) {
            	
                $(this).find("td").each(function(tdindex) {
                	tdindex = tdindex + 1;
                	
                    if( ( tdindex  & 1 ) == 1) {
                        
                    	tdText = $(this).text().trim();
                        vNext = $(this).next();

                        if(tdText == "PMR:") {
                            pmrNumber = vNext.text().trim();
                            // 00000,000,000
                            pmrNumber = pmrNumber.substr(0, 13);
                            
                        }

                        if(tdText=="Product:") {
                            productName = vNext.text().trim();
                        }
                        
                        if(tdText=="L2 Open Date:") {
                        	_tmp_ = vNext.text().trim();
                            l2OpenDate = _tmp_.substr(0, 10);
                            _l2OpenDate = moment(_tmp_,'YYYY-MM-DD HH:mm:ss:ms').valueOf();
                        }
                        
                        if(tdText=="Customer:") {
                            var tmp = vNext.text().trim();
                            var arr = tmp.split('/\s-\s/');
                            if(arr!=null && arr.length >=2) {
                            	customer = arr[1];
                            } else {
                            	customer = tmp.substr(16);
                            }
                        }
                        
                        if(tdText=="L2 Closed Date:") {
                        	if(!utils.isEmptyValue(vNext.text())) {
                        		_tmp_ = vNext.text().trim();
                        		l2CloseDate = _tmp_.substr(0, 10);
                        		_l2CloseDate = moment(_tmp_,'YYYY-MM-DD HH:mm:ss:ms').valueOf();
                        	} else {
                        		l2CloseDate="";
                        		_l2CloseDate=0;
                        	}

                        }
                        
                        if(tdText=="APAR:") {
                        	apar = utils.isEmptyValue(vNext.text()) ? "":vNext.text().trim()
                        }
                        
                        if(tdText=="L2 Age:") {
                            l2Age = vNext.text().trim();
                        }
                        
                        if(tdText=="L2 Sevdays:") {
                            l2Sevdays = vNext.text().trim();
                        }
                        
                        if(tdText=="Severity:") {
                            severity = vNext.text().trim();
                        }
                        
                        if(tdText=="Current Queue:") {
                            currentQueue = vNext.text().trim();
                        }
                        
                        if(tdText=="Priority:") {
                        	if(!utils.isEmptyValue(vNext.text())) {
                        		priority = vNext.text().trim();
                        	}
                        	priority="0";
                        }
                        
                        if(tdText=="L2 Owner:") {
                            l2Owner = vNext.text().trim();
                        }
                        
                        if(tdText=="Days Open:") {
                            openDays = vNext.text().trim();
                        }
                        
                        if(tdText=="PMR Status:") {
                        	if(!utils.isEmptyValue(vNext.text())) {
                        		tmp = vNext.text().trim();
                        		console.log("PMR Status:=" + tmp);
                            	if( tmp == 'Open' ) {
                            		pmrStatus = 'O';
                            	} else {
                            		pmrStatus = 'C';
                            	}
                        	} else {
                        		pmrStatus = 'O';
                        	}

                        }
                    }
                });
            }
            
            if(index == 1 ) {
                
                $(this).find("td").each(function(tdindex){
                    tdindex = tdindex + 1;
                    if( ( tdindex  & 1 ) == 1) {
                        
                        tdText = $(this).text().trim();
                        vNext = $(this).next();
                        
                        if(tdText=="L3 Group:") {
                          l3Group = vNext.text().trim();
                        }
                        
                        if(tdText=="L3 Owner:") {
                          l3Owner = vNext.text().trim();
                        }
                        
                        if(tdText=="L3 Request Date:") {
                        	_tmp_ = vNext.text().trim();
                        	l3RequestDate = _tmp_.substr(0, 10);
                        	_l3RequestDate = moment(_tmp_,'YYYY-MM-DD HH:mm:ss:ms').valueOf();
                        }
                        
                        if(tdText=="L3 Closed Date:") {
                        	if(!utils.isEmptyValue(vNext.text())) {
                        		_tmp_ = vNext.text().trim();
                            	l3CloseDate = _tmp_.substr(0, 10);
                            	_l3CloseDate = moment(_tmp_,'YYYY-MM-DD HH:mm:ss:ms').valueOf();
                        	} else {
                            	l3CloseDate="";
                            	_l3CloseDate=0;
                        	}
                        }
                        
                        if(tdText=="L3 Billable Time:") {
                          billTime = vNext.text().trim();
                        }
                        
                    }
                    
                 });
            }
            });

	        pmrInfo.pmrNumber = pmrNumber;
	        pmrInfo.productName = productName;
	        pmrInfo.l2OpenDate = l2OpenDate;
	        pmrInfo._l2OpenDate = _l2OpenDate;
	        pmrInfo.customer = customer;
	        
	        pmrInfo.severity = severity;
	        pmrInfo.currentQueue = currentQueue;
	        pmrInfo.pmrStatus = 'O';
	        pmrInfo.apar = '';
	        pmrInfo.l2CloseDate = '';
	        
	        pmrInfo._l2CloseDate = 0;
	        pmrInfo.l3CloseDate = '';
	        pmrInfo._l3CloseDate = 0;
	        
	        if(pmrStatus == 'C') {
	        	// has been closed
	        	pmrInfo.l2CloseDate = l2CloseDate;
	        	pmrInfo._l2CloseDate = _l2CloseDate;
	        	pmrInfo.apar = apar;
	        	pmrInfo.l2Age = l2Age;
	        	pmrInfo.l2Sevdays = l2Sevdays;
	        	pmrInfo.priority = priority;
	        	
	        	pmrInfo.l2Owner = l2Owner;
	        	//pmrInfo.pmrStatus = 'C';
	        	pmrInfo.openDays = openDays;
	        	pmrInfo.l3CloseDate = l3CloseDate;
	        	pmrInfo._l3CloseDate = _l3CloseDate;
	        	pmrInfo.billTime = billTime;
	        }
	        
	        pmrInfo.l3Group = l3Group;
	        pmrInfo.l3Owner = l3Owner;
	        pmrInfo.l3RequestDate = l3RequestDate;
	        pmrInfo._l3RequestDate = _l3RequestDate;
	        pmrInfo.pmrUrl = pmrUrl;
           
           $("form > p > span > textarea").each(function(index) {
               if(index==0) {
                   comments =$(this).text().trim();
                   pmrInfo.comments =  comments;
               }
               if(index==1) {
            	   scratchPad =$(this).text().trim();
            	   pmrInfo.scratchPad =  scratchPad;
               }
           });
           
           var updates = $(".ibm-twisty-body").first();
           
           var fileName  = localRepsPath + "/_" + pmrInfo.pmrNumber + ".html";
           

           fs.exists(fileName, function(exists) {
        	   if(!exists) {
        		   
                   fs.writeFile(fileName, updates, function(error){
                       if(error){
                           console.log(error);
                       }
                   });
        	   }
           });
           
        return pmrInfo;
    }
};

TrackerController.prototype = new BaseController();
GLOBAL.TrackerController = TrackerController;
