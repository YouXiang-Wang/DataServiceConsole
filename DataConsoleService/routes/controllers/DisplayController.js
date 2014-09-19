var fs = require('fs');
var path = require('path');
var url = require('url');
var fileHelper = require('./FileHelper.js')();
var displayModelFactory = require('./model/display.js')
var consDef = require('./Cons.js');

var workspacePath = consDef.WORKSPACE_DEF_PATH + '/';
var DISPLAY_UNIT_FILE_PATH = workspacePath + consDef.DISPLAY_UNIT_FILE_NAME;
var SIGNAL_UNIT_FILE_PATH =  workspacePath + consDef.SIGNAL_UNIT_DEF_FILE_NAME;
var CONTROL_UNIT_FILE_PATH = workspacePath + consDef.CONTROL_UNIT_DEF_FILE_NAME;
var DISPLAY_UNIT_TYPE_FILE_PATH = workspacePath + consDef.DISPLAY_UNIT_TYPE_FILE_NAME;
var EDGE_BLENDING_UNIT_TYPE_FILE_PATH = workspacePath + consDef.EDGE_BLENDING_UNIT_TYPE_FILE_NAME;
var WORKSPACE_DIRECTORY = workspacePath + consDef.WORKSPACE_SETTING_DIRECTORY;


function DisplayController(){
	var controllers = {
		
		getAllDisplayUnits: function(req, res, queryData)
		{
			getDisplayUnit(true, false, function(result){
				res.end(JSON.stringify(result))
			})		
		},
		
		getAllSignalInfo: function(req, res, queryData){
			getSignalUnits(true, false, function(result){
				res.send(JSON.stringify(result))
			})			
		},
		
		getAllControlUnitInfo: function(req, res, queryData){
			getControlUnits(function(result){
				res.send(result)
			})			
		},
		
		getAllControlTypes: function(req, res, queryData){
			var result = [];
			res.send(JSON.stringify(result));
		},
		
		saveAllDisplayUnitConfigInfo: function(req, res, queryData){
			var body = req.body;
			console.log('Update Display Unit Config With New Setting...')
			if(body != null && body.length > 0){
				try{
					fileHelper.writeConfigFileSync(DISPLAY_UNIT_FILE_PATH, body);
					res.send(consDef.resultResponse(true))
					return;
				}catch(e){
					res.send(consDef.errorResponse(e))
					return;
				}
			}
			res.send(consDef.errorResponse(false))
			return;
		},
		
		saveDisplayGroupSetting: function(req, res){
			var body = req.body;
			if(body != null && body.length > 0){
				try{
//					fileHelper.writeConfigFileSync(DISPLAY_UNIT_FILE_PATH, body);
					res.send(consDef.resultResponse(true))
					return;
				}catch(e){
					res.send(consDef.errorResponse(e))
					return;
				}
			}else{
				res.send([])
				return;				
			}
		},
		
		saveSignalConfigInfo: function(req, res){
			var body = req.body;
			console.log('Update Singal Config Info With New Setting...')
			console.dir(body);
			if(body != null && body.length > 0){
				try{
					fileHelper.writeConfigFileSync(SIGNAL_UNIT_FILE_PATH, body);
					res.send(consDef.resultResponse(true))
					return;
				}catch(e){
					res.send(consDef.errorResponse(e))
					return;
				}
			}
			res.send(consDef.errorResponse(false))
			return;			
		},
		
		exportDisplayUnit: function(req, res){
			res.send([]);
		},
		
		/**
		 * 加载最新的工作区设置。
		 */
		loadLatestWorkspace: function(req, res){
			var files = loadWorkspaceSettingByUpdateTime(1);
			if(files.length > 0){
				var workspaceName = files[0];
				var workspace = loadWorkspaceSettingByName(workspaceName, function(data){
					res.send(data.toString());
				});				
			}else{
				res.send(consDef.errorDef('0001'));
			}
		},
		
		/**
		 * 按照工作空间名字装在工作空间配置。
		 */
		loadSavedWorkspaceSetting: function(req, res){
			var urlPart = url.parse(req.url, true);
			var query = urlPart.query;
			var workspaceName = query.workspaceName;
			var workspace = loadWorkspaceSettingByName(workspaceName, function(data){
				res.send(data.toString());
			});
		},
		
		loadSavedWorkspacesInfo: function(req, res){
			var urlPart = url.parse(req.url, true);
			var query = urlPart.query;
			var fileNo = query.fileNo;
			var results = loadWorkspaceSettingByUpdateTime(fileNo);
			res.send(results);			
		},
		
		saveAllWorkspaceInfo: function(req, res){
			console.log('saving workspace');
			var workspaceSetting = req.body;
			var fileName = workspaceSetting.name + '.json';
			var urlPart = url.parse(req.url, true);
			var query = urlPart.query;
			var action = query.action;	
			var filePath = path.normalize(WORKSPACE_DIRECTORY + '/' + fileName);
			var fileExists = false;
			if(action != consDef.UPDATE){
				fileExists = checkDuplicateWorkspaceName(filePath);
			}
			if(fileExists){
				res.send(consDef.errorResponse('当前输入的工作区名字' + workspaceSetting.name + '已经存在，请更换工作区名字。'))
				return;
			}else{
				try{
					fileHelper.writeConfigFileSync(filePath, workspaceSetting);
					res.send(consDef.resultResponse(true))
					console.log('保存工作区配置信息' + fileName + '完成.')
					return;
				}catch(e){
					res.send(consDef.errorResponse(e))
					return;
				}				
			}
			
		},
		
		getAllPredefinedDisplayUnit: function(req, res){
			readConfigFile(DISPLAY_UNIT_TYPE_FILE_PATH, function(result){
				res.end(result)
			})
		},
		
		getBlendingUnitType: function(req, res){
			console.log('reading edge blending Info')
			readConfigFile(EDGE_BLENDING_UNIT_TYPE_FILE_PATH, function(result){
				res.end(result)
			})
		},
		
		sendUDPCommandService: function(req, res){
			console.log('sendUDPCommandService')
			console.log(req.body)
			// res.end();
			readConfigFile(EDGE_BLENDING_UNIT_TYPE_FILE_PATH, function(result){
				res.end(result)
			})
			// try{
			// 		// fileHelper.writeConfigFileSync(filePath, workspaceSetting);
			// 		res.send(consDef.resultResponse(true))
			// 		// console.log('保存工作区配置信息' + fileName + '完成.')
			// 		return;
			// 	}catch(e){
			// 		res.send(consDef.errorResponse(e))
			// 		return;
			// 	}	
		}
		
	}	
	return controllers;
}

function loadWorkspaceSettingByUpdateTime(index){
	var fPath = WORKSPACE_DIRECTORY;
	var pathList = fs.readdirSync(fPath);
	var fileCompare = function(a , b){
		var fileA = fs.statSync(fPath + '/' + a);
		var fileB = fs.statSync(fPath + '/' + b);
		var fileAcTime = fileA.mtime;
		var fiieBcTime = fileB.mtime;
		if(fileAcTime > fiieBcTime){
			return -1
		}else{
			return 1;
		}
		return 0;
	}
	var sortedFileList = pathList.sort(fileCompare);	
	if(index){
		var files = [];
		var fileNumber = Math.min(index, sortedFileList.length);
		for(var i = 0; i < fileNumber; i++){
			files.push(pathList[i]);
		}
		return files;
	}else{
		return sortedFileList;
	}
}

function loadWorkspaceSettingByName(workspaceName, callback){
	if(workspaceName == null){
		var fileNames = loadWorkspaceSettingByUpdateTime(0);
		if(fileNames.length > 0){
			workspaceName = fileNames[0];
		}
	}
	var wbPath = WORKSPACE_DIRECTORY + "/" + workspaceName;
	fileHelper.readConfigFile( wbPath, function(error, data){
		if(error){
			callback(error.toString());
		}else{
			var workspaceSetting = JSON.parse(data.toString());
			
			var dWList = workspaceSetting.detalSignalWindowList;
			if(dWList != null){
				for(var i = 0; i < dWList.length; i++){
					var item = dWList[i];
					item.xmlData = null;
					item.cuts = null;
				}
			}
			var sWList = workspaceSetting.signalWindowList;
			if(sWList != null){
				for(var i = 0; i < sWList.length; i++){
					var item = sWList[i];
					item.xmlData = null;
					item.cuts = null;
				}				
			}
			
			callback(JSON.stringify(workspaceSetting));
		}
	})	
}

function checkDuplicateWorkspaceName(filePath){
	return fs.existsSync(filePath);
}

function getDisplayUnitType(){
	fileHelper.readConfigFile( CONTROL_UNIT_FILE_PATH, function(error, data){
		if(error){
			callback(error.toString());
		}else{
			callback(data.toString());
		}
	})	
}

function getDisplayUnit(allData, isConfiged, callback){
	fileHelper.readConfigFile( DISPLAY_UNIT_FILE_PATH, function(error, data){
		var result = [];
		var duList = JSON.parse(data.toString());
		for(var i = 0; i < duList.length; i++){
			var item = duList[i]
			if(allData == true){
				result.push(item)
			}else{
				if(item.configured == isConfiged){
					result.push(item)
				}				
			}
				
		}
		callback(result);
	})	
}

function getSignalUnits(allData, isConfiged, callback){
	fileHelper.readConfigFile( SIGNAL_UNIT_FILE_PATH, function(error, data){
		var result = [];
		var duList = JSON.parse(data.toString());
		for(var i = 0; i < duList.length; i++){
			var item = duList[i]
			if(allData == true){
				result.push(item)
			}else{
				if(item.configured == isConfiged){
					result.push(item)
				}				
			}
				
		}
		callback(result);
	})	
}

function getControlUnits(callback){
	readConfigFile(CONTROL_UNIT_FILE_PATH, callback);	
}

function readConfigFile(fileName, callback){
	fileHelper.readConfigFile(fileName, function(error, data){
		if(error){
			callback(error.toString());
		}else{
			callback(data.toString());
		}
	})	
}


var mockupFactory = {
		createMockupSignal: function(){
			 
		}
}

module.exports = DisplayController;