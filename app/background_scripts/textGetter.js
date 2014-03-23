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
								mediator.trigger('gotText', response.text);
							}
						}
					);
				}
			);
		}
	}
})();