(function () {

    function init() {
        var x = document.getElementById('<%= webPartName %>');
        x.innerHTML = "Hello World!!!!";
        
        sbfrmcomponent.createImage();
    }

    document.addEventListener("DOMContentLoaded", init);

})();