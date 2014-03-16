	var ui, system, animator, text_processor;

	ui = {

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
		"updateProgressBar" : function(iterator){
			if (iterator !== 0){
				var step = 100/convertedText.length;
				ui.setProgressBarPercentage((iterator+1) * step);
			}
			else{
				ui.setProgressBarPercentage(0);			
			}
		}
	};

	

	system = {
		"fields" : {
			"text" : null,
			"convertedText" : null
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
			var text = selected_text.trim().split(/\r\n|\r|\n|\s/g);
			for (var i = 0; i < text.length; i++) {
				if (text[i].length > 0){
					preparedText.push(text[i]);
				}
			};

			system.fields.text = preparedText;
		}
	};


	text_processor = {
		"allignTextToHighLightFramePositionSnag" : function(){
			var position = highLightFramePosition - (ui.getHighlightedLetterLeftOffset()+(ui.getHighlightedLetterWidth()/2)-3);
			ui.setTextContainerLeftPosition(position);
		},
		"convertTextForAnimation" : function (textToAnimate, delay){
			var convertedText,
				letterToHighlight,
				delayChangeForPunctuation = false;

			convertedText = [];
			for (var i = 0; i < textToAnimate.length; i++){
				switch(textToAnimate[i].length){
					case 1:
						letterToHighlight = 1;
						break;
					case 2: 
						letterToHighlight = 2;
						break;
					default :
						letterToHighlight = calculateLetterPositionToHighLight(textToAnimate[i]);
						break;
				}
			
				convertedText.push({
					"letterToHighlight" : letterToHighlight,
					"word" : textToAnimate[i],
					"punctuation_delay" : wordHasPunctuationSymbol(textToAnimate[i])
				});
			}

			system.fields.convertedText = convertedText;
			
			return convertedText;

			function wordHasPunctuationSymbol(word){
				return word.match(/[?\‒\!\,\)\;\:\'\"\.\(\*]/g);
			}

			function calculateLetterPositionToHighLight (word){
				ui.hideTextContainer();
				charactersQuantity = word.length;
				highlightedWordElement = text_processor.generateHighlightedWordElement(0, word);
				ui.getTextContainer().innerHTML = highlightedWordElement;	
				
				textContainerWidth = ui.getTextContainer().offsetWidth;
				AverageCharacterWidth = textContainerWidth/charactersQuantity;
				ORP_Offset = (textContainerWidth*0.265)+(0.5*AverageCharacterWidth);
				positionToHighLight = (ORP_Offset/AverageCharacterWidth);
				ui.clearTextContainer();
				return Math.ceil(positionToHighLight);

			}					
		},
		"generateHighlightedWordElement" : function (highlightPosition, string){	
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
		"clalculateDelay": function(punctuation_delay, word_length){
			var delay = this.fields.delay;
			if (punctuation_delay || word_length > 12){
				delay = delay + this.fields.speed_delay_map[ui.getSelectedSpeedButton().value];
			}
			return delay;
		},
		"startAnimation" : function(selected_text){
			convertedText = system.fields.convertedText || text_processor.convertTextForAnimation(selected_text); 
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
					ui.updateProgressBar(animator.fields.iterator);
					animator.fields.iterator++;
					animator.fields.animation = setTimeout(animate, animator.clalculateDelay(c.punctuation_delay, c.word.length));
				}
			}		
		}
	};

	controller = {
		"start" : function(){
			animator.startAnimation(system.fields.text);
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
			animator.pauseAnimation();
			animator.setAnimationSpeed(e.target.value);
			animator.startAnimation(system.fields.text);
			if (ui.getStartButton() !== null)
				ui.transformAnimateButtonStateToPause();
				ui.setPauseButtonEvent(controller.pause);
		}
	};

	system.getUserSelectedText(
		function(selected_text){
			preparedText = system.prepareText(selected_text);
			ui.setStartButtonEvent(controller.start);
			ui.setSpeedButtonsEvent(controller.setSpeed);
			ui.showStartButton();
		}
	);