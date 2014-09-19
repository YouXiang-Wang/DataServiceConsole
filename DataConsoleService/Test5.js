var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost:27017/test');


var BlogSchema = new Schema({
   user_id        : {type : Number, index : true}
  ,username       : {type : String}
}, { collection: 'blog' } );

mongoose.model("Blog", BlogSchema);

var Blog = mongoose.model("Blog");

var blog1 = new Blog();
blog1.user_id = 10;
blog1.username="xIANG";

blog1.save(function(err) {
  if (err) {
    console.log('save failed');
  }
  console.log('save success');
});

/*
Blog.find({id:4},function(err,docs){
     console.log(docs);
});

Blog.remove({id:4},function(err,docs){
     console.log(docs);
});
*/

Blog.update({user_id:10,username:"ulii"},function(err,docs){
     console.log(docs);
});


