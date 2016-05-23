var gulp = require("gulp");
var debug = require("gulp-debug");
var concat = require('gulp-concat');
var gulpfn = require("gulp-fn");
var xeditor = require("gulp-xml-editor");
var prettyData = require('gulp-pretty-data');
var clean = require('gulp-clean');
var rename = require("gulp-rename");
var msbuild = require("gulp-msbuild");
var destination = "";

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}

//Lol, gulp works our the dependancy tree and executes everything you need
gulp.task('.BUILD', ['packagesp']);
gulp.task('.BUILDWSP', ['msbuild']);


gulp.task('default', ['packagesp']);

gulp.task('cleanlocal', function () {
    return gulp.src('./WebComponents/buildlocal/**', {
        read: false
    })
        .pipe(clean());
});

gulp.task('cleansp', ['cleansp1', 'cleansp2']);
gulp.task('cleansp1', function () {
    return gulp.src('./WebComponents/buildSP/**', {
        read: false
    })
        .pipe(clean());
});
gulp.task('cleansp2', ['cleansp1'], function () {
    return gulp.src('./<%=projectName%>/CodeModule/**/*.{jpg,png,css,js,htm,html}', {
        read: false
    })
        .pipe(clean());
});

gulp.task('buildhtmllocal', ['cleanlocal'], function () {
    return gulp.src(['./WebComponents/.container/localtop.htm',
        './WebComponents/.container/loader.htm',
        './WebComponents/src/webpartcontent.htm',
        './WebComponents/.container/localbottom.htm'
    ])
        .pipe(concat('index.html'))
        .pipe(gulp.dest('./WebComponents/buildlocal'));
});

gulp.task('buildcssboth', ['cleanlocal', 'cleansp'], function () {
    return gulp.src(['./WebComponents/src/css/*.css'])
        .pipe(debug({
            title: 'cssbuild:'
        }))
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest('./WebComponents/buildlocal/SBFrameWork/<%=webPartName%>'))
        .pipe(gulp.dest('./WebComponents/buildSP'));
});

gulp.task('buildjsboth', ['cleanlocal', 'cleansp'], function () {
    return gulp.src(['./WebComponents/src/js/*.js'])
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest('./WebComponents/buildlocal/SBFrameWork/<%=webPartName%>'))
        .pipe(gulp.dest('./WebComponents/buildSP'));
});

gulp.task('buildimgboth', ['cleanlocal', 'cleansp'], function () {
    return gulp.src(['./WebComponents/src/images/*.*'])
        .pipe(gulp.dest('./WebComponents/buildlocal/SBFrameWork/<%=webPartName%>/images'))
        .pipe(gulp.dest('./WebComponents/buildSP/images'));

});

gulp.task('buildhtmlsp', ['cleansp'], function () {
    return gulp.src(['./WebComponents/.container/loader.htm', './WebComponents/src/webpartcontent.htm'])
        .pipe(concat('loader.htm'))
        .pipe(gulp.dest('./WebComponents/buildSP'));
});

var elementFiles = [];

gulp.task('packagesp', ['prettify1', 'prettify2', 'prettify3']);

gulp.task('packageXmlFiles', ['buildhtmlsp', 'buildjsboth', 'buildcssboth'], function () {

    return gulp.src(['./WebComponents/buildSP/*.*'])
        .pipe(gulp.dest('./<%=projectName%>/CodeModule'))
        .pipe(gulpfn(function (file) {
            var fname = file.path.substring(file.base.length + 1);
            var obj = {
                "name": fname,
                srcprefix: "",
                "path": 'CodeModule\\',
                "Url": "SBFrameWork/<%=webPartName%>/" + fname
            }
            elementFiles.push(obj);
            console.log("     AddToArr:" + obj.name + " :: " + obj.path);
        }));
});

gulp.task('packageImages', ['buildimgboth'], function () {
    return gulp.src(['./WebComponents/buildSP/images/*.*'])
        .pipe(gulp.dest('./<%=projectName%>/CodeModule/images'))
        .pipe(gulpfn(function (file) {
            var fname = file.path.substring(file.base.length + 1);
            elementFiles.push({
                "name": fname,
                srcprefix: 'images\\',
                path: 'CodeModule\\images\\',
                "Url": "SBFrameWork/<%=webPartName%>/images/" + fname
            });
        }));

});

gulp.task('packageElements', ['packageXmlFiles', 'packageImages'], function () {
    return gulp.src("./<%=projectName%>/CodeModule/Elements.xml")
        .pipe(xeditor(function (xml, xmljs) {
            var node = xml.find('//xmlns:File', 'http://schemas.microsoft.com/sharepoint/');
            for (var i = 0; i < node.length; i++) {
                node[i].remove();
            }
            var module = xml.get('//xmlns:Module', 'http://schemas.microsoft.com/sharepoint/');
            for (var j = 0; j < elementFiles.length; j++) {
                console.log("     CreatingElement:");
                console.log(elementFiles[j]);
                var path = elementFiles[j].path + elementFiles[j].name;
                module.node('File')
                    .attr({
                        "ReplaceContent": 'TRUE'
                    })
                    .attr({
                        "Path": path
                    })
                    .attr({
                        "Url": elementFiles[j].Url
                    });

            }


            return xml;
        }))
        .pipe(gulp.dest("./<%=projectName%>/CodeModule/", {
            "overwrite": true
        }));
});



gulp.task('packagespdata', ['packageXmlFiles', 'packageImages'], function () {
    //Clear out all the File objects in the XML
    return gulp.src("./<%=projectName%>/CodeModule/SharePointProjectItem.spdata")
        .pipe(xeditor(function (xml, xmljs) {
            var node = xml.find('//xmlns:ProjectItemFile[@Type="ElementFile"]', "http://schemas.microsoft.com/VisualStudio/2010/SharePointTools/SharePointProjectItemModel");
            for (var i = 0; i < node.length; i++) {
                node[i].remove();
            }
            var module = xml.get('//xmlns:Files', "http://schemas.microsoft.com/VisualStudio/2010/SharePointTools/SharePointProjectItemModel");
            for (var j = 0; j < elementFiles.length; j++) {

                module.node('ProjectItemFile')
                    .attr({
                        "Source": elementFiles[j].srcprefix + elementFiles[j].name
                    })
                    .attr({
                        "Target": elementFiles[j].path
                    })
                    .attr({
                        "Type": "ElementFile"
                    });
            }


            return xml;
        }))
        .pipe(gulp.dest("./<%=projectName%>/CodeModule/", {
            "overwrite": true
        }));
});

gulp.task('packagecsproj', ['packageElements', 'packagespdata'], function () {

    //Clear out all the File objects in the XML
    return gulp.src("./<%=projectName%>/<%=projectName%>.csproj")
        .pipe(xeditor(function (xml, xmljs) {
            console.log("TODO:Edit the csproj file with the extra files in the ItemGroup");
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
        .pipe(gulp.dest("./<%=projectName%>/", {
            "overwrite": true
        }));
});

gulp.task('prettify1', ['packageElements'], function () {
    return gulp.src("./<%=projectName%>/CodeModule/Elements.xml")
        .pipe(prettyData({
            type: 'prettify'
        }))
        .pipe(gulp.dest("./<%=projectName%>/CodeModule/", {
            "overwrite": true
        }));
});

gulp.task('prettify2', ['packagespdata'], function () {
    return gulp.src("./<%=projectName%>/CodeModule/SharePointProjectItem.spdata")
        .pipe(rename("SharePointProjectItem.spdata.xml"))
        .pipe(prettyData({
            type: 'prettify'
        }))
        .pipe(rename("SharePointProjectItem.spdata"))
        .pipe(gulp.dest("./<%=projectName%>/CodeModule/", {
            "overwrite": true
        }));
});

//If we get problems with unidentified package items then delete the .suo files in a new task item

gulp.task('prettify3', ['packagecsproj'], function () {
    return gulp.src("./<%=projectName%>/<%=projectName%>.csproj")
        .pipe(rename("<%=projectName%>.csproj.xml"))
        .pipe(prettyData({
            type: 'prettify'
        }))
        .pipe(rename("<%=projectName%>.csproj"))
        .pipe(gulp.dest("./<%=projectName%>/", {
            "overwrite": true
        }));
});


gulp.task('msbuild', ['packagesp'], function () {
    return gulp.src("./<%=projectName%>/<%=projectName%>.csproj")
        .pipe(msbuild({
            targets: ['Package'],
            toolsVersion: 12.0,
            properties: { 
                OutputPath:"./bin/package"}
        }));

});
