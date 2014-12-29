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
var lineReader = require('line-reader');
var PMRFilter = require("../filter/PMRFilter");
var PMRAnalyzer=require("../models/PMRAnalyzer");
var path = require('path');
var iconv= require('iconv-lite');

function PMRTrackerController() {
    
    var _parent = Object.getPrototypeOf(this);
    var _self = this;
    
    var l3Groups = config.l3Groups;
    
    var baseUrlGroups = config.baseUrlGroups;
    
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
    	
    	else if(command == "UPDATEPMRS") {
    		_self.updatePMRs();
    	}
    	
    	else if(command == "ABOUT") {
    		_self.about();
    	}
    	
    	else if(command == "UPDATEPMRSLOCAL") {
    		_self.updatePMRsLocal();
    	}
    	
    	else {
    		_parent.welcome();
		}
    };
    
    this.trackPMRs = function() {
    	_self.requestSession()
		.then(_self.analyzePMRUrls)
		.then(function(data) {
			var urls = data[0];
			var jar = data[1];
			_self.requestPMRsByURLs(urls, jar);
		});
    	
    	_parent.welcome();
    };
    
    this.analyzePMRUrls = function(jar, res, body) {
    	var req = _parent._req;
    	var fileList = req.query.filelist;
    	var byType = 1;
		if(!utils.isEmptyValue(fileList)) {
			byType = 3; // by PMR list file
		}
		
		if(byType==1) {
			var pmrAnalysisEntries=PMRAnalyzer.analyzePMREntries( _parent._req);
	    	var promises = pmrAnalysisEntries.map(function (item) {
	    		var _url;
	        	if(item.status=="Closed") {
	        		_url = item.baseURL + "&startDate=" + item.startDate + "&endDate=" + item.endDate + "&l3group=" + item.group;
	        	} else {
	        		_url = item.baseURL + "&l3group=" + item.group;
	        	}
	        	
	        	console.log("PMR Entry:" + _url);
	        	var deferred = Q.defer();
	        	
	            request.get({url : _url, jar : jar}, function(err, res, body) {
	            	
	            	var pmrUrlList = new Array();
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
	                            pmrUrlList.push(_pmr_url);
	                        }
	                    });
	                });
	                deferred.resolve( pmrUrlList);
	            });
	            return deferred.promise;
	          });
	    	
	    	return Q.all(promises).then(function (urlsArray) {
	    		var pmrUrlList = new Array();
	    		for(var i=0; i < urlsArray.length; i++ ) {
	    			var tmp = urlsArray[i];
	    			for(var j=0; j < tmp.length; j++ ) {
	    				pmrUrlList.push(urlsArray[i][j])
	    			}
	    		}
	    		console.log("Count of the URLs is:"+pmrUrlList.length);
	            return [pmrUrlList, jar];
	    	});
		}
		
		if(byType==2) {
			
		}
		
		if(byType==3) {
			var deferred = Q.defer();
			var _pmrUrls = new Array();
        	lineReader.eachLine('c:/pmrlist.txt', function(line) {
        		_pmrUrls.push(line);
        	}).then(function () {
        		deferred.resolve( [_pmrUrls, jar]);
        	});
        	return deferred.promise;
		}
    };
    
    this.requestSession = function() {
    	var req = _parent._req;
        var res = _parent._res;
        var _login_url = "https://w3-01.sso.ibm.com/pkmslogin.form";
        var username = config.pmrSystemCredential.username;
        var password = config.pmrSystemCredential.password;
        var _jar = request.jar();
        var form_data = qs.stringify({
            username : username,
            password : password,
            "login-form-type": "pwd"
        });
        
        var deferred = Q.defer();
        request.post({url: _login_url, jar: _jar, form: form_data}, function(err, res, body) {
        	if(!err) {
        		deferred.resolve( _jar, res, body);
        	}else {
        		deferred.reject(err);
        	}
        });
        return deferred.promise;
        
    };
    
    this.updatePMRs = function() {
    	var login_url = "https://w3-01.sso.ibm.com/pkmslogin.form";
    	var req = _parent._req;
    	var res = _parent._res;
    	_self.requestSession()
    		.then(function (jar, res, body) {
    			var conditions = PMRFilter.returnQueryCondition(req);
    			pmrProxy.getPmrsByCondition(conditions, {pmrUrl:1}, {}, _self.handleResult(jar));
    		});
    	
    	_parent.welcome();
    };
    
    this.updatePMRsLocal = function() {
    	var login_url = "https://w3-01.sso.ibm.com/pkmslogin.form";
    	var req = _parent._req;
    	var res = _parent._res;
    	var conditions = PMRFilter.returnQueryCondition(req);
    	pmrProxy.getPmrsByCondition(conditions, {pmrUrl:1}, {}, _self.handleResult(jar));
    	_parent.welcome();
    };
    
    this.handleResult = function(jar) { return function (err, data) {
    	if(err) {
    		resultResponse = {
					type: 'ERROR',
					result: err
			};
    		
        } else {
        	var _len = data.length;
        	console.log("LEN=" + _len);
        	var _urlArray = new Array();
        	for(var i=0 ; i < _len; i++) {
        		_urlArray.push(data[i].pmrUrl)
        	}
        	_self.requestPMRsByURLs(_urlArray, jar);
        }
    }};
    
    this.requestPMRsByURLs = function(pmrUrls, cookieJar) {
    	console.log("Being to extract the PMR information, pmrUrls.length=" + pmrUrls.length);
		async.each(pmrUrls, function(pmrUrl, callback) {
    		_self.requestPMRInfo(pmrUrl, cookieJar);
    		callback();
    	}, function(err) {
            if(err) {
                console.error(err);
            }
        });
    };
    
    this.requestPMRInfo = function(pmrUrl, cookieJar) {
    	
    	(function(url, jar) {
    		 var localRepsPath = config.pmrRepository;
         	request.get({url : url, encoding: null, jar : jar}, function(err, res, body) {
                 if(err) {
                 	console.trace();
                 	return console.error("Error2:" + "\nURL=" + url + "\nReason:" + err);
                 } else {
                     // parse the body for the information
                	 var data = iconv.decode(body, 'ISO-8859-1');
                	 var htmlstr = data.toString();
                	 var pmrInfo = PMRAnalyzer.analyzeHTML(url, htmlstr);
                     pmrProxy.save(pmrInfo);
                     var fileName  = localRepsPath + path.sep + pmrInfo.pmrNumber + ".html";
                     fs.exists(fileName, function(exists) {
                  	   if( (!exists) || (exists && config.redownloadPMRHtml)) {
                             fs.writeFile(fileName, htmlstr, function(error){
                                 if(error){
                                     console.log(error);
                                 }
                             });
                  	   }
                     });
                 }
             });
        } (pmrUrl,cookieJar));
    };
};

PMRTrackerController.prototype = new BaseController();
GLOBAL.PMRTrackerController = PMRTrackerController;
