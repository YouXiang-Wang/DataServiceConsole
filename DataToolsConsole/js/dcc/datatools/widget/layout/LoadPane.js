define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dijit/_WidgetBase",
		"dojo/_base/Deferred"
		], function(declare, lang, Widget, Deferred){
		return declare("dcc/datatools/widget/./layout/LoadPane", [Widget], {
			
			/**
			 * The class string should use the same formatter like the dojo/_base/lang.
			 */
			innerContentClass: '',
			
			contentArgs: {},
			
			constructor: function(){
				lang.mixin(this.contentArgs, arguments[0]);
			},
			
			postMixInProperties: function(){
				
			},
			
			postCreate: function(){				
				this._contentDeferred = new Deferred();
				var _self = this;
	    		require([this.innerContentClass], lang.hitch(this, function(paneContent){
	    			var contentWidget = new paneContent(_self.contentArgs);
	    			if(contentWidget.startup != null){
	    				contentWidget.startup();
	    			} 
	    			_self.domNode.appendChild(contentWidget.domNode);
	    			this._contentDeferred.resolve(contentWidget);
	    		}));				
			}
		})
});