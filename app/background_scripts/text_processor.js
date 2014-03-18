var ui = require('./ui.js');
var system = require('./system.js');


text_processor = {
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
				return word.match(/[\?\‒\!\,\)\;\:\'\"\.\(\*\{\}\[\]\]]/g);
			}

			function calculateLetterPositionToHighLight (word){
				ui.hideTextContainer();
				charactersQuantity = word.length;
				highlightedWordElement = text_processor.generateHighlightedWord(0, word);
				ui.getTextContainer().innerHTML = highlightedWordElement;	
				
				textContainerWidth = ui.getTextContainer().offsetWidth;
				AverageCharacterWidth = textContainerWidth/charactersQuantity;
				ORP_Offset = (textContainerWidth*0.265)+(0.5*AverageCharacterWidth);
				positionToHighLight = (ORP_Offset/AverageCharacterWidth);
				ui.clearTextContainer();
				return Math.ceil(positionToHighLight);

			}					
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

module.exports = text_processor;