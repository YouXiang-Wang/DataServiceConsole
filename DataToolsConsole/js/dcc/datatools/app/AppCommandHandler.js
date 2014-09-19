define('dcc/datatools/app/AppCommandHandler', [
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	'dojo/Deferred',
	'dcc/datatools/context/AppContext'
], function(declare, lang, array, Deferred, AppContext){
	
	var commandViewerMapping = {
			LIST_PMR: 'dcc/datatools/pmrs/views/PmrObjectView',
			LIST_TABLE: 'ibm/ds/workspace/DatabaseObjectView',
			DESCRIBE: 'ibm/ds/view/table/ColumnView',
			EXEC_SQL: 'ibm/ds/workspace/DataPreviewView',
			SHOW_SQL_EDITOR: 'ibm/ds/editor/SQLEditor'
	}
	
	var commandsFactory = {
		executeLIST_TABLE: createDeferredObject,
		executeDESCRIBE: createDeferredObject,
		executeEXEC_SQL: function(viewClassName, data){
			return createDeferredObject(viewClassName, data, function(data){
				return {
					previewItem: {
						itemTitle: lang.trim(data.commandText)
					}
				}
			})			
		},
		executeSHOW_SQL_EDITOR: createDeferredObject
	}
	
	function createDeferredObject(viewLoc, data, propertiesCallback){
		var deferred = new Deferred();
		var commandText = lang.trim(data.commandText);
		var commandId = data.commandDef.moduleID;
		var commandArgs = data.args;
		var props = {};
		if(lang.isFunction(propertiesCallback)){
			props = propertiesCallback(data);
		}
		var widgetProps = lang.mixin(
			{
				title: commandText,
				dataObjectResult: data.result,
				closable: true,
				commandOptions: {
					commandId: commandId,
					commandArgs: commandArgs,
					commandText: commandText
				}
			},
			props
		)
		require([viewLoc], function(viewClass){
			var view = new viewClass(widgetProps)
			deferred.resolve({
				view: view,
				commandPropties: data
			});
		})
		return deferred;		
	}
	
	function renderView(commandId, result){
		var commandDef = result.commandDef;
		var viewClassName = commandDef.moduleRenderView;
		return createDeferredObject(viewClassName, result);
	}
	
	function renderAutoRefreshView(viewConfig){
		var commandId = viewConfig.commandId;
		var deferred = new Deferred();
		var widgetProps = {
				title: viewConfig.commandText,
				commandOptions: viewConfig,
				sendRequest: true,
				closable: true
		}
		var viewClassName = commandViewerMapping[commandId];
		require([viewClassName], function(viewClass){
			deferred.resolve(new viewClass(widgetProps));
		})	
		return deferred;
	}
	
	return {
		renderView: renderView,
		renderAutoRefreshView: renderAutoRefreshView
	}
})