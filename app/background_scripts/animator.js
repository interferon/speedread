module.exports = (function() {

	var convertedElements = [];
	var delay = 240;
	var long_word_delay = 100;
	var wpm = 250;
	var reading_progress_counter = 0;
	var animation = null;
	var speed_delay_map = {
		"250" : 150,
		"300" : 120,
		"350" : 110,
		"400" : 100,
		"450" : 90,
		"500" : 90	
	};

	function calculateDelay(has_punctuation, long_word){
		var _delay = delay;
		if (has_punctuation || long_word){
			_delay = _delay + speed_delay_map[wpm];
		};
		if (long_word && has_punctuation) {
			_delay = _delay + speed_delay_map[wpm] + long_word_delay;
		};
		return _delay;
	}

	var publicMethods = {

		"setAnimationSpeed" : function (wpm){
			delay = (60/wpm)*1000;
			wpm = wpm;
		},
		"bindConvertedText" : function(text){
			convertedElements = text;
		},
		"stop" : function (){
			clearTimeout(animation);
			reading_progress_counter = 0;
			mediator.notify('animationFinished');
		},
		"pause" : function(){
			clearTimeout(animation);
		},
		"start" : function(){
			if (reading_progress_counter == convertedElements.length){
				this.stop();
			}
			else{
				var cE = convertedElements[reading_progress_counter];
				reading_progress_counter++;
				mediator.notify('wordProvided', {'element' : cE, 'progress' : reading_progress_counter});
				var animate = function(){
					publicMethods.start(convertedElements);
				}	
				animation = setTimeout(
					animate,
					calculateDelay(cE.punctuation_delay, cE.word.length > 12)
				);	
			}		
		}
	}

	return publicMethods;
})();