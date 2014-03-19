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
	}
};

module.exports = system;