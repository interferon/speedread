
	chrome.runtime.onMessage.addListener(
	  function(request, sender, sendResponse) {
	    if (request.method === "getSelectedText") {
				sendResponse({text: getSelectedText()});
				unselectText();
			}
	  });


	function getSelectedText(){
		return window.getSelection().toString();
	}

	function unselectText(){
		document.execCommand("Unselect");
	}


