# generator-sb-framework [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> Yeoman generator to create aSharePoint  Declarative Sandbox solution.
This project is split into multiple directory structures that should allow a we developer to create a simple WebPart using
the usual web stack tools, like VS Code, gulp, browser-sync to create a SharePoint sandbox WSP.

It is for windows users,  because it relies on MSBuild , Visual Studio and the Office Dev SDK having been installed to enable
the gulp file to MSbuild the WSP file for you.

The gulp build process bundles/copies the html, js, css, images into local and sharepoint folders, local so you can test outside of
SharePoint in a wrapper page to emulate a webpart in a page, and sharepoint so we can automatically edit the Elements.xml .spdata and csproj files
of the Vis Studio project created for you to enable automatic build via MSBUILD. 

## Installation

Below is the standard yeoman install stuff. I have had issues because of being behind a corporate proxy
you need to consider proxy settings all over the place.
  
      npm congig
      git config
      .nsprc   -- This one specifically for the generator to work.
      
If you live behind a corporate proxy, do yourself a favour and set up fiddler for a start and send traffic through there, at least you can debug it.
Also, if you can, consider a tool like 

      "Proxifier"
Then you can unset your proxy settings everywhere, I mean everywhere, not just this project. As this is a winsock layer proxy handler that 
intercepts IP traffic and routes it to the correct proxy based on a ruleset you tell it.  It's pay for so ...... :-(
      

Next, install [Yeoman](http://yeoman.io) and generator-sb-framework using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
npm install -g generator-sb-framework
```

Then generate your new project:

```bash
yo sb-framework
```

After this is done, you will need to cd into the sub folder for your project name.

Now run 
```bash
npm install 
```
This will install all the dependencies required to enable the automatic gulp builds.

Despite Node being javascript you will find some people can't just leave it alone and refer to their old languages,
So I have had to install Python to make some packages work, Python 2 not 3,  You will need to make sure that you set 
the environment variables, do it properly not inthe CMD file else you have to keep doing it.

(Check you did install python to this directory of course) 

PATH=%PATH%;C:\Program Files\Python\python.exe
PYTHON=C:\Program Files\Python\python.exe


The xml editor package uses libxmljs package which has to be built with the windows SDK,   I had multiple versions of studio
so this caused all sorts of issues.

So I did this, this made it work for me.
 
```bash
npm config set msvs_version 2015 --global
```

Another thing to consider is the MS build task in the gulp file, you may have to alter the toolsVersion to suit your installed
VS Studio/Windows SDK.  Notice the OUTPUTPATH, cos this is where you WSP is put.

```bash
gulp.task('msbuild', ['packagesp'], function () {
    return gulp.src("./<%=projectName%>/<%=projectName%>.csproj")
        .pipe(msbuild({
            targets: ['Package'],
            toolsVersion: 12.0,
            stdout:true,
            properties: { 
                OutputPath:"./bin/package"}
        }));

});
```

Once you created this package, load the folder in VSCode,  I wrote this with VSCODE in mind so the settings files are for that.
I use the installed VSCode packages : jshint and beautify PrettyfyJson.  You dont need them as the bundler does most of this, but
jshint is worth installing.  It's merits over eshint I leave to you.

The VSCode setting "files.exclude" hides most of the folders from view.  Edit the settings.json to hide/undide stuff you want to see.

You edit your html js in the Webcomponents/src folder. You may not like the folder structure but this is v1, perhaps we can lose the WebComponents Parent and jsut rename it Src or something,
but today this is what it is.

Open a CMD file from here and run

```bash
npm run dev
```  

This will start the lite-server (https://github.com/johnpapa/lite-server), that will monitor the files in the local build
and run a web server and brower-sync.  The settings for which are in the (hidden) bs-config.json.  Go change them if you want.

To build the project, and you need to each time you edit and want to see a change (bundling/browsersync). hit CTRL-B
and it will run the gulp tasks you need.

To make a WSP, hit F1, type task, Select run Task, then run .BUILDWSP.

All the tasks you see are part of the process.  Only run the ones beginning with ".", the others are all part of the process
but because gulp can't do hidden tasks you see them all.  Once day in gulp 4 maybe.  For now I use that nomenclature.

This is early days, be gentle.


## Generator built for Yeoman, using generator-generator

 * Yeoman has a heart of gold.
 * Yeoman is a person with feelings and opinions, but is very easy to work with.
 * Yeoman can be too opinionated at times but is easily convinced not to be.
 * Feel free to [learn more about Yeoman](http://yeoman.io/).

## License

MIT © [binaryjam]()


[npm-image]: https://badge.fury.io/js/generator-sb-framework.svg
[npm-url]: https://npmjs.org/package/generator-sb-framework
[travis-image]: https://travis-ci.org/binaryjam/generator-sb-framework.svg?branch=master
[travis-url]: https://travis-ci.org/binaryjam/generator-sb-framework
[daviddm-image]: https://david-dm.org/binaryjam/generator-sb-framework.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/binaryjam/generator-sb-framework
