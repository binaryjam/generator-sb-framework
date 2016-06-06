/* jshint node: true */
var gulp = require("gulp");
var concat = require('gulp-concat');
var gulpfn = require("gulp-fn");
var xeditor = require("gulp-xml-editor");
var prettyData = require('gulp-pretty-data');
var rename = require("gulp-rename");
var msbuild = require("gulp-msbuild");
var gulpSequence = require('gulp-sequence');
var debug = require('gulp-debug');

var del = require('del');


if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}

gulp.task('.BUILD', ['bothBuild']);

gulp.task('.BUILDWSP', gulpSequence('spBuild', 'msbuild'));

gulp.task('bothBuild', gulpSequence(['spBuild', 'localBuild']));

//dependancy tree got out of control so switch to sequence handler instead
gulp.task('localBuild', gulpSequence(
    'cleanlocal',
    ['buildhtmlPartLoader', 'buildhtmlindex', 'buildTheRest'] //'bundlejslocal',
));

gulp.task('spBuild', gulpSequence(
    'cleanspbuild',
    'cleanspmodule',
    ['buildhtmlsp', 'buildhtmlsp3'],  //'buildcsssp', 'buildjssp', 'buildimgsp',
    ['packageXmlFiles'],
    ['packageElements', 'packagespdata'],
    'packagecsproj',
    ['prettify1', 'prettify2', 'prettify3']
));



gulp.task('default', ['bothBuild']);


/********************************************************************************************** */
/* SP BUILD TASKS                                                                               */
/********************************************************************************************** */

gulp.task('cleanspbuild', function () {

    return del(['./WebComponents/buildSP']);
});


gulp.task('cleanspmodule', function () {
    return del(['./MyNewProject/CodeModule/**/*', '!./MyNewProject/CodeModule/Elements.xml', '!./MyNewProject/CodeModule/SharePointProjectItem.spdata']);//**/*.{jpeg,gif,jpg,png,css,js,htm,html}']);
});

/* No, Naughty bad bundling!!  Do it properly later when you have sorted the basics 

gulp.task('buildcsssp', function () {
    return gulp.src(['./WebComponents/src/css/*.css'])
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest('./WebComponents/buildSP'));
});

gulp.task('buildjssp', function () {
    return gulp.src(['./WebComponents/src/js/*.js'])
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest('./WebComponents/buildSP'));
});

*/


gulp.task('buildhtmlsp', function () {
    return gulp.src(['./WebComponents/.container/loader.htm', './WebComponents/src/webpart/webpartcontent.htm'])
        .pipe(concat('webpartcontent.htm'))
        .pipe(gulp.dest('./WebComponents/buildSP/webpart/'));
});

gulp.task('buildhtmlsp3', function () {
    return gulp.src(['./WebComponents/src/**', '!./WebComponents/src/webpart{,/**}'])  // '!./**/css{,/**}','!./**/js{,/**}','!./**/images{,/**}',
        .pipe(gulp.dest('./WebComponents/buildSP/'));
});

var elementFiles = [];

gulp.task('packageXmlFiles', function () {
    return gulp.src(['./WebComponents/buildSP/**/*.*'])
        .pipe(debug())
        .pipe(gulp.dest('./MyNewProject/CodeModule'))
        .pipe(gulpfn(function (file) {
            var fname = file.path.substring(file.base.length + 1);
            var obj = {
                "name": fname,
                srcprefix: "",
                "path": 'CodeModule\\',
                "Url": "SBFrameWork/<%=projectName%>/" + fname
            };
            elementFiles.push(obj);
        }));
});



gulp.task('packageElements', function () {
    return gulp.src("./MyNewProject/CodeModule/Elements.xml")
        .pipe(xeditor(function (xml) {
            var node = xml.find('//xmlns:File', 'http://schemas.microsoft.com/sharepoint/');
            for (var i = 0; i < node.length; i++) {
                node[i].remove();
            }
            var module = xml.get('//xmlns:Module', 'http://schemas.microsoft.com/sharepoint/');
            for (var j = 0; j < elementFiles.length; j++) {
                var path = elementFiles[j].path + elementFiles[j].name;
                module.node('File')
                    .attr({
                        "ReplaceContent": 'TRUE'
                    })
                    .attr({
                        "Path": path
                    })
                    .attr({
                        "Url": elementFiles[j].Url.replace(/\\/g, "/")
                    });
                console.log(elementFiles[j].Url.replace(/\\/g, "/"));
            }

            return xml;
        }))
        .pipe(gulp.dest("./MyNewProject/CodeModule/", {
            "overwrite": true
        }));
});

gulp.task('packagespdata', function () {
    //Clear out all the File objects in the XML
    return gulp.src("./MyNewProject/CodeModule/SharePointProjectItem.spdata")
        .pipe(xeditor(function (xml) {
            var node = xml.find('//xmlns:ProjectItemFile[@Type="ElementFile"]', "http://schemas.microsoft.com/VisualStudio/2010/SharePointTools/SharePointProjectItemModel");
            for (var i = 0; i < node.length; i++) {
                node[i].remove();
            }
            var module = xml.get('//xmlns:Files', "http://schemas.microsoft.com/VisualStudio/2010/SharePointTools/SharePointProjectItemModel");
            for (var j = 0; j < elementFiles.length; j++) {
                var folder = elementFiles[j].name.lastIndexOf("\\");
                folder = elementFiles[j].name.substring(0, folder);
                module.node('ProjectItemFile')
                    .attr({
                        "Source": elementFiles[j].srcprefix + elementFiles[j].name
                    })
                    .attr({
                        "Target": elementFiles[j].path + folder
                    })
                    .attr({
                        "Type": "ElementFile"
                    });
            }


            return xml;
        }))
        .pipe(gulp.dest("./MyNewProject/CodeModule/", {
            "overwrite": true
        }));
});

gulp.task('packagecsproj', function () {

    //Clear out all the File objects in the XML
    return gulp.src("./MyNewProject/MyNewProject.csproj")
        .pipe(xeditor(function (xml) {
            var node = xml.get('//xmlns:ItemGroup[xmlns:Content]', "http://schemas.microsoft.com/developer/msbuild/2003");
            if (typeof node !== "undefined") {
                var children = node.childNodes();
                var newItems = [];
                var removeNodes = [];

                //Loop to remove items no longer in the project from csproj
                for (var i = 0; i < children.length; i++) {
                    if (children[i].attr("Include") !== null) {
                        var itemValue = node.childNodes()[i].attr("Include").value();
                        if (itemValue.startsWith("CodeModule")) {
                            var matched = false;
                            for (var j = 0; j < elementFiles.length; j++) {
                                if (elementFiles[j].path + elementFiles[j].name === itemValue) {
                                    matched = true;
                                }
                            }
                            if (!matched) {
                                if (itemValue !== "CodeModule\\Elements.xml") {
                                    removeNodes.push(node.childNodes()[i]);
                                }
                            }
                        }
                    }
                }

                //Loop to find items in the project not in the csproj
                for (var j = 0; j < elementFiles.length; j++) {
                    var matched = false;
                    for (var i = 0; i < children.length; i++) {
                        if (children[i].attr("Include") !== null) {
                            var itemValue = node.childNodes()[i].attr("Include").value();
                            if (itemValue.startsWith("CodeModule")) {
                                if (elementFiles[j].path + elementFiles[j].name === itemValue) {
                                    matched = true;
                                }
                            }
                        }
                    }

                    if (!matched) {
                        newItems.push(elementFiles[j]);
                    }
                }


                for (var k = 0; k < newItems.length; k++) {
                    node.node('Content')
                        .attr({
                            "Include": newItems[k].path + newItems[k].name
                        });
                }

                //Changes to the XML have to be done after iterations else it goes bang.
                for (var k = 0; k < removeNodes.length; k++) {
                    removeNodes[k].remove();
                }
            }
            return xml;
        }))
        .pipe(gulp.dest("./MyNewProject/", {
            "overwrite": true
        }));
});

gulp.task('prettify1', function () {
    return gulp.src("./MyNewProject/CodeModule/Elements.xml")
        .pipe(prettyData({
            type: 'prettify'
        }))
        .pipe(gulp.dest("./MyNewProject/CodeModule/", {
            "overwrite": true
        }));
});

gulp.task('prettify2', function () {
    return gulp.src("./MyNewProject/CodeModule/SharePointProjectItem.spdata")
        .pipe(rename("SharePointProjectItem.spdata.xml"))
        .pipe(prettyData({
            type: 'prettify'
        }))
        .pipe(rename("SharePointProjectItem.spdata"))
        .pipe(gulp.dest("./MyNewProject/CodeModule/", {
            "overwrite": true
        }));
});

//If we get problems with unidentified package items then delete the .suo files in a new task item

gulp.task('prettify3', function () {
    return gulp.src("./MyNewProject/MyNewProject.csproj")
        .pipe(rename("MyNewProject.csproj.xml"))
        .pipe(prettyData({
            type: 'prettify'
        }))
        .pipe(rename("MyNewProject.csproj"))
        .pipe(gulp.dest("./MyNewProject/", {
            "overwrite": true
        }));
});


gulp.task('msbuild', function () {
    return gulp.src("./MyNewProject/MyNewProject.csproj")
        .pipe(msbuild({
            targets: ['Package'],
            toolsVersion: 12.0,
            stdout: true,
            properties: {
                OutputPath: "./bin/package"
            }
        }));

});



/********************************************************************************************** */
/*Local Dummy site BUILD TASKS                                                                  */
/********************************************************************************************** */
gulp.task('cleanlocal', function () {
    return del(['./WebComponents/buildlocal/**']);
});

gulp.task('buildhtmlPartLoader', function () {
    return gulp.src(['./WebComponents/.container/localtop.htm',
        './WebComponents/.container/loader.htm',
        './WebComponents/src/webpart/webpartcontent.htm',
        './WebComponents/.container/localbottom.htm'
    ])
        .pipe(concat('webpartcontent.htm'))
        .pipe(gulp.dest('./WebComponents/buildlocal/SBFrameWork/<%=projectName%>/webpart'));
});
gulp.task('buildhtmlindex', function () {
    return gulp.src('./WebComponents/.container/index.html')
        .pipe(gulp.dest('./WebComponents/buildlocal/'));
});


//Possible to use a bundler here as well if you want. 
/*  Remove bad concat style bundling  replace with your own, requires or broserify  or webpack or whatever*/
/*
gulp.task('bundlecsslocal', function () {
    return gulp.src(['./WebComponents/src/css/*.css'])
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest('./WebComponents/buildlocal/SBFrameWork/<%=projectName%>'));
});
*/

/*  Remove bad concat style bundling  replace with your own, requires or broserify  or webpack or whatever*/
/*
gulp.task('bundlejslocal', function () {
    
    return gulp.src(['./WebComponents/src/js/*.js'])
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest('./WebComponents/buildlocal/SBFrameWork/<%=projectName%>'));
});
*/


gulp.task('buildTheRest', function () {
    return gulp.src(['./WebComponents/src/**', '!./WebComponents/src/webpart/webpartcontent.htm'])  //'!./**/js{,/**}','!./**/css{,/**}',
        .pipe(gulp.dest('./WebComponents/buildlocal/SBFrameWork/<%=projectName%>'));
});
