
var fs = require('fs');

fs.readFile('D:/EOS/listtable.txt','utf-8',
		function(err,data){ 
	if(err){ console.error(err); }
	else{ 
		
		
		console.log(data);
		
		var resultResponse = {};
		resultResponse = {
				type: 'SUCCESS',
				result: data							
		};
		
		var data1 = JSON.stringify(resultResponse);
		
        fs.writeFile("D:/EOS/listtable1.txt",data1 , function(error){
            if(error){
                console.log(error);
            }
        });
		
		
	}});
