var request = require("request");
var qs = require('querystring');
var fs = require('fs');
var async = require('async');
var cheerio = require('cheerio');

var _urlList = 'https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3AnalystProfile.do';
var _login_url = "https://w3-01.sso.ibm.com/pkmslogin.form";

var pmrAnalysts = [
                   {analystSN:"917317672"},
                   {analystSN:"6A4698897"}
                   ];

var username = "wangyoux@cn.ibm.com";
var password = "Taiji1005";

var _jar = request.jar();

var _startDate = "2014-01-01";
var _endDate = "2014-08-21";

var form_data = qs.stringify({
	username : username,
	password : password,
	"login-form-type": "pwd"
});

var dataArray = new Array();

var _baseUrl = "https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3AnalystProfile.do?";

request.post({url: _login_url, jar: _jar, form: form_data}, function(err, res, body) {
    if(err) {
        return console.error(err);
    }
    
    //var cookie_string = _jar.getCookieString(_login_url);
    //console.log("cookie_string:", cookie_string);
    
    async.each(pmrAnalysts, function(item, callback) {
    	
    	var _url = _baseUrl + "&cnum=" + item.analystSN + "&startDate=" + _startDate + "&endDate=" + _endDate;
    	//console.error("_url=" + _url);
        request.get({url : _url, jar : _jar}, function(err, res, body) {
            if(err) {
                return console.error("error" + err);
            }
            
            var $ = cheerio.load(body);
            
            $(".ibm-data-table.ibm-sortable-table").each(function(index) {
            	if(index == 1 || index == 3 ) {
            		$(this).find("tr").each(function(trindex,tritem) {
            			var _c1 = $(this).find("td").eq(0);
            			var _c1_pmr_number = _c1.text();
            			
            			if(_c1 !=undefined && _c1_pmr_number!="" && _c1_pmr_number !="Comments") {
            				
            				console.error("_c1_pmr_number=" + _c1_pmr_number);
            				
            				var _pmr_url = _c1.find("a").attr("href");
            				var pmrInfo = {
                                    pmrNumber : _c1_pmr_number,
                                    pmrUrl : _pmr_url
                                  };
                            dataArray.push(pmrInfo);
            			}
            		});
            	}
            });
     		callback();
     		console.log("++++++++++++++++++++++++++++++++++");
     		
     		for(var a in dataArray) {
     	    	
     	    	console.log("_c1_pmr_number:" + dataArray[a].pmrNumber);
     	    }
     	    
     		
        });
    }, function(err) {
    	console.log("Error:" + err);
    });
    
    
});
