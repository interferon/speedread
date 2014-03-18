ui = {
	"fields" : {
		"progress_length" : 0,
	},
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
	"updateProgressBar" : function(iterator, data_length){
		if (iterator !== 0){
			var step = 100/data_length;
			ui.setProgressBarPercentage((iterator+1) * step);
		}
		else{
			ui.setProgressBarPercentage(0);			
		}
	},
	"showWord" : function(html, progress){
		ui.getTextContainer().innerHTML = html;
		ui.indentWord();
		ui.showTextContainer();
		ui.updateProgressBar(progress, ui.fields.progress_length);
	},
	"indentWord" : function(){
			var position = ui.getSmallbBarLength() - (ui.getHighlightedLetterLeftOffset()+(ui.getHighlightedLetterWidth()/2)-3);
			ui.setTextContainerLeftPosition(position);
	}
};

module.exports = ui;