define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin"
	], function(declare, lang, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin) {
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		
		templateString: '<div class="loadingIndicatorContainer"><div class="loadingIndicator" title="Loading..."></div></div>',
		
		show: true,
		
		postCreate: function(){
			this.inherited(arguments);
			if(this.show == true){
				this.show();
			}
		},
		
		/**
		 * Show the loading section.
		 */
		show: function(){
			this.domNode.style.display = '';
		},
		
		/**
		 * Hide the loading section.
		 */
		hide: function(){
			this.domNode.style.display = 'none';
		}
	})
});