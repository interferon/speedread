module.exports  = (function () {
	
	var events_module = {};

	return {
		'bind' : function(event, listeners){
			events_module[event] = listeners;
		},
		'notify' : function(event, data){
			for (listener in events_module[event]){
				events_module[event][listener](data);
			}
		},
		'unbind' : function(event, listener){
			delete events_module[event][listener];
		}
	}

})(); 

