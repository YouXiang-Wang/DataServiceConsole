define('dcc/datatools/app/AppHelper',[
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/connect",
	'dojo/io-query',
	'dojo/Deferred',
	'dcc/datatools/context/AppContext',
	'dcc/datatools/shared/base/request'
], function(declare, lang, connect, ioQuery, Deferred, AppContext, request){
	
	var helper = {
			
		COMMAND_HANDLER: 'commandHandler',
		
		COMMAND_GET_WORKSPACE: 'getWorkspaceSetting',

		RESOPNSE_WORKSPACE_LOADED: 'workspaceLoadReady',
		
		RESOPNSE_WORKSPACE_SAVE: 'workspaceSaveReady',
		
		RESOPNSE_RESULT_READY: 'responseResultReady',
			
		SELECT_TAB_VIEW: 'selectTabView',
		
		CLOSE_TAB_VIEW: 'closeTabView'
	}
	
	function publishEvent(eventId, eventArgs){
		var args = eventArgs;
		if(lang.isArray(eventArgs) == false){
			args = [eventArgs]
		}
		connect.publish(eventId, args);
	}
	
	/**
	 * 
	 * @param eventId stirng, the event name.
	 * @param callback Function, the callback function for the event
	 */
	function subscribeEvent(eventId, callback){
		connect.subscribe(eventId, callback);
	}
	
	function generalCommandHandler(commandId, callback){
		connect.subscribe(commandId, callback);
	}
	
	function publishCommand(commandId, commandDetail){
		connect.publish(commandId, [commandDetail])
	}
	
	/*
	function generalCommandHandler(callback){
		//connect.subscribe(helper.COMMAND_HANDLER, callback);
	}
	
	function publishCommand(commandDetail){
		connect.publish(helper.COMMAND_HANDLER, [commandDetail])
	}
	*/
	function getCurrentWorkspaceSetting(deferred){
		if(deferred instanceof Deferred){
			connect.publish(helper.COMMAND_GET_WORKSPACE, [deferred])
		}
	}
	
	function loadWorkspace(workspaceName, deferred){
		var request = new request();
		var url = AppContext.contextPath + '/resources/command/WORKSPACE_LOAD?workspaceName=' + workspaceName;
		request.sendRequest(url, {
			noRedirect: true,
			successHandler: function(result){
				deferred.resolve(result);
			},
			toasterMessage: ['Load workspace ' + workspaceName]
		});			
	}
	
	function getCommandURL(commandUrl, reqArgs){
		var queryStr = ioQuery.objectToQuery(reqArgs);
		return AppContext.contextPath + commandUrl + '?' + queryStr;
	}	
	
	var helperFun = {
		publishEvent: publishEvent,
		subscribeEvent: subscribeEvent,
		generalCommandHandler: generalCommandHandler,
		publishCommand: publishCommand,
		getCommandURL: getCommandURL,
		getCurrentWorkspaceSetting: getCurrentWorkspaceSetting,
		loadWorkspace: loadWorkspace
	}
	
	return lang.mixin(helper, helperFun);
});