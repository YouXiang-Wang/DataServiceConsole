define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/date/locale",
		"dijit/layout/_LayoutWidget",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",

		"dojo/text!./templates/PmrDetailView.html",
		"dcc/datatools/shared/_ViewOptionParserMixin",
		"dojo/html",
		
		"./PmrDetailModel",
		"dojo/on",
		"dojo/query",
		"dojo/_base/array",
		
		"dojox/layout/TableContainer",
		"dijit/layout/ContentPane",
		"dijit/form/TextBox",
		"dijit/Toolbar",
		"dijit/form/ComboBox",
		"dijit/form/CheckBox",
		"dijit/form/Select"
		
	], function(declare, lang, DateLocale, _LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin,
			viewTemplate, _ViewOptionParserMixin, html,
			PmrDetailModel, on, query, array,
			TableContainer, ContentPane, TextBox) {

		return declare("ibm/datastudio/pmrs/views/PmrDetailView", [_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _ViewOptionParserMixin], {
			
			templateString: viewTemplate,
			
			constructor: function(){
				this.inherited(arguments);
				this.addEventsListener();
				this.model = new PmrDetailModel();
			},
			
			postCreate: function() {
				this.inherited(arguments);
				
				html.set(this.pmrsCommuInfoContainer, this.model.dataStore, {parserContent: false});
				
				var _pmrData = this.contextData.data;
				this.pmrNumber = _pmrData.pmrNumber;
				var _pmrNumber = new ContentPane({label: "PMR:"});

				_pmrNumber.set('content', _pmrData.pmrNumber);
				this.pmrsDetailInfoContainer.addChild(_pmrNumber);
				
				var _product = new ContentPane({label: "Product:"});
				_product.set('content', _pmrData.productName);
				this.pmrsDetailInfoContainer.addChild(_product);

				var _l2OpenDate = new ContentPane({label: "L2 Open Date:"});
				_l2OpenDate.set('content', _pmrData.l2OpenDate);
				this.pmrsDetailInfoContainer.addChild(_l2OpenDate);

				var _customer = new ContentPane({label: "Customer:"});
				_customer.set('content', _pmrData.customer);
				this.pmrsDetailInfoContainer.addChild(_customer);
				
				var _severity = new ContentPane({label: "Severity:"});
				_severity.set('content', _pmrData.severity);
				this.pmrsDetailInfoContainer.addChild(_severity);
				
				var _currentQueue = new ContentPane({label: "Current Queue:"});
				_currentQueue.set('content', _pmrData.currentQueue);
				this.pmrsDetailInfoContainer.addChild(_currentQueue);
				
				var _l3Group = new ContentPane({label: "L3 Group:"});
				_l3Group.set('content', _pmrData.l3Group);
				this.pmrsDetailInfoContainer.addChild(_l3Group);


				var _l3Owner = new ContentPane({label: "L3 Owner:"});
				_l3Owner.set('content', _pmrData.l3Owner);
				this.pmrsDetailInfoContainer.addChild(_l3Owner);
				

				
				var _l3RequestDate = new ContentPane({label: "L3 Request Date:"});
				_l3RequestDate.set('content', _pmrData.l3RequestDate);
				this.pmrsDetailInfoContainer.addChild(_l3RequestDate);
				
				var _l3CloseDate = new ContentPane({label: "L3 Closed Date:"});
				_l3CloseDate.set('content', _pmrData.l3CloseDate);
				this.pmrsDetailInfoContainer.addChild(_l3CloseDate);
				
				
				var _billTime = new ContentPane({label: "L3 Billable Time:"});
				_billTime.set('content', _pmrData.billTime);
				this.pmrsDetailInfoContainer.addChild(_billTime);
				
				
				var _l2Owner = new ContentPane({label: "L2 Owner:"});
				_l2Owner.set('content', _pmrData.productName);
				this.pmrsDetailInfoContainer.addChild(_l2Owner);
				
				
				var _apar = new ContentPane({label: "APAR:"});
				_apar.set('content', _pmrData.apar);				
				this.pmrsDetailInfoContainer.addChild(_apar);
				
				var status = _pmrData.pmrStatus;
				
				if(status!=undefined && status!=null && status!='') {
					var _l2CloseDate = new ContentPane({label: "L2 Closed Date::"});
					_l2CloseDate.set('content', _pmrData.l2CloseDate);
					this.pmrsDetailInfoContainer.addChild(_l2CloseDate);
				}
				
					
			},
			
			getViewId: function() {
				return 'PMR_DETAIL_VIEW_' + this.pmrNumber;
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
			}
			
	});
});