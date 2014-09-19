define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/connect",
		"dojo/_base/array",
		"dojo/dom-construct",
		
		"dcc/datatools/common/BaseModel",
		"dcc/datatools/context/AppContext",
		"dcc/datatools/helper/DataConvertHelper"
		
	], function(declare, lang, connect, array, domConstruct, 
			BaseModel, AppContext,dataConvertHelper ) {
	
	
	return declare("ibm/datastudio/pmrs/views/PmrDetailMode", [BaseModel], {
		
		
		constructor: function(){
			this.dataStore = null;
		},

		dataWrapperForViewer: function(response){
			var result = response.result; //.result;
			this.dataStore = result;
			return result;
		}
		
	});
});