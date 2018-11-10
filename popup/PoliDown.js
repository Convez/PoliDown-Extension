/**
 * 
 */
function sendClear(){

	browser.runtime.sendMessage({
		command:"clearCourses"
	});
}
class ElementRow {
	constructor(lesson) {
		this.row = document.createElement("tr");
		this.checkBox = document.createElement("input");
		this.checkBox.type = "checkbox";
		if(lesson.willDownload)
			this.checkBox.checked = "checked";
		this.checkBox.disabled = lesson.disableDownload;
		this.checkBox.addEventListener("change",()=>{
			browser.runtime.sendMessage({
				command:"changeLesson",
				params:{
					course:course,
					lesson:lesson.name
				}
			});
		});
		this.nameTag = document.createElement("div");
		this.nameTag.class = "lessonName";
		this.nameTag.innerText = lesson.name;
		this.progressBar = document.createElement("progress");
		this.progressBar.max = 100;
		this.progressBar.value = parseFloat(lesson.percentage);
		this.downloadButton = document.createElement("input");
		this.downloadButton.type = "button";
		this.downloadButton.value = "Download";
		this.downloadButton.disabled = lesson.disableDownload;
		console.log(lesson);
		this.downloadButton.addEventListener("click",()=>{
			this.downloadButton.disabled=true;
			this.checkBox.disabled=true;

			browser.tabs.query({active:true}).then((tabs)=>{
				browser.tabs.sendMessage(tabs[0].id,{
					command:"fetchURL",
					params:{
						course:course,
						lesson:lesson.name,
						url: lesson.videoUrl
					}
				});
			});
		});
		this.cancelButton = document.createElement('input');
		this.cancelButton.type='button';
		this.cancelButton.value='Clear';
		this.draw = function () {
			let checkBoxCell = document.createElement("td");
			checkBoxCell.appendChild(this.checkBox);
			let nameTagCell = document.createElement("td");
			nameTagCell.appendChild(this.nameTag);
			let progressBarCell = document.createElement("td");
			progressBarCell.appendChild(this.progressBar);
			let downloadButtonCell = document.createElement("td");
			downloadButtonCell.appendChild(this.downloadButton);
			let cancelButtonCell= document.createElement('td');
			cancelButtonCell.appendChild(this.cancelButton);
			this.row.appendChild(checkBoxCell);
			this.row.appendChild(nameTagCell);
			this.row.appendChild(progressBarCell);
			this.row.appendChild(downloadButtonCell);
			this.row.appendChild(cancelButtonCell);
			return this.row;
		};
	}
}
function handleMessages(message){
	switch(message.command){
		case "printCourse":
			let table = document.querySelector("#downloadTable");
			course = message.params.name;
			message.params.lessons.forEach((lesson,key)=>{
					let row = new ElementRow(lesson);
					table.appendChild(row.draw());
				}
			);
			break;
	}
}
if(!window.hasRun){
	window.hasRun=true;
	browser.runtime.onMessage.addListener(handleMessages);
}
browser.tabs.query({active:true}).then((tabs)=>{
	browser.tabs.sendMessage(tabs[0].id,{command:"getTabCourse"});
});