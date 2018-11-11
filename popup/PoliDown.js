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
		this.row.classList.add("lessonRow");
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
		this.progressBar.className="";
		this.progressBar.classList.add(lesson.state);
		this.downloadButton = document.createElement("input");
		this.downloadButton.type = "button";
		this.downloadButton.value = "Download";
		if(lesson.state === "in_progress"){
			this.downloadButton.value = "Cancel";
			this.downloadButton.onclick = (event)=>{
				cancelDownload(lesson);
			}
		}else{
			if(lesson.state === "complete"){
				this.downloadButton.value="Show";
				this.downloadButton.onclick = ()=>{
					showDownload(lesson);
				}
			}else{
				// this.downloadButton.disabled = lesson.disableDownload;
				this.downloadButton.onclick =()=>{
					startDownload(lesson);
				};
			}
		}
		
		this.draw = function () {
			let checkBoxCell = document.createElement("td");
			checkBoxCell.appendChild(this.checkBox);
			let nameTagCell = document.createElement("td");
			nameTagCell.appendChild(this.nameTag);
			let progressBarCell = document.createElement("td");
			progressBarCell.appendChild(this.progressBar);
			let downloadButtonCell = document.createElement("td");
			downloadButtonCell.appendChild(this.downloadButton);
			this.row.appendChild(checkBoxCell);
			this.row.appendChild(nameTagCell);
			this.row.appendChild(progressBarCell);
			this.row.appendChild(downloadButtonCell);
			return this.row;
		};
	}
}
let rows = new Map();
function startDownload(lesson){
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
}
function cancelDownload(lesson){
	browser.runtime.sendMessage({
		command:"cancelDownload",
		params:lesson
	});
}

function showDownload(lesson){
	browser.runtime.sendMessage({
		command:"showDownload",
		params:lesson
	})
}
function downloadAll(course){
	browser.runtime.sendMessage({
		command:"downloadAll",
		params:course
	});
}
function cancelAll(course){
	browser.runtime.sendMessage({
		command:"cancelAll",
		params:course
	})
}
function handleMessages(message){
	switch(message.command){
		case "printCourse":
			let table = document.querySelector("#downloadTable");
			course = message.params.name;
			let someDownloads = false;
			message.params.lessons.forEach((lesson,key)=>{
					if (someDownloads === false)
						someDownloads = lesson.downloadId === "in_progress";
					let row = new ElementRow(lesson);
					rows.set(lesson.name,row);
					table.appendChild(row.draw());
				}
			);
			let allDown = document.querySelector("#downloadAll");
			if(!someDownloads){
				allDown.value = "Download all selected";
				allDown.onclick=()=>{downloadAll(course)};
			}else{
				allDown.value = "Cancel all downloads";
				allDown.onclick=()=>{cancelAll(course)};
			}
			break;
		case "updateCourse":
			course = message.params.name;
			let sDown = false;
			message.params.lessons.forEach((lesson,key)=>{
				if (sDown === false)
					sDown = lesson.state === "in_progress";
				let row = rows.get(lesson.name);
				row.progressBar.className = "";
				row.progressBar.classList.add(lesson.state);
				row.progressBar.value = Math.floor(parseFloat(lesson.percentage));
				
				if(lesson.willDownload)
					row.checkBox.checked = "checked";
				row.checkBox.disabled = lesson.disableDownload;
				row.downloadButton.value="Download";
				if(lesson.state === "in_progress"){
					row.downloadButton.value = "Cancel";
					row.downloadButton.onclick = ()=>{
						cancelDownload(lesson);
					}
				}else{
					if(lesson.state === "complete"){
						row.downloadButton.value="Show";
						row.downloadButton.onclick = ()=>{
							showDownload(lesson);
						}
					}else{
						// this.downloadButton.disabled = lesson.disableDownload;
						row.downloadButton.onclick =()=>{
							startDownload(lesson);
						};
					}
				}

			});

			let aDown = document.querySelector("#downloadAll");
			if(!sDown){
				aDown.value = "Download all selected";
				aDown.onclick=()=>{downloadAll(course)};
			}else{
				aDown.value = "Cancel all downloads";
				aDown.onclick=()=>{cancelAll(course)};
			}
			break;
	}
}
if(!window.hasRun){
	window.hasRun=true;
	browser.runtime.onMessage.addListener(handleMessages);
}
function refreshPage(){
	browser.tabs.query({active:true}).then((tabs)=>{
		browser.tabs.sendMessage(tabs[0].id,{command:"getTabCourseForUpdate"});
	});
}

browser.tabs.query({active:true}).then((tabs)=>{
	browser.tabs.sendMessage(tabs[0].id,{command:"getTabCourse"});
});

setInterval(refreshPage,1000);
