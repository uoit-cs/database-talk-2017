// Perform multi-column formatting to the slides
(function() {
    // get the column declaration in $p
    function getColumnDecl($p) {
        var a = $p.find("a:first");
        var result = false;

        if(a.size() > 0) {
            result = a.text() == "!" && 
                    a.attr('href') &&
                    a.attr('href').startsWith("columns");
        }
        if(result) {
            return a;
        } else {
            return null;
        }
    }

    // get the column split in $p
    function isColumnSplit($p) {
        var a = $p.find("a:first");
        var result = false;
        if(a.size() > 0 && a.text() == "!" && a.attr("href")) {
            if(a.attr("href").match(/split/)) {
                result = a.attr("href");
            }
        }
        return result;
    }

    function parseColumnWidths(cmd) {
        var widths = cmd.replace(/columns /, "").trim().split(/:/);
        var total = 0;
        widths.forEach(function(w) {
            var n = parseInt(w, 10);
            if(1 <= n && n <= 12) total += n;
        });

        return widths.map(function(x) {
            var w = parseInt(x, 10);
            return (1 <= w && w <= 12) ? w : 12 - total;
        });
    }

    function makeRow(columns) {
        var row = $("<div>").addClass("row");

        for(var i=0; i < columns.length; i++) {
            var column = columns[i];
            var col = $("<div>").addClass("column col-sm-" + column.width);
            var fontSize = column.fontSize;
            if(fontSize) {
                col.css('font-size', fontSize);
            }
            column.children.forEach(function(x) {
                col.append(x);
            });
            row.append(col);
        }

        return row;
    }

    function process(section) {
        var children = $(section).children();
        var inColumn = null;
        var widths = null;

        // Get the column configuration
        // and collect the children that should be distributed
        // into columns
        for(var i=0; i < children.length; i++) {
            var c = $(children[i]);
            var a = getColumnDecl(c);
            if(a) {
                c.detach();
                widths = parseColumnWidths(a.attr('href'));
                inColumn = children.slice(i+1);
                break;
            }
        }

        if(widths) {
            // Initalize the columns
            var columns = [];
            for(var i=0; i < widths.length; i++) {
                columns.push({
                    width: widths[i],
                    fontSize: null,
                    children: [],
                });
            }

            // Distribute the inColumn children into the
            // corresponding columns
            var col = 0;
            var fontSize = null;
            for(var i=0; i < inColumn.length; i++) {
                var $c = $(inColumn[i]).detach();

                var split = isColumnSplit($c);

                if(split) {
                    col = Math.min(widths.length-1, col + 1);

                    if(split.match(/note/)) {
                        columns[col].fontSize = "75%";
                    }
                } else {
                    columns[col].children.push($c);
                }
            }

            $(section).append(makeRow(columns));
        }
    }

    if(window.print_pdf) {
        $("section").each(function() {
            process(this);
        });
    } else {
        // Register reprocessing
        Reveal.addEventListener('slidechanged', function(event) {
            process(event.currentSlide);
        });

        process(Reveal.getCurrentSlide());
    }
})();
