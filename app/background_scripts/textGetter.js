module.exports = (function(){
	
	var done = null;

	return {
		"init" : function(app){
			done = function(text){
				app.trigger('gotText', text);
			}	
		},
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
								done(response.text);
							}
						}
					);
				}
			);
		}
	}
})();