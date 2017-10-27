/**
 * 
 */

function ElementRow() {
	this.row = document.createElement("tr");
	this.checkBox = document.createElement("input");
	this.checkBox.type="checkbox";
	this.checkBox.checked="checked";
	this.nameTag = document.createElement("div");
	this.nameTag.class="lessonName";
	this.nameTag.innerText="Lezione 5";
	this.progressBar = document.createElement("progress");
	this.progressBar.max=100;
	this.progressBar.value=97;
	this.downloadButton = document.createElement("input");
	this.downloadButton.type="button";
	this.downloadButton.value="Download";
	this.draw = function(){
		checkBoxCell = document.createElement("td");
		checkBoxCell.appendChild(this.checkBox);
		nameTagCell = document.createElement("td");
		nameTagCell.appendChild(this.nameTag);
		progressBarCell = document.createElement("td");
		progressBarCell.appendChild(this.progressBar);
		downloadButtonCell = document.createElement("td");
		downloadButtonCell.appendChild(this.downloadButton);
		this.row.appendChild(checkBoxCell);
		this.row.appendChild(nameTagCell);
		this.row.appendChild(progressBarCell);
		this.row.appendChild(downloadButtonCell);
		return this.row;
	}
}
var cells = new Array();
for (var i=0;i<10;i++){
	var cell = new ElementRow();
	cells.push(cell);
	document.getElementById("downloadTable").appendChild(cell.draw());
}