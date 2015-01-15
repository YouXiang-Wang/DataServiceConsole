define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		
		"dijit/layout/ContentPane",
		"dojo/text!./templates/PmrReportDialog.html",

		"dijit/Dialog",
		"moment",
		"dojo/date/locale",

		"dojo/dom-construct",
		"dojo/dom-style",
		"dojo/window",
		"dojo/on",
		"dojo/query",
		"dojo/_base/array",
		"dojo/aspect",
		
		//"dcc/datatools/widget/ExpandablePane",
		"dijit/layout/TabContainer",
		"dijit/layout/ContentPane",
		"dijit/form/TextBox",
		"dijit/form/DateTextBox",
		"dojox/layout/TableContainer",
		"dijit/form/Button",
		"dijit/form/RadioButton",
		"dijit/form/CheckBox",
		"dojox/widget/Standby"
		
		
	], function(declare, lang, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
			ContentPane, viewTemplate,
			Dialog, moment, DateLocale,
			domConstruct, domStyle, window, on, query, arrayUtil, aspect,
			//ExpandablePane, 
			TabContainer, ContentPane, TextBox, DateTextBox, TableContainer, Button, RadioButton, CheckBox, Standby) {
	
		return declare("ibm/datastudio/pmrs/views/PmrReportDialog", [Dialog, _WidgetsInTemplateMixin ], {
			
			templateString: viewTemplate,
			widgetsInTemplate : true,
			title: null,
			
			labelGenerateButton : '',
			labelCancelButton : null,
			
			tabTimeSettings: '',
			
			constructor : function() {
				this.inherited(arguments);
				
			},
			
			postCreate: function() {
				
				this.inherited(arguments);
				var _self = this;

				var windowSize = window.getBox();
				var height = 300;
				if(windowSize){
					height = windowSize.h - 250;
				}
				if(height<0){
					height = 60;
				}
				domStyle.set(this.containerNode, {
					height : ""+height+"px"
				});

				this.folder =  new TabContainer({
				    style:"height: "+height+"px;"
			    });
				

				   
				{
					var panel = new ContentPane({ title: this.tabTimeSettings, tooltip: this.tabTimeSettings, style:"width:100%;"});
					this.folder.addChild(panel);
					
					
					var _tableContainer1 = new TableContainer({
							cols: 4,
							style:"width:100%;"
					});
					
					panel.addChild(_tableContainer1);
					
					this.standby = new Standby({target: _tableContainer1});
					this.addChild(this.standby);
					this.standby.startup();

					this.radioCurrentWeek = new RadioButton({title: "By Current Week", checked: true, name:"radioTimeSelection", colspan:1});
					this.radioCurrentMonth = new RadioButton({title: "By Current Month", name:"radioTimeSelection", colspan:1});
					this.radioCurrentYear = new RadioButton({title: "By Current Year", name:"radioTimeSelection", colspan:1});
					this.radioDefault = new RadioButton({title: "By Default", name:"radioTimeSelection", colspan:1});
			       
			        _tableContainer1.addChild(this.radioCurrentWeek);
					_tableContainer1.addChild(this.radioCurrentMonth);
					_tableContainer1.addChild(this.radioCurrentYear);
					_tableContainer1.addChild(this.radioDefault);
					
					
					this.pmrReportBeginDate = new DateTextBox({
						title: "Begin Date",
						colspan:2,
						constraints:{datePattern:'yyyy-MM-dd'}
					});
					
					_tableContainer1.addChild(this.pmrReportBeginDate);
					
					this.pmrReportEndDate = new DateTextBox({
						title: "End Date",
						colspan:2,
						constraints:{datePattern:'yyyy-MM-dd'}
					});
					
					_tableContainer1.addChild(this.pmrReportEndDate);
					
				}

				{
					var panel = new ContentPane({ title: "Compare", tooltip:"Compare", style:"width:100%;"});
					this.folder.addChild(panel);
					
				}


				this.folder.placeAt(this.containerNode); 
				this.folder.startup();
				
				
				this.own(on(this.generateButton, "click", lang.hitch(this, "_onGenerateReport")));
				this.own(on(this.cancelButton, "click", lang.hitch(this, "_onCancelClose")));
				
				//this.own(on(this.radioCurrentMonth, "change", lang.hitch(this, "_chooseMoment")));
				//this.own(on(this.radioCurrentYear, "change", lang.hitch(this, "_chooseMoment")));
				//this.own(on(this.radioDefault, "change", lang.hitch(this, "_chooseMoment")));
				
				this.own(this.radioCurrentWeek.on('change', function(checked) {
					if(checked) {
						var start = moment().startOf('week');
						var end = moment().endOf('week');
						alert(start);
						_self._chooseMoment(start, end);
					}
				}));
				
				
				this.own(this.radioCurrentMonth.on('change', function(checked) {
					
					if(checked) {
						var start = moment().startOf('month');
						var end = moment().endOf('month');
						_self._chooseMoment(start, end);
					}
				}));
				
				this.own(this.radioCurrentYear.on('change', function(checked) {
					if(checked) {
						var start = moment().startOf('year');
						var end = moment().endOf('year');
						_self._chooseMoment(start, end);
					}
				}));
				
				this.own(this.radioDefault.on('change', function(checked) {
					if(checked) {
						var start = moment().startOf('year');
						var end = moment().endOf('year');
						_self._chooseMoment(start, end);
					}
				}));
				
				
		        aspect.after(this, "onCancel", function(){
		        	_self._onCancelClose();
	            });
		        
				this._initReportDialog();
				
			},
			
			postMixInProperties: function() {
				this.inherited(arguments);
				this.title = 'PMR Report Generation Preferences';
				this.tabTimeSettings = 'Report Time Setting';
				this.labelGenerateButton = 'Generate';
				this.labelCancelButton = 'Cancel';
			},
			
			
			show:function(){
	    	    this.inherited(arguments);		    	
		    	var windowSize = window.getBox();
				var height = 500;
				if(windowSize){
					height = windowSize.h - 250;
				}
				if(height<0){
					height = 60;
				}
				domStyle.set(this.containerNode, {
					height : ""+height+"px",
					width : "760px",
				});

		    	domStyle.set(this.folder.domNode, {
					width : "760px",
					height:""+height+"px"
				});
		    	this.folder.resize();
			},
		
			
			_initReportDialog: function() {
				this.pmrReportBeginDate.set('value', '2011-01-01');
				this.pmrReportEndDate.set('value', new Date());
			},
			
			
			_onGenerateReport : function() {
				
				this.standby.show();
				this.hide();
				
				try {
					//this.dialog.destroyRecursive();
				} catch (err) {
					console.log(err);
				}
				
			},
			
			_onCancelClose : function() {
				this.hide();
				
				/*
				try {
					this.dialog.destroyRecursive();
				} catch (err) {
					console.log(err);
				}
				*/
				
			},
			
			_chooseMoment: function(start, end) {
				this.pmrReportBeginDate.set('value', start.format('YYYY-MM-DD'));
				this.pmrReportEndDate.set('value', end.format('YYYY-MM-DD'));
				
			},

			_executeFilter: function() {
			}
			
		});
});