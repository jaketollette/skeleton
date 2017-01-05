$(document).ready(function(){
    move(".headline--primary")
        .set("opacity", 1)
        .add("margin-left", 50)
        .rotate(-5)
        .duration("2s")
        .end();
});
