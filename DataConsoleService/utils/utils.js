	// number should less than 2 ^ 32
exports.getIntArrayByByte = function(number) {
	
	var result = new Array();
	var tmp;
	
	if(number==0)
	{
		result[0]=0;
		return result;
	}
	var _max = Math.sqrt(number + 1);
	
	for(var i=0; i<_max; i++)
	{
		tmp = 1 << i;
		if((number & tmp ) == tmp)
		{
			result.push(tmp);
		}
	}
	
	return result;
};

exports.hasAttr = function(object, attr) {
	var value = object[attr];
	if(value == undefined || value==null ) {
		return false;
	}
	return true;
};

exports.isEmptyValue = function(value) {
	if(value == undefined || value==null || value.trim() == '' ) return true;
	return false;
}
		
