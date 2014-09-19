define([
		"dojo/_base/declare",
		"dojo/_base/lang"
	], function(declare, lang){
	return {
		checkboxFormatter: function(data){
			var checked = true;
			if(data == null || data == '' || data == 0){
				checked = false;
			}
			return checked;
		},
		
		formatterPrimaryKey: function(data){
			var checked = true;
			if(data == null || data == '' || data == 0){
				checked = false;
			}
			return checked;			
		},
		
		formatterNotNull: function(data){
			var checked = true;
			if(data == 'N'){
				checked = false;
			}
			return checked;				
		},
		
		formatterGenerated: function(data){
			var checked = false;
			if(data == 'Y'){
				checked = true;
			}
			return checked;				
		}	
	}			
});