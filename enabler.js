function cl (a,b,c){
    this.doc=a;
    this.url=b;
    this.cookies=c;
}
browser.runtime.sendMessage(new cl(document.documentElement.innerHTML,document.URL,document.cookie));