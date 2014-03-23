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

			mediator.trigger('textConverted', convertedText);					
		}
	}

})();
