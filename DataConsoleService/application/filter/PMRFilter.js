var qs = require("querystring");
var config = require("../../config").config;
var utils = require("../../utils/utils");

function PMRFilter() {
	var _self = this;

	this.returnQueryCondition = function(req) {
		var _conditions = new Array();
		
		var requestedPmr = req.query.pmrnumber;
		if(!utils.isEmptyValue(requestedPmr)) {
			_conditions.push({pmrNumber: requestedPmr});
		} else {
			// status
			var type = req.query.type;
			var _types = new Array();
			
			if(type!=undefined && type!=null && type!='') {
				if( (type & 1 ) == 1 ) {
					_types.push({pmrStatus: "O"});
				}
				
				if( (type & 2 ) == 2 ) {
					_types.push({pmrStatus: "C"});
				}
			} else {
				_types.push({pmrStatus: "O"});
				_types.push({pmrStatus: "C"});
			}
			
			_conditions.push({$or:_types});
			
			// groups 
			var group = req.query.group;
			var _groups = new Array();
			
			if(group!=undefined && group!=null && group!='') {
				if( (group & 1 ) == 1 ) {
					_groups.push({l3Group: "Data Studio Administrator"});
				}
				
				if( (group & 2 ) == 2 ) {
					_groups.push({l3Group: "Optim Data Studio Core Development"});
				}
				if( (group & 4 ) == 4 ) {
					_groups.push({l3Group: "Optim Development Studio /  Data Studio (Developer)"});
				}
				
				if( (group & 8 ) == 8 ) {
					_groups.push({l3Group: "Data Studio Query Tuner / Common VE"});
				}
				
				_conditions.push({$or:_groups});
			}
			
		}
		
		var conditions = {
				$and:_conditions
		};
		
		return conditions;
	}
}

module.exports = new PMRFilter();