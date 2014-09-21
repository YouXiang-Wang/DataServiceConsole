define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/connect",
		"dojo/_base/array",
		"dojo/dom-construct",
		
		"dcc/datatools/common/BaseModel",
		"dcc/datatools/context/AppContext",
		"dcc/datatools/helper/DataConvertHelper",
		"./PmrObjectCons"
		
	], function(declare, lang, connect, array, domConstruct, 
			BaseModel, AppContext,dataConvertHelper, PmrObjectCons ) {
	
	
	return declare([BaseModel], {

		constructor: function(){
			this.dataGridStore = null;
		},	

		dataWrapperForViewer: function(response) {
			var result = {
					identifier: "pmrNumber",
					items: response.result
			}
			
			var memoryStore = dataConvertHelper.createMemoryStoreFromArray(result);
			this.dataGridStore = memoryStore;
			return memoryStore;
		},
		
		getFilterStore: function(options){
			return dataConvertHelper.createMemoryStoreFromArray(options);
		}
	});
});