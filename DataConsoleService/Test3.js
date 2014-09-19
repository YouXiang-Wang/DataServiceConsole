var request = require("request");
var qs = require('querystring');
var fs = require('fs');
var async = require('async');
var cheerio = require('cheerio');


var fs = require('fs');
var dataArray = new Array();

fs.readFile("C:/PMRS/pmr_test.html",function(err,data){
	
	
	//console.error("data=" + data);
	
	var $ = cheerio.load(data);
	
	
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
	
});

