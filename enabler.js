
var Page = class {
    constructor(a, b, c) {
        this.doc = a;
        this.url = b;
        this.cookies = c;
    }
}

function getCourseName(){
    var courseName = document.querySelector(".text-primary");
    courseName = courseName!=null?courseName.innerHTML:courseName;
    var cn = document.querySelector("#rightZone");
    cn = cn!=null?cn.querySelector("h2").innerText:cn;
    console.log(cn);
    return courseName != null? courseName: cn;
}
function fetchVideoURL(params){
    let request = new XMLHttpRequest();
        request.withCredentials=true;
        request.responseType="document";
        request.onreadystatechange=function()
        {
            if (request.readyState==4 && request.status==200)
            {
                let videoRelURL = request.responseXML.querySelector('[id^="video"]').getAttribute("href");
                let videoURL = "";
                if(window.location.href.startsWith("https://elearning.polito.it/gadgets/video/")){
                    videoURL="https://elearning.polito.it/gadgets/video/"+videoRelURL;
                }else{
                    videoURL="https://didattica.polito.it/"+videoRelURL;
                }
                console.log(videoURL);
                console.log("Origin: "+window.location.origin);
                browser.runtime.sendMessage({
					command:"downloadLesson",
					params:{
						course:params.course,
						lesson:params.lesson,
						url: videoURL
					}
				});
            }
        };

        request.open("GET", params.url, true);
        request.send();
}
function inPageListener(message){
    console.log(message);
    switch(message.command){
        case "getTabCourse":
            let courseName = getCourseName();
            console.log(courseName);
            browser.runtime.sendMessage({
                command: "sendTabCourse",
                params: courseName
            });
            break;
        case "getTabCourseForUpdate":
            let course = getCourseName();
            browser.runtime.sendMessage({
                command: "sendTabCourseForUpdate",
                params: course
            });
            break;
        case "fetchURL":
            fetchVideoURL(message.params);
            break;
    }
}
browser.runtime.onMessage.addListener(inPageListener);

browser.runtime.sendMessage({
    command:"scanPage",
    params: new Page(document.documentElement.innerHTML,document.URL,document.cookie)
});
browser.browserAction.setIcon({path:"icons/beasts-32-red.png"});
