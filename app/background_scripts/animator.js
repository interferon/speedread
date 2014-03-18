var ui = require('./ui.js');
var system = require('./system.js');
var text_processor = require('./text_processor.js');
var controller = require('./controller.js');

animator = {
		"fields" : {
			"delay" : 240,
			"long_word_delay" : 100,
			"wpm" : null,
			// +1 for every read word
			"reading_progress_counter" : 0,
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
		"setAnimationSpeed": function(wpm){
			animator.fields.delay = (60/wpm)*1000;
			animator.fields.wpm = wpm;
		},
		"stopAnimation" : function (){
			clearTimeout(animator.fields.animation);
			animator.fields.reading_progress_counter = 0;
			ui.clearTextContainer();
			ui.updateProgressBar(0);
		},
		"pauseAnimation" : function(){
			clearTimeout(animator.fields.animation);
		},
		"clalculateDelay": function(has_punctuation, long_word){
			var delay = this.fields.delay;
			if (has_punctuation || long_word){
				delay = delay + this.fields.speed_delay_map[animator.fields.wpm];
			};
			if (long_word && has_punctuation) {
				delay = delay + this.fields.speed_delay_map[animator.fields.wpm] + animator.fields.long_word_delay;
			};

			return delay;
		},
		"startAnimation" : function(selected_text){
			var convertedElements = system.fields.convertedElements || text_processor.convertTextForAnimation(selected_text);
			ui.fields.progress_length = convertedElements.length;
			animate();

			function animate(){
				if (animator.fields.reading_progress_counter == convertedElements.length){
					animator.stopAnimation();
					ui.transformAnimateButtonStateToStart();
					ui.setStartButtonEvent(controller.start);
				}else{
					var cE = convertedElements[animator.fields.reading_progress_counter];
					var generatedWord = text_processor.generateHighlightedWord(cE.letterToHighlight, cE.word)
					ui.showWord(generatedWord, animator.fields.reading_progress_counter);
					animator.fields.reading_progress_counter++;
					animator.fields.animation = setTimeout(animate, animator.clalculateDelay(cE.punctuation_delay, cE.word.length > 12));
				}
			}		
		}
	};
module.exports = animator;