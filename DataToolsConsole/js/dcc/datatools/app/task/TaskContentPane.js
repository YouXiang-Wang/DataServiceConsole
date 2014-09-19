define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dijit/layout/_LayoutWidget",
		"dijit/_Templated",
		"dojo/text!./templates/TaskContentPane.html",
		"dojo/_base/Deferred",
		"dojo/DeferredList",
		"dijit/layout/BorderContainer",
		"dijit/layout/ContentPane",
		"dijit/Toolbar",
		"dijit/form/Button",
		"dijit/form/DropDownButton",
		"dijit/Menu",
		"dijit/MenuItem",
		"dijit/form/ComboButton",
		"dojo/data/ItemFileReadStore",
		"dijit/tree/ForestStoreModel",
		"dijit/Tree",
		"dojo/dom-geometry",
		"dojo/window"
	], function(declare, lang,  _LayoutWidget, _Templated, templateString, Deferred, DeferredList, BorderContainer, ContentPane, Toolbar,
			Button, DropDownButton, Menu, MenuItem, ComboButton, 
			ItemFileReadStore, ForestStoreModel, Tree,
			domGeometry, dWindow) {
		
		return declare("dcc/datatools/app/task/TaskContentPane", [ContentPane, _Templated], {
			
			externalLink: null,
			
			templateString: templateString,
			
			widgetsInTemplate: true,
			
			widgetsLists: [],
			
			_minWindowWidth: 1024,
			
			showInnerTitle: true,
			
			tree: undefined,
			
			treeStore: undefined,
			
			treeModel: undefined,
			
			constructor: function(){
				
			},
			
			postCreate: function(){
				this.createToolBar();
				treeStore = new ItemFileReadStore({url:'data/CopBusiness.json'});
				treeModel = new ForestStoreModel({
					store: treeStore,
					query: {type:'category'},
					//rootId: "continentRoot",
					//rootLabel: "Continents",
					childrenAttrs: ["children"]
				});
				
				tree = new Tree({
					id: "copBusinessTree",
					model: treeModel,
					showRoot: false,
					persist: false //,		// persist==true is too hard to test
					//dndController: "dijit.tree.dndSource"
				});
				
				this.treeContainer.containerNode.appendChild(tree.domNode);
				this.connect(tree, "onClick", dojo.hitch(this, "showData"));
				tree.startup();
				this.treeStore = treeStore;
				this.treeModel = treeModel;
				this.tree = tree;
				
			},
			resize: function(){
				this.inherited(arguments);
				this.container.resize();
				this.copTabContainer.resize();
			},
			
			createToolBar: function(){
				//toolBarContainer
				var newButton = new Button({
					id: "newButton",
					label: "New", 
					showLabel: true
					
				});
				//this.toolBarContainer.addChild(newButton);
				//this.connect(newButton, "onClick", dojo.hitch(this, "onNewButtonClick"));
			},
			onNewButtonClick: function(data, wNode, evt){
				if(data.code[0].length>3) {
					alert(data.name[0]);
				}
				
			},
			
			showData: function(data, wNode, evt){
				if(data.code[0].length>3) {
					var tabPage = new ContentPane({
							title: data.name[0],
							content:"dddd",
							closable:true
					 });
					this.copTabContainer.addChild(tabPage);
					this.copTabContainer.selectChild(tabPage);
				}
				//alert("on new button click");
			}
			
			
			/*
			createLayout: function(){
				var sectionTabContainer = new TableContainer(
				{
					cols: this.overviewSectionColNumber, 
					showLabels: false,
					style: "overflow:auto",
					customClass: 'perfwebSectionView'
				}, this.sectionTabContainerDiv);		
				this.sectionTabContainer = sectionTabContainer;		
			},
			
			startup: function(){
				this.inherited(arguments);
			},
			
			renderViewByProfiles: function(profiles){
				var _self = this;
				var deferredElementList = [];
				for(var item in profiles){
					var sectionDef = profiles[item];
					var deferredElement = new Deferred();
					deferredElementList.push(deferredElement);
					this.createWidgetByInput(sectionDef, deferredElement) 					
				}
				var deferredList = new DeferredList(deferredElementList);
				deferredList.then(function(result){
					for(var i = 0; i < _self.widgetsLists.length; i++)
					{
						var widgetItemId = _self.widgetsLists[i];
						var chartWidget = _self[widgetItemId];
						if( chartWidget != null){
							var chartInstance = chartWidget.chartInstance;
							chartInstance._chartDeferred.then(function(_chartContainer){
								_chartContainer.renderBarsSerise(_chartContainer.data)
							});	
							_self.sectionTabContainer.addChild(chartWidget);		
						}	
					}
					_self.renderTableContainer();
				})
			},
			
			layout: function(){
				this.inherited(arguments);
			},
			
			renderTableContainer: function(){
				var tableContainer = this.sectionTabContainer;
				tableContainer._initialized = false;
				tableContainer._started = false;
				tableContainer.startup();				
			},
			
			resize: function(){
				this.inherited(arguments);
				this.calcViewRenderSize();
				if(this.sectionTabContainer){
					this.sectionTabContainer.set('cols', this.overviewSectionColNumber);
					this.sectionTabContainer.resize();
				}
			},
			
			createWidgetByInput: function(metaDef, deferredElement){
				require([metaDef.classInstanceName], lang.hitch(this, function(widgetObject) {
					var widget = new widgetObject(metaDef);
					this[widget.profileId] = widget;
					deferredElement.resolve(widget);
				}));
			},
			
			renderViewByInput: function(inputDatas){
				var datas = this.mappingDataByInput(inputDatas);
				this.renderViewByProfiles(datas);
			}*/
		});

	}
);