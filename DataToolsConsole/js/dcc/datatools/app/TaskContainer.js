require([
			"dojo/ready",
            "dojo/on",
            "dijit/MenuItem",
            "dijit/layout/TabContainer",
            "dijit/layout/ContentPane",
            "dcc/datatools/app/task/TaskContentPane",
            "law/contractmanage/ContractManageTab",
            "dojo/_base/lang",
            "dojo/parser",
            ], function(ready, on, MenuItem, TabContainer, ContentPane, TaskContentPane, ContractManageTab, lang){

			 ready(function() {
				 var tabContainer = dijit.byId("taskContainer");
				 var menuCopBusiness = dijit.byId('menuCopBusiness');
				 var pmrManagement = dijit.byId('pmrManagement');
				 
				 on(pmrManagement, 'click', function(){
				 		var tab_cop_business= dijit.byId('tabCopBusiness');
					 		if(tab_cop_business==undefined || tab_cop_business==null) {
					 			
					 			var tabPane = new TaskContentPane({
									id:"tabCopBusiness",
									title: "PMRs",
									preload:false,
									style:{padding:"0px"},
									closable:true
							 });
							tabContainer.addChild(tabPane);
							tabContainer.selectChild(tabPane);
				 		}
					 });
				 
				 on(menuCopBusiness, 'click', function(){
			 		var tab_cop_business= dijit.byId('tabCopBusiness');
				 		if(tab_cop_business==undefined || tab_cop_business==null) {
				 			
				 			var tabPane = new TaskContentPane({
								id:"tabCopBusiness",
								title: "Task1",
								preload:false,
								style:{padding:"0px"},
								closable:true
						 });
						tabContainer.addChild(tabPane);
						tabContainer.selectChild(tabPane);
			 		}
				 });
				 
				 var menuContractManage = dijit.byId('menuContractManage');
				 on(menuContractManage, 'click', function(){
			 		var tabContractManage= dijit.byId('tabContractManage');
				 		if(tabContractManage==undefined || tabContractManage==null) {
				 			
				 			var tabPane = new ContractManageTab({
								id:"tabContractManage",
								title: "合同管理",
								style:{padding:"0px"},
								preload:false,
								closable:true
						 });
						tabContainer.addChild(tabPane);
						tabContainer.selectChild(tabPane);
			 		}
				 });
				 
				 
				 var menuReceptions = dijit.byId('menuReceptions');
				 on(menuReceptions, 'click', function(){
			 		var tabReceptions= dijit.byId('tabReceptions');
				 		if(tabReceptions==undefined || tabReceptions==null) {
				 			
				 			var tabPane = new ContentPane({
								id:"tabReceptions",
								title: "Receptions",
								href: "../mail/demo.html",
								preload:false,
								closable:true
						 });
						tabContainer.addChild(tabPane);
						tabContainer.selectChild(tabPane);
			 		}
				 });
			 });
            
        });