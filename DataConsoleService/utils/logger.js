  var winston = require('winston');

  var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({ filename: __dirname + '/log/tnet.log' })
    ],
    
    exceptionHandlers: [ new winston.transports.File({ 
    	filename:  __dirname + '/log/error.log',
    	timestamp: true,
	  	maxsize: 1024,
		maxFiles: 1    	
    })]    
  });

  exports.logger = logger;