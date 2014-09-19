define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/Evented"
], function(declare, lang, Evented){
	var contextInstance;
	
	var context = declare([Evented],{
		mockupRequest: true,
		
		agentType: 'desktop',
		
		/**
		 * The context path of the server runtime.
		 */
		contextPath: '/',
		
		/**
		 * The workspace to load during app startup.
		 */
		workspaceToLoad: null,
		realTimeSocketSupport: true,
		simpleViewDefinition: null

	});
	
	if(contextInstance == null){
		contextInstance = new context();
	}
	
	return contextInstance;
	
})