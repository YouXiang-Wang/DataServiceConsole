require(CORE + "BaseController.js");

var request = require("request");
var cheerio = require("cheerio");
var fs = require("fs");

var async = require("async");
var Q = require("q");

var qs = require("querystring");

var PMRModel = require("../models").PmrInfo;
var pmrProxy = require('../proxy').PmrProxy;

function TrackerController() {
    
    var _parent = Object.getPrototypeOf(this);
    var _self = this;
    var req = _parent._req;
    var res = _parent._res;
    
    this.usage = function(){
    };
    
    this.executeCommand = function(){
        var req = _parent._req;
        var res = _parent._res;
        var _urlList = 'https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3AnalystProfile.do';
        var _login_url = "https://w3-01.sso.ibm.com/pkmslogin.form";

        var pmrAnalysisEntries = [
                                   {
                                	baseURL: "https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3groupClosed.do?",
                                	group: "Data Studio Administrator",
                                	startDate: "2012-01-01",
                                	endDate: "2014-09-01",
                                	category: "Closed"
                                	},
                                	
                                    {baseURL: "https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3groupClosed.do?",
                                     group: "Optim Data Studio Core Development",
                                     startDate: "2012-01-01",
                                     endDate: "2014-09-01",
                                     category: "Closed"
                                    },
                                    {baseURL: "https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3groupClosed.do?",
                                     group: "Optim Development Studio /  Data Studio (Developer)",
                                     startDate: "2012-01-01",
                                     endDate: "2014-09-01",
                                     category: "Closed"
                                    }
                                 ];
        
        var username = "wangyoux@cn.ibm.com";
        var password = "Taiji1005";
        
        var _jar = request.jar();
        
        var _startDate = "2012-01-01";
        var _endDate = "2014-09-01";
        
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
        
        //request.post({url: _login_url, jar: _jar, form: form_data}, function(err, res, body) {
        request.post(_post, function(err, res, body) {
            if(err) {
                return console.error(err);
            }
            
            var cookie_string = _jar.getCookieString(_login_url);
            console.log("cookie_string:", cookie_string);
            
            async.each(pmrAnalysisEntries, function(item, callback) {
                
                
                var _url = item.baseURL + "&startDate=" + item.startDate + "&endDate=" + item.endDate + "&l3group=" + item.group;
                console.log('_url is: ' + _url);
                
                request.get({url : _url, jar : _jar}, function(err, res, body) {
                    if(err) {
                    	console.log(err);
                        return console.error("error" + err);
                    }
                    
                    var $ = cheerio.load(body);
                    
                    $(".ibm-data-table.ibm-sortable-table").each(function(index) {
                    
                        $(this).find("tr").each(function(trindex,tritem) {
                            var _c1 = $(this).find("td").eq(0);
                            var _c1_pmr_number = _c1.text();
                            if(_c1 !=undefined && _c1_pmr_number!="" && _c1_pmr_number !="Comments") {
                                
                                var _pmr_url = _c1.find("a").attr("href");
                                _pmr_url = "https://w3-01.sso.ibm.com" + _pmr_url;
                                
                                console.log("PMR" + _c1_pmr_number);
                                request.get({url : _pmr_url, jar : _jar}, function(err, res, body) {
                                    if(err) {
                                        return console.error("error" + err);
                                    }
                                    
                                    // parse the body for the information
                                    var pmrInfo = _self.parseHTML(body);
                                    pmrProxy.insert(pmrInfo);
                                    
                                    console.log("PMR_3_" + pmrInfo.pmrNumber);
                                    console.log("**********************************************************");
                                    
                                    var fileName  = "c:/PMRS2/" + pmrInfo.pmrNumber + ".html";
                                    
                                     fs.writeFile(fileName, body.toString(), function(error){
                                        if(error){
                                            console.log(error);
                                        }
                                    });
                                });
                                
                            }
                        });
                        
                    });
                    //callback();
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
    
    
    this.parseHTML = function(body){
        var $ = cheerio.load(body);
        
        var tdText;
        var vNext;
        
        var pmrNumber;
        var productName;
        var l2Owner;
        var l2OpenDate;
        var l2CloseDate;
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
        var l3CloseDate;
        var openDays;
        var billTime;
        var l3Status;
        var comments;
        var scratchPad;
        var pmrUrl;
        var fileContent;

        
        var pmrInfo = new PMRModel();
           $(".ibm-data-table.ibm-alternating-col").each(function(index) {
            
                if(index == 0) {
                    
                    $(this).find("td").each(function(tdindex){
                        tdindex = tdindex + 1;
                        
                        if(tdindex == 9 && tdText=="L2 Closed Date:") {
                            // has been closed
                            pmrStatus = 'C';
                        }
                            
                        if( ( tdindex  & 1 ) == 1) {
                            
                            tdText = $(this).text().trim();
                            vNext = $(this).next();


                            if(tdText == "PMR:") {
                                pmrNumber = vNext.text().trim();
                                // 00000,000,000
                                pmrNumber = pmrNumber.substr(0, 13);
                                console.log("**********************************************************");
                                //console.log("PMR_1_" +pmrNumber);
                            }

                            if(tdText=="Product:") {
                                productName = vNext.text().trim();
                            }
                            
                            if(tdText=="L2 Open Date:") {
                                l2OpenDate = vNext.text().trim();
                            }
                            
                            if(tdText=="Customer:") {
                                customer = vNext.text().trim();
                            }
                            
                            if(tdText=="L2 Closed Date:") {
                                l2CloseDate = vNext.text().trim();
                            }
                            
                            if(tdText=="APAR:") {
                                apar = vNext.text().trim();
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
                                priority = vNext.text().trim();
                            }
                            
                            if(tdText=="L2 Owner:") {
                                l2Owner = vNext.text().trim();
                            }
                            
                            if(tdText=="Days Open") {
                                openDays = vNext.text().trim();
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
                              l3RequestDate = vNext.text().trim();
                            }
                            
                            if(tdText=="L3 Closed Date") {
                              l3CloseDate = vNext.text().trim();
                            }
                            
                            if(tdText=="L3 Billable Time:") {
                              billTime = vNext.text().trim();
                            }
                            
                        }
                        
                     });
                }
            
            pmrInfo.pmrNumber = pmrNumber;
            pmrInfo.productName = productName;
            pmrInfo.l2OpenDate = l2OpenDate;
            pmrInfo.customer = customer;
            
            pmrInfo.severity = severity;
            pmrInfo.currentQueue = currentQueue;
            pmrInfo.pmrStatus = 'O';
            if(pmrStatus = 'C') {
            	// has been closed
            	pmrInfo.l2CloseDate = l2CloseDate;
            	pmrInfo.apar = apar;
            	pmrInfo.l2Age = l2Age;
            	pmrInfo.l2Sevdays = l2Sevdays;
            	pmrInfo.priority = priority;
            	
            	pmrInfo.l2Owner = l2Owner;
            	pmrInfo.pmrStatus = 'C';
            	pmrInfo.openDays = openDays;
            	pmrInfo.l3CloseDate = l3CloseDate;
            }
            
            pmrInfo.l3Group = l3Group;
            pmrInfo.l3Owner = l3Owner;
            pmrInfo.l3RequestDate = l3RequestDate;
            pmrInfo.billTime = billTime;
            
            });
           
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
           //console.log("PMR_2_" +pmrNumber);
           
           
           
           
           
           
           
           
           
           
           
        return pmrInfo;
    }
};

TrackerController.prototype = new BaseController();
GLOBAL.TrackerController = TrackerController;
