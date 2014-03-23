document.addEventListener('DOMContentLoaded', function(){	
	
	app = require('./app.js');
	var textGetter = require('./textGetter.js');
	var animator = require('./animator.js');
	var ui = require('./ui.js');
	var text_processor = require('./text_processor.js');
	
	app.bind('gotText', [{'name' : 'text_processor', 'callback' : text_processor.convertText}]);
	app.bind('textConverted', [{'name' : 'animator', 'callback' : animator.bindConvertedText },
		{'name' : 'ui', 'callback' : ui.init}]);
	app.bind('wordProvided', [ {'name' : 'ui', 'callback' : ui.showWord}]);
	app.bind('animationStarted', [{'name' : 'animator', 'callback' : animator.start}]);
	app.bind('animationPaused', [{'name' : 'animator', 'callback' : animator.pause}]);
	app.bind('animationSpeedChange', [{'name' : 'animator', 'callback' : animator.setAnimationSpeed}]);
	app.bind('animationFinished', [{'name' : 'ui', 'callback' : ui.end}])

	textGetter.getUserSelectedText();
});
