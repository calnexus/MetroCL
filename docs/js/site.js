var body = $("body");
var sidenav = $("#sidenav");

$.get('header.html', function(data){
    body.prepend(data);
});

$.get('sidenav.html', function(data){
    sidenav.html(data);
});