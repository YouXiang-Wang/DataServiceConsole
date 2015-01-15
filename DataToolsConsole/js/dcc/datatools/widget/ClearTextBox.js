define("dcc/datatools/widget/ClearTextBox", [
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/on",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dojo/dom-class",
		"dijit/form/TextBox",
		"xstyle/css!./ClearTextBox/css/ClearTextBox.css"
		
		], function(declare, lang, on,  domConstruct, domStyle, domClass, TextBox){
		return declare([TextBox], {
			
			deleteText: "Delete",
			
			intermediateChanges: true,
			
			postCreate: function(){
				
				var _self = this;
				
				this.inherited(arguments);
				
				domClass.add(this.domNode, "dccClearTextBox");
				
				this.clearLink = domConstruct.create("a", {
					className: "dccClear"
				}, this.domNode, "first");
				
				// Fix the width
				var startWidth = domStyle.get(this.domNode, "width");
				var pad = domStyle.get(this.domNode,"paddingRight");
				
				domStyle.set(this.domNode, "width", (startWidth - pad) + "px");

				on(this.clearLink, "click", function() {
					_self.set("value", "");
					_self.focus();
				});
				
				on(this, "change", this.checkValue);
				
				this.checkValue();
				
			},
			
			checkValue: function(value) {
				domClass[(value != "" && value != undefined ? "remove" : "add")] (this.clearLink, "dijitHidden");
			}
		})
});