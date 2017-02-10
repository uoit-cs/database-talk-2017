var myEvents = {
    "#phones": {
        enter: function(slide) {
                   var images = $("img", slide);
                   images.css('opacity', 0.0);
                   var n = images.size();
                   for(var i=0; i < n; i++) {
                       var t = Math.random() * 5000;
                       setTimeout(function(im) {
                           im.css('opacity', 1.0);
                       }, t, $(images[i]));
                   }
               }
    }
};
