var user = require('./model/user.js');

var displayFactory = require('./model/display.js')

console.dir(user)

var obj = {
	deviceID: 'ID For Test',
	type: 'Type for test',
	id: 'internal Id'
}
var displayUnitVO = displayFactory.displayUnitModel(obj)
console.dir(displayUnitVO)