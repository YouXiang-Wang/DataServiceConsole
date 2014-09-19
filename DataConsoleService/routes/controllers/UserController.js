var nfs = require('node-fs');
var fs = require('fs');
var fileHelper = require('./FileHelper.js')();
var cons = require('./Cons');


var USER_FILE_PATH = cons.WORKSPACE_DEF_PATH + '/' + cons.USER_DEF_FILE_NAME;


function UserController(){
	var controllers = {
			
			getAllUserInfo: function(req, res){
				fileHelper.readConfigFile( USER_FILE_PATH, function(error, data){
					var users = JSON.parse(data.toString());
					for(var i = 0; i < users.length; i++){
						var item = users[i]
						if(item != null && item.pwd){
							item.pwd = cons.passwordReplace;
						}						
					}
					res.end(JSON.stringify(users).toString());
				})
			},
			
			addNewUser: function(req, res, queryData){
				var user = req.body;
				checkUserExists(user.userName, function(exists, users){
					if(exists){
						res.end(cons.errorDef('0002'));
					}else{
						users.push(user);
						fileHelper.writeConfigFileSync(USER_FILE_PATH, users);
						res.end(cons.resultResponse(true));
					}
				})
			},
			
			authUser: function(req, res, queryData){
				var body = req.body;
				var userName = body.userName;
				var password = body.pwd;
				getUserByName(userName, password, function(user){
					if(user){
						user.pwd = cons.passwordReplace;
						res.end(JSON.stringify(user));
					}else{
						res.end(cons.errorDef('0003'));
					}
				})
			},
			
			updateUser: function(req, res){
				var user = req.body;
				updateUserHandler(user, function(users){
					if(users != null && users.length > 0){
						fileHelper.writeConfigFileSync(USER_FILE_PATH, users);
						res.end(cons.resultResponse(true));
					}
				})
			},
			
			checkDefaultUserConfigFile: function(userDef)
			{
				var folderName = cons.WORKSPACE_DEF_PATH;
				var folderExists = fs.existsSync(folderName);
				if(folderExists == false){
					console.log('Folder ' + folderName + ' not existed, create the folder first.')
					nfs.mkdirSync(folderName, 0777, true)
				}
				var userPath = USER_FILE_PATH;
				var userFileExistes = fs.existsSync(userPath);
				if(userFileExistes == false)
				{
					console.log(' create user list file : ' + userPath + ' first.');
					fileHelper.writeConfigFileSync(userPath, userDef);
				}				
			}						
		}	
		return controllers;	
}

function updateUserHandler(user, callback){
	fileHelper.readConfigFile( USER_FILE_PATH, function(error, data){
		var users = JSON.parse(data.toString());
		for(var i = 0; i < users.length; i++){
			var item = users[i];
			if(item.userName == user.userName){
				users[i] = user;
				break;
			}
		}	
		callback(users);
	})	
}

function getUserByName(userName, password, callback)
{
	fileHelper.readConfigFile( USER_FILE_PATH, function(error, data){
		var users = JSON.parse(data.toString());
		var user = null;
		users.forEach(function(item, index){
			if(item.userName == userName && item.pwd == password){
				user = item;
			}
		})
		callback(user);
	})				
}

function checkUserExists(userName, callback){
	fileHelper.readConfigFile( USER_FILE_PATH, function(error, data){
		var users = JSON.parse(data.toString());
		var user = null;
		var userExists = false;
		users.forEach(function(item, index){
			if(item.userName == userName){
				userExists = true;
			}
		})
		callback(userExists, users);
	})		
}

module.exports = UserController;