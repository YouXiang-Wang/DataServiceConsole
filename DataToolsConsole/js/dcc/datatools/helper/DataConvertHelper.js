define("dcc/datatools/helper/DataConvertHelper",[
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/connect",
		"dojo/_base/array",
		"dojo/store/Memory"
		
	], function(declare, lang, connect, array, Memory) {
	
		function createMemoryStoreFromArray(sourceData){
			return new Memory(
				{
					data: sourceData
				}
			)
		}
		
		function createMemoryStoreByObject(id, source){
			
			var _resultArray = new Array();
			var _index = 0;
	    	for(var _attr in source) {
	    		if ( source[_attr]!=undefined && typeof(source[_attr]) != "function") {
	    			_resultArray[_index] = source[_attr];
	    			_index ++;
	    		}
	    	}
			
			return new Memory({
					idProperty: id,
					data: _resultArray
				});
		}
		
		function createMemoryStore(id, sourceData){
			return new Memory(
				{
					data: sourceData
				}
			)
		}

		
		
		return {
			createMemoryStoreFromArray: createMemoryStoreFromArray,
			createMemoryStore: createMemoryStore,
			createMemoryStoreByObject: createMemoryStoreByObject
		}
	}
);