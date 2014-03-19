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