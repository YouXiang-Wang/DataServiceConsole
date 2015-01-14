// number should less than 2 ^ 32
function getIntArrayByByte(number) {
	
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


function getIntArrayLog2ByByte(number) {
	var byteArray = getIntArrayByByte(number);
	var result = new Array();
	for(var i=0; i<byteArray.length; i++)
	{
		for(var j=0;j<32;j++) {
			if(Math.pow(2,j)==byteArray[i]) {
				result.push(j);
				break;
			}
		}
	}
	
	return result;
};


function hasAttr (object, attr) {
	var value = object[attr];
	if(value == undefined || value==null ) {
		return false;
	}
	return true;
};


function isEmptyValue(value) {
	if(value == undefined || value==null || value.trim()== '' ) return true;
	return false;
}

exports.getIntArrayByByte = getIntArrayByByte;
exports.getIntArrayLog2ByByte = getIntArrayLog2ByByte;
exports.hasAttr = hasAttr;
exports.isEmptyValue = isEmptyValue;
