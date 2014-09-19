var builder = require('xmlbuilder');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var fs = require('fs');

const PANEL_DEF_XML = 'panelDef.xml';
const SIGNAL_DEF_XML = 'signalDef.xml';
const UNIT_DEF_XML = 'unitDef.xml';

exports.createPanelXML = createPanelXML;
exports.createUnitsXML = createUnitsXML;
exports.createSignalXML = createSignalXML;
exports.readPanelFile = readPanelFile;
exports.readUnitsFile = readUnitsFile;
exports.readSignalFile = readSignalFile;
exports.createUserDef = createUserDef;


function generateContentByObject(obj, root){
	for(var p in obj){
		var pValue = obj[p];
		if(typeof pValue === 'number' || typeof pValue === 'string' || typeof pValue === 'boolean'){
			root.ele(p).txt(pValue).up();
		}else if(typeof pValue == 'array' || pValue.length != 'undefined'){
			for(var i = 0; i < pValue.length; i++){
				var item = pValue[i];
				var innerItem = root.ele(p);
				generateContentByObject(item, innerItem);				
			}
		}else{
			var m = 0;
			for(var j in pValue){
				m++;
			}
			if(m > 0){
				var subNode = root.ele(p);
				generateContentByObject(pValue, subNode);	
			}
		}
	}	
}

function createUserDef(userDef, callback){
	var doc = builder.create();
	var root = doc.begin('users');
	generateContentByObject(userDef, root);
	console.log(doc.toString({pretty: true}));
}
/**
 * TODO replace the hard code with constant variable.
 * @param panel
 * @returns
 */
function createPanelXML(panel){
	var doc = builder.create();
	var root = doc.begin('panel');
	generateContentByObject(panel, root)

	persistentFileToDisk( '/workspace/panel/' + PANEL_DEF_XML, doc.toString({pretty: true}), function(error){
		console.log(error);
	})
}

/**
 * TODO replace the hard code with constant variable.
 * @param panel
 * @returns
 */
function createUnitsXML(unitsDef){
	var doc = builder.create();
	var root = doc.begin('unit');
	generateContentByObject(unitsDef, root)
	
	persistentFileToDisk( '/workspace/units/' + UNIT_DEF_XML, doc.toString({pretty: true}), function(error){
		if(error){
			console.log(error);
		}
	})
}

/**
 * TODO replace the hard code with constant variable.
 * @param panel
 * @returns
 */
function createSignalXML(signalDef){
	var doc = builder.create();
	var root = doc.begin('signal');
	generateContentByObject(signalDef, root)
	persistentFileToDisk( '/workspace/signal/' + SIGNAL_DEF_XML, doc.toString({pretty: true}), function(error){
		if(error){
			console.log(error);
		}
	})
}

function persistentFileToDisk(fileName, doc, callback){
	fs.writeFile(__dirname + '/' + fileName, doc.toString({pretty: true}), function(error){
		callback(error);
	})
}

function readPanelFile(callback){
	var fileName = __dirname + '/workspace/panel/' + PANEL_DEF_XML;
	fs.readFile(fileName, function(error, data){
		
		parser.parseString(data, function(pError, pData){
			console.dir(pData)
			callback(pError, pData);
		});
	})
}

function readUnitsFile(callback){
	fs.readFile(__dirname + '/workspace/units/' + UNIT_DEF_XML, function(error, data){
		parser.parseString(data, function(pError, pData){
			callback(pError, pData);
		});
	})
}

function readSignalFile(callback){
	fs.readFile(__dirname + '/workspace/signal/' + SIGNAL_DEF_XML, function(error, data){
		parser.parseString(data, function(pError, pData){
			callback(pError, pData);
		});
	})
}