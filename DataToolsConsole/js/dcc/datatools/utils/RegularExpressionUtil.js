define([
	"dojo/_base/lang",
	"dojo/regexp"
], function(lang, rexexp ) {
	
	var exports = {
			
	};
	
	var REG_EMPTY_STR = "";
	var REG_QUESTION_MAKR_STR = "?";
	var REG_DOT_STR = ".";
	var REG_ASTERISK_STR = "*";
	var REG_DOT_ASTERISK_STR = REG_DOT_STR + REG_ASTERISK_STR;
	var REG_DOT_QUESTION_STR = REG_DOT_STR + REG_QUESTION_MAKR_STR;
	
	var REG_MATCH_CASE_STR = "i";
	var REG_ESCAPE_STR = "\\"; 
	
	
	exports.scanEscapeString = function(simplePattern) {
		
		var length = simplePattern.length;
		var pattern = REG_EMPTY_STR;
		var j = 0;
		var k = 0;
		for(var i=0;i < length; i++) 
		{
			var ch = simplePattern.charAt( i );
			var temp = REG_EMPTY_STR;
			switch(ch)
			{
				case '*':
					j = 0;
					k = i;
					while ( k >= 1 )
					{
						var c = simplePattern.charAt( k - 1 );
						if ( c == '\\' )
						{
							j++;
						}
						else
						{
							break;
						}
						k--;
					}

					if ( (j & 1) != 0 )
					{
						// odd number
						temp = REG_ASTERISK_STR;
					}
					else
					{
						temp = REG_DOT_ASTERISK_STR;
					}

					break;

				case '?':
					j = 0;
					k = i;
					while ( k >= 1 )
					{
						var c = simplePattern.charAt( k - 1 );
						if ( c == '\\' )
						{
							j++;
						}
						else
						{
							break;
						}
						k--;
					}

					if ( (j & 1) != 0 )
					{
						// odd number
						temp = REG_QUESTION_MAKR_STR;

					}
					else
					{
						temp = REG_DOT_QUESTION_STR;
					}

					break;

				case '(':
					temp = REG_ESCAPE_STR + "(";
				break;
				
				case ')':
					temp = REG_ESCAPE_STR + ")";
				break;

				case '{':
					temp = REG_ESCAPE_STR + "{";
				break;

				case '}':
					temp = REG_ESCAPE_STR + "}";
				break;
				
				case '[':
					temp = REG_ESCAPE_STR + "[";
				break;
				
				case ']':
					temp = REG_ESCAPE_STR + "]";
				break;

				case '+':
					temp = REG_ESCAPE_STR + "+";
				break;

				case '^':
					temp = REG_ESCAPE_STR + "^";
				break;

				case '$':
					temp = REG_ESCAPE_STR + "$";
				break;
				
				case '|':
					temp = REG_ESCAPE_STR + "|";
				break;
				
				case '.':
					temp = REG_ESCAPE_STR + ".";
				break;
				
				default:
				temp = REG_EMPTY_STR + ch;
			}
			pattern +=temp;
		}
		
		return pattern;
	};

	
	exports.convertSimpleMatchRule = function(simpleString, isMatchCase){
		if ( simpleString == REG_EMPTY_STR )
		{
			return simpleString;
		}
		
		var strPattern = simpleString;
		strPattern = exports.scanEscapeString( strPattern );
		
		if( strPattern.substring(strPattern.length-REG_ASTERISK_STR.length)!=REG_ASTERISK_STR) {
			strPattern += REG_DOT_ASTERISK_STR;
		}
		
		if ( strPattern.substring( strPattern.length - (REG_ESCAPE_STR + REG_ASTERISK_STR).length)== REG_ESCAPE_STR + REG_ASTERISK_STR)
		{
			strPattern += REG_DOT_ASTERISK_STR;
		}
		
		return strPattern;
	};
	
	exports.compilePattern = function(/*String*/simpleString, /*boolean*/isMatchCase, /**/isForward){
		
		var pattern = exports.convertSimpleMatchRule(simpleString, isMatchCase);
		if(isForward) {
			pattern = '^' + pattern;
		}
		
		var reg;
		
		if(isMatchCase) {
			reg = new RegExp(pattern,"gm");
		} else {
			reg = new RegExp(pattern,"gmi");
		}
		
		return reg;
	};
	
	exports.match = function(objStr, reg){
		return reg.exec(objStr);
	};
	
	exports.format = function(){
		return "format";
	};
	
	return exports;
})