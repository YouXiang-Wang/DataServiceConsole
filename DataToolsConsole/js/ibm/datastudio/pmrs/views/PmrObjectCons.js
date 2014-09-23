define([
		"dojo/_base/declare",
		"dojo/_base/lang"
	], function(declare, lang) {
		/*
		var column = function(label, field){
			return {label: label, field: field}
		}
		*/
	
		var column = function(label, field){
			return {label: label, id: field}
		}
		
		
		var tableProperties = 
			[
		      column('PMR Number', 'pmrNumber'),
		      column('Component', 'l3Group'),
		      column('L3 Owner', 'l3Owner'),
		      column('Customer', 'customer'),
		      column('Version', 'version'),
		      column('Severity', 'severity'),
		      column('Priority', 'priority'),
		      column('PMR Status', 'pmrStatus'),
		      column('APAR', 'apar'),
		      column('Request Date', 'l3RequestDate'),
		      column('Close Date', 'l2CloseDate')
		      
		    ];
		
		/*
		var tableProperties = 
			[
		      column('PMR Number', 'pmrNumber'),
		      column('Component', 'l3Group'),
		      column('L3 Owner', 'l3Owner'),
		      column('Customer', 'customer'),
		      column('Version', 'openAgainst'),
		      column('Severity', 'severity'),
		      column('Priority', 'priority'),
		      column('PMR Status', 'pmrStatus'),
		      column('Request Date', 'l3RequestDate'),
		      column('Close Date', 'l3CloseDate'),
		      column('APAR', 'apar')
		    ];
		*/
		
		
		var events = {
				LOAD_DATA_READY: 'loadDataReady'
		}
		
		var requests = {
				REQ_DATA_OBJECT_MOCKUP: '/data/tables.json'
		}
		
		return {
			tableProperties: tableProperties,
			events: events,
			requests: requests
		}
	}
);