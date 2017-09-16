(function() {
    "use strict";

    var body = $("body");
    var sidenav = $("#sidenav");

    $.get('header.html', function(data){
        body.prepend(data);
    });

    $.get('sidenav.html', function(data){
        sidenav.html(data);
    });

    var form = $(".need-validation");
    form.on("submit", function(event) {
        event.preventDefault();
        event.stopPropagation();
    }, false);

    $.each($("pre"), function(){
        var pre = $(this);
        pre.prepend($("<button>").addClass("button square copy-button").html("<span class='mif-files-empty'></span>"));
    });

    hljs.initHighlightingOnLoad();

    new Clipboard('.copy-button', {
        target: function(trigger) {
            return trigger.nextElementSibling;
        }
    });
}());


