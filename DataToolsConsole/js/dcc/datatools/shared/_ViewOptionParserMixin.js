define('dcc/datatools/shared/_ViewOptionParserMixin', [
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	'dcc/datatools/app/AppHelper',
	'dcc/datatools/shared/cons/cons'
],function(declare, lang, arrayUtil, appHelper, cons){
	
	/**
	 * The class for each view to extends, it will define the properties for one view. 
	 * We can recreate the view use these properties.
	 * 
	 */
	var parserMixin = declare(null, {
		
		// viewTitle: [public] String
		//		The title of the view, if need, it will show as the tab label.
		viewTitle: '',
		
		// sendRequest: [public] boolean
		//		If the property is false, it means the widgets will not send request to render itself, it will
		//      only renderer according dataObjectResult passed during instance initialization.
		//		If the property is true, it means the widgets will send request to render itself.	
		sendRequest: false,
		
		constructor: function(){
			// connDef: [public] String or Object.
			//			The connection definition of the object.     
			this.connDef = null;
			this.commandOptions = null;
			this.dataObjectResult = null;
			this.model = null;
		},
		
		postCreate: function(){
			this.registerEvents();
			if(this.sendRequest){
				var url = this.getCommandRequestURL();
				this.model.sendInitRequest(url);			
			}
			if(this.sendRequest == false && this.model && this.model.initRequestReadyHandler){
				this.model.initRequestReadyHandler(this.dataObjectResult);
			}			
		},
		
		registerEvents: function(){
			if(this.model && this.model.on){
				this.model.on(cons.RESPONSE_INIT_VIEW_DATA_READY, lang.hitch(this, 'initViewDataReadyHandler'));
			}
		},
		
		// Important: Abstract method need child to implementation.
		// It will update the view according passed model wrapper properties.
		initViewDataReadyHandler: function(viewResult){
			
		},
		
		getCommandRequestURL: function(){
			var commandOptions = this.commandOptions;
			if(commandOptions != null){
				return appHelper.getCommandURL(commandOptions.commandId, commandOptions.commandArgs);
			}
		},

		refreshViewHandler: function(){
			// summary:
			//		The refresh action support for the current view, 
			//      if the view support refresh it will be invoked.
			// tags:
			//		abstract method need each child widget implementation			
		},
		
		filterViewHandler: function(){
			// summary:
			//		The filter action support for the current view, 
			//      if the view support refresh it will be invoked.
			// tags:
			//		abstract method need each child widget implementation				
		}
	})
	
	return parserMixin;
})