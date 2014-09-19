define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/date/locale",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		
		"dijit/layout/ContentPane",
		"dojo/text!./templates/PmrDetailView.html",
		"dcc/datatools/shared/_ViewOptionParserMixin",
		"dojo/html",
		
		"./PmrDetailModel",
		"dojo/on",
		"dojo/query",
		"dojo/_base/array",
		"dijit/Toolbar",
		"dijit/form/ComboBox",
		"dijit/form/TextBox",
		"dijit/form/CheckBox",
		"dijit/form/Select"
		
	], function(declare, lang, DateLocale, _LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, 
			ContentPane, viewTemplate, _ViewOptionParserMixin, html,
			PmrDetailModel, on, query, array) {

		return declare("ibm/datastudio/pmrs/views/PmrDetailView", [_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _ViewOptionParserMixin], {
			
			templateString: viewTemplate,
			htmlSetter : null,
			
			constructor: function(){
				
				this.inherited(arguments);
				this.addEventsListener();
				this.model = new PmrDetailModel();
			},
			
			
			postCreate: function() {
				this.inherited(arguments);
				
				//pane.set("content", this.model.dataStore);
				//pane.style.overflow='auto';
				
				//pane.set("href", 'http://localhost/DataToolsConsole/data/01981,442,000.html');
				
				html.set(this.pmrsDetailInfoContainer, this.model.dataStore, {parserContent: false});
				
					  
				//this.pmrsDetailInfoContainer.appendChild(pane.domNode);
				
			},
			
			resize: function(){
				this.inherited(arguments);
			},
			
			addEventsListener: function(){
				var _self = this;
			},

			_executeFilter: function() {
				this.cbSelectAll.set('checked', this.returnCheckedStatus());
				on.emit(this.domNode, this.EXECUTE_FILTER, {
					dataOptions: this.getQueryOption(),
					bubbles: true,
				    cancelable: true
				});
			},
			
	});
});