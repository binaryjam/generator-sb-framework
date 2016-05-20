'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the flawless ' + chalk.red('generator-sb-framework') + ' generator!'
    ));

    function valLength(input){
       return (input.length > 0) ? true : "You gotta enter something, you know";
    }

    var prompts = [
      {
        type: 'input',
        name: 'projectName',
        message: "Whats the solution name (don't add a word like solution or Sln i'll do it)",
        default: "SBFrameWorkPart", // Default to current folder name
        validate: valLength
      },
      {
        type: 'input',
        name: 'webPartName',
        message: 'Whats the name of the web part',
        validate: valLength
      },
      {
        type: 'input',
        name: 'webPartDesc',
        message: 'Part Description ',
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
    this.fs.copy(
      this.templatePath('dummyfile.txt'),
      this.destinationPath('dummyfile.txt')
    );

    this.fs.copy(this.templatePath(), this.destinationPath(), true);

  },

  install: function () {
    this.npmInstall();
  }
});
