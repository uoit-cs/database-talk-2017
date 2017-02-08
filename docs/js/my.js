function resize_images() {
    var re = /width=(\d+)/;
    $("img[alt]").each(function() {
        var $this = $(this);
        var alt = $this.attr("alt");
        var m = re.exec(alt);
        if(m) {
            w = m[1];
            $this.attr("width", w);
        }
    });
}

function imaged_blocks() {
    function imaged_block($b, $i, image_on_left) {
        $i.detach();
        $i = $("<figure>").append(
                $i,
                $("<figcaption>").text($i.attr("alt")));

        var c1 = $("<div class='col-md-6'>");
        var c2 = $("<div class='col-md-6'>");
        var div = $("<div class='row imaged-block'>").append(c2);
        if(image_on_left) {
            $b.wrap(div).closest(".row").prepend(c1.append($i));
            $i.css('float', 'right');
        } else {
            $b.wrap(div).closest(".row").append(c1.append($i));
            $b.find("p").css({
                textAlign: "right"
            });
        }
    }

    $("blockquote").each(function() {
        var $blockquote = $(this);
        var $img = $("img", $blockquote);
        var $p = $img.parent();

        if($img.size() == 1 && $p.children().size() == 1) {
            if($p.index() == 0) {
                imaged_block($blockquote, $img, true);
            } else {
                imaged_block($blockquote, $img, false);
            }
        }
    });
}

function commands() {
    $("a").each(function() {
        var text = $(this).text().trim();
        if(text == "!") {
            var cmds = $(this).attr("href").split(":");
            var cmd, arg;
            cmd = cmds[0];
            if(cmds.length > 1) {
                arg = cmds[1];
            }
            var f = COMMANDS[cmd];
            if(f) {
                f(this, arg);
            }
        }
    });
}

$(function() {
    resize_images();
    imaged_blocks();
    commands();
});

function row(a, c1, b, c2) {
    var div = $("<div class=row>");
    var col1 = $("<div class=col-md-" + c1 + ">");
    var col2 = $("<div class=col-md-" + c2 + ">");
    div.append(col1, col2);
    col1.append(a);
    col2.append(b);
    return div;
}

/* ===== COMMANDS ======= */
var COMMANDS = {};

// converts a blockquote to a well.
COMMANDS["well"] = function(a) {
    $(a).closest("blockquote").each(function() {
        $(this).addClass("plain-block").wrap($("<div>").addClass("well"));
    });
    $(a).remove();
};

// alerts
COMMANDS["alert"] = function(a, style) {
    if(! style) style = "info";

    $(a).closest("blockquote").each(function() {
        $(this).addClass("plain-block").wrap($("<div>").addClass("alert alert-" + style));
    });
    $(a).remove();

};

// panel list
COMMANDS["panel"] = function(a, style) {
    if(! style) style = "default";

    $(a).closest("blockquote").each(function() {
        var bq = $(this);
        bq.addClass("plain-block")
           .wrap($("<div class='panel panel-" + style + "'><div class='panel-body'></div></div>"));
        var panel = bq.closest(".panel");

        // add title
        var h1 = $("h1:first,h2:first,h3:first,h4:first", bq);
        if(h1.size() > 0) {
            h1.remove().prependTo(panel).addClass("panel-title");
            h1.wrap($("<div class=panel-heading>"));
        }

        // convert list
        var ul = $("> ul", bq);
        ul.addClass("list-group");
        $("> li", ul).addClass("list-group-item");
    });
    $(a).remove();
};
