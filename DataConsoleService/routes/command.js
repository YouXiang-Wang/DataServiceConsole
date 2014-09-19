
var Connection = require('../models/Connection');
var that = exports;

exports.executeCommand = function(req, res) {
	
	var cmd = req.params.command;
	cmd = cmd.toUpperCase();
	
	if(cmd == "LISTTABLE") {
		that.listTable(req, res);
	}
	else if(cmd == "SHOWTABLE") {
		that.showDetail(req, res);
	}
	else if(cmd == "EXECMD") {
		that.executeStoredProcedure(req, res);
	}
	else if(cmd == "EXECMD") {
		that.executeStoredProcedure(req, res);
	}
	else if(cmd == "QUERY") {
		that.executeQuery(req, res);
	}
	else {
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('Welcome to DB2 EOS Service Console!');
	}
};

exports.listTable = function(req, res) {
	
	// /cmd/listtable?type=u&schema=wangyoux
	// http://localhost:3100/cmd/listtable?type=u&schema=wangyoux
	var _basic_query = "SELECT TABSCHEMA, TABNAME, TYPE, REMARKS,  PARTITION_MODE, TBSPACE, INDEX_TBSPACE, LONG_TBSPACE,  DATACAPTURE, COMPRESSION, DROPRULE, VOLATILE, PARENTS, CHILDREN, ROWCOMPMODE, CREATE_TIME, ALTER_TIME, CONTROL, '' AS TABLEORG FROM SYSCAT.TABLES WHERE TYPE IN( 'T','S' )";
	var _table_scope = " OWNERTYPE IN( 'U','S' ) ";
	var _schema_filter = "";
	// table type
	var tableType=req.query.type;
	var schema=req.query.schema;
	
	if(schema!=null) {
		_schema_filter = " AND TABSCHEMA= '" + schema.toUpperCase() + "'";
	}
	if(tableType!=null) {
		console.log("type is[" + tableType + "]");
		
		if(tableType.toUpperCase() == 'S') {
		
			_table_scope = " OWNERTYPE IN( 'S' ) ";
			
		} else if(tableType.toUpperCase() == 'U') {
			
			_table_scope = " OWNERTYPE IN( 'U' ) ";	
			
		} else {
			
			_table_scope = " OWNERTYPE IN( 'U','S' ) ";
			
		}
		
	} else {
			_table_scope = " OWNERTYPE IN( 'U','S' ) ";
	}
	
	var db2_connection = Connection.getConnection(req);
	
	var a_query = _basic_query + ' AND ' + _table_scope + _schema_filter;
	
	a_query += ' ORDER BY TABSCHEMA, TABNAME FOR FETCH ONLY ';
	
	console.log("Query command is[" + a_query + "]");
	
	var result = db2_connection.executeQueryByResultsetSync(a_query);
	var json = result.fetch({'ReturnFormat':1});
	res.writeHead(200, {"Content-Type": "application/json"});
	res.end(json);
};

exports.showDetail = function(req, res) {
	
};

exports.executeStoredProcedure = function(req, res) {
	var commandSQL=req.query.command;
	console.log("commandSQL is:" + commandSQL);
	if(commandSQL!=null) {
		var db2_connection = Connection.getConnection(req);
		db2_connection.executeStoredProcedure(commandSQL);
	}
};

exports.executeQuery = function(req, res) {
	

	// http://localhost:3100/cmd/query?sql=SELECT * FROM T1
		
	var a_query=req.query.sql;
	
	if(a_query==null) {
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('There is no query SQL executed.');
		return;
	}
	
	var out_type=req.query.type;
	
	console.log("Query command is[" + a_query + "]");
	var db2_connection = Connection.getConnection(req);
	var result = db2_connection.executeQueryByResultsetSync(a_query);
	var json = result.fetch({'ReturnFormat':1});
	res.writeHead(200, {"Content-Type": "application/json"});
	res.end(json);
	
};