module.exports  = (function () {
	
	var listeners = {
		'gotText' : {},
		'textConverted' : {},
		'wordProvided' : {},
		'animationStarted' : {},
		'animationStoped' : {},
		'animationSpeedChange' : {}
	}

	var events = {
		'gotText' : function(data){
			for(var key in listeners.gotText){
				var listener = listeners.gotText[key];
				listener.callback(data);
			}
		},
		'textConverted' : function(data) {
			for(var key in listeners.textConverted){
				var listener = listeners.textConverted[key];
				if (listener.name == 'ui')
					listener.callback(data.length);
				else
					listener.callback(data);
			}

		},
		'wordProvided' : function(data) {
			for(var key in listeners.wordProvided){
				var listener = listeners.wordProvided[key];
				listener.callback(data);
			}
		},
		'animationStarted' : function(){
			for(var key in listeners.animationStarted){
				var listener = listeners.animationStarted[key];
				listener.callback();
			}
		},
		'animationStoped' : function(){
			for(var key in listeners.animationStoped){
				var listener = listeners.animationStoped[key];
				listener.callback();
			}
		},
		'animationSpeedChange' : function(speed){
			for(var key in listeners.animationSpeedChange){
				var listener = listeners.animationSpeedChange[key];
				listener.callback(speed);
			}
		}
	}
	return {
		'bind' : function(event, listeners_arr){
			for (var i = 0; i < listeners_arr.length; i++) {
				listeners[event][listeners_arr[i].name] = listeners_arr[i];
			};
			
		},
		'trigger' : function(event, data){
			events[event](data);
		},
		'unbind' : function(event, listener_name){
			delete listeners[event][listener_name];
		}
	}

})(); 

