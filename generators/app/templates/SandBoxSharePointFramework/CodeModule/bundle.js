(function () {

    function init() {
        var x = document.getElementById('<%= webPartName %>');
        x.innerHTML = "Hello World!!!!";
        
        sbfrmcomponent.createImage();
    }

    document.addEventListener("DOMContentLoaded", init);

})();
var sbfrmcomponent = (function(){
    var imgPath=_spPageContextInfo.siteAbsoluteUrl + "/SBFrameWork/<%= webPartName %>/images";

    //I dont do anything yet
    function createImage(){
      //  var x = document.getElementById('galaxyimg');
      //  x.innerHTML = "<img src='" + imgPath + "galaxyimg.jpg'/>";
      
      //Grrr hate not having a framework to do this stuff for me,
      //Things like paths to images have to be calculated cos once in a sub site of the site collection
      //you cant use relative links, you have to refer to them directly
      //The above didnt work and I have to stop for now, gimme jquery, knockout or angulars/2 
      //hell i'd settle for handlebars right now but trying to make this agnostic for first round
    }
    
    return {
        createImage:createImage
    };

})();