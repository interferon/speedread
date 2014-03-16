var system = require('./system.js');
var controller = require('./controller.js');
var ui = require('./ui.js');

system.getUserSelectedText(
	function(selected_text){
		preparedText = system.prepareText(selected_text);
		ui.setStartButtonEvent(controller.start);
		ui.setSpeedButtonsEvent(controller.setSpeed);
		ui.showStartButton();
	}
);