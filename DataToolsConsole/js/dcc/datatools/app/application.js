define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/on",
	"dijit/layout/_LayoutWidget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./templates/application.html",
	
	'dojo/_base/array',
	"dcc/datatools/helper/ViewFactoryHelper",
	'dcc/datatools/shared/_ViewOptionParserMixin',
	'dcc/datatools/shared/cons/cons',
	"./AppModel",
	"./AppHelper",
	
	"idx/app/Header",
	"dijit/layout/BorderContainer",
	"dijit/layout/TabContainer",
	"dijit/layout/ContentPane",
	
	"idx/widget/Menu",
    "dijit/MenuBar",
    "idx/widget/MenuDialog",
    "idx/widget/MenuHeading",
    "dijit/MenuBarItem",
    "dijit/PopupMenuBarItem",
    "dijit/MenuItem",
    "dcc/datatools/app/module/ModuleItem"
	
], function(declare, lang, on, _LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, viewTemplate, 
		array, ViewFactoryHelper, _ViewOptionParserMixin, cons, AppModel, AppHelper,
		Header, BorderContainer, TabContainer, ContentPane, 
		Menu, MenuBar,MenuDialog, MenuHeading, MenuBarItem, PopupMenuBarItem, MenuItem, ModuleItem
		){
	
	return declare("dcc/datatools/app/application", [_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin], {
		
		templateString: viewTemplate,
		
		model: null,
		
		constructor: function(){
			
		},
		
		postCreate: function(){
			
			//this.subscribe(cons.EVENT_SHOW_COMMAND_HISTORY, lang.hitch(this,'showCommandHistoryView'));
			this.model = new AppModel();
			this.addEventListenerForModel();
			//this.initCommandSection();
			this.initTaskManager();
		    this.mainViewTabContainer.addChild(new ContentPane({title: "Welcome", content: "<b>Welcome to the Data Console Platform.</b>", closable: false}));
		    
		    
		},
		
		getCurrentViewCommandOptions: function(){
			/*
			var children = this.mainViewContainer.getChildren();
			var commandOptions = []
			array.forEach(children, function(tab){
				if(tab.isInstanceOf(_ViewOptionParserMixin)){
					commandOptions.push(tab.commandOptions);
				}
			})
			return commandOptions;
			*/
		},
		
		addEventListenerForModel: function(){
			
			var _self = this;
			this.model.on(AppHelper.RESOPNSE_RESULT_READY, lang.hitch(this, AppHelper.RESOPNSE_RESULT_READY));
			this.model.on(AppHelper.RESOPNSE_WORKSPACE_LOADED, lang.hitch(this, "initTabByWorkspaceSetting"));
			//this.subscribe(AppHelper.COMMAND_GET_WORKSPACE, function(deferred){
				//deferred.resolve(_self.getCurrentViewCommandOptions());
			//})
			
		},
		
		workspaceLoadReadyHandler: function(workspace){
			console.log(workspace);
		},
		
		initCommandSection: function(){
			this.commandSection.renderView();
		},
		
		initTaskManager: function() {
			
			var navigationMenu = new MenuBar;
		    
		    var taskItemMenu = new Menu({baseClass:"menu-workitem"});
		    taskItemMenu.addChild(new MenuItem({label:"<span class='idxMenuCategoryItem'>Data Console</span>", column: 0,  iconClass:"mi-workitem-icon-welcome"}));
		    
		    taskItemMenu.addChild(new MenuHeading({label:"<span class='idxMenuCategory'>Query</span>", column: 0}));
		    taskItemMenu.addChild(new MenuItem({label:"<span class='idxMenuCategoryItem'>Public Query</span>", column: 0,  iconClass:"mi-workitem-icon-query-folder"}));
		    
		  
		    taskItemMenu.addChild(new MenuHeading({label:"<span class='idxMenuCategory'>PMRs</span>", column: 0}));
		    
		    var itemListPmr = new MenuItem({label:"<span class='idxMenuCategoryItem'>List PMRs</span>", column: 0,  id:"pmrManagement", iconClass:"mi-workitem-icon-task"});
		    //  "LIST_PMRS"
		    
		    var modleListPmr = new ModuleItem( {
		    			moduleID: "LIST_PMRS",
		    			displayTitle: "PMRs",
		    			//contextPath: 'http://9.123.149.188:3200',
		    			contextPath: 'http://localhost:3200',
		    			args: {
		    				type: 1,
		    				group: 7
		    			},
		    			moduleRenderView: "ibm/datastudio/pmrs/views/PmrObjectView",
		    			restServiceUrl: "/resource/pmr/listpmrs",
		    			isCrossDomain: "N"
		    		}
		    );
		    this.model.registerModule(modleListPmr);
		    this.model.registerWorkspaceModule(modleListPmr);
		    
		    on(itemListPmr, "click", lang.hitch(this.model, "moduleHandler", "LIST_PMRS"));
		    
		    
		    taskItemMenu.addChild(itemListPmr);
		    taskItemMenu.addChild(new MenuItem({label:"<span class='idxMenuCategoryItem'>Business</span>", column: 0,  id:"menuCopBusiness", iconClass:"mi-workitem-icon-task"}));
		    
		    
		    navigationMenu.addChild(new PopupMenuBarItem({label: "Task Manager", popup: taskItemMenu, currentPage: false}));
		    
		    var navigationMenu_03 = new Menu({baseClass:"oneuiMessageMenu"});
		    navigationMenu_03.addChild(new MenuItem({label:"With an warning icon", baseClass:"messageTitles", iconClass:"oneuiWarningMenuItemIcon"}));
		    navigationMenu_03.addChild(new MenuItem({label:"With an information icon", baseClass:"messageTitles", iconClass:"oneuiInformationMenuItemIcon"}));
		    navigationMenu_03.addChild(new MenuItem({label:"With an error icon", baseClass:"messageTitles", iconClass:"oneuiErrorMenuItemIcon"}));
		    var messageDialog = new MenuDialog;
		    messageDialog.set({content:navigationMenu_03});
		    
		    var actionsMenu = new Menu;
		    actionsMenu.addChild(new MenuItem({label: "Edit"}));
		    
		    var settingsMenu = new Menu;
		    settingsMenu.addChild(new MenuItem({label: "Settings"}));
		    settingsMenu.addChild(new MenuItem({label: "Settings"}));
		    var helpMenu = new Menu;
		    helpMenu.addChild(new MenuItem({label: "Help Center"}));
		    helpMenu.addChild(new MenuItem({label: "About"}));
		    
		    
		    var header = new Header({primaryTitle: "Data Console", 
		    	navigation: navigationMenu, 
		    	user: {displayName: "Welcome", actions: actionsMenu}, 
		    	settings: settingsMenu, 
		    	help: helpMenu,
		    	}, 
		    	this.headerContainer);
		},
		
		initTabByWorkspaceSetting: function(view){
			this.addToMainViewContainer(view);
		},
		
		responseResultReady: function(resultDef){
			this.renderViewInCanvas(resultDef.view, resultDef.commandPropties);
		},
		
		//FIXME if the view is already showing, 
		// it should only refresh the view and change it to active.
		renderViewInCanvas: function(view, resOptions){
			this.addToMainViewContainer(view, resOptions);
		},
		
		addToMainViewContainer: function(view, resOptions){
			this.mainViewTabContainer.addChild(view);
			this.mainViewTabContainer.selectChild(view);
		},
		
		showCommandHistoryView: function(){
			//this.propertyViewContainer.selectChild(this.commandHistoryTab);
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