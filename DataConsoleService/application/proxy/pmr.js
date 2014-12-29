var models = require("../models");
var PmrInfo = models.PmrInfo;

exports.save = function (pmrInfo, callback) {
	var query = { pmrNumber: pmrInfo.pmrNumber };
	(function(query, pmrInfo_) {
		
		PmrInfo.findOne(query, function(err, _pmrInfo) {
		if (err) {
		    console.error(err);
		    return;
		} else {
			if(_pmrInfo==undefined) {
				pmrInfo_.save(function(err) {
					if (err) {
					    console.error(err);
					}
				});
			} else {
				var _pmr = {};
				_pmr.l3Owner = pmrInfo_.l3Owner;
				_pmr.productName = pmrInfo_.productName;
				_pmr.l2OpenDate = pmrInfo_.l2OpenDate;
				_pmr._l2OpenDate = pmrInfo_._l2OpenDate;
				_pmr.customer = pmrInfo_.customer;

				_pmr.severity = pmrInfo_.severity;
				_pmr.pmrStatus = pmrInfo_.pmrStatus;

				if(_pmr.pmrStatus==='C') {
					_pmr.l3CloseDate = pmrInfo_.l3CloseDate;
					_pmr._l3CloseDate = pmrInfo_._l3CloseDate;
				} else {
					_pmr._l3CloseDate = 0;
				}
				_pmr.scratchPad = pmrInfo_.scratchPad;
				_pmr.comments = pmrInfo_.comments;
				_pmr.pmrUrl = pmrInfo_.pmrUrl;
				
				console.log("pmrNumber=" + pmrInfo_.pmrNumber + ":" + "pmrStatus=" + pmrInfo_.pmrStatus + "\n");
				
				var options = {};
				PmrInfo.update(query, {$set: _pmr} , options, function(err, docs) {
					if (err) {
						console.error("Update error:" + err);
					}
				});
			}
		}
	});
	} (query, pmrInfo));
};

exports.insert = function (pmrInfo, callback) {
	pmrInfo.save(function(err) {
		if (err) {
		    console.error(err);
		    //try to update
		}
	});
};

exports.update = function (pmrInfo, callback) {
	var _pmrNumber = pmrInfo.pmrNumber;
};

exports.getPmrsByL3Owners = function (l3Owners, callback) {
  if (l3Owners.length === 0) {
    return callback(null, []);
  }
  PmrInfo.find({ 'l3Owner': { $in: l3Owners } }, callback);
};

//exports.getPmrsByGroup = function (groups, fields, options, callback) {
exports.getPmrsByGroup = function (groups, callback) {
	if (groups.length === 0) {
		return callback(null, []);
	}
	PmrInfo.find({ 'l3Group': { $in: groups } }, callback);
};


exports.getPmrByPMRNumber = function (pmrNumber, callback) {
	PmrInfo.findOne({'pmrNumber': pmrNumber}, callback);
};


exports.getPmrById = function (id, callback) {
	PmrInfo.findOne({_id: id}, callback);
};

exports.getPmrByStatus = function (statuses, callback) {
	PmrInfo.find({'pmrStatus': {'$in': statuses}}, callback);
};

exports.getPmrsByCondition = function (condition, fields, options, callback) {
	
	if (condition.length === 0) {
		return callback(null, []);
	}
	//PmrInfo.find(condition, fields, options, callback);
	PmrInfo.find(condition, fields, callback);
	
};
