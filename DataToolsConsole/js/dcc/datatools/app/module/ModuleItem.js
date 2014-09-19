define( "dcc/datatools/app/module/ModuleItem", [
		"dojo/_base/declare",
		"dojo/_base/lang",
		'dojo/_base/array'
		], function(declare, lang, array) {
	
		var ModuleItem = declare(null,  {
			
			moduleID: "",
			
			contextPath: '',
			
			args: null,
			
			moduleRenderView: "",
			
			restServiceUrl: "",
			
			displayTitle: "",
			
			isCrossDomain: "N", 
			
			constructor: function(){
				if(arguments.length > 0) {
					var _info = arguments[0];
					this.moduleID = _info.moduleID;
					this.displayTitle = _info.displayTitle;
					this.contextPath = _info.contextPath
					this.moduleRenderView = _info.moduleRenderView;
					this.args = _info.args;
					this.restServiceUrl = _info.restServiceUrl;
					this.isCrossDomain = _info.isCrossDomain;
				}
			},
			
			postCreate: function(){
				
			}
			
		})
		
		return ModuleItem;
});