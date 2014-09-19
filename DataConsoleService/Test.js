var request = require("request");
var qs = require('querystring');
var fs = require('fs');

var url = 'https://w3-01.sso.ibm.com/pkmslogin.form';
//var url1 = 'https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3PmrRecord1.do?&pmrno=27386&bno=999&cno=760&createDate=O14/06/26&method=retrieveCRMWithDate';
//var url1 = 'https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3PmrRecord1.do?&pmrno=50629&bno=075&cno=724&createDate=O14/02/21&method=retrieveCRMWithDate';

//var url1 = 'https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3PmrRecord1.do?&pmrno=25150&bno=999&cno=760&createDate=O14/06/12&method=retrieveCRMWithDate';

//var url1 = 'https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3GroupPmrStatus.do?l3group=Optim%20Development%20Studio%20/%20%20Data%20Studio%20%28Developer%29&reportStartDate=2014-01-01&reportEndDate=2014-08-21';

var url1 = 'https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3AnalystProfile.do?&cnum=6A4698897&startDate=2014-01-01&endDate=2014-08-21';


	
var post_data = qs.stringify({
	'username' : 'wangyoux@cn.ibm.com',
	'password' : 'Taiji1005',
	'login-form-type': 'pwd'
});

var j = request.jar();
//request.post('http://service.com/upload', {form:{key:'value'}})
//request.post({url: url, qs: {'username': "wangyoux@cn.ibm.com", 'password': "Taiji1005", 'login-form-type': 'pwd'}}, function(err, res, body) {
request.post({url: url, jar: j, form: {'username': "wangyoux@cn.ibm.com", 'password': "Taiji1005", 'login-form-type': 'pwd'}}, function(err, res, body) {
    if(err) {
        return console.error(err);
    }

    var cookie_string = j.getCookieString(url);
    //console.log("Response body:", body);
    console.log("cookie_string:", cookie_string);
    
    
    request.get({url : url1, jar : j}, function(err, res, body) {
        if(err) {
            return console.error(err);
        }

        //console.log("Got a response!", res);
        //console.log("Response body:", body);
        
        //pmrno=50629&bno=075&cno=724
        var _params = qs.parse(url1);
        var _pmrno = _params.pmrno;
        var _bno = _params.bno;
        var _cno = _params.cno;
        
        
        var fileName  = "c:/PMRS/test3.html";
        
        
        //var fileName  = _pmrno + ',' + _bno + ',' +  _cno;
        //fileName = 'c:/PMRS/' + fileName + '.html';
        
 		fs.writeFile(fileName, body.toString(), function(error){
			if(error){
				console.log(error);
			}
		});
		
    });
    
    
});
