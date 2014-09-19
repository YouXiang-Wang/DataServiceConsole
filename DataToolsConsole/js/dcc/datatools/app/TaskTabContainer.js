require([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dijit/layout/_LayoutWidget",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		"dojo/text!./templates/TaskContentPane.html",
		"dojo/_base/Deferred",
		"dojo/DeferredList",
        "dijit/MenuItem",
        "dijit/layout/TabContainer",
        "dijit/layout/ContentPane",
        "dcc/datatools/app/task/TaskContentPane",
        "law/contractmanage/ContractManageTab"
        ], function(declare, lang, _LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, viewTemplate,
        		Deferred, DeferredList, MenuItem, TabContainer, ContentPane, TaskContentPane, ContractManageTab){
		
		return declare("dcc/datatools/app/task/TaskTabContainer", [_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin], {
			templateString: viewTemplate,
			
			constructor: function(){
				
			},
			
			postCreate: function(){
				this.subscribe(Cons.EVENT_SHOW_COMMAND_HISTORY, lang.hitch(this,'showCommandHistoryView'));
				this.model = new appModel();
				this.addEventListenerForModel();
				this.initCommandSection();
			},
			
			startup: function(){
				this.inherited(arguments);
				if(this.appContainer){
					this.appContainer.startup();
				}
			},
			
			resize: function(){
				this.inherited(arguments);
				if(this.appContainer){
					this.appContainer.resize();
				}
			}
			
			
		});
    })