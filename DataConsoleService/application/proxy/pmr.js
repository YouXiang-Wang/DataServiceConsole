var models = require("../models");
var PmrInfo = models.PmrInfo;

exports.insert = function (pmrInfo, callback) {
	
	pmrInfo.save(function(err) {
		  if (err) {
		    console.error(err);
		  }
		});
};

exports.getPmrsByL3Owners = function (l3Owners, callback) {
  if (l3Owners.length === 0) {
    return callback(null, []);
  }
  PmrInfo.find({ l3Owner: { $in: l3Owners } }, callback);
};

//exports.getPmrsByGroup = function (groups, fields, options, callback) {
exports.getPmrsByGroup = function (groups, callback) {
	if (groups.length === 0) {
		return callback(null, []);
	}
	PmrInfo.find({ l3Group: { $in: groups } }, callback);
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
	PmrInfo.find(condition, fields, options, callback);
};
