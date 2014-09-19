define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/array",
		'dojo/io-query',
		"dcc/datatools/common/BaseModel",
		"dcc/datatools/shared/base/request",
		"dcc/datatools/context/AppContext",
		'dcc/datatools/shared/cons/cons'
	], function(declare, lang, array, ioQuery, BaseModel, request, AppContext, cons) {
	
	return declare([BaseModel], {
		
		constructor: function(){
			
		},
		
		loadCommandLinks: function(){
			var commandUrl = AppContext.contextPath + '/resources/command/COMMAND_LINK?action=load';
			var request = new request();
			request.sendRequest(commandUrl, {
				successHandler: lang.hitch(this, "loadCommandLinksReadyHandler"),
				toasterMessage: ['load command links definition ready.'],
				noRedirect: true
			});				
		},
		
		loadCommandLinksReadyHandler: function(result){
			this.emit(cons.RESPONSE_LOAD_COMMAND_LINKS_READY, result.result);
		},
		
		saveCommandLink: function(commandLinkDef){
			var commandUrl = AppContext.contextPath + '/resources/command/COMMAND_LINK?action=save&';
			var queryStmt = ioQuery.objectToQuery(commandLinkDef);
			var request = new request();
			var url = commandUrl + queryStmt;
			request.sendRequest(url, {
				successHandler: lang.hitch(this, "saveCommandLinkReadyHandler"),
				toasterMessage: ['Save command link definition ' + commandLinkDef.linkText],
				noRedirect: true
			});				
		},
		
		saveCommandLinkReadyHandler: function(result){
			this.emit(cons.RESPONSE_SAVE_COMMAND_LINK_READY, result.result);
		}
	});
});