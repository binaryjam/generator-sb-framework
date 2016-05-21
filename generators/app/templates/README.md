# SandBoxSharePointFrameworkSln
Place to develop a sandbox solution to emulate the new SP framework.  Use vs code and js techniques to develop the webparts, tools like webpack, browserify browsersync, and gulp to part build and quick deploy to webdav locations

##Background
About a month ago, before the announcement of the new SP framework, I'd been working on creating in-page CEWP that loads html/js etc, because, well we all hate App parts.
That has been going well, but repeatable deployment was becoming a pain.  I decided to use Declarative sandbox solutions, they allow me 
deploy my files, create a custom .wepbart based on the CEWP but wit my basic info in there. This was much better.  I was doing the initial install and editing the js/css in VSCode via webdav.
I started to use gulp to watch and autocopy to the site.  In the mean time I was also learning angular/2,gulp,npm etc and picking up more and more
of the latest techniques.  I included more of these into my work.

Then they announced the new SP framework, well that sounds a lot like what I'm doing, better of course they have resources, I'm just doing my day job
trying to make life easier.  So I decided to try to bring all the bits of the lifecycle I've learned up to now and try to make the 2010/2013 
equivalent.

##Goals
I want this to be able to:
  1. Yeoman project into life
  2. Edit webpart in VS code.
  3. Have browsersync/Lite-server/webpackdevserver viewing capabilities - quick reload and view after build
  4. Build process creates local and sharepoint versions of src
  5. Packages files into Sharepoint Project
     a. Copy files to Module area
     b. Auto edit XML elements for additional files not bundled (images, if stored in SP not CDN)
     c. MSBuild the WSP file - without starting studio and manually do it, else DDF Makecab it
  
  6. Provide different starter versions for those wanting to use knockout or angular or angular2
  7. Further variations on whether you want to use concat, requirejs, webpack, browserify, jspm as your module loaders
  8. No SharePoint required on developer machine!!!!
  9. Can hand this project off to JS dev/designers who doesnt know SharePoint, may need some help later but even better if not.
  
##Getting Started
First we need to tackle not requiring SharePoint on the developer machine, initially we have to build using VS2015, but we don't
need SharePoint installed to do this for declarative sandbox solutions.

Follow this guide. You only need the registry setting, Declarative SB's don't need DLL's so skip it.
   https://weblogs.asp.net/ricardoperes/sharepoint-pitfalls-creating-a-visual-studio-project-without-sharepoint-locally-installed
   
You are going to need Node.JS.  Install that.
    https://nodejs.org/en/download/
If you are behind a corporate proxy google for "npm proxy settings" and configure it.

Once done we have some dependancies, open up a node command prompt (better still you added node to your path).

Install gulp globally
  npm install -g gulp

Install VS Code
  https://code.visualstudio.com/Download
  
Install Git, even if you don't use it yourself you are likely to need it, you can skip this if you want,
and may have to configure its proxy settings also.

everything after this needs more work, wel it all does but below is really really draft
-----  
fork and clone this project or just plain download it to a folder.

open a CMD prompt
cd into the root of the folder where the package.json file is.
run 
  npm install
That will get all the dependancies and install them locally.
run 
   npm run dev
This will launch the lite-server and watch the build files
run
    code .

Lauch VS code.

edit the webpart.html and the files in the src/js folder
hit CTRL-B  this will build local,sp and packagesp files 

To make a WSP load the Sln file in VS2015 - You need the office Dev SDK as well as 2015.
Right Mouse on the project and Publish it,  pick a deployment folder for your WSP.

This is the process so far,  it needs work, but I've banged this out in half a day really.
More to do, the images and xml edit first,  then at this point the project splits into module loader diffs and figuring out a 
better publish method without loading VS2015, better still just using makecab, but it's been a while since i ddf built anything.

Also anyone want to help ?





  
  
