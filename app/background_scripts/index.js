document.addEventListener('DOMContentLoaded', function(){	
	
	mediator = require('./mediator.js');
	var textGetter = require('./textGetter.js');
	var animator = require('./animator.js');
	var ui = require('./ui.js');
	var text_processor = require('./text_processor.js');
	

	mediator.bind('app_opened', {'textGetter' : textGetter.getUserSelectedText});
	mediator.bind('gotText', {'text_processor' : text_processor.convertText});
	mediator.bind('textConverted', {'animator': animator.bindConvertedText, 'ui': ui.init});
	mediator.bind('wordProvided', {'ui' : ui.showWord});
	mediator.bind('animationStarted', {'animator': animator.start});
	mediator.bind('animationPaused', {'animator': animator.pause});
	mediator.bind('animationSpeedChange', {'animator' : animator.setAnimationSpeed});
	mediator.bind('animationFinished', {'ui' : ui.end});
	

	mediator.notify('index file','app_opened');
});
