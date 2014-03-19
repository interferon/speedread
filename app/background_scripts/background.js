(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ui = require('./ui.js');
var system = require('./system.js');
var text_processor = require('./text_processor.js');
var controller = require('./controller.js');

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
			animator.fields.delay = (60/wpm)*1000;
			animator.fields.wpm = wpm;
		},
		"stopAnimation" : function (){
			clearTimeout(animator.fields.animation);
			animator.fields.reading_progress_counter = 0;
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
		"startAnimation" : function(convertedElements, display){
			animate();
			function animate(){
				if (animator.fields.reading_progress_counter == convertedElements.length){
					animator.stopAnimation();
				}
				else{
					var cE = convertedElements[animator.fields.reading_progress_counter];
					animator.fields.reading_progress_counter++;
					display(
						cE,
						animator.fields.reading_progress_counter
					);
					animator.fields.animation = setTimeout(
						animate,
						animator.clalculateDelay(cE.punctuation_delay, cE.word.length > 12)
					);
				}
			}		
		}
	};

module.exports = animator;
},{"./controller.js":2,"./system.js":4,"./text_processor.js":5,"./ui.js":6}],2:[function(require,module,exports){
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
			animator.pauseAnimation();
			ui.deactivateActiveButton();
			ui.switchSpeedButtonStateToActive(e.target);
			animator.setAnimationSpeed(e.target.value);
			if (system.fields.convertedElements.length !== 0){
				animator.startAnimation(
					system.fields.convertedElements,
					function(convertedElement, progress){
						ui.showWord(convertedElement, progress);
					}
				);
			}
			if (ui.getStartButton() !== null)
				ui.transformAnimateButtonStateToPause();
				ui.setPauseButtonEvent(controller.pause);
		}
	};

module.exports = controller;
},{"./animator.js":1,"./system.js":4,"./text_processor.js":5,"./ui.js":6}],3:[function(require,module,exports){
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
},{"./controller.js":2,"./system.js":4,"./ui.js":6}],4:[function(require,module,exports){
system = {
	"fields" : {
		"text" : "",
		"convertedElements" : [],
		"progress_length" : 0 
	},
	"getUserSelectedText": function (cb){
		// Chrome API: 
		chrome.tabs.query(
			{
				active: true,
				currentWindow: true
			}, 
			function(tabs){
				chrome.tabs.sendMessage(
					tabs[0].id,
					{
						method: "getSelectedText"
					},
					function(response) {
						if (response.text.length > 10){
							cb(response.text);
						}
					}
				);
			}
		);
	},
	"prepareText" : function (selected_text){
		var preparedText = [];
		var splitted_text = splitTextIntoSeparateWords(selected_text)
		for (var i = 0; i < splitted_text.length; i++) {
			if (splitted_text[i].length > 0){
				preparedText.push(splitted_text[i]);
			}
		};

		function splitTextIntoSeparateWords(text){
			return text.trim().split(/\r\n|\r|\n|\s/g);
		}
		system.fields.text = preparedText;
	}
};

module.exports = system;
},{}],5:[function(require,module,exports){
text_processor = {
		"fields" : {
			"AverageLetterWidth" : 18
		},
		"convertText" : function (text){
			var convertedText,
				letterToHighlight,
				delayChangeForPunctuation = false;

			convertedText = [];
			for (var i = 0; i < text.length; i++){
				switch(text[i].length){
					case 1:
						letterToHighlight = 1;
						break;
					case 2: 
						letterToHighlight = 2;
						break;
					default :
						letterToHighlight = calculateLetterPositionToHighLight(text[i]);
						break;
				}
			
				convertedText.push({
					"letterToHighlight" : letterToHighlight,
					"word" : text[i],
					"punctuation_delay" : wordHasPunctuationSymbol(text[i])
				});
			}

			return convertedText;

			function wordHasPunctuationSymbol(word){
				punctuation_symbols = word.match(/[\?\‒\!\,\)\;\:\'\"\.\(\*\{\}\[\]\]]/g);
				return punctuation_symbols != null;
			}

			function calculateLetterPositionToHighLight (word){
				textContainerWidth = text_processor.fields.AverageLetterWidth * word.length
				ORP_Offset = (textContainerWidth*0.265)+(0.5*text_processor.fields.AverageLetterWidth);
				positionToHighLight = (ORP_Offset/text_processor.fields.AverageLetterWidth);
				return Math.ceil(positionToHighLight);
			}					
		}
	};

module.exports = text_processor;
},{}],6:[function(require,module,exports){
ui = {
	"fields" : {
		"progress_length" : 0,
	},
	"getTextContainer" : function(){
		return document.getElementById('textContainer');
	},
	"getProgressBar" : function(){
		return document.getElementById('reading_progress');
	},
	"getSmallbBarLength" : function(){
		return document.getElementsByClassName("small_bar")[0].clientWidth;
	},
	"getStartButton" : function(){
		return document.getElementById("start");
	},
	"getPauseButton" : function(){
		return document.getElementById("pause");
	},
	"getHighlightedLetterLeftOffset" : function(){
		return document.getElementsByClassName('highlight')[0].offsetLeft;
	},
	"getHighlightedLetterWidth" : function(){
		return document.getElementsByClassName('highlight')[0].offsetWidth;
	},
	"getSelectedSpeedButton" : function(){
		return document.getElementsByClassName('active')[0];
	},
	"setStartButtonEvent" : function(fn){
		this.getStartButton().onclick = fn;
	},
	"setPauseButtonEvent" : function(fn){
		this.getPauseButton().onclick = fn;
	},
	"transformAnimateButtonStateToStart" : function (){
		var button = ui.getPauseButton();
		button.innerText = "Start!";
		button.id = "start";
	},
	"transformAnimateButtonStateToPause" : function(){
		var button = ui.getStartButton();
		button.innerText = "Pause";
		button.id = "pause";
	},
	"setProgressBarPercentage" : function(percents){
		this.getProgressBar().style.width = percents+"%";
	},
	"hideTextContainer": function(){
		this.getTextContainer().style.visibility = 'visible';
	},
	"clearTextContainer" : function(){
		this.getTextContainer().innerText = '';
	},
	"setTextContainerLeftPosition" : function(position){
		this.getTextContainer().style.left = position + "px";
	},
	"showTextContainer" : function(){
		this.getTextContainer().style.visibility='visible';
	},
	"showStartButton" : function(){
		this.getStartButton().style.visibility = 'visible';
	},
	"switchSpeedButtonStateToActive" : function(speed_button){
		speed_button.className = speed_button.className + " active";
	},
	"setSpeedButtonsEvent" : function(handler){
		var nodes = document.getElementsByClassName("btn-group")[0].children;
		for(var i = 0; i < nodes.length; i++){
			nodes[i].onclick = handler;
		}
	},
	"deactivateActiveButton" : function(){
		var active_button = document.getElementsByClassName("active")[0];
		var classes = active_button.className.split(" ");
		active_button.className = classes[0]+" "+classes[1];
	},
	"updateProgressBar" : function(iterator, data_length){
		if (iterator !== 0){
			var step = 100/data_length;
			ui.setProgressBarPercentage((iterator+1) * step);
		}
		else{
			ui.setProgressBarPercentage(0);			
		}
	},
	"showWord" : function(element, progress, animation_end_cb){
		if (progress < ui.fields.progress_length){
			ui.getTextContainer().innerHTML = ui.generateHighlightedWord(element.letterToHighlight, element.word);
			ui.indentWord();
			ui.showTextContainer();
			ui.updateProgressBar(progress, ui.fields.progress_length);
		}
		else{
			ui.clearTextContainer();
			ui.updateProgressBar(0);
			ui.transformAnimateButtonStateToStart();
			animation_end_cb();
		}
	},
	"indentWord" : function(){
		var position = ui.getSmallbBarLength() - (ui.getHighlightedLetterLeftOffset()+(ui.getHighlightedLetterWidth()/2)-3);
		ui.setTextContainerLeftPosition(position);
	},
	"generateHighlightedWord" : function (highlightPosition, string){	
		var processedWord = "";	
		for (var i = 0; i < string.length; i++) {
			var cssClass = "";
			if (i == highlightPosition-1){
				cssClass = "highlight";
			}
			var label = "<label class='"+cssClass+"'>"+string[i]+"</label>";
			processedWord = processedWord + label;
		}
		return processedWord;
	}
};

module.exports = ui;
},{}]},{},[3])