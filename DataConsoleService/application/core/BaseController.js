function BaseController() {
	var _self = this;
	
	_self._req;
	_self._res;
	
	_self._resource;
	this.dispatchRequest = function(req, res) {
		_self._req = req;
		_self._res = res;
		var routerMap = GLOBAL_CONFIG.routerConfig ? GLOBAL_CONFIG.routerConfig : getRouterConf();
		
  };
  
	this.init = function(req, res){
		_self._req = req;
		_self._res = res;
	};
	
	this.init = function(req, res, resource){
		_self._req = req;
		_self._res = res;
		_self._resource = resource;
	};

	//display the html file
	this.displayHtml = function(htmlName){
		var file = Module.fs.readFileSync(VIEW + htmlName);
		_self._res.end(file);
	};
	
	//point out a JADE file
	this.displayJade = function(jadeName, json){
		_self._res.render(jadeName,json);
	};

	this.wrapData = function(req, res, data){
		
		_self._req = req;
		_self._res = res;
		
		var callback = _self._req.query.callback;
		
		if(callback!=undefined && callback!=null && callback!='') {
			// support JSONP
			_self._res.write(callback);
			_self._res.write('(');
		}
		
		_self._res.write(JSON.stringify(data));
		
		if(callback!=undefined && callback!=null && callback!='') {
			_self._res.write(')');
		}
	};

	this.returnResponse = function(resultResponse){
		_self._res.writeHead(200, {"Content-Type": "application/json"});
		_self._res.write(JSON.stringify(resultResponse));
		_self._res.end();
	};

	this.welcome = function(){
		_self._res.writeHead(200, {"Content-Type": "application/json"});
		_self._res.end('Welcome to Data Service Console!');
	};
	// return the JSON data
	this.returnError = function(code,msg,dataJson){
		_self._res.send({"code":code, "msg":msg, "data":dataJson});
	};
}

global.BaseController = BaseController;