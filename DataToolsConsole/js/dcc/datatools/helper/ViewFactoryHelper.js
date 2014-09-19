define("dcc/datatools/helper/ViewFactoryHelper", [
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/connect",
		"dojo/_base/array",
		"dojo/Deferred",
	], function(declare, lang, connect, array, Deferred) {

		/**
		 * 
		 * @param options
		 * @returns Deferred Object, this can be sync return or async return to the client side.
		 */		
		function viewRender(options){
			var moduleName = options.module;
			var result = options.result;
			var deferred = new Deferred();
			require([moduleName], function(instanceClass){
				var view = new instanceClass({
					
				})
				deferred.resolve(view);
			})
			return deferred;
		};
		
		function optionParser(options){
			
		}
		
		return {
			viewRender: viewRender
		}
	}
);