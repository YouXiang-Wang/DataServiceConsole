define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dijit/layout/_LayoutWidget",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		'ibm/ds/share/cons/Cons',
		"dojo/text!./templates/WelcomeView.html",
		"dojo/dom-construct",
		'dojo/string',
		'dojo/on',
		'dijit/focus',
		'dojo/_base/array',
		'./WelcomeModel'
		/*
		"ibm/ds/share/widgets/LoadingWidget",
		"dojo/query", 
		"dojo/NodeList-traverse",
		'dijit/form/Button',
		'dijit/form/TextBox',
		'dijit/Dialog',
		'dojox/html/ellipsis',
		'ibm/ds/share/widgets/VoiceInput'
		*/
	], function(declare, lang, _LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, Cons, 
			viewTemplate, domConstruct, stringUtil, on, focusUtil, arrayUtil, WelcomeModel) {
	
		return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin], {
			templateString: viewTemplate,
			
			welcomeTagTemplate: '<div class="welcomeTagSection"><div class="commandLinkIcon ${iconClass}" title="${iconTooltip}" link-command="${commandText}"></div>' 
				+ '<div class="linkTextSection dojoxEllipsis" title="${commandText}">${linkText}</div></div>',
			
			constructor: function(){
				this.inherited(arguments)
				this.model = new WelcomeModel();
				this.registerEvents();
			},
			
			registerEvents: function(){
				var _self = this;
				this.subscribe(Cons.EVENT_SHOW_COMMAND_SHORTCUT, function(){
					_self.showAddLinkDialog();
				});
				this.subscribe(Cons.EVENT_SHOW_VOICE_DIALOG, function(){
					_self.showVoiceCommandDialog();
				});
				this.model.on(Cons.RESPONSE_SAVE_COMMAND_LINK_READY, lang.hitch(this, 'saveCommandLinkReadyHandler'));
				this.model.on(Cons.RESPONSE_LOAD_COMMAND_LINKS_READY, lang.hitch(this, 'loadCommandLinksReadyHandler'));
			},
			
			startup: function(){
				this.inherited(arguments);
				this.hideLoadingIndicator();
				this.addCommandDialog.startup();
				this.voiceCommandDialog.startup();
			},
			
			postCreate: function(){
				this.renderContent();
				var _self = this;
				var viBox = _self.voiceInputBox.domNode;
				if(viBox){
					on(viBox, _self.voiceInputBox.EVENT_VOICE_READY, function(evt){
						_self.hideVoiceCommandDialog();
					})
				}
			},
			
			resize: function(){
				this.inherited(arguments);
			},
			
			initViewDataReadyHandler: function(resultObj){
				this.hideLoadingIndicator();
			},
			
			hideLoadingIndicator: function(){
				if(this.loadingIndicator){
					this.loadingIndicator.hide();
				}				
			},
			
			renderContent: function(){
				this.model.loadCommandLinks();
			},
			
			renderCommandLink: function(itemDefinition, newAddCommand){
				var _self = this;
				if(itemDefinition == null){
					itemDefinition = {
							iconClass: 'addNewCommandLink', 
							iconTooltip : 'Add New Command Link',
							linkTextTooltip: 'Add New Command Link',
							linkText: 'Add Command Link',
							commandText: ''
					}	
				}else{
					this._preHandlerCommandLink(itemDefinition);
				}
				var html = stringUtil.substitute(this.welcomeTagTemplate, itemDefinition)
				var itemNode = domConstruct.toDom(html);
			    on(itemNode, on.selector('.commandLinkIcon', 'click'), function(evt){
			    	var commandText = evt.target.getAttribute('link-command');
			        if(commandText != null && commandText != ''){
			        	Cons.executeCommand(commandText);
			        }else{
			        	_self.showAddLinkDialog();
			        }	    	
			    });
			    if(newAddCommand){
			    	var len = this.welcomeContainer.children.length;
			    	var last = this.welcomeContainer.children[len - 1];
			    	domConstruct.place(itemNode, last, 'before');
			    }else{
			    	this.welcomeContainer.appendChild(itemNode);
			    }
								
			},
			
			_preHandlerCommandLink: function(modelDef){
				modelDef.iconTooltip = 'Click to execute command.'		
				modelDef.iconClass = 'defaultCommandLinkIcon'
			},
			
			showAddLinkDialog: function(){
				this.addCommandDialog.show();
				this.commandLinkText.focus();
			},
			
			hideAddLinkDailogHandler: function(){
				var domArray = ['commandLinkText', 'commandToExecuteText', 'commandLinkIcon', 'commandLinkDescription']
				this.addCommandDialog.hide();
			},
			
			addLinkItemDailogHandler: function(){
				var des = this.getInputValue('commandLinkDescription');
				var model = {
						linkText: this.getInputValue('commandLinkText'),
						commandText: this.getInputValue('commandToExecuteText'),
						iconClass: this.getInputValue('commandLinkIcon'),
						linkTextTooltip: des
				}
				this._preHandlerCommandLink(model);
				this.model.saveCommandLink(model);
			},
			
			loadCommandLinksReadyHandler: function(result){
				var _self = this;
				arrayUtil.forEach(result, function(item){
					_self.renderCommandLink(item);
				})
//				_self.renderCommandLink();
			},
			
			saveCommandLinkReadyHandler: function(result){
				this.renderCommandLink(result, true);
				this.hideAddLinkDailogHandler();
			},
			
			getInputValue: function(widgetInstanceName){
				return this[widgetInstanceName].get('value'); 
			},
			
			setInputAsNull: function(domArray){
				var _self = this;
				arrayUtil.forEach(domArray, function(item){
					_self[item].set('value', '');
				})
			},
			
			showVoiceCommandDialog: function(){
				this.voiceCommandDialog.show();
			},
			
			hideVoiceCommandDialog: function(){
				this.voiceCommandDialog.hide();
			}
		});
	}
);