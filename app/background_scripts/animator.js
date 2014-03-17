var ui = require('./ui.js');
var system = require('./system.js');
var text_processor = require('./text_processor.js');
var controller = require('./controller.js');

animator = {
		"fields" : {
			"delay" : 240,
			"iterator" : 0,
			"animation" : null,
			"speed_delay_map" : {
				"250" : 150,
				"300" : 120,
				"350" : 110,
				"400" : 100,
				"450" : 90,
				"500" : 90	
			}
		},
		"setAnimationSpeed": function(speed){
			animator.fields.delay = (60/speed)*1000;
		},
		"stopAnimation" : function (){
			clearTimeout(animator.fields.animation);
			animator.fields.iterator = 0;
			ui.clearTextContainer();
			ui.updateProgressBar(0);
		},
		"pauseAnimation" : function(){
			clearTimeout(animator.fields.animation);
		},
		"clalculateDelay": function(has_punctuation, long_word){
			var delay = this.fields.delay;
			var long_word_delay = 100;
			if (has_punctuation || long_word){
				delay = delay + this.fields.speed_delay_map[ui.getSelectedSpeedButton().value];
			};
			if (long_word && has_punctuation) {
				delay = delay + this.fields.speed_delay_map[ui.getSelectedSpeedButton().value] + long_word_delay;
			};

			return delay;
		},
		"startAnimation" : function(selected_text){
			var convertedText = system.fields.convertedText || text_processor.convertTextForAnimation(selected_text);
			animate();
			function animate(){
				if (animator.fields.iterator == convertedText.length){
					animator.stopAnimation();
					ui.transformAnimateButtonStateToStart();
					ui.setStartButtonEvent(controller.start);

				}else{
					c = convertedText[animator.fields.iterator];	
					highLightFramePosition = ui.getSmallbBarLength();
					ui.getTextContainer().innerHTML = text_processor.generateHighlightedWordElement(c.letterToHighlight, c.word);
					text_processor.allignTextToHighLightFramePositionSnag();
					ui.showTextContainer();
					ui.updateProgressBar(animator.fields.iterator, convertedText.length);
					animator.fields.iterator++;
					animator.fields.animation = setTimeout(animate, animator.clalculateDelay(c.punctuation_delay, c.word.length > 12));
				}
			}		
		}
	};
module.exports = animator;