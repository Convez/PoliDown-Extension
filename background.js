/**
 * 
 * @param {string} name 
 * @param {string} url 
 */
function Lesson(name,url){
    this.name=name;
    this.videoUrl=url;
    this.willDownload=true;
    this.canDownlaod=false;
}
/**
 * 
 * @param {string} name 
 */
function Course(name){
    this.name=name;
    this.lessons = new Map();
}

var courses = new Map();
/**
 * 
 * @param {*} fromPage 
 */
async function loadCourse(pageValues){
    var element = document.createElement("html");
    element.innerHTML = pageValues.doc;
    var courseName = element.getElementsByClassName("text-primary");
    if(courseName.length>0){
        courseName = courseName[0].innerText;
    }else{
        courseName = element.querySelector("#rightZone").getElementsByTagName("h2")[0].innerText;
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
                            course.lessons.set(s.innerText,baseUrl+ref);
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
        course.lessons.forEach((value,key)=>console.log(key,value.videoUrl));
    }
}


function startEnabling(pageValues){
    console.log("on video page");
    browser.browserAction.setIcon({path:"icons/beasts-32-red.png"});    
    loadCourse(pageValues);
}
function clearCourses(){
    courses.clear();
}

browser.runtime.onMessage.addListener(clearCourses);

//Start Listener listening for new pages
browser.runtime.onMessage.addListener(startEnabling);