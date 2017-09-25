
$(function(){
});

(function() {
    "use strict";

    var body = $("body");
    var sidenav = $("#sidenav");
    var search;

    $.get('header.html', function(data){
        body.prepend(data);
    });

    $.get('sidenav.html', function(data){
        sidenav.html(data);

        setTimeout(function(){
            search = docsearch({
                apiKey: '00a53b92ba6ed063bec0a9320e60d4e6',
                indexName: 'metroui',
                inputSelector: '#search_input',
                debug: false // Set debug to true if you want to inspect the dropdown
            });
        }, 500);
    });

    var form = $(".need-validation");
    form.on("submit", function(event) {
        event.preventDefault();
        event.stopPropagation();
    }, false);

    $.each($("pre"), function(){
        var pre = $(this);
        pre.prepend($("<button>").addClass("button square copy-button rounded").attr("title", "Copy").html("<span class='mif-copy'></span>"));
    });

    hljs.initHighlightingOnLoad();

    new Clipboard('.copy-button', {
        target: function(trigger) {
            return trigger.nextElementSibling;
        }
    });

    preCode("pre code, textarea");
}());


