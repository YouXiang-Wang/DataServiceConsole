var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var config = require('../../config');

var Pmrchema = new Schema({
  pmrNumber: { type: String},
  productName: { type: String},
  version: { type: String},
  defect: { type: String },
  fixedOn: { type: String },
  l2Owner: { type: String },
  l2OpenDate: { type: String },
  _l2OpenDate: { type: Number, },
  l2CloseDate: { type: String },
  _l2CloseDate: { type: Number, },
  apar: { type: String },
  l2Age: { type: Number },
  l2Sevdays: { type: Number },
  pmrStatus: { type: String },
  customer: { type: String},
  severity: { type: String },
  priority: { type: String },
  currentQueue: {type: String},
  openDays: { type: Number },
  l3Group: { type: String },
  l3Owner: { type: String },
  l3RequestDate: { type: String },
  _l3RequestDate: { type: Number, },
  l3CloseDate: { type: String },
  _l3CloseDate: { type: Number, },
  billTime: { type: String },
  l3Status: { type: String},
  comments: {type: String},
  scratchPad: {type: String},
  pmrUrl: {type: String},
  fileContent: {type: String}
},{collection: "pmrs"});


Pmrchema.index({pmrNumber: 1}, {unique: true});
Pmrchema.index({customer: 1});
Pmrchema.index({l3Owner: 1});
Pmrchema.index({pmrStatus: 1});
Pmrchema.index({_l3RequestDate: 1});
Pmrchema.index({_l3CloseDate: 1});

mongoose.model('PmrInfo', Pmrchema);
