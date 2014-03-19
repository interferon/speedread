var system = require('./system.js');
var controller = require('./controller.js');

system.getUserSelectedText(
	function(selected_text){
		system.fields.text = selected_text;
		controller.init(selected_text);
	}
);