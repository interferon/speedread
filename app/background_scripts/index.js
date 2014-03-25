document.addEventListener('DOMContentLoaded', function(){	
	
	mediator = require('./mediator.js');
	var textGetter = require('./textGetter.js');
	var animator = require('./animator.js');
	var ui = require('./ui.js');
	var text_processor = require('./text_processor.js');
	
	mediator.bind('gotText', [{'name' : 'text_processor', 'callback' : text_processor.convertText}]);
	mediator.bind('textConverted', [{'name' : 'animator', 'callback' : animator.bindConvertedText },
		{'name' : 'ui', 'callback' : ui.init}]);
	mediator.bind('wordProvided', [ {'name' : 'ui', 'callback' : ui.showWord}]);
	mediator.bind('animationStarted', [{'name' : 'animator', 'callback' : animator.start}]);
	mediator.bind('animationPaused', [{'name' : 'animator', 'callback' : animator.pause}]);
	mediator.bind('animationSpeedChange', [{'name' : 'animator', 'callback' : animator.setAnimationSpeed}]);
	mediator.bind('animationFinished', [{'name' : 'ui', 'callback' : ui.end}])

	textGetter.getUserSelectedText();
});