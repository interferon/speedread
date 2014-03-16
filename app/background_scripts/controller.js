var animator = require('./animator.js');
var ui = require('./ui.js');
var system = require('./system.js');

controller = {
		"start" : function(){
			animator.startAnimation(system.fields.text);
			ui.transformAnimateButtonStateToPause();
			ui.setPauseButtonEvent(controller.pause);
		},
		"pause" : function(){
			animator.pauseAnimation();	
			ui.transformAnimateButtonStateToStart();
			ui.setStartButtonEvent(controller.start);		
		},
		"setSpeed" : function(e){
			ui.deactivateActiveButton();
			ui.switchSpeedButtonStateToActive(e.target);
			animator.pauseAnimation();
			animator.setAnimationSpeed(e.target.value);
			animator.startAnimation(system.fields.text);
			if (ui.getStartButton() !== null)
				ui.transformAnimateButtonStateToPause();
				ui.setPauseButtonEvent(controller.pause);
		}
	};

module.exports = controller;