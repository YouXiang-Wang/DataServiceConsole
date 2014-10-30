define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	'dojo/Deferred',
	'dojo/io-query',
	'dcc/datatools/shared/base/request',
	'dcc/datatools/context/AppContext',
	'dcc/datatools/app/AppHelper',
	'dcc/datatools/shared/cons/cons',
], function(declare, lang, array, Deferred, ioQuery, Request, AppContext, AppHelper, cons){
	
	return declare("dcc/datatools/command/CommandHandler", [], {
		
		args: null,
		
		context: null,
		
		commandText: '',
		
		commandDef: null,
		
		toasterMessage: '',
		
		readyCallback: null,
		
		errorCallback: null,
		
		successMessage: null,
		
		constructor: function(options){
			this.defer = new Deferred();
			this.readyCallback = null;
			this.errorCallback = null;
			lang.mixin(this,options);
		},
		
		sendRequest: function(){
			var _self = this;
			var request = new Request();
			var url = this._createURL();
			var _isCrossDomain = this.commandDef.isCrossDomain;
			request.sendRequest(url, {
				noRedirect: true,
				successHandler: lang.hitch(_self, "successHandler"),
				errorHandler: lang.hitch(_self, "errorHandler"),
				isCrossDomain: _isCrossDomain,
				toasterMessage: [this.toasterMessage]
			});			
		},
		
		successHandler: function(result){
			var readyFun = this.readyCallback;
			var responseSuccess = result.type != cons.RESPONSE_ERROR;
			if(lang.isFunction(readyFun)){
				var readyResult = readyFun(result);
				this.defer.resolve(readyResult);				
			}else{
				if(responseSuccess){
					var message = this.successMessage || 'Command execution successfully.'
					this.defer.resolve(message);	
				}else{
					this.defer.resolve('Command execution fail for: ' + result.message);	
				}
			}
			
			if(responseSuccess){
				AppHelper.publishCommand(AppHelper.COMMAND_HANDLER, {
					commandDef: this.commandDef,
					commandText: this.commandText,
					args: this.args,
					context: this.context,
					result: result
				})				
			}
		},
		
		errorHandler: function(error){
			var errorFun = this.errorCallback;		
			if(lang.isFunction(errorFun)){
				var errorFun = errorFun(error);
				this.defer.resolve(errorFun);				
			}else{
				this.defer.resolve('Command execution fail for .' + error.message);	
			}			
		},
		
		_createURL: function(){
			var queryStr = ioQuery.objectToQuery(this.args);
			return this.commandDef.contextPath + this.commandDef.restServiceUrl + '?' + queryStr;
		},
		
		execute: function(){
			this.sendRequest();
		}
	});	
})