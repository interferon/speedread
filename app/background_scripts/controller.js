var animator = require('./animator.js');
var ui = require('./ui.js');
var system = require('./system.js');
var text_processor = require('./text_processor.js');

controller = {
		"start" : function(){
			convertedElements = text_processor.convertText(system.fields.text);
			system.convertedElements = convertedElements;
			ui.fields.progress_length = convertedElements.length;
			animator.startAnimation(
				convertedElements,
				function(convertedElement, progress){
					ui.showWord(
						convertedElement,
						progress,
						function(){
							ui.setStartButtonEvent(controller.start);
					});
				}
			);
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
			animator.setAnimationSpeed(e.target.value);
		}
	};

module.exports = controller;