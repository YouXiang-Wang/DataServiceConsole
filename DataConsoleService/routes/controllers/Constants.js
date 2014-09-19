
var PASSWORD_STAR = '******';

var errorResponse = function(message, id, fault){
	return {
		type: 'error',
		errorId: id,
		message: message,
		fault: fault
	}
}

var errorDef = function(errorId, content){
	var errorDef = ERROR_DEF[errorId];
	var message;
	if(errorDef != null){
		message = errorDef.message;
	}
	if(content == null){
		content = ''
	}
	var errorObject = {
		type: 'error',
		errorId: errorId,
		message: message,
		content: content
	}
	return JSON.stringify(errorObject);
}

var resultResponse = function(content, message){
	var readyObject = {
		type: 'ready',
		message: message,
		result: content
	}	
	return JSON.stringify(readyObject);
}

exports.errorResponse = errorResponse;
exports.errorDef = errorDef;
exports.passwordReplace = PASSWORD_STAR;
exports.resultResponse = resultResponse;

var cwd = process.cwd();

var ERROR_DEF = {
	'0001': {message: '当前没有保存的工作空间，需要创建一个新的工作空间'},
	'0002': {message: '当前用户名已经存在，请选择不同的用户名。'},
	'0003': {message: '当前用户不存在，请检查用户名或者密码信息。'},
	'0004': {message: '当前命令发送失败'}
}


exports.WORKSPACE_DEF_PATH = cwd + '/lib/workspace/default'

exports.WORKSPACE_TEST_DEF_PATH = cwd + '/..' + '/lib/workspace/default'

exports.DISPLAY_UNIT_FILE_NAME = 'displayUnit.json';

exports.SIGNAL_UNIT_DEF_FILE_NAME = 'signalUnits.json';

exports.CONTROL_UNIT_DEF_FILE_NAME = 'controlUnits.json';

exports.USER_DEF_FILE_NAME = 'user.json';

/**
 * 默认的保存display unit type的文件。
 * 目前默认为4种。
 * 1024x768,1366x768,1400x1050,1920x1080
 */
exports.DISPLAY_UNIT_TYPE_FILE_NAME = 'displayUnitType.json';
exports.EDGE_BLENDING_UNIT_TYPE_FILE_NAME = 'blendingUnitType.json';
exports.WORKSPACE_SETTING_DIRECTORY = 'setting';
/**
 * 服务器启动以后的运行环境。
 */
exports.RUNTIME_CONFIG_FILE = cwd + '/rt.json';
exports.UPDATE = 'update';
exports.ERROR = ERROR_DEF;

