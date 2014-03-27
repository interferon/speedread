(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
document.addEventListener('DOMContentLoaded', function(){	
	
	mediator = require('./mediator.js');
	var textGetter = require('./textGetter.js');
	var animator = require('./animator.js');
	var ui = require('./ui.js');
	var text_processor = require('./text_processor.js');
	
	mediator.bind('gotText', {'text_processor' : text_processor.convertText});
	mediator.bind('textConverted', {'animator': animator.bindConvertedText, 'ui': ui.init});
	mediator.bind('wordProvided', {'ui' : ui.showWord});
	mediator.bind('animationStarted', {'animator': animator.start});
	mediator.bind('animationPaused', {'animator': animator.pause});
	mediator.bind('animationSpeedChange', {'animator' : animator.setAnimationSpeed});
	mediator.bind('animationFinished', {'ui' : ui.end});

	textGetter.getUserSelectedText();
});
},{"./animator.js":1,"./mediator.js":3,"./textGetter.js":4,"./text_processor.js":5,"./ui.js":6}],3:[function(require,module,exports){
module.exports  = (function () {
	
	var events_module = {};

	return {
		'bind' : function(event, listeners){
			events_module[event] = listeners;
		},
		'notify' : function(event, data){
			console.log(event, data)
			for (listeners in events_module[event]){
				events_module[event][listeners](data);
			}
		},
		'unbind' : function(event, listener_name){
			delete events_module[event][listener_name];
		}
	}

})(); 


},{}],4:[function(require,module,exports){
module.exports = (function(){
	return {
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
								mediator.notify('gotText', response.text);
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

			mediator.notify('textConverted', convertedText);					
		}
	}

})();

},{}],6:[function(require,module,exports){
module.exports = (function() {

	var step = 0;

	return {
		"showWord" : function(data){
			getTextContainer().innerHTML = generateHighlightedWord(data.element.letterToHighlight, data.element.word);
			indentWord();
			showTextContainer();
			updateProgressBar(data.progress);
		},
		"init": function (data){
			step = 100/data.length;
			showStartButton();
			setStartButtonEvent();
			setSpeedButtonsEvent();
		},
		"end" : function(){
			updateProgressBar(0);
			clearTextContainer();
			transformAnimateButtonStateToStart();
			setStartButtonEvent();
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
			mediator.notify('animationStarted');
			transformAnimateButtonStateToPause();
			setPauseButtonEvent();
		}
	}

	function setPauseButtonEvent (){
		getPauseButton().onclick = function(){
			mediator.notify('animationPaused');
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
			nodes[i].onclick = function(event){
				deactivateActiveButton();
				makeSelectedSpeedButtonActive(event.target);
				mediator.notify('animationSpeedChange', event.target.value);
			};
		}
	}

	function makeSelectedSpeedButtonActive(button){
		button.className = button.className + " active";
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
},{}]},{},[2])