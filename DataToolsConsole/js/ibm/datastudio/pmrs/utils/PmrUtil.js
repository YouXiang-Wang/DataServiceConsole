define([
	"dojo/_base/lang"
], function(lang ) {
	
	var exports = {
			
	};
	
	exports.abbrL3Group = function(group) {
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

	
	
	
	return exports;
})