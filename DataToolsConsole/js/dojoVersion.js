
function dojoScriptImport(path, beforeID,attrs) {
	try{
		var attrStr = "";
		for (attr in attrs) {
			var attrVal = attrs[attr];
			if (attrVal.indexOf('"') >= 0) {
				attrStr = attrStr + " " + attr + "='" + attrs[attr] + "'";
			} else {
				attrStr = attrStr + " " + attr + '="' + attrs[attr] + '"';
			}
		}
		var importStatement = "<script type='text/javascript' src='js/dojo/dojo.js'></script>";
		document.write(importStatement);
	} catch (e) {
		var headNode = document.getElementsByTagName("head")[0];
		var scriptNode = document.createElement("script");
		var placeHolder = null;
		if (beforeID) {
			placeHolder = document.getElementById(beforeID);
		}
		scriptNode.type = "text/javascript";
		scriptNode.src  = path.replace("@dojopath@", currentDojoVersion.path);
		scriptNode.onload = function () { };
		
		if (placeHolder) {
			headNode.insertBefore(scriptNode, placeHolder);
		} else {
			headNode.appendChild(scriptNode);
		}
	}
}
