'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

var packageId = "3555ac31-11dd-4174-97c6-a3cbbcfd3bb4";
var solutionId = "3555ac31-11dd-4174-97c6-a3cbbcfd3bb4";
var featureRefId = "dd8379d3-79d5-49f2-8d10-6130e79373f6";

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the flawless ' + chalk.red('generator-sb-framework') + ' generator!' + '\n\n' +
      'This creates a folder Hierarchy of :Project+"Sln"/Project/Parts:, So have some name ideas ready' + '\n\n' +
      'The project requires VS2013 and the Office Dev kit as it generates a VS2013  SharePoint Solution' + '\n\n' +
      'But you can just worry about the html and let gulp build the SharePointy bits.'
    ));

    function valLength(input) {
      return (input.length > 0) ? true : "You gotta enter something, you know";
    }

    var prompts = [
      {
        type: 'input',
        name: 'projectName',
        message: "Whats the project name)",
        default: "MyNewProject", // Default to current folder name
        validate: valLength
      },
      {
        type: 'input',
        name: 'webPartName',
        message: 'Whats the name of the web part',
        default: "MyNewPart", // Default to current folder name
        validate: valLength
      },
      {
        type: 'input',
        name: 'webPartDesc',
        message: 'Part Description ',
        default: "A web part that does stuff", // Default to current folder name
        validate: valLength
      },
      {
        type: 'input',
        name: 'url',
        message: 'Url of Dev Site Collection ',
        default: "http://localhost/", // Default to current folder name
        validate: valLength
      }
    ];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.webPartName;
      this.props = props;
    }.bind(this));
  },

  writing: function () {

    this.fs.copy(this.templatePath("*.*"), this.destinationPath(this.props.projectName + 'Sln'), true);
    this.fs.copy(this.templatePath(".gitignore"), this.destinationPath(this.props.projectName + 'Sln/.gitignore'), true);

    this.fs.copy(this.templatePath(".vscode"), this.destinationPath(this.props.projectName + 'Sln/.vscode'), true);

    this.fs.copy(this.templatePath("WebComponents/.container"), this.destinationPath(this.props.projectName + 'Sln/WebComponents/.container'), true);
    this.fs.copy(this.templatePath("WebComponents/buildSP"), this.destinationPath(this.props.projectName + 'Sln/WebComponents/buildSP'), true);
    this.fs.copy(this.templatePath("WebComponents/src"), this.destinationPath(this.props.projectName + 'Sln/WebComponents/src'), true);

    this.fs.copy(this.templatePath("WebComponents/buildlocal/loader.htm"),
      this.destinationPath(this.props.projectName + 'Sln/WebComponents/buildlocal/loader.htm'), true);

    this.fs.copy(this.templatePath("WebComponents/buildlocal/SBFrameWork/SandboxFrameworkPart"),
      this.destinationPath(this.props.projectName + 'Sln/WebComponents/buildlocal/' + this.props.projectName + '/' +
        this.props.webPartName), true);
    //All the nasty templating bits now    
    this.fs.copy(this.templatePath("SandBoxSharePointFramework/CodeModule"),
      this.destinationPath(this.props.projectName + 'Sln/' + this.props.projectName + "/CodeModule"), true);

    this.fs.copy(this.templatePath("SandBoxSharePointFramework/Properties"),
      this.destinationPath(this.props.projectName + 'Sln/' + this.props.projectName + "/Properties"), true);

    this.fs.copyTpl(
      this.templatePath('SandBoxSharePointFramework/Package'),
      this.destinationPath(this.props.projectName + 'Sln/' + this.props.projectName + 'Package'),
      {
        packageId: packageId,
        solutionId: solutionId,
        featureRefId: featureRefId
      }
    );
    
    TODO : WebPartModule bits template those

  },

  install: function () {
    this.npmInstall();
  }
});
