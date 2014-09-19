define([
		"dojo/_base/declare",
		"dojo/_base/lang",   
        "dojo/_base/connect",
        'dcc/datatools/shared/cons/cons',
        'dcc/datatools/context/AppContext'], 
	function(declare, lang, connect, Cons, AppContext){
	
		function getSocketHref(){
			var localHref = location.href;
			var portIndex = localHref.lastIndexOf(':')
			var urlWithoutPort = localHref.substring(0,portIndex);
			return urlWithoutPort + ":3000/";
		}
		
		var socket;
		
		var socketReady = false;
		
		var controller = {
				sendCommand: function(commandDef){
					if(socketReady){
						socket.emit('command', commandDef);
					}				
				},
				sendBroadcastCommand: function(commandDef){
					if(socketReady){
						socket.emit('command_broadcast', commandDef);
					}						
				},
				
				syncUpdateSQLEditor: function(sqlContent){
					if(socketReady){
						socket.emit('sql_editor_broadcast', sqlContent);
					}					
				}
		}		
		
		if(AppContext.realTimeSocketSupport && typeof io != "undefined"){
			var socketURL = getSocketHref();
			console.log('getSocketHref() ' + getSocketHref());
			socket = io.connect(socketURL);	

			socketReady = true;
			
			socket.on('commandreadycallback', function(data){
				console.log(data);
			});
			
			socket.on('remotecommandinvoke', function(commmandToRun){
				cons.executeCommand(commmandToRun);
			});
			
			socket.on('syncupdatesqleditor', function(sqlContent){
				cons.syncUpdateSQLEditor(sqlContent);
			})			
		}

		return controller;
});