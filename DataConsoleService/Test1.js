var request = require("request");
var qs = require('querystring');
var fs = require('fs');
var async = require('async');

var url = 'https://w3-01.sso.ibm.com/pkmslogin.form';
var url1 = 'https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3AnalystProfile.do?&cnum=6A4698897&startDate=2014-01-01&endDate=2014-08-21';

var pmrArray = [
           {pmrNumber:"93768,110,846", pmrUrl:"https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3PmrRecord1.do?&pmrno=93768&bno=110&cno=846&createDate=O14/02/06&method=retrieveCRMWithDate"},
           {pmrNumber:"81014,082,000", pmrUrl:"https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3PmrRecord1.do?&pmrno=81014&bno=082&cno=000&createDate=O14/07/14&method=retrieveCRMWithDate"},
           {pmrNumber:"18924,019,866", pmrUrl:"https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3PmrRecord1.do?&pmrno=18924&bno=019&cno=866&createDate=O14/08/13&method=retrieveCRMWithDate"},
           {pmrNumber:"25915,211,788", pmrUrl:"https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3PmrRecord1.do?&pmrno=25915&bno=211&cno=788&createDate=O14/04/03&method=retrieveCRMWithDate"}
           
           ];

var pmrAnalysts = [
                {analystNumber:"917317672", profileUrl:"/software/servdb/crm/secure/l3AnalystProfile.do?&cnum=6A4698897"},
                {analystNumber:"6A4698897"}
                ];



var j = request.jar();

var post_data = qs.stringify({
	'username' : 'wangyoux@cn.ibm.com',
	'password' : 'Taiji1005',
	'login-form-type': 'pwd'
});

var form_data = qs.stringify({
	'username' : 'wangyoux@cn.ibm.com',
	'password' : 'Taiji1005',
	'login-form-type': 'pwd'
});


request.post({url: url, jar: j, form: form_data}, function(err, res, body) {
    if(err) {
        return console.error(err);
    }
    
    var cookie_string = j.getCookieString(url);
    console.log("cookie_string:", cookie_string);
    
    async.each(pmrArray, function(item, callback) {
    	
    	console.log('PMR Number is: ' + item.pmrNumber);
        request.get({url : item.pmrUrl, jar : j}, function(err, res, body) {
            /*
        	if(err) {
                return console.error("error" + err);
            }
            
            var fileName  = "c:/PMRS/" + item.pmrNumber + ".html";
            
     		fs.writeFile(fileName, body.toString(), function(error){
    			if(error){
    				console.log(error);
    			}
    		});
    		*/
     		callback();
        });
        
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++");
        
    }, function(err) {
    	if(err) {
    		console.error(err);
    	}
    });
    
    /*
    request.get({url : url1, jar : j}, function(err, res, body) {
        if(err) {
            return console.error(err);
        }
        
        var fileName  = "c:/PMRS/test5.html";
        
 		fs.writeFile(fileName, body.toString(), function(error){
			if(error){
				console.log(error);
			}
		});
		
    });
    */
    
});
