
var Connection = require('../models/Connection');
var that = exports;

exports.loadProperties = function(req, res) {
	
	var object_type = req.params.type;
	object_type = object_type.toUpperCase();
	
	if(object_type == "TABLE") {
		
		that.showTableProperty(req, res);
	}
	else if(object_type == "VIEW") {
		that.showViewProperty(req, res);
	}
	else if(object_type == "PROCEDURE") {
		that.showProcedureProperty(req, res);
	}
	else {
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('Welcome to DB2 EOS Service Console!');
	}
};

exports.listTable = function(req, res) {
	
	// /cmd/listtable?type=u&schema=wangyoux
	
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

exports.showTableProperty = function(req, res) {
	
	// /object/table?schema=wangyoux&name=T10
	// http://localhost:3100/object/table?schema=wangyoux&name=T10
	var _basic_query = "SELECT TABSCHEMA, TABNAME, COLNO, COLNAME, REMARKS, GENERATED, IDENTITY, NULLS, TYPESCHEMA, TYPENAME, LENGTH, SCALE, CODEPAGE, DEFAULT, TARGET_TYPESCHEMA, TARGET_TYPENAME, LOGGED, COMPACT, HIDDEN, INLINE_LENGTH,SECLABELNAME,ROWCHANGETIMESTAMP,ROWBEGIN,ROWEND,TRANSACTIONSTARTID FROM SYSCAT.COLUMNS ";
	var schema=req.query.schema;
	var name=req.query.name;
	var _schema_filter="";
	if(name==null) {
		return;
	}
	
	if(schema!=null) {
		_schema_filter = " AND TABSCHEMA= '" + schema.toUpperCase() + "'";
	}
	
	// WHERE TABNAME = 'T10' ORDER BY TABSCHEMA,TABNAME,COLNO FOR READ ONLY 
	var a_query = _basic_query + " WHERE TABNAME='" + name +"'" +  _schema_filter + " ORDER BY TABSCHEMA,TABNAME,COLNO FOR READ ONLY";
	console.log("Query command is[" + a_query + "]");
	
	var db2_connection = Connection.getConnection(req);
	var result = db2_connection.executeQueryByResultsetSync(a_query);
	var json = result.fetch({'ReturnFormat':1});
	res.writeHead(200, {"Content-Type": "application/json"});
	res.end(json);
	
};

exports.showViewProperty = function(req, res) {
	// /object/view?schema=wangyoux&name=T10
	// http://localhost:3100/object/view?schema=wangyoux&name=T10
	
	var _basic_query = "SELECT VIEWSCHEMA, VIEWNAME, VIEWCHECK, READONLY, VALID, TEXT, SUBSTR(PROPERTY,13,1) AS OPTIMIZEQUERY FROM SYSCAT.VIEWS V, SYSCAT.TABLES T WHERE T.TABNAME = V.VIEWNAME  AND T.TABSCHEMA = V.VIEWSCHEMA ";
	var schema=req.query.schema;
	var name=req.query.name;
	var _schema_filter="";
	if(name==null) {
		return;
	}
	
	if(schema!=null) {
		_schema_filter = " AND TABSCHEMA= '" + schema.toUpperCase() + "'";
	}
	
	
	var a_query = _basic_query + _schema_filter + " AND V.VIEWNAME= '" + name + "'" + " ORDER BY VIEWSCHEMA, VIEWNAME, SEQNO FOR FETCH ONLY";
	console.log("Query command is[" + a_query + "]");
	
	var db2_connection = Connection.getConnection(req);
	var result = db2_connection.executeQueryByResultsetSync(a_query);
	var json = result.fetch({'ReturnFormat':1});
	res.writeHead(200, {"Content-Type": "application/json"});
	res.end(json);
	
	
};

exports.showProcedureProperty = function(req, res) {
	
	// /object/procedure?schema=wangyoux&name=SP3
	// http://localhost:3100/object/procedure?schema=wangyoux&name=SP3
	
	//SELECT A.ROUTINESCHEMA, A.ROUTINENAME, A.SPECIFICNAME, A.TEXT, A.DEBUG_MODE,
	//B.PARMNAME, B.ROWTYPE, B.LOCATOR, B.TYPESCHEMA,   B.TYPENAME, B.LENGTH, B.SCALE, B.CODEPAGE, B.REMARKS,   B.TARGET_TYPESCHEMA, B.TARGET_TYPENAME, B.TYPEMODULENAME
	//FROM SYSCAT.ROUTINES A
	//LEFT JOIN SYSCAT.ROUTINEPARMS B
	//ON A.ROUTINESCHEMA = B.ROUTINESCHEMA
	//AND A.ROUTINENAME = B.ROUTINENAME
	//AND A.SPECIFICNAME = B.SPECIFICNAME
	//WHERE A.ROUTINENAME='SP3'
	//FOR FETCH ONLY
	
	// SELECT ROUTINESCHEMA, ROUTINENAME, SPECIFICNAME,   TEXT, DEBUG_MODE FROM SYSCAT.ROUTINES ORDER BY ROUTINESCHEMA, ROUTINENAME, SPECIFICNAME FOR FETCH ONLY
	// SELECT ROUTINESCHEMA, ROUTINENAME, SPECIFICNAME,   PARMNAME, ROWTYPE, LOCATOR, TYPESCHEMA,   TYPENAME, LENGTH, SCALE, CODEPAGE, REMARKS,   TARGET_TYPESCHEMA, TARGET_TYPENAME, TYPEMODULENAME  FROM SYSCAT.ROUTINEPARMS ORDER BY ROUTINESCHEMA, ROUTINENAME, SPECIFICNAME, ORDINAL FOR FETCH ONLY
	
	var _basic_query = "SELECT A.ROUTINESCHEMA, A.ROUTINENAME, A.SPECIFICNAME, A.TEXT, A.DEBUG_MODE, B.PARMNAME, B.ROWTYPE, B.LOCATOR, B.TYPESCHEMA,   B.TYPENAME, B.LENGTH, B.SCALE, B.CODEPAGE, B.REMARKS,   B.TARGET_TYPESCHEMA, B.TARGET_TYPENAME, B.TYPEMODULENAME FROM SYSCAT.ROUTINES A LEFT JOIN SYSCAT.ROUTINEPARMS B ON A.ROUTINESCHEMA = B.ROUTINESCHEMA AND A.ROUTINENAME = B.ROUTINENAME AND A.SPECIFICNAME = B.SPECIFICNAME";
	
	var schema=req.query.schema;
	var name=req.query.name;
	var _schema_filter="";
	
	if(name==null) {
		return;
	}
	
	if(schema!=null) {
		_schema_filter = " AND A.ROUTINESCHEMA= '" + schema.toUpperCase() + "'";
	}
	
	var a_query = _basic_query + " WHERE  A.ROUTINENAME= '" +name + "'" + _schema_filter + " FOR FETCH ONLY";
	console.log("Query command is[" + a_query + "]");
	
	var db2_connection = Connection.getConnection(req);
	var result = db2_connection.executeQueryByResultsetSync(a_query);
	var json = result.fetch({'ReturnFormat':1});
	res.writeHead(200, {"Content-Type": "application/json"});
	res.end(json);

};

exports.executeStoredProcedure = function(req, res) {
	var commandSQL=req.query.command;
	console.log("commandSQL is:" + commandSQL);
	if(commandSQL!=null) {
		var db2_connection = Connection.getConnection(req);
		db2_connection.executeStoredProcedure(commandSQL);
	}
};