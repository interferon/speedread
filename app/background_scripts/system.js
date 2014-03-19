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