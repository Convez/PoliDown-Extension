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
    console.log("Parsing page");
    var element = document.createElement("html");
    element.innerHTML = pageValues.doc;
    var courseName = element.getElementsByClassName("text-primary");
    if(courseName.length>0){
        courseName = courseName[0].innerText;
    }else{

        courseName = element.querySelector("#rightZone")
        if(courseName.length>0){
            courseName = courseName.getElementsByTagName("h2")[0].innerText;
        }
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
    }
}


function startEnabling(pageValues){
    console.log("on video page");
    // browser.browserAction.setIcon({path:"icons/beasts-32-red.png"});    
    loadCourse(pageValues);
}

function clearCourses(){
    courses.clear();
}

function sendTabCourse(courseName){
    if(courses.has(courseName)){
        browser.runtime.sendMessage({
            command: "printCourse",
            params: courses.get(courseName)
        });
    }
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

function downloadLesson(course,lesson,url){
    console.log(url);
    if(courses.has(course)){
        course = courses.get(course);
        if(course.lessons.has(lesson)){
            lesson = course.lessons.get(lesson);
            lesson.disableDownload=true;
            let dld = browser.downloads.createDownload();
            console.log(dld);
        }
    }
}

function handleMessages(message){
    switch (message.command){
        case "scanPage":
            startEnabling(message.params);
            break;
        case "clearCourses":
            clearCourses();
            break;
        case "sendTabCourse":
            sendTabCourse(message.params);
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