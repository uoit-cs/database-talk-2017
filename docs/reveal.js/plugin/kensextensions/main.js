(function () {
    function processCopyBtn($section) {
        if($section.is(".copybtned"))
            return;

        $section.addClass("copybtned");
        $("code.clipboard", $section).each(function() {
            var code = $(this);
            var btn = $('<button class="btn btn-sm cmd">Copy</button>')
                .css({
                    position: "absolute",
                    right: 0,
                    top: 0,
                });
            code.after(btn);
            code.parent().css('position', 'relative');
            new Clipboard(btn[0], {
                text: function(trigger) {
                    return code.text();
                }
            });
        });
    }

    function processCodeTemplate($section) {
        if($section.is(".codetemplated"))
            return;

        $section.addClass("codetemplated");
        $("code.template", $section).each(function() {
            var code = $(this);
            var html = code.html();
            html = html.replace(/__(\w+)__/g, function(m, w) {
                return '<i class="template">' + w + '</i>';
            });
            code.html(html);
            console.debug(code.html());
        });
    }

    // [!](note)
    // Gets the previous sibling, and wrap $a parent
    // in a two column row with fixed ratio
    function processNote($a, ratio) {
        var noteWidth = ratio ? parseInt(ratio, 10) : 4;
        var mainWidth = 12 - noteWidth;
        // assume blockquote being the note container
        var note = $a.closest("blockquote");
        // default to the parent
        if(note.size() == 0) note = $a.parent();
        var sibling = note.prev();
        var row = $("<div>").addClass("row");
        var c1 = $("<div>").addClass("col-xs-" + mainWidth).appendTo(row);
        var c2 = $("<div>").addClass("col-xs-" + noteWidth).appendTo(row);
        note.after(row);
        note.detach().appendTo(c2);
        sibling.detach().appendTo(c1);
        note.css({
            fontSize: "85%",
            marginLeft: 20,
        });
    }

    function processCmd($a) {
        var cmd = ($a.attr('href') || "").split(/\s+/);
        // =========================================
        if(cmd[0].startsWith("comfort")) {
            $a.closest("ul,ol").children().css({
                marginBottom: 20,
            });
            $a.closest("li").detach();
        }
        // =========================================
        else if(cmd[0].startsWith("---") ||
                cmd[0].startsWith("***") ||
                cmd[0].startsWith("&&&")) {
            var n = cmd[0].length;
            var i = $("<i class='fa fa-asterisk'></i>").css({
                marginLeft: 5,
                marginRight: 5,
                fontSize: 15,
                color: '#888',
            });
            if(cmd[0].startsWith("---")) {
                i = $("<hr>");
            } else if(cmd[0].startsWith("&&&")) {
                i.removeClass("fa-asterisk").addClass("fa-leaf").css({
                    color: "#0a0",
                    fontSize: 25,
                });
            } else {
                var i1 = i, i2 = i.clone(), i3 = i.clone();
                i = $("<div>").append(i1, i2, i3);
            }
            var div = $("<div></div>").css({
                marginTop: 10*n,
                marginBottom: 10*n,
                textAlign: "center"
            }).append(i);
            $a.after(div);
            $a.detach();
        }
        // =========================================
        else if(cmd[0] == "highlight") {
            var div = $("<div>").css({
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 600,
                padding: 20,
            }).append("<div>");

            $a.closest("section").css({
                background: "#888",
                color: "white",
            }).wrapInner(div);
            $a.detach();
        }
        // =========================================
        else if(cmd[0] == "middle") {
            var div = $("<div>").css({
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 600,
                padding: 20,
            }).append("<div>");
            $a.closest("section").wrapInner(div);
            $a.detach();
        }
        // =========================================
        else if(cmd[0] == "box") {
            $a.parent().css({
                border: "thin solid #aaa",
                padding: 20,
            });
            $a.detach();
        }
        // =========================================
        else if(cmd[0] == "note") {
            processNote($a, (cmd.length > 1) ? cmd[1] : "");
            $a.detach();
        }
        // =========================================
        else if(cmd[0] == "scale") {
            var scale = (cmd.length > 1) ? cmd[1] : 1.0;
            var $slide = $a.closest("section");
            $slide.css({
                transform: 'scale(' + scale + ')',
                transformOrigin: "0 0",
            });
            $a.detach();
        }
        // =========================================
        else if(cmd[0] == "fragments") {
            var $ul = $a.closest("ul,ol");
            $("li", $ul).addClass("fragment");
            $a.closest("li").detach();
            $a.detach();
        }
        // =========================================
        else if(cmd[0] == "nobullet" || cmd[0] == "nobullets") {
            var $ul = $a.closest("ul");
            $ul.css({"list-style": "none"});
            $a.closest("li").detach();
            $a.detach();
        }
    }

    function masonry($slide) {
        var container = $(".masonry", $slide);

        if(container.size() > 0) {
            var w = parseInt(container.attr("width"));
            var h = parseInt(container.attr("height"));
            var n = container.attr("columns");
            var border = container.attr("border");
            if(n)
                n = parseInt(n);
            else
                n = 3;
            var colWidth = 1/n * 100;
            container.css({
                width: w,
                height: h,
                margin: "10px auto"
            });
            container.children().each(function() {
                var $this = $(this);
                var span = $this.attr("span");
                if(span)
                    span = parseInt(span);
                else
                    span = 1;
                $this.css("width", (span * colWidth) + "%");

                if(border) $this.css("border", border);
            });
            container.masonry();
            container.removeClass("masonry").addClass("done-masonry");
        } else {
            ;
        }
    }

    $(".slides section").each(function() {
        processCopyBtn($(this));
        processCodeTemplate($(this));
    });

    $(".slides section a").each(function() {
        var $a = $(this);
        if($a.text() == "!") {
            processCmd($a);
        }
    });

    Reveal.addEventListener('slidechanged', function(e) {
        masonry(e.currentSlide);
    });
    Reveal.addEventListener('ready', function(e) {
        masonry(e.currentSlide);
    });

    // ======== duplicate heading if necessary ==============
    // for h1 with "____"
    var $lasth1 = null;
    $(".slides section > h1").each(function() {
        var $h1 = $(this);
        var text = $h1.text();
        if(/^_{3,}$/.exec(text) && $lasth1) {
            $h1.html($lasth1.html());
        }
        $lasth1 = $h1;
    });

})();
