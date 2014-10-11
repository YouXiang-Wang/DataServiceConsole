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
		
		"dojox/charting/Chart",
		"dojox/charting/DataChart",
		"dojox/charting/DataSeries",
		"dojox/charting/plot2d/Pie",
		"dojox/charting/plot2d/Columns",
		"dojox/charting/action2d/Highlight",
		"dojox/charting/action2d/MoveSlice",
		"dojox/charting/action2d/Tooltip",
		
		"dojox/charting/themes/MiamiNice",
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
		
		"../utils/PmrUtil",
		"./PmrAnalysisModel",
		"./PmrObjectCons"
		
	], function(declare, lang, DateLocale, _LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, 
			viewTemplate, _ViewOptionParserMixin,
			domConstruct, on, query, arrayUtil, moment, ItemFileWriteStore,
			Chart, DataChart, DataSeries, Pie, ChartColumns, Highlight, MoveSlice, Tooltip, 
			MiamiNice, Legend, Lines, axis2dDefault, plot2dDefault, Claro, ThreeD, StoreSeries,
			put, BorderContainer, ContentPane, Dialog, Toolbar, ToolbarSeparator, ToggleButton, Button, DateTextBox,
			Grid, OnDemandGrid, ColumnHider, ColumnReorder, ColumnResizer, selector, Selection, Keyboard, editor,
			PmrUtil, PmrAnalysisModel, PmrObjectCons ) {

		return declare("ibm/datastudio/pmrs/views/PmrAnalysisView", [_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _ViewOptionParserMixin], {
			
			templateString: viewTemplate,
			
			grid : null,
			
			dataStore : null,
			strokeColors: ['red', 'gold', 'green', 'blue'],

			config : {
			    itemsList: ["item1", "item2", "item3", "item4", "item5", "item6", "item7", "item8", "item9", "item11"],
			    fieldsList: ["last_price", "time", "timestamp", "pct_change", "bid_quantity", "bid", "ask", "ask_quantity", "min", "max", "ref_price", "open_price", "stock_name", "item_status"],
			    columns: [
			                editor({ label: "", field: "show", sortable: true, autosave: true }, "checkbox"),
			                { id: "legend", label: "Legend", field: "legend", renderCell: function (object, data, td, options){
			                                                                                      var span = document.createElement("span");
			                                                                                      span.style.setProperty("width", "12px", "important");
			                                                                                      span.style.setProperty("height", "12px", "important");                                                                                    
			                                                                                      span.style.setProperty("display", "inline-block", "important");
			                                                                                      span.style.setProperty("background-color", data||"", "important");
			                                                                                      return span;
			                                                                                    },
			                                                                                    sortable: true
			                },
			                { id: "name", label: "Name", field: "stock_name", sortable: true },
			                { id: "last", label: "Last", field: "last_price", sortable: true },
			                { id: "norm", label: "Norm", field: "ref_price", sortable: true },
			                { id: "time", label: "Updated", field: "time", sortable: true },
			                { id: "change", label: "Change", field: "pct_change", renderCell: function (object, data, td, options){
			                                                                                      var div = document.createElement("span");
			                                                                                      if (data<0) {
			                                                                                        div.style.setProperty("color", "red", "important");
			                                                                                        div.innerHTML = "";
			                                                                                      } else {
			                                                                                        div.style.setProperty("color", "green", "important");
			                                                                                        div.innerHTML = "+";
			                                                                                      }
			                                                                                      div.innerHTML = div.innerHTML + data + "%";
			                                                                                      return div;
			                                                                                  }, 
			                                                                                  sortable: true },
			                /*                                                                 
			                { id: "bid_size", label: "Bid Size", field: "bid_quantity", sortable: true },
			                { id: "bid", label: "Bid", field: "bid", sortable: true },
			                { id: "ask", label: "Ask", field: "ask", sortable: true },
			                { id: "ask_size", label: "Ask Size", field: "ask_quantity", sortable: true }
			                */
			                                                                                  
			            ],
			    xAxis: { 
			      title: "Time", 
			      fixLower: "major", 
			      fixUpper: "minor", 
			      natural: true, 
			      //labelFunc: this.formatters.time,  
			      majorLabels: true, majorTicks: true, majorTick: {length:10}, majorTickStep:5000,
			      minorLabels: false, minorTicks:true, minorTick:{length:6},  minorTickStep:1000
			    },
			    plotButtons: [ "CurvedLines", "StraightLines", "LinesOnly" ]
			  },
			  
			constructor: function(){
				this.inherited(arguments);
				this.model = new PmrAnalysisModel();
			},
			
			postCreate: function() {
				this.inherited(arguments);
				this.model.setDataStore(this.contextData.dataGridStore);
				this._createToolbar();
				//this._renderDGrid();
				this._renderChart();
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
			            checked: true,
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
				_toolbar.addChild(new ToolbarSeparator());
				
				{
					this.pmrBeginDate = new DateTextBox({constraints:{datePattern:'yyyy-MM-dd'}});
					this.pmrEndDate = new DateTextBox({constraints:{datePattern:'yyyy-MM-dd'}});
					var _start = moment().startOf('week');
					var _end = moment().endOf('week');
					this._selectMoment(_start, _end);
					_toolbar.addChild(this.pmrBeginDate);
					_toolbar.addChild(this.pmrEndDate);
				}
				
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
				arrayUtil.forEach([this.tbCurrentWeek, this.tbCurrentMonth, this.tbCurrentYear, this.tbCustomTime ], function(_tgButton){
					if(_tgButton.isInstanceOf(ToggleButton)){
						
						if(tgButton == _tgButton) {
							_tgButton.set('Checked', true);
						} else {
							_tgButton.set('Checked', false);
						}
					}
				})
			},
			
			_selectMoment: function(start, end) {
				this.pmrBeginDate.set('value', start.format('YYYY-MM-DD'));
				this.pmrEndDate.set('value', end.format('YYYY-MM-DD'));
				
			},
			
			
			_renderDGrid: function() {
				var _self = this;
				
				//var gridDomNode = put("div#gridDomNode");
				//put(document.body, gridDomNode);
				
				var gridDomNode = domConstruct.create("div");
				
				/*
				this.grid = new Grid({
				      columns:  this.config.columns,
				      region: 'center',
				      height: 'auto',
				      updateDelay: 0,
				}, gridDomNode);
				*/
				
				this.grid = new (declare([OnDemandGrid,
					                         ColumnResizer,
					                         Selection, Keyboard]))({
						columns: this.config.columns,
						sort: [{attribute:"stock_name", descending : true}],
						loadingMessage: "Loading data...",
						noDataMessage: "No results found.",
						//allowTextSelection: true,
						selectionMode: 'extended', 
						//store: store,
						
					}, gridDomNode);
			
				/*	
				this.grid.styleColumn("last", "width: 17em; text-align: right; padding: 2px; border-width: 0px;");
				this.grid.styleColumn("norm", "width: 17em; text-align: right; padding: 2px; border-width: 0px;");
				this.grid.styleColumn("change", "width: 17em; text-align: right; padding: 2px; border-width: 0px;");
				this.grid.styleColumn("bid_size", "width: 17em; text-align: right; padding: 2px; border-width: 0px;");
				
				this.grid.styleColumn("bid", "width: 7em; text-align: right; padding: 2px; border-width: 0px;");
				this.grid.styleColumn("ask", "width: 7em; text-align: right; padding: 2px; border-width: 0px;");
				this.grid.styleColumn("ask_size", "width: 7em; text-align: right; padding: 2px; border-width: 0px;");
				
				
				this.grid.styleColumn("time", "width: 17em; text-align: right; padding: 2px; border-width: 0px;");
				this.grid.styleColumn("legend", "width: 17em; text-align: center; border-width: 0px;");
				this.grid.styleColumn("name", "width: auto; text-align: left; padding-left: 2px; border-width: 0px;");
				this.grid.styleColumn(0, "width: 7em; text-align: left; border-width: 0px;");
				*/
				
				this.grid.startup();
				gridDomNode.style.width = '100%';
				gridDomNode.style.height = '30%';
				this.gridContentNode.domNode.appendChild(gridDomNode);
				  // bind the grid with the store
				//this.grid.set("store",stockStore);
				//this.gridNode.set("content", this.grid);
				
				  //start sorting by stock_name
				this.grid.set("sort","stock_name");
				/*
				this.grid.on("dgrid-datachange", function(evt){  
				    // when the show checkbox is flagged/unflagged we need to update the store by saving the dirt data of the grid
				    var cell = evt.cell;
				    if ( cell.column && cell.column.id == 0 ) {
				      setTimeout(function() {
				        grid.save();
				      },0);
				    }
				});
				*/
			},
			
			_createChart: function(groups, item) {
				var chartAreaNode = domConstruct.create("div", {class: "chart-area"}, this.chartContentNode.domNode);
				var chartLegendNode = domConstruct.create("div", null, chartAreaNode);
				var chartDomNode = domConstruct.create("div", {class: "chart"}, chartAreaNode);
				
				var chart = new Chart(chartDomNode);
				chart.setTheme(Claro);
				chart.addPlot("default", {
					margins: {l: 0,r: 0,t: 0,b: 0},
			        type: "Default",
			        markers: true,
			        tension: "S",   
			        lines: true, 
			        //labelOffset: -10,  
			        shadows: { dx:2, dy:2, dw:2 }  
				});
				
			    chart.addAxis("x");
			    chart.addAxis("y", {vertical: true});
			    
			    var _index = 0;
			    for(var _attr in groups) {
		    		if ( groups[_attr]!=undefined && typeof(groups[_attr]) != "function") {
		    			chart.addSeries(groups[_attr].abbrGroupName, groups[_attr][item], {stroke: this.strokeColors[_index]});
		    			_index++;
		    		}
		    	}
			    
				new Tooltip(chart);
		        new MoveSlice(chart);
		        new Highlight(chart);
			    chart.render();
				this._addLegend(chart, chartLegendNode);
			    
			},
			
			_renderChart: function() {
				var _from = this.pmrBeginDate.get('value');
				var _fromLong = (new moment('2012-01-01')).valueOf();
				
				var _to = this.pmrEndDate.get('value');
				var _toLong = (new moment(_to)).valueOf();
				
				var _groups = this.model.analyzeData(_fromLong, _toLong);
				//closedCount inflowCount backlogCount
				var _items = ['inflowCount', 'closedCount', 'backlogCount'];
				for(var i=0; i < _items.length; i++) {
					this._createChart(_groups, _items[i]);
				}
				
				
				var chartAreaNode = domConstruct.create("div", {class: "chart-area"}, this.chartContentNode.domNode);
				var chartLegendNode = domConstruct.create("div", null, chartAreaNode);
				var chartDomNode = domConstruct.create("div", {class: "chart"}, chartAreaNode);
				
				var chartP = new Chart(chartDomNode);
				chartP.setTheme(MiamiNice); //MiamiNice //Claro
				
				
				chartP.addPlot("default", {
					margins: {l: 0,r: 0,t: 0,b: 0},
			        type: Pie,
			        radius: 80,
			        fontColor: "blue",
			        shadows: { dx:2, dy:2, dw:2 }  
				});
			    
				
				chartP.addSeries("count", this._valTrans(_groups ,'inflow'));
				new Tooltip(chartP);
		        new MoveSlice(chartP);
		        new Highlight(chartP);
		        chartP.render();
				this._addLegend(chartP, chartLegendNode);
				
			},
			
			_valTrans: function(groups, item) {
				var _series = [];
				var _index = 0;
				for(var _attr in groups) {
					var tmpItem = {};
					if(groups[_attr][item]!==undefined) {
						tmpItem.x = groups[_attr].abbrGroupName;
						tmpItem.y = (groups[_attr][item]).length;
						tmpItem.color = this.strokeColors[_index];
						tmpItem.text = groups[_attr].abbrGroupName;
						tmpItem.tooltip = (groups[_attr][item]).length;
						_index++;
					}
					_series.push(tmpItem);
				}
				
				return _series;
			},
			___renderChart: function() {
				var _from = this.pmrBeginDate.get('value');
				var _fromLong = (new moment('2014-01-01')).valueOf();
				
				var _to = this.pmrEndDate.get('value');
				var _toLong = (new moment(_to)).valueOf();
				
				var _groups = this.model.analyzeData(_fromLong, _toLong);
				
				
				var chartAreaNode1 = domConstruct.create("div", {class: "chart-area"}, this.chartContentNode.domNode);
				var chartLegendNode1 = domConstruct.create("div", null, chartAreaNode1);
				var chartDomNode1 = domConstruct.create("div", {class: "chart"}, chartAreaNode1);
				
				var chart1 = new Chart(chartDomNode1);
				//chart1.setTheme(ThreeD);
				chart1.addPlot("default", {
					margins: {l: 0,r: 0,t: 5,b: 0},
			        type: "Default",
			        markers: true,
			        tension: "S",   
			        lines: true, 
			        labelOffset: -30,  
			        shadows: { dx:2, dy:2, dw:2 }  
				});
			    chart1.addAxis("x");
			    //chart1.addAxis("y", {vertical: true, fixLower: "minor", fixUpper: "minor", includeZero: false, min: 0, max: 10 });
			    chart1.addAxis("y", {vertical: true});
			    
			    var _index = 0;
			    for(var _attr in _groups) {  //closedCount inflowCount backlogCount
		    		if ( _groups[_attr]!=undefined && typeof(_groups[_attr]) != "function") {
		    			chart1.addSeries(_groups[_attr].abbrGroupName, _groups[_attr].inflowCount, {stroke: this.strokeColors[_index]});
		    			_index++;
		    		}
		    	}
			    
				chart1.render();
				
				this._addLegend(chart1, chartLegendNode1);
				

				var chartAreaNode2 = domConstruct.create("div", {class: "chart-area"}, this.chartContentNode.domNode);
				var chartLegendNode2 = domConstruct.create("div", null, chartAreaNode2);
				var chartDomNode2 = domConstruct.create("div", {class: "chart"}, chartAreaNode2);
				var chart2 = new Chart(chartDomNode2);
				
				chart2.addPlot("default", {
					margins: {l: 0,r: 0,t: 5,b: 0},
			        type: "Default",
			        markers: true,
			        tension: "S",  
			        lines: true,
			        labelOffset: -30,  
			        shadows: { dx:2, dy:2, dw:2 }  
				});
			    chart2.addAxis("x");
			    chart2.addAxis("y", {vertical: true});
			   
			    var _index1 = 0;
			    for(var _attr in _groups) {  //closedCount
		    		if ( _groups[_attr]!=undefined && typeof(_groups[_attr]) != "function") {
		    			chart2.addSeries(_groups[_attr].abbrGroupName, _groups[_attr].backlogCount, {stroke: this.strokeColors[_index1]});
		    			_index1++;
		    		}
		    	}
			    
				chart2.render();
				
				this._addLegend(chart2, chartLegendNode2);
				
				/*
				var chartAreaNode3 = domConstruct.create("div", {class: "chart-area"}, this.chartContentNode.domNode);
				var chartLegendNode3 = domConstruct.create("div", null, chartAreaNode3);
				var chartDomNode3 = domConstruct.create("div", {class: "chart"}, chartAreaNode3);
				
		        
		        var chartP = new Chart(chartDomNode3);
		        chartP.addPlot("default", {type: Pie, radius: 125});
		        chartP.addSeries("Price", new dojox.charting.DataSeries(
		                    store, {query: {symbol: "*"}}, {y: "price", text: "symbol", tooltip: "price"})).
		        charP.render();
		        addLegend(chartP, "pie_legend");
		        new dojox.charting.action2d.Tooltip(chartP);
		        new dojox.charting.action2d.MoveSlice(chartP);
				*/
			},
			
		    _addLegend : function(chart, node){
		        var legend = new Legend({chart: chart}, node);
		        dojo.connect(chart, "render", legend, "refresh");
		    },
			
	});
});