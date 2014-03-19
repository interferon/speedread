text_processor = {
		"fields" : {
			"AverageLetterWidth" : 18
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
			return preparedText;
		},

		"convertText" : function (text){
			prepared_text = this.prepareText(text);
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
						letterToHighlight = this.calculateLetterPositionToHighLight(prepared_text[i]);
						break;
				}
			
				convertedText.push({
					"letterToHighlight" : letterToHighlight,
					"word" : prepared_text[i],
					"punctuation_delay" : this.wordHasPunctuationSymbol(prepared_text[i])
				});
			}

			return convertedText;					
		},

		"wordHasPunctuationSymbol" : function(word){
			punctuation_symbols = word.match(/[\?\‒\!\,\)\;\:\'\"\.\(\*\{\}\[\]\]]/g);
			return punctuation_symbols != null;
		},

		"calculateLetterPositionToHighLight" : function(word){
			textContainerWidth = this.fields.AverageLetterWidth * word.length
			ORP_Offset = (textContainerWidth*0.265)+(0.5*this.fields.AverageLetterWidth);
			positionToHighLight = (ORP_Offset/this.fields.AverageLetterWidth);
			return Math.ceil(positionToHighLight);
		}
	};

module.exports = text_processor;