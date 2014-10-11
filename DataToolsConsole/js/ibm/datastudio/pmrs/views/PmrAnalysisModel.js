define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/connect",
		"dojo/_base/array",
		"dojo/dom-construct",
		"dojo/_base/array",
		
		"dcc/datatools/common/BaseModel",
		"dcc/datatools/context/AppContext",
		"dcc/datatools/helper/DataConvertHelper",
		
		"../utils/PmrUtil",
		
	], function(declare, lang, connect, array, domConstruct, arrayUtil,
			BaseModel, AppContext,dataConvertHelper, PmrUtil ) {
	
	
	return declare("ibm/datastudio/pmrs/views/PmrAnalysisModel", [BaseModel], {
		
		
		constructor: function() {
			this.inherited(arguments);
			this.dataStore = null;
		},

		setDataStore: function(dataStore) {
			this.dataStore = dataStore;
		},
		
		_eanalyzeData: function(from, to) {
			var _data = this.dataStore.data;
	    	var _tmpGroup;
	    	var _len = _data.length;
	    	var _closedDate;
	    	var _requestedDate;
	    	var _l3Group;

	    	var _beginWeek = moment(from).week();
	    	var _endWeek = moment(to).week();
	    	var _weeks = _endWeek - _beginWeek + 1;
	    	var _dataItems = new Array();
	    	var _items = {};
	    	
	    	for(var i=0 ; i < _len; i++) {
	    		
	    		_l3Group = _data[i].l3Group;
	    		
	    		_requestedDate = _data[i]._l3RequestDate;
	    		var _year = moment(_requestedDate).get('year');
	    		var _month = moment(_requestedDate).get('month') + 1;
	    		var _day = moment(_requestedDate).get('date');
	    		
	    		var _tmpWeek = moment(_requestedDate).week();
	    		var _info;
	    		var _exist = false;
	    		
	    		_closedDate = _data[i]._l3CloseDate;
	    		var _tid = _year + '_' + _tmpWeek;
	    		if(_items[_l3Group + '_' + _tid] == undefined || _items[_l3Group + '_' + _tid] == null ) {
	    			_info = {
			    			id: _l3Group + '_' + _tid,
			    			groupName: _l3Group,
							week: _year + '-' + _tmpWeek,
							inflow : new Array(),
							inflowCount : 0,
							closed : new Array(),
							closedCount : 0,
							backlog : new Array(),
							backlogCount : 0
			    	}
	    			
	    			_items[_l3Group + '_' + _tid] = _info;
	    		}
	    		
	    		_info = _items[_l3Group + '_' + _tid];
	    		
	
	    		if(_requestedDate >= from ) {
	    			_info.inflow.push(_data[i]);
	    			_info.inflowCount++;
	    		}
	    		
	    		if(_closedDate==undefined || _closedDate == null || _closedDate == 0 || _closedDate < 0 ) {
	    			_info.backlog.push(_data[i]);
	    			_info.backlogCount++;
	    		}
	    		
	    		if(_closedDate >= from && _closedDate <= to) {
	    			_info.closed.push(_data[i]);
	    			_info.closedCount++;
	    		}
	    	}
	    	
	    	
	    	var _resultArray = new Array();
	    	var _index = 0;
	    	for(var _attr in _items) {
	    		if ( _items[_attr]!=undefined && typeof(_items[_attr]) != "function") {
	    			_resultArray[_index] = _items[_attr];
	    			_index ++;
	    		}
	    	}
			
			var _result = {
					identifier: "id",
					idAttribute:"groupName", 
					label: "week",
					items: _resultArray
			}
			
			return _result;

		},
		
		analyzeData: function(from, to) {
			
			var _data = this.dataStore.data;
			
	    	var _closedPmrs = new Array();
	    	var _newPmrs = new Array();
	    	var _backlogPmrs = new Array();
	    	
			var _groups = {};
	    	var _tmpGroup;
	    	
	    	var _len = _data.length;
	    	var _closedDate;
	    	var _requestedDate;
	    	
	    	var _l3Group;
	    	
    		var _year = moment(_requestedDate).get('year');
    		var _month = moment(_requestedDate).get('month') + 1;
    		var _day = moment(_requestedDate).get('date');
    		
	    	var _beginWeek = moment(from).week();
	    	var _endWeek = moment(to).week();
	    	
	    	var _beginYear = moment(from).get('year');
	    	var _endYear = moment(to).get('year');
	    	var _weeks;
	    	
	    	if(_beginYear == _endYear) {
	    		_weeks = _endWeek - _beginWeek + 1;
	    	} else {
	    		_weeks = (_endWeek - _beginWeek + 1) + 52;
	    	}
	    	
	    	for(var i=0 ; i < _len; i++) {
	    		_requestedDate = _data[i]._l3RequestDate;
	    		if(_requestedDate < from || _requestedDate > to ) {
	    			continue;
	    		}
	    		_l3Group = _data[i].l3Group;
	    		
	    		if(_groups[_l3Group] == undefined || _groups[_l3Group] == null || _groups[_l3Group] == '') {
	    			var _component = {
	    						groupName : _l3Group,
	    						abbrGroupName: PmrUtil.abbrL3Group(_l3Group),
	    						inflow : new Array(),
	    						inflowCount : new Array(_weeks),
	    						closed : new Array(),
	    						closedCount : new Array(_weeks),
	    						backlog : new Array(),
	    						backlogCount : new Array(_weeks),
	    					};
	    			
	    			for(var i=0; i < _weeks; i ++ ) {
	    				_component.inflowCount[i] = 0 ;
	    				_component.closedCount[i] = 0 ;
	    				_component.backlogCount[i] = 0 ;
	    			}
	    			_groups[_l3Group] = _component;
	    		}
	    		_closedDate = _data[i]._l3CloseDate;
	    		
	    		
	    		var _tmpWeek = moment(_requestedDate).week();
	    		var _a = _groups[_l3Group];
	    		
	    		if(_requestedDate >= from ) {
	    			_a.inflow.push(_data[i]);
	    			_a.inflowCount[_tmpWeek - _beginWeek]++;
	    		}
	    		
	    		if(_closedDate==undefined || _closedDate == null || _closedDate == 0) {
	    			_a.backlog.push(_data[i]);
	    			_a.backlogCount[_tmpWeek - _beginWeek]++;
	    		}
	    		
	    		if(_closedDate >= from && _closedDate <= to) {
	    			_a.closed.push(_data[i]);
	    			_a.closedCount[_tmpWeek - _beginWeek]++;
	    		}
	    		
	    	}
	    	
	    	var _resultArray = new Array();
	    	var _index = 0;
	    	for(var _attr in _groups) {
	    		if ( _groups[_attr]!=undefined && typeof(_groups[_attr]) != "function") {
	    			_resultArray[_index] = _groups[_attr];
	    			_index ++;
	    		}
	    	}
			
			var _result = {
					identifier: "groupName",
					idAttribute:"groupName", 
					label: "groupName",
					items: _resultArray
			}
			
			//return _result;
			return _groups;

		},
		
		_analyzeData: function(from, to) {
			
			var _data = this.dataStore.data;
			
	    	var _closedPmrs = new Array();
	    	var _newPmrs = new Array();
	    	var _backlogPmrs = new Array();
	    	
			var _groups = {};
	    	var _tmpGroup;
	    	
	    	var _len = _data.length;
	    	var _closedDate;
	    	var _requestedDate;
	    	
	    	var _l3Group;
	    	
	    	
	    	for(var i=0 ; i < _len; i++) {
	    		
	    		_l3Group = _data[i].l3Group;
	    		
	    		if(_groups[_l3Group] == undefined || _groups[_l3Group] == null || _groups[_l3Group] == '') {
	    			var _component = {
	    						groupName : _l3Group,
	    						data : new Array()
	    					};
	    			
	    			_groups[_l3Group] = _component;
	    		}
	    		_closedDate = _data[i]._l3CloseDate;
	    		
	    		_requestedDate = _data[i]._l3RequestDate;
	    		
	    		if(_requestedDate >= from ) {
	    			_newPmrs.push(_data[i]);
	    		}
	    		
	    		if(_closedDate==undefined || _closedDate == null || _closedDate == 0) {
	    			_backlogPmrs.push(_data[i]);
	    		}
	    		
	    		if(_closedDate >= from && _closedDate <= to) {
	    			_closedPmrs.push(_data[i]);
	    		}
	    		
	    		_groups[_l3Group].data.push(_data[i]);
	    	}
	    	
			return _groups;

		},
		
		dataWrapperForViewer: function(response){
			
			return {};
		}
		
	});
});