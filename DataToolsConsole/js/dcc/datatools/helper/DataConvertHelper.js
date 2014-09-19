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

		return {
			createMemoryStoreFromArray: createMemoryStoreFromArray
		}
	}
);