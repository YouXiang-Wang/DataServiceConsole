var fs = require("fs");
var cheerio = require("cheerio");
var config = require("../../config").config;
var qs = require("querystring");
var moment = require("moment");
var PMRModel = require("../models").PmrInfo;
var utils = require("../../utils/utils");
var path = require('path');

function analyzePMREntries(req) {
	var type = req.query.type;
	var group = req.query.group;
	var requestedPmr = req.query.pmrlink;
	var fileList = req.query.filelist;
	
	var byType = 1;
	
	if(!utils.isEmptyValue(requestedPmr)) {
		byType = 2; // by PMR number
	}
	
	if(!utils.isEmptyValue(fileList)) {
		byType = 3; // by PMR list file
	}
	
	var allGroups = 1 + 2 + 4;
	var allTypes = 1 + 2;
	var _from = req.query.from;
	
	if(_from==undefined || _from == null || _from =='' ) {
		_from = '2011-01-01';
	} else {
		_from_ = moment(_from,'YYYY-MM-DD');
	}
	
	var _to = req.query.to;
	if(_to==undefined || _to == null || _to =='' ) {
		_to = moment().format('YYYY-MM-DD');
	} else {
		_to = moment(_to,'YYYY-MM-DD');
	}
	
    var _closeGroupUrl = "https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3groupClosed.do?";
    var _backlogGroupUrl = "https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3groupBacklog.do?";
    

    var pmrAnalysisEntries = new Array();
    
    var _bytes1 = utils.getIntArrayLog2ByByte(group);
    var _bytes2 = utils.getIntArrayByByte(type);
    var tmp1, tmp2;
    
    var l3Groups = config.l3Groups;
    var baseUrlGroups = config.baseUrlGroups;
    
    if(byType==1) {
    	for(var i = 0; i < _bytes1.length ; i ++ ) {
        	tmp1 = _bytes1[i];
        	for(var j = 0; j < _bytes2.length ; j ++ ) {
            	tmp2 = _bytes2[j];
            	var a = {
        				baseURL: baseUrlGroups[tmp2 - 1],
        				group: l3Groups[tmp1],
        				startDate: _from,
        				endDate: _to,
        				status: ( (tmp2 - 1 )== 0 )? "Opened" : "Closed",
        		}
            	pmrAnalysisEntries.push(a);
        	}
        }
    }
    
    return pmrAnalysisEntries;
    
};

function analyzeHTML(pmrUrl, body) {
		
    var $ = cheerio.load(body);
    var localRepsPath = config.pmrRepository;
    
    var tdText;
    var vNext;
    
    var pmrNumber;
    var productName = '';
    var l2Owner;
    var l2OpenDate;
    var _l2OpenDate;
    var l2CloseDate;
    var _l2CloseDate;
    var l2Age;
    var l2Sevdays;
    var apar;
    var pmrStatus = 'O';
    var customer = '';
    var severity = 0;
    var priority = 0;
    var currentQueue;
    var l3Group = '';
    var l3Owner ='';
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
                        var arr = tmp.split(/\s-\s/);
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
                    	_l3RequestDate = moment(_tmp_,'YYYY-MM-DD').valueOf();
                    }
                    
                    if(tdText=="L3 Closed Date:") {
                    	if(pmrStatus =='O') {
                    		if(utils.isEmptyValue(vNext.text())) {
                        		pmrStatus = 'O';
                            	l3CloseDate="";
                            	_l3CloseDate=0;
                        	} else {
                        		_tmp_ = vNext.text().trim();
                            	l3CloseDate = _tmp_.substr(0, 10);
                            	_l3CloseDate = moment(_tmp_,'YYYY-MM-DD HH:mm:ss:ms').valueOf();
                            	pmrStatus = 'C';
                        	}
                    	} else {
                    		_tmp_ = vNext.text().trim();
                        	l3CloseDate = _tmp_.substr(0, 10);
                        	_l3CloseDate = moment(_tmp_,'YYYY-MM-DD HH:mm:ss:ms').valueOf();
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
        pmrInfo.comments = '';
        pmrInfo.scratchPad= '';
        
        if(pmrStatus == 'C') {
        	pmrInfo.l2CloseDate = l2CloseDate;
        	pmrInfo._l2CloseDate = _l2CloseDate;
        	pmrInfo.apar = apar;
        	pmrInfo.l2Age = l2Age;
        	pmrInfo.l2Sevdays = l2Sevdays;
        	pmrInfo.priority = priority;
        	
        	pmrInfo.l2Owner = l2Owner;
        	pmrInfo.pmrStatus = 'C';
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
        	   if(!utils.isEmptyValue($(this).text())) {
        		   comments =$(this).text().trim();        		  
        		   comments=comments.replace(/\r\n/g, '\n');
                   pmrInfo.comments =  comments;
        	   }
           }
           if(index==1) {
        	   if(!utils.isEmptyValue($(this).text())) {
            	   scratchPad =$(this).text().trim();
            	   scratchPad=scratchPad.replace(/\r\n/g, '\n');
            	   pmrInfo.scratchPad =  scratchPad;
        	   }
           }
       });
       
       var updates = $(".ibm-twisty-body").first();
       
       var fileName  = localRepsPath + path.sep + "_" + pmrInfo.pmrNumber + ".html";
       
       fs.exists(fileName, function(exists) {
    	   if( (!exists) || (exists && config.redownloadPMRHtml)) {
               fs.writeFile(fileName, updates, 'utf8', function(error){
                   if(error){
                       console.log(error);
                   }
               });
    	   }
       });
       return pmrInfo;
       
}

exports.analyzeHTML=analyzeHTML;
exports.analyzePMREntries=analyzePMREntries;
