define([
	"dojo/_base/lang",
	"../../constants/constants"
], function(lang, constants ) {
	
	var exports = {
			
	};
	
	exports.abbrL3Group = function(group) {
		if(group !=undefined) {
    		if(group == constants.L3GROUP_ADMINISTRATION) {
        		return 'Administrator';
        	} else if (group == constants.L3GROUP_CORE) {
        		return 'Core Development';
        	} else if (group == constants.L3GROUP_DEVELOPER) {
        		return 'Developer';
        	} else {
        		return group;
        	}
    	} else {
    		return '';
    	}
	};

	
	exports.getDataIndex = function(id, value, dataArray) {
		for(var i=0; i < dataArray.length; i++) {
			if(dataArray[i][id] == value ) {
				return i;
			}
		}
		return -1;
	};
	
	
	return exports;
})