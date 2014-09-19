define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		'dojo/topic'
	], function(declare, lang, topic) {
		
		return {
			RESPONSE_ERROR: 'ERROR',
			
			RESPONSE_SUCCESS: 'SUCCESS',
			
			RESPONSE_INIT_VIEW_DATA_READY: 'initViewDataReady',
			
			VALIDATE_COMMAND: 'validateCommand',
			
			/**
			 * Event to execute the command directly.
			 */
			COMMAND_EXEC: 'COMMAND_EXEC',
			
			/**
			 * Event to update the command text in gcli.
			 */
			COMMAND_UPDATE: 'COMMAND_UPDATE',
			
			SYNC_UPDATE_SQL: 'syncUpdateSQL',
			
			REQUEST_TOASTER_MESSAGE_TOPIC: 'requestToasterMessageTopic',
			
			/**
			 * Welcome Model Events
			 */
			RESPONSE_SAVE_COMMAND_LINK_READY: 'saveCommandLinkReady',
			
			RESPONSE_LOAD_COMMAND_LINKS_READY: 'loadCommandLinksReady',
			
			EVENT_SHOW_COMMAND_SHORTCUT: 'eventShowCommandShortcut',
			
			EVENT_SHOW_COMMAND_HISTORY: 'eventShowCommandHistory',
			
			EVENT_SHOW_VOICE_DIALOG: 'eventShowVioceDialog',
			/**
			 * If parameter commandOptions is string, it means it is a command text;
			 * If parameter commandOptions is object, it will follow below spec.{
			 *		  hidden: true,
			 *		  typed: result.command
			 *	  } 
			 */
			executeCommand: function(commandOptions){
				topic.publish(this.COMMAND_EXEC, commandOptions);
			},
			
			updateCommand: function(commandOptions){
				topic.publish(this.COMMAND_UPDATE, commandOptions);
			},
			
			syncUpdateSQLEditor: function(sqlContent){
				topic.publish(this.SYNC_UPDATE_SQL, sqlContent);
			}
			
		}
	}
);