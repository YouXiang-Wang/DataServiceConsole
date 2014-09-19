define([
	"dojo/_base/declare",
	"dojo/_base/lang",    
	"dojo/request",
	"dojo/request/script",
	"dojo/_base/connect",
	"dcc/datatools/context/AppContext",
	"dcc/datatools/shared/cons/cons"
	
], function(declare, lang, request, request_script, connect, AppContext, cons){
	
	var optionsConfig = {
		handleAs: "json"
	};
	
	return declare(null, {
		
		/**
		 * @options 
		 *  map object, options for request.
		 *  successHandler will be callback function for success handler.
		 *  errorHandler will be callback function for error handler.
		 *  toasterMessage: Array object. follow the definition for to dojox.widget.Toaster. 
		 *  Follow the spec such as  {"message":"This is another message!","type":"warning","duration":500}
		 */
		sendRequest: function(url, options){
			var successHandler = this._getHandlerFunction(options.successHandler, this.successHandler);
			var errorHandler = this._getHandlerFunction(options.errorHandler, this.errorHandler);
			var newURL = this.urlWrapper(url, options);
			if(options.handleAs == null){
				options.handleAs = 'json';
			}
			this._showToasterMessage(options);
			var reqPromise;
			if(options.isCrossDomain!=undefined && options.isCrossDomain!=null) {
				if(options.isCrossDomain=="Y") {
					//reqPromise = request_script(newURL, options).then(function(result){
					reqPromise = request_script(newURL, {
						jsonp: "callback"
					}).then(function(result){
						successHandler.apply(this, [result]);
					}, function(error){
						errorHandler.apply(this, [error]);
					});
					return reqPromise;
				}
			}
			
			reqPromise = request("data/data.json", options).then(function(result){
				successHandler.apply(this, [result]);
			}, function(error){
				errorHandler.apply(this, [error]);
			});	
			return reqPromise;			
		},
		
		_showToasterMessage: function(options){
			if(options == null){
				return;
			}
			var message = options.toasterMessage;
			if(message){
				var tMessage;
				if(lang.isArray(message)){
					tMessage = message;
				}else{
					tMessage = [message];
				}
				connect.publish(cons.REQUEST_TOASTER_MESSAGE_TOPIC, tMessage);
			}			
		},
		
		_getHandlerFunction: function(handler, defaultHandler){
			if(handler == null){
				return defaultHandler;
			}else{
				if(typeof handler == "function"){
					return lang.hitch(this, handler);
				}else{
					return defaultHandler;
				}
			}
		},

		successHandler: function(result){
			console.dir(result);
		},
		
		errorHandler: function(fault){
			console.dir(fault);
		},
		
		urlWrapper: function(url, options){
			if(options.noRedirect == true){
				return url;
			}
			var newURL;
			if(AppContext.mockupRequest == true){
				if(options.mockupUrl){
					newURL = options.mockupUrl;
				}
			}else{
				newURL = url;
			}
			return newURL;
		}
	})
	
});