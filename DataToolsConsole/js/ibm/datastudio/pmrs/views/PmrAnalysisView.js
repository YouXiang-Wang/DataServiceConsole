define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/date/locale",
		"dijit/layout/_LayoutWidget",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		

		"dojo/text!./templates/PmrAnalysisView.html",
		"dcc/datatools/shared/_ViewOptionParserMixin",

		"dojo/dom-construct",
		"dojo/on",
		"dojo/query",
		"dojo/_base/array",
		
		"moment",
		"dojo/data/ItemFileWriteStore",
		"dojo/store/Observable",
		"dojo/store/Memory",
		
		"dojox/charting/Chart",
		"dojox/charting/DataChart",
		"dojox/charting/DataSeries",
		"dojox/charting/plot2d/Pie",
		"dojox/charting/plot2d/Grid",
		"dojox/charting/plot2d/Columns",
		"dojox/charting/plot2d/ClusteredColumns",
		"dojox/charting/action2d/Highlight",
		"dojox/charting/action2d/MoveSlice",
		"dojox/charting/action2d/Tooltip",

		"dojox/charting/widget/Legend",
		"dojox/charting/plot2d/Lines",
		"dojox/charting/axis2d/Default",
		"dojox/charting/plot2d/Default",
		"dojox/charting/themes/Claro", 
		"dojox/charting/themes/ThreeD",
		"dojox/charting/StoreSeries", 
		  
		"put-selector/put",
		"dijit/layout/BorderContainer",
		"dijit/layout/ContentPane",
		"dijit/Dialog",
		"dijit/Toolbar",
		"dijit/ToolbarSeparator",
		
		"dijit/form/ToggleButton",
		"dijit/form/Button",
		"dijit/form/DateTextBox",
		
		"dgrid/Grid",
		"dgrid/OnDemandGrid",
		"dgrid/extensions/ColumnHider",
		"dgrid/extensions/ColumnReorder",
		"dgrid/extensions/ColumnResizer",
		"dgrid/selector",
		"dgrid/Selection",
		"dgrid/Keyboard",
		"dgrid/editor",
		
		"dcc/datatools/helper/DataConvertHelper",
		"../utils/PmrUtil",
		"./PmrAnalysisModel",
		"./PmrObjectCons"
		
	], function(declare, lang, DateLocale, _LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, 
			viewTemplate, _ViewOptionParserMixin,
			domConstruct, on, query, arrayUtil, moment, ItemFileWriteStore, Observable, Memory,
			Chart, DataChart, DataSeries, Pie, Grid, ChartColumns, ClusteredColumns, Highlight, MoveSlice, Tooltip, 
			Legend, Lines, axis2dDefault, plot2dDefault, Claro, ThreeD, StoreSeries,
			put, BorderContainer, ContentPane, Dialog, Toolbar, ToolbarSeparator, ToggleButton, Button, DateTextBox,
			Grid, OnDemandGrid, ColumnHider, ColumnReorder, ColumnResizer, selector, Selection, Keyboard, editor,
			DataConvertHelper, PmrUtil, PmrAnalysisModel, PmrObjectCons ) {

		return declare("ibm/datastudio/pmrs/views/PmrAnalysisView", [_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _ViewOptionParserMixin], {
			
			templateString: viewTemplate,
			
			
			constructor: function(){
				this.inherited(arguments);
				this.model = new PmrAnalysisModel();
			},
			
			postCreate: function() {
				this.inherited(arguments);
				this.model.setDataStore(this.contextData.dataGridStore);
				this.grid = null;
				this.charts = [];
				this._createToolbar();
				

				this.initData();
				this._renderDGrid();
				this._renderChart();				
			},
			
			initData: function(){
				var _fromLong = (new moment('2011-01-01')).valueOf();
				var _toLong = (new moment()).valueOf();
				
				this.memoryStore = this.model.analyzeData(_fromLong, _toLong);
				this.observedStore = new Observable(this.memoryStore);
				this.chartResults = this.observedStore.query({show: true});
			},
			
			resize: function(){
				this.inherited(arguments);
				if(this.grid){
					this.grid.resize();
				}
			},
			
			getViewId: function() {
				return 'PMR_ANALYSIS_VIEW';
			},
			
			_createToolbar: function() {
				var _toolbar = new Toolbar({style: 'border: 0;padding:5;width: 100%;'});
				var _self = this;
				
				_toolbar.addChild(new ToolbarSeparator());
				{
					this.tbCurrentWeek = new ToggleButton({
						label: "Current Week",
			            showLabel: true,
			            
			            iconClass:"dijitRadioIcon"
					});
					_toolbar.addChild(this.tbCurrentWeek);
					
					this.own(this.tbCurrentWeek.on('change', function(checked) {
						if(checked) {
							var start = moment().startOf('week');
							var end = moment().endOf('week');
							_self._selectMoment(start, end);
							_self._toggle(this);
						}
					}));
					
				}
				
				{
					this.tbCurrentMonth = new ToggleButton({
						label: "Current Month",
			            showLabel: true,
			            iconClass:"dijitRadioIcon"
					});
					
					_toolbar.addChild(this.tbCurrentMonth);
					
					this.own(this.tbCurrentMonth.on('change', function(checked) {
						if(checked) {
							var start = moment().startOf('month');
							var end = moment().endOf('month');
							_self._selectMoment(start, end);
							_self._toggle(this);
						}
					}));
				}
				
				{
					this.tbCurrentYear = new ToggleButton({
						label: "Current Year",
			            showLabel: true,
			            checked: true,
			            iconClass:"dijitRadioIcon"
					});
					
					_toolbar.addChild(this.tbCurrentYear);
					
					this.own(this.tbCurrentYear.on('change', function(checked) {
						if(checked) {
							var start = moment().startOf('year');
							var end = moment();
							_self._selectMoment(start, end);
							_self._toggle(this);
						}
					}));
				}
				/*
				{
					this.tbCustomTime = new ToggleButton({
						label: "Custom Time",
			            showLabel: true,
			            iconClass:"dijitRadioIcon"
					});
	
					_toolbar.addChild(this.tbCustomTime);
					
					this.own(this.tbCustomTime.on('change', function(checked) {
						if(checked) {
							var start = moment().startOf('week');
							var end = moment().endOf('week');
							_self._selectMoment(start, end);
							_self._toggle(this);
						}
					}));
					
				}
				*/
				
				_toolbar.addChild(new ToolbarSeparator());
				
				{
					this.pmrBeginDate = new DateTextBox({constraints:{datePattern:'yyyy-MM-dd'}});
					this.pmrEndDate = new DateTextBox({constraints:{datePattern:'yyyy-MM-dd'}});
					var _start = moment().startOf('year');
					var _end = moment().endOf('year');
					this.pmrBeginDate.set('value', _start.format('YYYY-MM-DD'));
					this.pmrEndDate.set('value', _end.format('YYYY-MM-DD'));
					
					_toolbar.addChild(this.pmrBeginDate);
					_toolbar.addChild(this.pmrEndDate);
				}
				
				{
					this.btChoose = new Button({label: "Choose", checked: true, name:"btChoose", iconClass:'executeFilter'});
					_toolbar.addChild(this.btChoose);
					this.own(this.btChoose.on('click', function(evt) {
						_self._selectMoment(0, 0, true);
					}));
				}
				
				_toolbar.addChild(new ToolbarSeparator());
				
				{
					this.btAbout = new Button({label: "About", checked: true, name:"btAbout", iconClass:'executeFilter'});
					_toolbar.addChild(this.btAbout);
					this.own(this.btAbout.on('click', function(evt) {
						this.store = {};
					}));
				}
				
				_toolbar.placeAt(this.headerNode); 
				_toolbar.startup();
			},
			
			
			_toggle: function(tgButton) {
				arrayUtil.forEach([this.tbCurrentWeek, this.tbCurrentMonth, this.tbCurrentYear ], function(_tgButton){
					if(_tgButton.isInstanceOf(ToggleButton)){
						
						if(tgButton == _tgButton) {
							_tgButton.set('Checked', true);
						} else {
							_tgButton.set('Checked', false);
						}
					}
				})
			},
			
			
			_selectMoment: function(start, end, byChoose) {
				var _start = start;
				var _end = end;
				if(byChoose==undefined || byChoose == false) {
					this.pmrBeginDate.set('value', start.format('YYYY-MM-DD'));
					this.pmrEndDate.set('value', end.format('YYYY-MM-DD'));
				} else {
					_start = this.pmrBeginDate.get('value');
					_end = this.pmrEndDate.get('value');
				}
				
				var _fromLong = moment(_start).valueOf();
				var _toLong = moment(_end).valueOf();
				this.memoryStore = this.model.analyzeData(_fromLong, _toLong);
				this._reRenderChart();
			},

			
			_renderDGrid: function() {
				var _self = this;
				var _columns = [
			                editor({ label: "", width: 30, field: "show", sortable: true }, "checkbox"),
			                { id: "legend", width: 50, label: "Legend", field: "legend", renderCell: function (object, data, td, options){
			                                                                                      var span = document.createElement("span");
			                                                                                      span.style.setProperty("width", "12px", "important");
			                                                                                      span.style.setProperty("height", "12px", "important");                                                                                    
			                                                                                      span.style.setProperty("display", "inline-block", "important");
			                                                                                      span.style.setProperty("background-color", data||"", "important");
			                                                                                      return span;
			                                                                                    },
			                                                                                    sortable: true
			                },
			                { id: "abbrGroupName", label: "Component", field: "abbrGroupName", sortable: true },
			                {	id: "inflow",
			                	label: "Inflow",
			                	field: "inflow",
			                	sortable: true,
			                	get: function (rowData) {
							    	var _col = rowData.inflow;
			                		return _col.length;
						        }},
			                {	id: "closedCount",
						        label: "Closed", field: "closed", sortable: true,
						        get: function (rowData) {
							    	var _col = rowData.closed;
			                		return _col.length;
						        }},
			                {	id: "backlogCount",
						        label: "Backlog",
						        field: "backlog",
						        sortable: true,
						        get: function (rowData) {
							    	var _col = rowData.backlog;
			                		return _col.length;
						        }}
			                                                                                  
			            ];
			            
				var gridDomNode = domConstruct.create("div");
				var _gridStore = this.dataStore;
				this.grid = new (declare([OnDemandGrid,
					                         ColumnResizer,
					                         Selection, Keyboard]))({
						columns: _columns,
						sort: [{attribute:"stock_name", descending : true}],
						loadingMessage: "Loading data...",
						noDataMessage: "No results found.",
						//allowTextSelection: true,
						selectionMode: 'extended', 
						updateDelay: 0,
						store: this.observedStore
						
					}, gridDomNode);
				
				this.grid.styleColumn(0, "width: 3em; text-align: center; border-width: 1px;");
				this.grid.styleColumn("legend", "width: 5em; text-align: center; border-width: 1px;");
				/*
				this.grid.styleColumn("abbrGroupName", "width: 7em; text-align: left; border-width: 0px;");
				this.grid.styleColumn("inflowCount", "width: 3em; text-align: center; border-width: 0px;");
				this.grid.styleColumn("closedCount", "width: 3em; text-align: center; border-width: 0px;");
				
				this.grid.styleColumn("backlogCount", "width: 3em; text-align: center; border-width: 1px;");
				*/
				
				this.grid.startup();
				gridDomNode.style.width = '100%';
				gridDomNode.style.height = '90%';
				this.gridContentNode.domNode.appendChild(gridDomNode);
				
				
				this.grid.on("dgrid-datachange", function(evt){
					// when the show checkbox is flagged/unflagged
					//we need to update the store by saving the dirt data of the grid
				    var cell = evt.cell;
			    	if ( cell.column && cell.column.id == 0 ) {
			    		// must call grid.save() in setTimeout
			    		// do not call grid.save() directly
			    		setTimeout(function() { _self.grid.save();},0);
			    	}
				});
			},
			
			_createChart: function(groups, item, type) {
				var chartAreaNode = domConstruct.create("div", {class: "chart-area"}, this.chartContentNode.domNode);
				var chartLegendNode = domConstruct.create("div", null, chartAreaNode);
				var chartDomNode = domConstruct.create("div", {class: "chart"}, chartAreaNode);
				
				
				var chart = new Chart(chartDomNode);
				chart.setTheme(Claro);
				
				if( (type == Lines) || (type == ClusteredColumns) ) {
					chart.addAxis("x", {natural: true, includeZero: true, fixUpper: "minor"});
				    chart.addAxis("y", {vertical: true, natural: true, includeZero: true, fixUpper: "minor"});
				}
				
				if(type == Lines) {
					chart.addPlot("default", {
						margins: {l: 0,r: 0,t: 0,b: 0},
				        type: Lines,
				        markers: true,
				        tension: "S",   
				        lines: true, 
				        //labelOffset: -10,  
				        shadows: { dx:2, dy:2, dw:2 }  
					});
				}

				
				if(type == Pie) {
					chart.addPlot("default", {
						margins: {l: 0,r: 0,t: 0,b: 0},
				        type: Pie,
				        radius: 80,
				        fontColor: "black",
				        shadows: { dx:2, dy:2, dw:2 }  
					});
					chart.addSeries("count", this._valTrans(groups, item));
				}
				
				if( type == ClusteredColumns) {
					chart.addPlot("default", {
						margins: {l: 0,r: 0,t: 0,b: 0},
				        type: ClusteredColumns,
				        gap: 2
					});
				}

			    
			    if( (type == Lines) || (type == ClusteredColumns) ) {
				    for(var _index = 0; _index < groups.length; _index++) {
				    	chart.addSeries(groups[_index].abbrGroupName, groups[_index][item], {stroke: groups[_index].legend});
				    }
			    }

			    this.charts.push({
			    	chart: chart,
			    	dataItem: item,
			    	chartType: type
			    });
			    
				new Tooltip(chart, 'default');
		        new MoveSlice(chart, 'default');
		        new Highlight(chart, 'default');
		        
			    chart.render();
				this._addLegend(chart, chartLegendNode);
			    
			    
			},
			
			_addChartSeries: function(chart, type, seriesName, data, legend) {
				
				if( (type == Lines) || (type == ClusteredColumns) ) {
					chart.addSeries(seriesName, data, {stroke: legend});
					chart.render();
				}
			},
		
			_removeChartSeries: function(chart, seriesName) {
				chart.removeSeries(seriesName);
				chart.render();

			},
			
			
			_reRenderChart: function() {
				var _self = this;
				arrayUtil.forEach(_self.charts, function (chart) {
					arrayUtil.forEach(_self.chartResults, function (group) {
						var _name = group.abbrGroupName;
						chart.chart.removeSeries(_name);
					});
					chart.chart.render();
				});
				
				
				this.observedStore = new Observable(this.memoryStore);
				this.grid.set("store",this.observedStore);
				this.chartResults = this.observedStore.query({show: true});
				
				
				arrayUtil.forEach(_self.charts, function (chart) {
					arrayUtil.forEach(_self.chartResults, function (group) {
						var _type = chart.chartType;
						var _item = chart.dataItem;
						var _name = group.abbrGroupName;
						if( (_type == Lines) || (_type == ClusteredColumns) ) {
							chart.chart.addSeries(_name, group[_item], {stroke: group.legend});
						}
					});
					chart.chart.render();
				});
				
			},
			
			_renderChart: function() {
				var _self = this;
				
				var _items = ['inflowCount', 'closedCount', 'backlogCount'];
				for(var i=0; i < _items.length; i++) {
					this._createChart(this.chartResults, _items[i], Lines);
				}
				
				//this._createChart(this.chartResults, 'inflow', Pie);
				
				for(var i=0; i < _items.length; i++) {
					this._createChart(this.chartResults, _items[i], ClusteredColumns);
				}


				this.chartResults.observe(function(updatedObject, removedFrom, updatedInto) {
					
					if(!updatedObject["show"]) {
						arrayUtil.forEach(_self.charts, function (chart) {
							chart.chart.removeSeries(updatedObject["abbrGroupName"]);
							chart.chart.render();
						});
					} else {
						var _name = updatedObject["abbrGroupName"];
						var _index = _self._getDataIndex('abbrGroupName', _name, _self.chartResults);
						arrayUtil.forEach(_self.charts, function (chart) {
							var _type = chart.chartType;
							var _item = chart.dataItem;
							if( (_type == Lines) || (_type == ClusteredColumns) ) {
								chart.chart.addSeries(_name, _self.chartResults[_index][_item], {stroke: updatedObject.legend});
								chart.chart.render();
							}
						});
					}

				});
				
			},
			
			_valTrans: function(groups, item) {
				var _series = [];
				var _index = 0;
			    for(var _index = 0; _index < groups.length; _index++) {
			    	var tmpItem = {};
			    	tmpItem.x = groups[_index].abbrGroupName;
					tmpItem.y = (groups[_index][item]).length;
					tmpItem.color = groups[_index].legend,
					tmpItem.text = groups[_index].abbrGroupName;
					tmpItem.tooltip = (groups[_index][item]).length;
					_series.push(tmpItem);
			    }
				
				return _series;
			},
			
			_getDataIndex: function(id, value, dataArray) {
				return PmrUtil.getDataIndex(id, value, dataArray);
			},
			
		    _addLegend : function(chart, node){
		        var legend = new Legend({chart: chart}, node);
		        dojo.connect(chart, "render", legend, "refresh");
		    },
			
	});
});