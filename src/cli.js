const { Command } = require('commander');
const pm2 = require('pm2');
const inquirer = require('inquirer');
const program = new Command();
const config = require("../package.json");

inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'))

program
	.name(config.name)
	.description(config.description)
	.version(config.version);

program.command('create')
	.description('Create a pm2 application instance and register it to Runpier')
	.action(() => {
		console.log('Hi, please make sur that you are in the folder of the application that you want to run');

		const questions = [
			{
				type: 'list',
				name: 'type',
				message: 'Type of pm2 instance to run?',
				choices: ['Normal', 'Custom interpreter', 'Npm script', 'Custom command'],
				filter(val) {
					return val.toLowerCase();
				},
			},
			{
				type: 'input',
				name: 'interpreter',
				message: 'Interpreter to use',
				default: "node",
				when(answers) {
					return answers.type == 'custom interpreter';
				},
			},
			{
				type: 'input',
				name: 'interpreter_args',
				message: 'Interpreter args?',
				default: "",
				when(answers) {
					return answers.type == 'custom interpreter';
				},
			},
			{
				type: 'input',
				name: 'script',
				message: 'Npm script to use',
				default: "start",
				when(answers) {
					return answers.type == 'npm script';
				},
			},
			{
				type: 'input',
				name: 'command',
				message: 'Enter custom command to run',
				default: "node ./index.js",
				when(answers) {
					return answers.type == 'custom command';
				},
			},
			{
				type: 'fuzzypath',
				name: 'path',
				excludePath: nodePath => nodePath.startsWith('node_modules') || nodePath.startsWith('.git'),
				excludeFilter: nodePath => nodePath == '.',
				itemType: 'any',
				rootPath: './',
				message: 'Select a target file for yout app',
				suggestOnly: false,
				depthLimit: 5,
				when(answers) {
					return answers.type == 'custom interpreter' || answers.type == 'normal';
				},
			},
			{
				type: 'input',
				name: 'name',
				message: 'Application name?',
			},
			{
				type: 'input',
				name: 'icon',
				message: 'Font awesome v6 icon?',
				default: "fa-solid fa-vial"
			},
			{
				type: 'input',
				name: 'color',
				message: 'Color of the icon?',
				default: "#ff0000"
			},
		];

		inquirer.prompt(questions).then((answers) => {
			console.log('\nAnswers:');
			console.log(JSON.stringify(answers, null, '  '));
		});
	});

program.parse();