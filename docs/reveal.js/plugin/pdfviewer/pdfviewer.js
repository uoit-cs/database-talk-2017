(function() {
    var buttonStyle = {
        position: 'absolute',
        top: 0,
        background: 'transparent',
        border: 'none',
        fontFamily: 'Roboto',
        fontSize: '80%',
    };
    function process($div) {
        if($div.is(".processed"))
            return;

        $div.addClass("processed");

        var canvas=$("<canvas>");
        canvas.attr('width', $div.width()).css({
            marginLeft: 'auto',
            marginRight: 'auto',
        });
        $div.append(canvas);
        var url = $div.attr('pdf');
        var rotate = $div.attr('rotate');
        if(rotate) {
            rotate = parseInt(rotate, 10);
        }
        var scale = parseFloat($div.attr('scale')) || 1.0;
        canvas = canvas[0];

        PDFJS.disableWorker = true;
        PDFJS.workerSrc = "/js/pdf.worker.js";
        PDFJS.getDocument(url).then(function(pdf) {
            var n = pdf.numPages;
            var i = 1;
            if($div.attr('page')) {
                i = parseInt($div.attr('page'));
            }

            $div.css({
                position: 'relative',
            });

            if(n > 1) {
                // add controls
                $next = $('<button>Next</button>').css(
                        $.extend(buttonStyle, {
                            right: 0,
                        })
                    ).click(function() {
                    if(i < n) {
                        i += 1;
                        show(pdf, canvas, i, scale, rotate);
                    }
                }).prependTo($div);

                $prev = $('<button>Prev</button>').css(
                        $.extend(buttonStyle, {left: 0})
                ).click(function() {
                    if(i >= 1) {
                        i -= 1;
                        show(pdf, canvas, i, scale, rotate);
                    }
                }).prependTo($div);
            }
            show(pdf, canvas, 1, scale, rotate);
        });
    }

    function show(pdf, canvas, i, s, rotate) {
        pdf.getPage(i).then(function(page) {
            var scale = canvas.width / page.getViewport(1.0, rotate).width * s;
            var viewport = page.getViewport(scale, rotate);
            var context = canvas.getContext('2d');
            canvas.height = viewport.height;
            var renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            page.render(renderContext);
        });
    }

    function processSlide(el) {
        $("div[pdf]", $(el)).each(function() { process($(this)); });
    }

    Reveal.addEventListener('slidechanged', function(e) {
        processSlide(e.currentSlide);
    });

    processSlide(Reveal.getCurrentSlide());
})();
