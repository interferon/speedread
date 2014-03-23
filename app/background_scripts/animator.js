module.exports = (function() {
	
	var display = null;
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

	function clalculateDelay(has_punctuation, long_word){
		var delay = delay;
		if (has_punctuation || long_word){
			delay = delay + speed_delay_map[wpm];
		};
		if (long_word && has_punctuation) {
			delay = delay + speed_delay_map[wpm] + long_word_delay;
		};
		return delay;
	}
	function setAnimationSpeed(wpm){
		delay = (60/wpm)*1000;
		wpm = wpm;
	}

	var publicMethods = {
		"init" : function(app){
			display = function(data){
				app.trigger('wordProvided', data);
			}
		},
		"bindConvertedText" : function(text){
			convertedElements = text;
		},
		"stop" : function (){
			clearTimeout(animation);
			reading_progress_counter = 0;
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
				display({'element' : cE, 'progress' : reading_progress_counter});
				var animate = function(){
					publicMethods.start(convertedElements);
				}.bind(this);	
				animation = setTimeout(
					animate,
					clalculateDelay(cE.punctuation_delay, cE.word.length > 12)
				);	
			}		
		}
	}

	return publicMethods;
})();