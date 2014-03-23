(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
module.exports  = (function () {
	
	var listeners = {
		'gotText' : {},
		'textConverted' : {},
		'wordProvided' : {},
		'animationStarted' : {},
		'animationStoped' : {},
		'animationSpeedChange' : {}
	}

	var events = {
		'gotText' : function(data){
			for(var key in listeners.gotText){
				var listener = listeners.gotText[key];
				listener.callback(data);
			}
		},
		'textConverted' : function(data) {
			for(var key in listeners.textConverted){
				var listener = listeners.textConverted[key];
				if (listener.name == 'ui')
					listener.callback(data.length);
				else
					listener.callback(data);
			}

		},
		'wordProvided' : function(data) {
			for(var key in listeners.wordProvided){
				var listener = listeners.wordProvided[key];
				listener.callback(data);
			}
		},
		'animationStarted' : function(){
			for(var key in listeners.animationStarted){
				var listener = listeners.animationStarted[key];
				listener.callback();
			}
		},
		'animationStoped' : function(){
			for(var key in listeners.animationStoped){
				var listener = listeners.animationStoped[key];
				listener.callback();
			}
		},
		'animationSpeedChange' : function(speed){
			for(var key in listeners.animationSpeedChange){
				var listener = listeners.animationSpeedChange[key];
				listener.callback(speed);
			}
		}
	}
	return {
		'bind' : function(event, listeners_arr){
			for (var i = 0; i < listeners_arr.length; i++) {
				listeners[event][listeners_arr[i].name] = listeners_arr[i];
			};
			
		},
		'trigger' : function(event, data){
			events[event](data);
		},
		'unbind' : function(event, listener_name){
			delete listeners[event][listener_name];
		}
	}

})(); 


},{}],3:[function(require,module,exports){
document.addEventListener('DOMContentLoaded', function(){
	
	var animator = require('./animator.js');
	var ui = require('./ui.js');
	var textGetter = require('./textGetter');
	var text_processor = require('./text_processor.js');
	var app = require('./app.js');

	ui.init(app);
	textGetter.init(app);
	text_processor.init(app);
	animator.init(app);

	app.bind('gotText', [{'name' : 'text_processor', 'callback' : text_processor.convertText}]);
	app.bind('textConverted', [{'name' : 'animator', 'callback' : animator.bindConvertedText },
		{'name' : 'ui', 'callback' : ui.setProgressBarLength}]);
	app.bind('wordProvided', [ {'name' : 'ui', 'callback' : ui.showWord}]);
	app.bind('animationStarted', [{'name' : 'animator', 'callback' : animator.start}]);
	app.bind('animationStoped', [{'name' : 'animator', 'callback' : animator.stop}]);
	app.bind('animationSpeedChange', [{'name' : 'animator', 'callback' : animator.setAnimationSpeed}]);

	textGetter.getUserSelectedText();
});

},{"./animator.js":1,"./app.js":2,"./textGetter":4,"./text_processor.js":5,"./ui.js":6}],4:[function(require,module,exports){
module.exports = (function(){
	
	var done = null;

	return {
		"init" : function(app){
			done = function(text){
				app.trigger('gotText', text);
			}	
		},
		"getUserSelectedText": function (){
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
								done(response.text);
							}
						}
					);
				}
			);
		}
	}
})();
},{}],5:[function(require,module,exports){
module.exports = (function(){
		
	var AverageLetterWidth = 18;
	var done = null;	

	function prepareText(selected_text){
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
			return preparedText;
		}

		function wordHasPunctuationSymbol (word){
			punctuation_symbols = word.match(/[\?\‒\!\,\)\;\:\'\"\.\(\*\{\}\[\]\]]/g);
			return punctuation_symbols != null;
		}

		function calculateLetterPositionToHighLight (word){
			textContainerWidth = AverageLetterWidth * word.length
			ORP_Offset = (textContainerWidth*0.265)+(0.5*AverageLetterWidth);
			positionToHighLight = (ORP_Offset/AverageLetterWidth);
			return Math.ceil(positionToHighLight);
		}

	return {
		"init" : function(app){
			done = function(convertText){
				app.trigger('textConverted', convertText);
			}	
		},
		"convertText" : function (text){
			prepared_text = prepareText(text);
			var convertedText,
				letterToHighlight,
				delayChangeForPunctuation = false;

			convertedText = [];
			for (var i = 0; i < prepared_text.length; i++){
				switch(prepared_text[i].length){
					case 1:
						letterToHighlight = 1;
						break;
					case 2: 
						letterToHighlight = 2;
						break;
					default :
						letterToHighlight = calculateLetterPositionToHighLight(prepared_text[i]);
						break;
				}
			
				convertedText.push({
					"letterToHighlight" : letterToHighlight,
					"word" : prepared_text[i],
					"punctuation_delay" : wordHasPunctuationSymbol(prepared_text[i])
				});
			}

			done(convertedText);					
		}
	}

})();

},{}],6:[function(require,module,exports){
module.exports = (function() {

	var step = 0;
	var app = null;


	return {
		"showWord" : function(data){
			getTextContainer().innerHTML = generateHighlightedWord(data.element.letterToHighlight, data.element.word);
			indentWord();
			showTextContainer();
			updateProgressBar(data.progress);
		},
		"init": function (_app){
			app = _app;
			showStartButton();
			setStartButtonEvent();
			setSpeedButtonsEvent();
		},
		"setProgressBarLength" : function(length){
			step = 100/length;
		}
	}

	function getTextContainer (){
		return document.getElementById('textContainer');
	}

	function getProgressBar(){
		return document.getElementById('reading_progress');
	}

	function getSmallbBarLength (){
		return document.getElementsByClassName("small_bar")[0].clientWidth;
	}

	function getStartButton (){
		return document.getElementById("start");
	}

	function getPauseButton (){
		return document.getElementById("pause");
	}

	function getHighlightedLetterLeftOffset (){
		return document.getElementsByClassName('highlight')[0].offsetLeft;
	}

	function getHighlightedLetterWidth (){
		return document.getElementsByClassName('highlight')[0].offsetWidth;
	}

	function getSelectedSpeedButton (){
		return document.getElementsByClassName('active')[0];
	}

	function setStartButtonEvent (){
		getStartButton().onclick = function(){
			app.trigger('animationStarted');
			transformAnimateButtonStateToPause();
			setPauseButtonEvent();
		}
	}

	function setPauseButtonEvent (){
		getPauseButton().onclick = function(){
			app.trigger('animationStoped');
			transformAnimateButtonStateToStart();
			setStartButtonEvent();
		}
	}

	function transformAnimateButtonStateToStart (){
		var button = getPauseButton();
		button.innerText = "Start!";
		button.id = "start";
	}

	function transformAnimateButtonStateToPause (){
		var button = getStartButton();
		button.innerText = "Pause";
		button.id = "pause";
	}

	function setProgressBarPercentage (percents){
		getProgressBar().style.width = percents+"%";
	}

	function hideTextContainer (){
		getTextContainer().style.visibility = 'visible';
	}

	function clearTextContainer (){
		getTextContainer().innerText = '';
	}

	function setTextContainerLeftPosition (position){
		getTextContainer().style.left = position + "px";
	}

	function showTextContainer (){
		getTextContainer().style.visibility='visible';
	}

	function showStartButton (){
		getStartButton().style.visibility = 'visible';
	}

	function setSpeedButtonState (speed_button, state){
		deactivateActiveButton();
		speed_button.className = speed_button.className + " " + state;
	}

	function setSpeedButtonsEvent (){
		var nodes = document.getElementsByClassName("btn-group")[0].children;
		for(var i = 0; i < nodes.length; i++){
			nodes[i].onclick = function(){
				app.trigger('animationSpeedChange', e.target.value);
			};
		}
	}

	function deactivateActiveButton (){
		var active_button = document.getElementsByClassName("active")[0];
		var classes = active_button.className.split(" ");
		active_button.className = classes[0]+" "+classes[1];
	}

	function updateProgressBar (iterator){
		if (iterator !== 0){
			setProgressBarPercentage((iterator+1) * step);
		}
		else{
			setProgressBarPercentage(0);			
		}
	}

	function indentWord (){
		var position = getSmallbBarLength() - (getHighlightedLetterLeftOffset()+(getHighlightedLetterWidth()/2)-3);
		setTextContainerLeftPosition(position);
	}

	function generateHighlightedWord  (highlightPosition, string){	
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
})();
},{}]},{},[3])