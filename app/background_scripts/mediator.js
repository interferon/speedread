module.exports  = (function () {
	
	window.events_module = {};

	
	var logger = {
			log_event_success : function(event, listener){
				console.log("Event **{"+event+"}** Fired on listener : **{"+listener+"}**");
			}, 
			log_event_fail: function(event){
				console.log("Event "+event+" failed to fire due to missing listener(s)");
			},
			log_notification : function(source, event){
				console.log("Module **{"+source+"}** trigger **{"+event+"}** event");
			}

		}

	return {
		'bind' : function(event, listeners){
			events_module[event] = listeners;
		},
		'notify' : function(source, event, data){
			logger.log_notification(source, event);
			if (events_module[event]){
				for (listener in events_module[event]){
					events_module[event][listener](data);
					logger.log_event_success(event, listener);				
				}
			}else{
				logger.log_event_fail(event);
			}
			
		},
		'unbind' : function(event, listener){
			delete events_module[event][listener];
		}
	}

})(); 

