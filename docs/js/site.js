var body = $("body");
var sidenav = $("#sidenav");

$.get('header.html', function(data){
    body.prepend(data);
});

$.get('sidenav.html', function(data){
    sidenav.html(data);
});

(function() {
    "use strict";
    var form = $(".need-validation");
    form.on("submit", function(event) {
        event.preventDefault();
        event.stopPropagation();
    }, false);
}());
