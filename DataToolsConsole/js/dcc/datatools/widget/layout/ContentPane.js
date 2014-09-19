define("dcc/datatools/widget/layout/ContentPane", [
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dijit/layout/_LayoutWidget",
		"./LoadPane"
		], function(declare, lang, _LayoutWidget, LoadPane){
		return declare([_LayoutWidget], {
			editorId: '',
			
			dataObjectId: '',
			
			constructor: function(){
			},
			
			postCreate: function(){
				this.inherited(arguments);
			},
			
			onLoad: function(){
				this.inherited(arguments);
				console.log('onLoad contentpane id is: ' + this.id + ' isLoaded ' + this.isLoaded);
			},
			
			onShow: function(){
				this.inherited(arguments);
				console.log('onShow contentpane id is: ' + this.id + ' isLoaded ' + this.isLoaded);
			},
			
			onHide: function(){
				this.inherited(arguments);
				console.log('onHide contentpane id is: ' + this.id + ' isLoaded ' + this.isLoaded);
			}
		})
});