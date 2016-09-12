var proxy = require('http-proxy-middleware');
/**
 * Configure proxy middleware
 * 
 * 
 *Not used at the minute but here for reference

var jsonPlaceholderProxy = proxy('/service', {
    target: 'http:/myremotesite',
    changeOrigin: true,             // for vhosted sites, changes host header to match to target's host
    logLevel: 'debug'
});

 */

function handleApiCall(req, res, next) {

    if (req.url.indexOf('_vti_bin') !== -1) {
        var fs = require("fs");
        fs.readFile("./WebComponents/.container/.mockapi/1.xml", function (err, data) {
            if (err) throw err;
            res.setHeader('Content-Type', 'text/xml');
            res.end(data.toString());
        });

    }
    else {
        next();
    }
}


module.exports = {
    'port': 8000,
    'files': [
        './WebComponents/buildlocal/**/*.*'
        //      './WebComponents/src/**/*.*'
    ],
    'server': {
        routes: {
            "/bower_components": "./bower_components"
        },
        'baseDir': './WebComponents/buildlocal',
        //        'baseDir': './WebComponents/src',
        'middleware': { 2: handleApiCall }
    }
};

