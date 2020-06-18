   script.js
   $.ajax({
       type: "GET",
       url: proxyUrl + "https://www.fxp.co.il/forumdisplay.php?f=5073",
       crossDomain: true,
       async: true,
       //proxyUrl = https: //jsonp.afeld.me/?url=
       dataType: "html",
       success: function(data) {
           var i;
           var titles = $(data).find(".threadbit").find(".rating0").find(".threadinfo").find(".inner").find(".threadtitle").find(".title");
           var altcheck = $(data).find(".threadbit").find(".rating0").find(".threadinfo").find(".inner").find(".threadtitle");
           for (i = 0; i < titles.length; i++) {
               if (!altcheck[i].innerHTML.includes("אשכול נעוץ")) {
                   console.log(titles[i].innerHTML);
                   //console.log(titles[i].href.replace("file:///C:/Users/Shalev/Documents/%E2%80%8F%E2%80%8FComputers%20and%20Internet%20Category%20Meholel%202/", "https://www.fxp.co.il/"));
               }
           }
       }
   })