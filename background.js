function startEnabling(page){
    console.log("on video page");
    browser.browserAction.setIcon({path:"icons/beasts-32-red.png"});    
}
//Start Listener listening for new pages
browser.runtime.onMessage.addListener(startEnabling);