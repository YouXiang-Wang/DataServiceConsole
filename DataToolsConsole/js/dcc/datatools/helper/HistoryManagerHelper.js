define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/connect",
		"dojo/_base/array"
	], function(declare, lang, connect, array) {
	
		var opertionType = {
			PREVIEW_ASSET_INFO: 'PREVIEW_ASSET_INFO',
			VIEW_ASSET_RELATION_SHIP: 'VIEW_ASSET_RELATION_SHIP',
			VIEW_ASSET_BASIC_INFO: 'VIEW_ASSET_BASIC_INFO',
			SEARCH_RESULT: 'SEARCH_RESULT',
			APPLY_FILTER: 'APPLY_FILTER'
		}
		
		var actions = {
			ADD_TO_OPERATION_HISTORY: 'addToOperationHistory'	
		}
		
		function opertionItem(type, name, data){
			var desInfo = name;
			switch(type){
			case opertionType.PREVIEW_ASSET_INFO:
				desInfo = 'Preview asset inforamtion of ' + name;
				break;
			case opertionType.VIEW_ASSET_RELATION_SHIP:
				desInfo = 'View asset relationship of ' + name;
				break;
			case opertionType.VIEW_ASSET_BASIC_INFO:
				desInfo = 'View asset basic inforamtion of ' + name;
				break;
			case opertionType.SEARCH_RESULT:
				desInfo = 'Search using: ' + name;
				break;	
			case opertionType.APPLY_FILTER:
				desInfo = 'Apply Filter to asset ' + name;
				break;				
			}

			return {
				type: type,
				name: desInfo,
				data: data
			}
		}

		/**
		 * Utility for handle the history events.
		 */
		function addToActionsHistory(actionItem){
			if(arguments.length > 1){
				var item = opertionItem.apply(this, arguments);
				actionItem = item;
			}
			connect.publish(actions.ADD_TO_OPERATION_HISTORY, [actionItem]);
		}		
		
		return {
			OP_TYPES: opertionType,
			ACTIONS: actions,
			createHistoryItem: opertionItem,
			addToActionsHistory: addToActionsHistory
		}
	}
);