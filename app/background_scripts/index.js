document.addEventListener('DOMContentLoaded', function(){
	
	var animator = require('./animator.js');
	var ui = require('./ui.js');
	var textGetter = require('./textGetter');
	var text_processor = require('./text_processor.js');
	var app = require('./app.js');

	ui.init(app);
	textGetter.init(app);
	text_processor.init(app);
	animator.init(app);

	app.bind('gotText', [{'name' : 'text_processor', 'callback' : text_processor.convertText}]);
	app.bind('textConverted', [{'name' : 'animator', 'callback' : animator.bindConvertedText },
		{'name' : 'ui', 'callback' : ui.setProgressBarLength}]);
	app.bind('wordProvided', [ {'name' : 'ui', 'callback' : ui.showWord}]);
	app.bind('animationStarted', [{'name' : 'animator', 'callback' : animator.start}]);
	app.bind('animationPaused', [{'name' : 'animator', 'callback' : animator.pause}]);
	app.bind('animationSpeedChange', [{'name' : 'animator', 'callback' : animator.setAnimationSpeed}]);

	textGetter.getUserSelectedText();
});
