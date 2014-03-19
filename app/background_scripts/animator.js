animator = {
		"fields" : {
			"delay" : 240,
			"long_word_delay" : 100,
			"wpm" : 250,
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
			this.fields.delay = (60/wpm)*1000;
			this.fields.wpm = wpm;
		},
		"stopAnimation" : function (){
			clearTimeout(this.fields.animation);
			this.fields.reading_progress_counter = 0;
		},
		"pauseAnimation" : function(){
			clearTimeout(this.fields.animation);
		},
		"clalculateDelay": function(has_punctuation, long_word){
			var delay = this.fields.delay;
			if (has_punctuation || long_word){
				delay = delay + this.fields.speed_delay_map[this.fields.wpm];
			};
			if (long_word && has_punctuation) {
				delay = delay + this.fields.speed_delay_map[this.fields.wpm] + this.fields.long_word_delay;
			};
			return delay;
		},
		"startAnimation" : function(convertedElements, display){

			if (this.fields.reading_progress_counter == convertedElements.length){
				this.stopAnimation();
			}
			else{
				var cE = convertedElements[this.fields.reading_progress_counter];
				this.fields.reading_progress_counter++;
				display(
					cE,
					this.fields.reading_progress_counter
				);	
				this.fields.animation = setTimeout(
					animate,
					animator.clalculateDelay(cE.punctuation_delay, cE.word.length > 12)
				);
				function animate(){
					animator.startAnimation(convertedElements, display);
				}	
			}		
		}
	};

module.exports = animator;