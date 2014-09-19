var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://192.168.0.108:27017/test');

mongoose.model('cats', { name: String });

var cat = mongoose.model("cats");

var kitty = new cat();
kitty.name = "xiang1dddd"; 

kitty.save(function (err) {
  if (err) {
    console.error(err);
  } else {
	  console.log("++++++++++++++++++++++++++++");  
  }
});

