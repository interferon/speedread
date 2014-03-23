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
			app.trigger('animationStarted');
			transformAnimateButtonStateToPause();
			setPauseButtonEvent();
		}
	}

	function setPauseButtonEvent (){
		getPauseButton().onclick = function(){
			app.trigger('animationPaused');
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
				app.trigger('animationSpeedChange', event.target.value);
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