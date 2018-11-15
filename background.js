/**
 *
 * @param {string} name
 * @param {string} url
 */
class Lesson {
    constructor(name, url) {
        this.name = name;
        this.videoUrl = url;
        this.willDownload = true;
        this.disableDownload = false;
        this.percentage = 0.0;
    }
}
/**
 *
 * @param {string} name
 */
class Course {
    constructor(name) {
        this.name = name;
        this.lessons = new Map();
    }
}

var courses = new Map();
/**
 * 
 * @param {*} fromPage 
 */
async function loadCourse(pageValues){
    let parser = new DOMParser();
    var element = parser.parseFromString(pageValues.doc,"text/html");
    var courseName = element.getElementsByClassName("text-primary");
    if(courseName.length>0){
        courseName = courseName[0].innerText;
    }else{

        courseName = element.querySelector("#rightZone")
        courseName = courseName.getElementsByTagName("h2")[0].innerText;
    }
    if(!courses.has(courseName)){
        var course = new Course(courseName);
        courses.set(courseName,course);
        courses.forEach(a=>console.log(a.name));
        var lessons = element.querySelector("#lessonList");
        var l = lessons.getElementsByTagName("a");
        var baseUrl = pageValues.url.split("/");
        var basePage = baseUrl[baseUrl.length-1].split("?")[0];
        baseUrl = pageValues.url.replace(baseUrl[baseUrl.length-1],"");
        for(var i=0;i<l.length;i++){
            var s = l[i];
            var ref = s.getAttribute("href");
            var cl = s.getAttribute("class");
            if(cl!=undefined){
                if(cl!="argoLink"){
                    if(ref!=undefined){
                        if(ref.startsWith(basePage)){
                            course.lessons.set(s.innerText,new Lesson(s.innerText,baseUrl+ref));
                        }
                    }
                }
            }else{
                if(ref!=undefined){
                    if(ref.startsWith(basePage)){
                        course.lessons.set(s.innerText,new Lesson(s.innerText,baseUrl+ref));
                    }
                }
            }
        }
        console.log(course);
    }
}


function startEnabling(pageValues){
    loadCourse(pageValues);
}

function clearCourses(){
    courses.clear();
}

function sendTabCourse(courseName){
    if(courses.has(courseName)){
        let course = courses.get(courseName);
        course.lessons.forEach(updatePercentage);
        browser.runtime.sendMessage({
            command: "printCourse",
            params: course
        });
    }
}
function sendTabCourseForUpdate(courseName){
    if(courses.has(courseName)){
        let course = courses.get(courseName);
        course.lessons.forEach(updatePercentage);
        browser.runtime.sendMessage({
            command: "updateCourse",
            params: course
        });
    }
}
/**
 * 
 * @param {Lesson} lesson 
 * @param {string} key 
 */
function updatePercentage(lesson,key){
    if(lesson.downloadId===undefined){
        return;
    }
    browser.downloads.search({id:lesson.downloadId})
    .then((downloadItem)=>{
        downloadItem = downloadItem[0];
        lesson.state = downloadItem.state;
        if(downloadItem.state === "complete"){
            lesson.percentage = 100;
            return;
        }
        if(downloadItem.state === "interrupted"){
            lesson.disableDownload = false;
            return;
        }
        if (downloadItem.totalBytes===-1){
            lesson.percentage = 0.0;
            return;
        }
        lesson.percentage = downloadItem.bytesReceived/downloadItem.totalBytes*100;
    })
}
function changeLesson(course,lesson){
    if(courses.has(course)){
        course = courses.get(course);
        if(course.lessons.has(lesson)){
            lesson = course.lessons.get(lesson);
            lesson.willDownload = !lesson.willDownload;
        }
    }
}

async function downloadLesson(course,lesson,url){
    if(courses.has(course)){
        course = courses.get(course);
        if(course.lessons.has(lesson)){
            lesson = course.lessons.get(lesson);
            lesson.disableDownload=true;
            console.log(url);
            // Funziona ma scarica nella barra del browser
            let downloadId = await browser.downloads.download({
                url:url,
                filename:course.name+"/"+lesson.name+".mp4"
            });
            lesson.downloadId = downloadId;
        }
    }
}
function cancelDownload(params){
    browser.downloads.cancel(params.downloadId).then(()=>{});
}
function showDownload(params){
    browser.downloads.show(params.downloadId).then(()=>{});
}
function downloadAll(course){
    courses.get(course).lessons.forEach((lesson,key)=>{
        if(lesson.state!==undefined && lesson.state!== "interrupted"){
            return;
        }
        if(!lesson.willDownload){
            return;
        }
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
    })
}
function cancelAll(course){
    courses.get(course).lessons.forEach((lesson, key)=>{
        if(lesson.state===undefined){
            return;
        }
        if(lesson.state!== "in_progress"){
            return;
        }
        cancelDownload(lesson);
    });
}
function handleMessages(message){
    switch (message.command){
        case "downloadAll":
            downloadAll(message.params);
            break;
        case "cancelAll":
            cancelAll(message.params);
            break;
        case "showDownload":
            showDownload(message.params);
            break;
        case "cancelDownload":
            cancelDownload(message.params);
            break;
        case "scanPage":
            startEnabling(message.params);
            break;
        case "clearCourses":
            clearCourses();
            break;
        case "sendTabCourse":
            sendTabCourse(message.params);
            break;
        case "sendTabCourseForUpdate":
            sendTabCourseForUpdate(message.params);
            break;
        case "changeLesson":
            changeLesson(message.params.course,message.params.lesson);
            break;

        case "downloadLesson":
            downloadLesson(message.params.course,message.params.lesson,message.params.url);
        break;
    }    
}

//Start Listener listening for new pages
browser.runtime.onMessage.addListener(handleMessages);
let matches = [
    "https://didattica.polito.it/pls/portal30/",
    "https://elearning.polito.it/gadgets/video/"
  ];
browser.tabs.onActivated.addListener(async (event)=>{
    let tabId = event.tabId;
    let match = false;
    let tabs = await browser.tabs.query({active:true});
    matches.forEach((str)=>{
        if(match)
            return;
        console.log(tabs[0].url);
        match = tabs[0].url.includes(str);
    });
    console.log(match);
    if(match){
        browser.browserAction.setIcon({path:"icons/beasts-32-red.png"});
    }else{
        browser.browserAction.setIcon({path:"icons/beasts-32.png"});
    }
})
