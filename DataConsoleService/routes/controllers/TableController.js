var constant = require('./Constants');
var Connection = require('../../models/Connection');

function TableController(){
	
	var controllers = {
					
			listTables: function(req, res){
				
				// http://localhost:3100/table/listTables?type=u&schema=wangyoux
				
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
			},
			
			showDetail: function(req, res){
				
				// http://localhost:3100/table/showDetail?schema=wangyoux&name=T10
				
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
			},
			
			showData: function(req, res){
				
				// http://localhost:3100/table/showData?schema=wangyoux&name=T1
				var _basic_query = "SELECT * FROM ";
				var schema=req.query.schema;
				var name=req.query.name;
				var _schema_filter="";
				var tableName;
				if(name==null) {
					return;
				}
				
				if(schema!=null) {
					//_schema_filter = " AND TABSCHEMA= '" + schema.toUpperCase() + "'";
					tableName = schema + '.' + name;
				} else {
					tableName = name;
				}
				
				// WHERE TABNAME = 'T10' ORDER BY TABSCHEMA,TABNAME,COLNO FOR READ ONLY 
				var a_query = _basic_query + tableName + " FOR READ ONLY";
				console.log("Query command is[" + a_query + "]");
				
				var db2_connection = Connection.getConnection(req);
				var result = db2_connection.executeQueryByResultsetSync(a_query);
				var json = result.fetch({'ReturnFormat':1});
				res.writeHead(200, {"Content-Type": "application/json"});
				res.end(json);
			},
			
			addData: function(req, res){
				
				// http://localhost:3100/table/showData?schema=wangyoux&name=T1
				var _basic_query = "SELECT * FROM ";
				var schema=req.query.schema;
				var name=req.query.name;
				var _schema_filter="";
				var tableName;
				if(name==null) {
					return;
				}
				
				if(schema!=null) {
					//_schema_filter = " AND TABSCHEMA= '" + schema.toUpperCase() + "'";
					tableName = schema + '.' + name;
				} else {
					tableName = name;
				}
				
				// WHERE TABNAME = 'T10' ORDER BY TABSCHEMA,TABNAME,COLNO FOR READ ONLY 
				var a_query = _basic_query + tableName + " FOR READ ONLY";
				console.log("Query command is[" + a_query + "]");
				
				var db2_connection = Connection.getConnection(req);
				var result = db2_connection.executeQueryByResultsetSync(a_query);
				var json = result.fetch({'ReturnFormat':1});
				res.writeHead(200, {"Content-Type": "application/json"});
				res.end(json);
			}
			
		}
		return controllers;	
}

module.exports = TableController;