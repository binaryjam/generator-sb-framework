/*jslint node: true */
'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

var bigProjectGuid = "FAE04EC0-301F-11D3-BF4B-00C04F79EFBC";
var projectGuid = "FB6D018C-D5DE-4442-98A5-E700A1D102AB";
var packageId = "3555ac31-11dd-4174-97c6-a3cbbcfd3bb4";
var solutionId = "3555ac31-11dd-4174-97c6-a3cbbcfd3bb4";
var featureRefId = "dd8379d3-79d5-49f2-8d10-6130e79373f6";
var featureId = "f3dffdb9-ed23-4039-b3fb-1cf76f3bcb24";
var codeModuleSpdataId = "74e207ce-768d-4e2d-9f0c-8eee41fb88af";
var webpartModuleSpdataId = "578d7194-3970-48ea-803b-1f97b6fae547";

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

        var templateModel = {
            packageId: packageId, solutionId: solutionId, featureRefId: featureRefId,
            featureId: featureId, codeModuleSpdataId: codeModuleSpdataId,
            webpartModuleSpdataId: webpartModuleSpdataId, projectGuid: projectGuid,
            bigProjectGuid: bigProjectGuid,
            webPartName: this.props.webPartName,
            wepPartDesc: this.props.webPartDesc,
            projectName: this.props.projectName
        };

        this.fs.copy(this.templatePath("bs-config.json"),
            this.destinationPath(this.props.projectName + 'Sln/bs-config.json'), true);
        this.fs.copy(this.templatePath("README.md"),
            this.destinationPath(this.props.projectName + 'Sln/README.md'), true);
        this.fs.copy(this.templatePath("jsconfig.json"),
            this.destinationPath(this.props.projectName + 'Sln/jsconfig.json'), true);
        this.fs.copy(this.templatePath(".vscode"), this.destinationPath(this.props.projectName + 'Sln/.vscode'), true);

        this.fs.copyTpl(
            this.templatePath('{package.json,gulpfile.js,.gitignore}'),
            this.destinationPath(this.props.projectName + 'Sln/'),
            templateModel
        );


        this.fs.copyTpl(this.templatePath("WebComponents/.container"), this.destinationPath(this.props.projectName + 'Sln/WebComponents/.container'), templateModel);
        
        this.fs.copy(this.templatePath("WebComponents/buildSP"), this.destinationPath(this.props.projectName + 'Sln/WebComponents/buildSP'), true);
        this.fs.copy(this.templatePath("WebComponents/src"), this.destinationPath(this.props.projectName + 'Sln/WebComponents/src'), true);

        this.fs.copyTpl(this.templatePath("WebComponents/buildlocal/loader.htm"),
            this.destinationPath(this.props.projectName + 'Sln/WebComponents/buildlocal/loader.htm'),
            templateModel);

        this.fs.copy(this.templatePath("WebComponents/buildlocal/SBFrameWork/SandboxFrameworkPart"),
            this.destinationPath(this.props.projectName + 'Sln/WebComponents/buildlocal/' + this.props.projectName + '/' +
                this.props.webPartName), true);

        //CodeModule
        this.fs.copy(
            this.templatePath("SandBoxSharePointFramework/CodeModule/images"),
            this.destinationPath(this.props.projectName + 'Sln/' + this.props.projectName + "/CodeModule/images"),
            true);
        this.fs.copy(
            this.templatePath("SandBoxSharePointFramework/CodeModule/bundle.css"),
            this.destinationPath(this.props.projectName + 'Sln/' + this.props.projectName + "/CodeModule/bundle.css"),
            true);
        this.fs.copyTpl(
            this.templatePath('SandBoxSharePointFramework/CodeModule/{bundle.js,Elements.xml,loader.htm,SharePointProjectItem.spdata}'),
            this.destinationPath(this.props.projectName + 'Sln/' + this.props.projectName + '/CodeModule/'),
            templateModel
        );

        //Features
        this.fs.copyTpl(
            this.templatePath('SandBoxSharePointFramework/Features/SandboxFrameworkPart/SandboxFrameworkPart.feature'),
            this.destinationPath(this.props.projectName + 'Sln/' + this.props.projectName + '/Features/' +
                this.props.webPartName + '/' + this.props.webPartName + '.feature'),
            templateModel
        );
        this.fs.copy(this.templatePath("SandBoxSharePointFramework/Features/SandboxFrameworkPart/SandboxFrameworkPart.Template.xml"),
            this.destinationPath(this.props.projectName + 'Sln/' + this.props.projectName + "/Features/" +
                this.props.webPartName + '/' + this.props.webPartName + '.Template.xml'
            ), true);


        //Properties
        this.fs.copyTpl(this.templatePath("SandBoxSharePointFramework/Properties/AssemblyInfo.cs"),
            this.destinationPath(this.props.projectName + 'Sln/' + this.props.projectName + "/Properties/AssemblyInfo.cs"),
            templateModel);

        //Package
        this.fs.copyTpl(
            this.templatePath('SandBoxSharePointFramework/Package'),
            this.destinationPath(this.props.projectName + 'Sln/' + this.props.projectName + '/Package'),
            templateModel
        );

        //  WebPartModule bits 
        this.fs.copyTpl(
            this.templatePath('SandBoxSharePointFramework/WebPartModule/Elements.xml'),
            this.destinationPath(this.props.projectName + 'Sln/' + this.props.projectName + '/WebPartModule/Elements.xml'),
            templateModel
        );
        this.fs.copyTpl(
            this.templatePath('SandBoxSharePointFramework/WebPartModule/SandboxFrameWorkWebPart.dwp'),
            this.destinationPath(this.props.projectName + 'Sln/' + this.props.projectName + '/WebPartModule/' +
                this.props.webPartName + '.dwp'),
            templateModel
        );
        this.fs.copyTpl(
            this.templatePath('SandBoxSharePointFramework/WebPartModule/SharePointProjectItem.spdata'),
            this.destinationPath(this.props.projectName + 'Sln/' + this.props.projectName + '/WebPartModule/SharePointProjectItem.spdata'),
            templateModel
        );

        //CSProj files
        this.fs.copyTpl(
            this.templatePath('SandBoxSharePointFramework/SandBoxSharePointFrameWork.csproj'),
            this.destinationPath(this.props.projectName + 'Sln/' + this.props.projectName + '/' +
                this.props.projectName + '.csproj'
            ),
            templateModel
        );

        this.fs.copyTpl(
            this.templatePath('SandBoxSharePointFramework/SandBoxSharePointFrameWork.csproj.user'),
            this.destinationPath(this.props.projectName + 'Sln/' + this.props.projectName + '/' +
                this.props.projectName + '.csproj.user'),
            templateModel
        );
    },

    install: function () {
        this.log(yosay(
            'You should install the npm modules yourself.\n Thats because I use gulp-xml-editor, which rebuilds a node compartment\n' +
            'I had to set the correct npm build setting, for me that was\n' +
            '    TODO: Go find out what I set at work, cos everything just works at home\n\n\n' +
            'Also notice the gulpfile.  If you have trouble builing then check out the msbuild task and adjust the toolsVersion\n' +
            "To match your environment,  Ideally use VS2013 or was it 2015, one of them.  I'll know for sure if I get help tesint this project someday"
        ));
    }
});
