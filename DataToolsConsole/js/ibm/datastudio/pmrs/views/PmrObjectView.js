define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dijit/layout/_LayoutWidget",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		"dojo/text!./templates/PmrObjectView.html",
		
		"dojo/_base/array",
		"dojo/dom-construct",
		'dojo/on',
		"dijit/layout/TabContainer",
		"dijit/layout/ContentPane",
		//"dijit/Dialog",
		"idx/widget/Dialog" ,
		"dijit/form/Button",
		
		"dgrid/Grid",
		"dgrid/OnDemandGrid",
		"dgrid/extensions/ColumnHider",
		"dgrid/extensions/ColumnReorder",
		"dgrid/extensions/ColumnResizer",
		"dgrid/selector",
		"dgrid/Selection",
		"dgrid/Keyboard",
		"put-selector/put",
		"dgrid/List",
		"dgrid/ColumnSet",
		"dgrid/extensions/Pagination",
		
		"dcc/datatools/helper/DataConvertHelper",
		
		"dcc/datatools/app/application",
		"dcc/datatools/command/CommandHandler",
		"dcc/datatools/shared/_ViewOptionParserMixin",
		"dcc/datatools/shared/widgets/LoadingWidget",
		"dcc/datatools/utils/RegularExpressionUtil",
		"./PmrObjectCons",
		"./PmrObjectModel",
		"./PMROverviewToolbar"
		
		],
		
		function(declare, lang, _LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin,viewTemplate, 
				arrayUtil, domConstruct, on, TabContainer, ContentPane, Dialog, Button,
				Grid, OnDemandGrid, ColumnHider, ColumnReorder, ColumnResizer, selector, Selection, Keyboard, put, List, ColumnSet, Pagination,
				DataConvertHelper, application, CommandHandler, _ViewOptionParserMixin, LoadingWidget, RegularExpressionUtil, PmrObjectCons, PmrObjectModel, PMROverviewToolbar) {
	
	
		var events = PmrObjectCons.events;
		return declare("ibm/datastudio/pmrs/views/PmrObjectView",[_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _ViewOptionParserMixin], {
			templateString: viewTemplate,
			
			severityArray : [1,2,4,8],
			priorityArray : [1,2,4,8],
			
			yearArray : [1,2,4,8],
			
			pmrsGrid : null,

			selectedRow : null,
			
			toolbar: null,
			
			constructor: function(){
				this.inherited(arguments);
				this.pmrsGrid = null;
				this.model = new PmrObjectModel();
				this.selectedRow = new Array();		
				this.reportDialog = null;
			},
			
			resize: function(){
				this.inherited(arguments);
				if(this.previewGrid){
					this.previewGrid.resize();
				}
			},
			
			
			initViewDataReadyHandler: function(memoryStore){
				if(this.loadingIndicator){
					this.loadingIndicator.hide();
				}
				var columns1 = PmrObjectCons.tableProperties;
				var columns = {
					pmrNumber: { label: "PMR No.", 
						reorderable: false, 
						width: 100,
						//formatter : _pmrNumberFormatter
						},
						
					l3Group: { label: "Component"},
					l3Owner: { label: "L3 Owner"},
					customer: { label: "Customer",
								get: function (rowData) {
							    	var value = rowData.customer;
							    	if(value!=null && value!='') {
							            return value.substr(16);
							    	}
							    	return "";
						        }},
					
					openAgainst: { label: "Versions", width: 75},  
					severity: { label: "Severity", width: 75},
					priority: { label: "Priority", width: 70},
					pmrStatus: { label: "Status", 
								width: 70,
							    get: function (rowData) {
							    	var value = rowData.pmrStatus;
						            if(value === 'C') {
						            	return "Closed";
						            } else if (value === 'O') {
						            	return "Opened";
						            } else {
						            	return value;
						            }
						        }},
					l3RequestDate: { label: "Request Date",
								width: 120,
								get: function (rowData) {
							    	var value = rowData.l3RequestDate;
							    	if(value!=null && value!='') {
							    		return value.substr(0, 10);
							    	}
							    	return "";
						        }},
					l3CloseDate: { label: "Close Date"},
					apar: { label: "APAR", width: 80},
					comments: { label: "Comments"},
				};
				
				this._renderDGrid(columns, memoryStore);
				this._renderFilterOption(columns1);
			},

			_renderDGrid: function(columns, store){
				var _self = this;
				var pmrsGridNode = put("div#pmrsGrid");
				put(document.body, pmrsGridNode);
				var pmrsGrid = new (declare([OnDemandGrid, ColumnHider,
				                         ColumnResizer, Pagination,
				                         Selection, Keyboard]))({
					columns: columns,
					sort: [{attribute:"l3RequestDate", descending : true}],
					loadingMessage: "Loading data...",
					noDataMessage: "No results found.",
			        pagingLinks: 1,
			        pagingTextBox: true,
			        previousNextArrows: true,
			        showLoadingMessage: true,
			        firstLastArrows: true,
			        rowsPerPage: 50,
			        pageSizeOptions: [10, 20, 50, 100, 200],
					cellNavigation: false,
					allowTextSelection: true,
					selectionMode: 'extended', 
					store: store,
					
				}, pmrsGridNode);

				pmrsGrid.startup();
				pmrsGridNode.style.width = '100%';
				pmrsGridNode.style.height = '88%';
				this.pmrsGridContainer.appendChild(pmrsGridNode);
				this.previewGrid = pmrsGrid;
				
				pmrsGrid.on("dgrid-deselect", function(event){
					var row = event.rows[0];
				});
				
				
				pmrsGrid.on("dgrid-select", function(event) {
					
					if(event.type == "dgrid-select") {
						arrayUtil.map(event.rows, function(row) {
							_self.selectedRow = row;
						});
					}
					
				});
				
				
				pmrsGrid.on(".dgrid-row:dblclick", function(event) {
					
					var item = _self.pmrsGrid.row(event).data;
					_self.openPmrInfomation("LOCAL");
					
				});
				
				
				this.pmrsGrid = pmrsGrid;
			},
			
			_pmrNumberFormatter : function(t){
				return t;
			},
			
			_renderFilterOption: function(columns){
				var _self = this;
				var toolbar = new PMROverviewToolbar();
				var filterStore = this.model.getFilterStore(columns);
				toolbar.setOptions(filterStore);
				this.filterSection.appendChild(toolbar.domNode);			
				on(toolbar.domNode, toolbar.EXECUTE_FILTER, function(filterOptions){
					var dataOptions = filterOptions.dataOptions;
					var key = dataOptions.key;
					var value = dataOptions.value;
					var type = dataOptions.type;
					_self.filterCurrentGrid(dataOptions);
					_self.pmrsGrid.resize();
					
				});
				
				on(toolbar.domNode, toolbar.OPEN_PMR_INFO, function(options) {
					var resourceType = options.resourceType;
					
					if(resourceType!=undefined && resourceType !=null && resourceType!='') {
						_self.openPmrInfomation(resourceType);
					}	
					
				});
				
				
				on(toolbar.domNode, toolbar.GEN_PMR_REPORT, function(options) {
					
					if(this.reportDialog==null) {
						
						var dialog = new Dialog({ 
							id: "pmrReportDialog", 
							title: "PMR Report Dialog", 

							instruction: "Choose the time stage to generate the PMR report.", 

							content: "<div style='height:80px'>Lorem ipsum dolor sit amet, consectetuer adipiscing elit." +
								"Aenean semper sagittis velit. Cras in mi. Duis porta mauris ut ligula. Proin porta rutrum lacus." +
								"Etiam consequat scelerisque quam. Nulla facilisi. Maecenas luctus venenatis nulla.</div>" + 
								
								"<div>" + 
								
								'<span><b>Years:</b></span>' + 
								'<input name="pmrYear2011" data-dojo-type="dijit/form/CheckBox"  data-dojo-attach-point="cbYear2011"/>' + 
								'<label for="pmrYear2011">2011</label>' + 
								
								'<input name="pmrYear2012" data-dojo-type="dijit/form/CheckBox"  data-dojo-attach-point="cbYear2012"/>' +
								'<label for="pmrYear2012">2012</label>' +
								"</div>",

							reference: { 
								name: "Link goes here", 
								link: "http://dojotoolkit.org/"
							}, 

							buttons: [ new Button({
								label: "Generate",
								onClick: function() {
									alert("Button1 clicked!");
								}
							}),new Button({
								label: "Generate And Open", 
								onClick: function() {
									_self.generatePmrReport();
								} 
							})], 
							closeButtonLabel: "Cancel"
								
						});
						
						this.reportDialog = dialog;
					}
 
					this.reportDialog.show();			
				});
				
				this.toolbar = toolbar;
				this.toolbar.setDefault('pmrNumber');
			},
			
			generatePmrReport: function() {
				alert("Report!");
			},
			
			openPmrInfomation: function(sourceType) {
				
				if(sourceType== "LOCAL") {
					
					var _row = this.selectedRow;
					var _pmrNumber = _row.data.pmrNumber;

					var _command = {
						moduleID: "GET_PMR",
						displayTitle: _pmrNumber,
						contextPath: "http://localhost:3200",
						args: {type: 1,
						  	pmrNumber: _pmrNumber
						},
						moduleRenderView: "ibm/datastudio/pmrs/views/PmrDetailView",
						restServiceUrl: "/resource/pmr/getpmr",
						isCrossDomain: "Y"
					};
	
					
					var commandHandler = new CommandHandler({
						  args: {type: 1,
							  	pmrNumber: '01981,442,000', //_pmrNumber
							  },
						  context: {data: _row},
						  commandText: '01981,442,000', //_pmrNumber,
						  commandDef: _command
					  });
					
					  commandHandler.execute();
					  return commandHandler.defer;
				}
			},
			
			returnGroupID : function(group) {
				var value;
				if(group == "Data Studio Administrator") {
					value = 1;
				} else if(group == "Optim Development Studio / Data Studio (Developer)") {
					value = 2;
				} else {
					value = 4;
				}
				return value;
			},
			
			returnStatus : function(status) {
				var value;
				if(status == "O") {
					value = 1;
				} else if(status == "C") {
					value = 2;
				} else {
					value = 4;
				}
				return value;
			},
			
			returnYearInt : function(year) {
				var value;
				if(year == "2011") {
					value = 1;
				} else if(year == "2012") {
					value = 2;
				} else if(year == "2013") {
					value = 4;
				} else {
					value = 8;
				}
				return value;
			},
			
			isInDatePeriod : function(date, beginDate, endDate) {
				date = date.replace(/-/g, '');
				return (date >= beginDate) && (date <= endDate) ;
			},
			
			filterCurrentGrid: function(dataOptions){
				
				var _self = this;
				var _key = dataOptions.key;
				var _value = dataOptions.value;
				var queryText = _value;
				
				var regExp;
				
				if(queryText!='') {
					if(queryText.substr(0, 1) == '*') {
						regExp = RegularExpressionUtil.compilePattern(queryText, false, false);
					} else {
						regExp = RegularExpressionUtil.compilePattern(queryText, false, true);
					}
					
				}
				
				var _groups = dataOptions.filterConditions.groups;
				var _severities = dataOptions.filterConditions.severities;
				var _priorities = dataOptions.filterConditions.priorities;
				var _statuses = dataOptions.filterConditions.statuses;
				var _apars = dataOptions.filterConditions.apars;
				var _years = dataOptions.filterConditions.years;
				
				var _datePeriodEnabled = dataOptions.filterConditions.datePeriodEnabled;
				var _beginDate;
				var _endDate;
				if(_datePeriodEnabled) {
					_beginDate = dataOptions.filterConditions.beginDate;
					_beginDate = _beginDate.replace(/-/g, '');
					
					_endDate = dataOptions.filterConditions.endDate;
					_endDate = _endDate.replace(/-/g, '');
				}
				
				
				this.previewGrid.set('query', function(item){
					var rowValue = item[_key].trim();
					var _group = item['l3Group'];
					var _groupID = _self.returnGroupID(_group);
					var _severity = _self.severityArray[item['severity']-1];
					var _priority = _self.severityArray[item['priority']-1];
					var _status = _self.returnStatus(item['pmrStatus']);
					var _apar = item['apar'].trim() !=''? 1 : 2;
					
					
					if( (_groupID & _groups) == _groupID) {
						
						if((_severity & _severities) == _severity) {
							
							if((_status & _statuses) == _status) {
								
								if((_priority & _priorities) == _priority) {
									
									if( (_apar & _apars) == _apar) {
										
										if(!_datePeriodEnabled) {
											// false
											var _year = _self.returnYearInt(item['l3RequestDate'].trim().substr(0, 4));
											if( (_year & _years) != _year) {
												return false;
											}
										} else {
											if(!_self.isInDatePeriod(item['l3RequestDate'].trim().substr(0, 10), _beginDate, _endDate)) {
												return false;
											}
										}
										
										if(queryText=='') {
											return true;
										} else {
											return RegularExpressionUtil.match(rowValue, regExp) != null ? true : false;
										}

									}
								}
							}
						}
					}
					return false;
				});
			}
			
		});
	}
);