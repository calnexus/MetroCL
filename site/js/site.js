function htmlToElement(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
}

var body = $("body");
var sidenav = $("#sidenav");

$.get('header.html', function(data){
    body[0].insertBefore(htmlToElement(data), body[0].firstChild)
});

$.get('sidenav.html', function(data){
    sidenav.html(data);
});