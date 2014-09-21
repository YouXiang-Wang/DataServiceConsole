define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/date/locale",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		"dojo/text!./templates/PMROverviewToolbar.html",
		
		"dojo/on",
		"dojo/query",
		"dojo/_base/array",
		"dojo/data/ObjectStore",
		"dijit/form/ComboBox",
		"dijit/form/TextBox",
		"dijit/form/CheckBox",
		"dijit/form/Select",
		"dcc/datatools/widget/ClearTextBox"
		
	], function(declare, lang, DateLocale, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, viewTemplate, 
			on, query, array, ObjectStore) {

		return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
			
			EXECUTE_FILTER: 'executeFilter',
			
			OPEN_PMR_INFO: 'OPEN_PMR_INFO',

			
			templateString: viewTemplate,
			
			comboxWidth: '130px',
			
			searchInputWidth: '130px',
			
			optionStore: null,
			
			showRemove: false,
			
			showExecute: false,
			
			checkedStatus : [/*group*/1,1,1,   /*severity*/1,1,1,1,   
			                 /*priority*/1,1,1,1,    /*status*/1,1,1, 
			                 /*apar*/1,1, /*year*/1,1,1,1,
			                 /**/ 1,1,1,1 
			                 ],
			
			filterConditions: {
				groups : 7,  // 1 + 2 + 4
				severities : 15,  // 1 + 2 + 4 + 8
				priorities : 15,  // 1 + 2 + 4 + 8
				statuses : 7,  // 1 + 2 + 4
				apars : 3, // 1 + 2
				years : 15, // 1 + 2 + 4 + 8
				versions : 15, // 1 + 2 + 4 + 8
				datePeriodEnabled : false,
				beginDate : 2012-01-01,
				endDate : new Date(),
			},
			
			postCreate: function(){
				this.inherited(arguments);
				this.addEventsListener();
				
				this.pmrBeginDate.set('value', '2011-01-01');
				this.pmrBeginDate.set('disabled', true);
				this.pmrEndDate.set('value', new Date());
				this.pmrEndDate.set('disabled', true);
				
				this.queryValue.set('intermediateChanges', true);
				this.queryValue.set('placeHolder', "type in the value");

			},
			
			
			setDefault: function(value) {
				
				if(value!=null && value!='') {
					//var item = this.optionStore.get(value);
					//this.queryItemType.set('item', item);
					this.queryItemType.set('value', value);
				}
			},
			
			returnCheckedStatus: function(){
				
				for(var i = 0; i < 24 ; i++) {
					if(this.checkedStatus[i]==0) {
						return false;
					}
				}
				return true;
			},
			
			_formatDate: function(date){
				
				return DateLocale.format( date, {datePattern: "yyyy-MM-dd", selector: "date"});
				
			},
			
			_filterByDatePeriod: function(){
				
				var _begin = this._formatDate(this.pmrBeginDate.get('value'));
				if(_begin=='') {
					this.pmrBeginDate.set('value', '2011-01-01');
					_begin = '2011-01-01';
				}
				
				this.filterConditions.beginDate = _begin;
				
				var _end = this._formatDate(this.pmrEndDate.get('value'));
				if(_end=='') {
					this.pmrEndDate.set('value', new Date());
					_end = this._formatDate(new Date());
				}
				
				this.filterConditions.endDate = _end;
				
				this.cbYear2011.set('disabled', true);
				this.cbYear2012.set('disabled', true);
				this.cbYear2013.set('disabled', true);
				this.cbYear2014.set('disabled', true);
				this._executeFilter();
				
			},
			
			_selectAllConditions: function(checked, byClick){
				
				if(byClick==true) {
					this.cbAdmin.set('checked', checked);
					this.cbDeveloper.set('checked', checked);
					this.cbCore.set('checked', checked);
					this.cbSev1.set('checked', checked);
					this.cbSev2.set('checked', checked);
					this.cbSev3.set('checked', checked);
					this.cbSev4.set('checked', checked);
					
					this.cbPri1.set('checked', checked);
					this.cbPri2.set('checked', checked);
					this.cbPri3.set('checked', checked);
					this.cbPri4.set('checked', checked);
					
					this.cbOpened.set('checked', checked);
					this.cbClosed.set('checked', checked);
					this.cbPending.set('checked', checked);
					
					this.cbAPARYes.set('checked', checked);
					this.cbAPARNo.set('checked', checked);
					
					this.cbYear2011.set('checked', checked);
					this.cbYear2012.set('checked', checked);
					this.cbYear2013.set('checked', checked);
					this.cbYear2014.set('checked', checked);
				}
			},
			
			addEventsListener: function(){
				var _self = this;
				this.queryValue.on('keydown', function(evt){
					if(evt.keyCode == 13){
						_self._executeFilter();
					}
				});
				
				
				this.queryValue.on('change', function(newvalue){
					_self._executeFilter();
				});
				
				
				this.pmrBeginDate.on('keydown', function(evt){
					if(evt.keyCode == 13){ //beginDate
						_self._filterByDatePeriod();
					}
				});
				
				this.pmrEndDate.on('keydown', function(evt){
					if(evt.keyCode == 13){ 
						//End Date
						_self._filterByDatePeriod();
					}
				});
				
				
				this.cbDatePeriod.on('change', function(checked) {
					
					_self.cbYear2011.set('disabled', checked);
					_self.cbYear2012.set('disabled', checked);
					_self.cbYear2013.set('disabled', checked);
					_self.cbYear2014.set('disabled', checked);
					
					_self.pmrBeginDate.set('disabled', !checked);
					_self.pmrEndDate.set('disabled', !checked);
					
					_self.filterConditions.datePeriodEnabled = checked;
					
					if (checked == true ) {
						
						var _begin = _self.pmrBeginDate.displayedValue;
						var _end = _self.pmrEndDate.displayedValue;
						if(_begin=='' || _end =='') {
							return;
						}
						_self.filterConditions.beginDate = _begin;
						_self.filterConditions.endDate = _end;
					}
					
					_self._executeFilter();
					
				});

				this.queryItemType.on('change', function(evt) {
					var value = _self.queryValue.get('value');
					if(value!=undefined && value!=null && value!='') {
						_self._executeFilter();
					}
					
				});
				
				
				
				this.cbSelectAll.on('click', function(evt) {
					var checked = evt.currentTarget.checked;
					_self.cbSelectAll.onChange(checked, true);
				});

				/*
				this.pmr_filter1.on('click', function(evt) {
					_self._executeFilter();
				});
				*/
				
				/*
				this.pmr_cond_clear1.on('click', function(evt) {
					_self.queryValue.set('value', "");
					_self._executeFilter();
				});
				*/
				
				this.pmr_filter2.on('click', function(evt) {
					_self._filterByDatePeriod();
				});
				
				this.cbSelectAll.on('change', function(checked, byClick) {
					if(byClick==undefined || byClick==null || byClick=='') {
						_self._selectAllConditions(checked, false);
					} else {
						_self._selectAllConditions(checked, byClick);
					}
				});
				
				
				this.cbAdmin.on('change', function(checked) {
					checked == true ? _self.filterConditions.groups += 1 : _self.filterConditions.groups -= 1;
					checked == true? _self.checkedStatus[0] = 1 :  _self.checkedStatus[0] = 0;
					_self._executeFilter();
				});
				
				this.cbDeveloper.on('change', function(checked){
					checked == true ? _self.filterConditions.groups += 2 : _self.filterConditions.groups -= 2;
					checked == true? _self.checkedStatus[1] = 1 :  _self.checkedStatus[1] = 0;
					_self._executeFilter();
				});
				
				this.cbCore.on('change', function(checked){
					checked == true ? _self.filterConditions.groups += 4 : _self.filterConditions.groups -= 4;
					checked == true? _self.checkedStatus[2] = 1 :  _self.checkedStatus[2] = 0;
					_self._executeFilter();
				});
				
				this.cbSev1.on('change', function(checked){
					checked == true ? _self.filterConditions.severities += 1 : _self.filterConditions.severities -= 1;
					checked == true? _self.checkedStatus[3] = 1 :  _self.checkedStatus[3] = 0;
					_self._executeFilter();
				});
				
				this.cbSev2.on('change', function(checked){
					checked == true ? _self.filterConditions.severities += 2 : _self.filterConditions.severities -= 2;
					checked == true? _self.checkedStatus[4] = 1 :  _self.checkedStatus[4] = 0;
					_self._executeFilter();
				});
				
				this.cbSev3.on('change', function(checked){
					checked == true ? _self.filterConditions.severities += 4 : _self.filterConditions.severities -= 4;
					checked == true? _self.checkedStatus[5] = 1 :  _self.checkedStatus[5] = 0;
					_self._executeFilter();
				});
				
				this.cbSev4.on('change', function(checked){
					checked == true ? _self.filterConditions.severities += 8 : _self.filterConditions.severities -= 8;
					checked == true? _self.checkedStatus[6] = 1 :  _self.checkedStatus[6] = 0;
					_self._executeFilter();
				});
				
				
				this.cbPri1.on('change', function(checked){
					checked == true ? _self.filterConditions.priorities += 1 : _self.filterConditions.priorities -= 1;
					checked == true? _self.checkedStatus[7] = 1 :  _self.checkedStatus[7] = 0;
					_self._executeFilter();
				});
				
				this.cbPri2.on('change', function(checked){
					checked == true ? _self.filterConditions.priorities += 2 : _self.filterConditions.priorities -= 2;
					checked == true? _self.checkedStatus[8] = 1 :  _self.checkedStatus[8] = 0;
					_self._executeFilter();
				});
				
				this.cbPri3.on('change', function(checked){
					checked == true ? _self.filterConditions.priorities += 4 : _self.filterConditions.priorities -= 4;
					checked == true? _self.checkedStatus[9] = 1 :  _self.checkedStatus[9] = 0;
					_self._executeFilter();
				});
				
				this.cbPri4.on('change', function(checked){
					checked == true ? _self.filterConditions.priorities += 8 : _self.filterConditions.priorities -= 8;
					checked == true? _self.checkedStatus[10] = 1 :  _self.checkedStatus[10] = 0;
					_self._executeFilter();
				});
				
				
				this.cbOpened.on('change', function(checked){
					checked == true ? _self.filterConditions.statuses += 1 : _self.filterConditions.statuses -= 1;
					checked == true? _self.checkedStatus[11] = 1 :  _self.checkedStatus[11] = 0;
					_self._executeFilter();
				});
				
				this.cbClosed.on('change', function(checked){
					checked == true ? _self.filterConditions.statuses += 2 : _self.filterConditions.statuses -= 2;
					checked == true? _self.checkedStatus[12] = 1 :  _self.checkedStatus[12] = 0;
					_self._executeFilter();
				});
				
				this.cbPending.on('change', function(checked){
					checked == true ? _self.filterConditions.statuses += 4 : _self.filterConditions.statuses -= 4;
					checked == true? _self.checkedStatus[13] = 1 :  _self.checkedStatus[13] = 0;
					_self._executeFilter();
				});
				
				this.cbAPARYes.on('change', function(checked){
					checked == true ? _self.filterConditions.apars += 1 : _self.filterConditions.apars -= 1;
					checked == true? _self.checkedStatus[14] = 1 :  _self.checkedStatus[14] = 0;
					_self._executeFilter();
				});				
				
				this.cbAPARNo.on('change', function(checked){
					checked == true ? _self.filterConditions.apars += 2 : _self.filterConditions.apars -= 2;
					checked == true? _self.checkedStatus[15] = 1 :  _self.checkedStatus[15] = 0;
					_self._executeFilter();
				});
				
				this.cbYear2011.on('change', function(checked){
					checked == true ? _self.filterConditions.years += 1 : _self.filterConditions.years -= 1;
					checked == true? _self.checkedStatus[16] = 1 :  _self.checkedStatus[16] = 0;
					_self._executeFilter();
				});
				
				this.cbYear2012.on('change', function(checked){
					checked == true ? _self.filterConditions.years += 2 : _self.filterConditions.years -= 2;
					checked == true? _self.checkedStatus[17] = 1 :  _self.checkedStatus[17] = 0;
					_self._executeFilter();
				});
				
				this.cbYear2013.on('change', function(checked){
					checked == true ? _self.filterConditions.years += 4 : _self.filterConditions.years -= 4;
					checked == true? _self.checkedStatus[18] = 1 :  _self.checkedStatus[18] = 0;
					_self._executeFilter();
				});
				
				this.cbYear2014.on('change', function(checked){
					checked == true ? _self.filterConditions.years += 8 : _self.filterConditions.years -= 8;
					checked == true? _self.checkedStatus[19] = 1 :  _self.checkedStatus[19] = 0;
					_self._executeFilter();
				});
				
				this.cbDSVersion4100.on('change', function(checked){
					checked == true ? _self.filterConditions.versions += 1 : _self.filterConditions.versions -= 1;
					checked == true? _self.checkedStatus[20] = 1 :  _self.checkedStatus[20] = 0;
					_self._executeFilter();
				});
				
				
				this.cbDSVersion4101.on('change', function(checked){
					checked == true ? _self.filterConditions.versions += 2 : _self.filterConditions.versions -= 2;
					checked == true? _self.checkedStatus[21] = 1 :  _self.checkedStatus[21] = 0;
					_self._executeFilter();
				});
				
				
				this.cbDSVersion4110.on('change', function(checked){
					checked == true ? _self.filterConditions.versions += 4 : _self.filterConditions.versions -= 4;
					checked == true? _self.checkedStatus[22] = 1 :  _self.checkedStatus[22] = 0;
					_self._executeFilter();
				});
								
				this.cbDSVersionOthers.on('change', function(checked){
					checked == true ? _self.filterConditions.versions += 8 : _self.filterConditions.versions -= 8;
					checked == true? _self.checkedStatus[23] = 1 :  _self.checkedStatus[23] = 0;
					_self._executeFilter();
				});
				
				
				this.btn_EditPmr.on('click', function(evt) {
					_self._openPmrLocal();
				});
				
				this.btn_OpenPmrLocal.on('click', function(evt) {
					_self._openPmrLocal();
				});
				
				this.btn_OpenPmrRemote.on('click', function(evt) {
					_self._openPmrLocal();
				});				
			},
			
			setOptions: function(optionStore){
				//this.optionStore = new ObjectStore({objectStore: optionStore});
				this.optionStore = optionStore;
				if(this.queryItemType){
					this.queryItemType.set('store', optionStore);
				}
			},
			
			getQueryOption: function(){
				var queryKey = this.queryItemType.get('value');
				if(queryKey==undefined || queryKey==null || queryKey=='') {
					queryKey = 'pmrNumber';
				}
				var value = this.queryValue.get('value');
				var filterType = "=";
				var filterStr ='';
				if(queryKey != null && value != null ){
					if(queryKey != '' && value !='') {
						filterStr = this.getFilterString(queryKey, value, filterType);
					}
					return {key: queryKey,
							value: value,
							type: filterType,
							filterStr: filterStr,
							filterConditions: this.filterConditions};
				}
				return null;
			},
			
			/**
			 * Generate the filter condition according the column type.
			 * for number type, it should not add '', for the filter type for varchar, it will add the ''.
			 */
			getFilterString: function(columnName, value, filterType){
				var selectedItem = this.optionStore.query({id: columnName})[0];
				var columnType = selectedItem.columnType || 'VARCHAR';
				var filterCondition = value;
				if(!this.isNumberType(columnType)){
					filterCondition = "'" +  value + "'";
				}
				return columnName + " " + filterType + " " + filterCondition;
			},
			
			isNumberType: function(columnType){
				return columnType == 'SMALLINT' || columnType == 'INTEGER' || columnType == 'INT' 
					|| columnType == 'BIGINT' || columnType == 'DECIMAL' || columnType == 'NUMERIC' || columnType == 'DECFLOAT' || columnType == 'REAL';
			},
			
			_removeFilterItem: function() {
				this.destroy();
			},
			
			_enableDatePeriod : function() {
				
			},
			
			_executeFilter: function() {
				this.cbSelectAll.set('checked', this.returnCheckedStatus());
				on.emit(this.domNode, this.EXECUTE_FILTER, {
					dataOptions: this.getQueryOption(),
					bubbles: true,
				    cancelable: true
				});
			},
			
			_openPmrLocal: function() {
				on.emit(this.domNode, this.OPEN_PMR_INFO, {
					resourceType: "LOCAL",
					bubbles: true,
				    cancelable: true
				});
			},
			
			_filterComponent: function(){
				
				on.emit(this.domNode, this.EXECUTE_FILTER, {
					dataOptions: {key: key,
						value: value, 
						type: type, filterStr: filterStr,
						filterConditions: this.filterConditions},
					bubbles: true,
				    cancelable: true
				});
			},
			
	});
});