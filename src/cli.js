const { Command } = require('commander');
const pm2 = require('pm2');
const { registerPrompt, prompt } = require('inquirer');
const generate = require('project-name-generator');
const { createSpinner } = require('nanospinner');

const program = new Command();
const config = require("../package.json");
const path = require('path');

program
	.name(config.name)
	.description(config.description)
	.version(config.version);

registerPrompt('fuzzypath', require('inquirer-fuzzy-path'))

module.exports.cli = function (args) {
	program.command('create')
		.description('Create a pm2 application instance and register it to Runpier.')
		.action(() => {
			console.log('Hi, please make sur that you are in the folder of the application that you want to run');

			const questions = [
				{
					type: 'list',
					name: 'type',
					message: 'Type of pm2 instance to run?',
					choices: ['Normal', 'Custom interpreter', 'Npm script'],
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
					type: 'fuzzypath',
					name: 'path',
					excludePath: nodePath => nodePath.startsWith('node_modules') || nodePath.startsWith('.git'),
					excludeFilter: nodePath => nodePath == '.',
					itemType: 'any',
					rootPath: './',
					message: 'Select a target file for your app',
					suggestOnly: false,
					depthLimit: 5,
					when(answers) {
						return answers.type == 'custom interpreter' || answers.type == 'normal';
					},
					filter(val) {
						return { entirePath: path.resolve(val), path: path.dirname(path.resolve(val)), name: val };
					},
				},
				{
					type: 'input',
					name: 'name',
					message: 'Application name?',
					default: generate({ words: 2, number: true }).dashed
				},
			];

			prompt(questions).then((answers) => {
				const spinner1 = createSpinner('Connecting to pm2 instance').start();
				pm2.connect(function (err) {
					if (err) {
						console.error(err);
						spinner1.error({ text: "Failed to connect" });
						process.exit(2);
					}
					spinner1.success();

					const spinner2 = createSpinner('Creating app').start();
					if (answers.type == "normal") {
						pm2.start({
							script: answers.path.entirePath,
							cwd: answers.path.path,
							name: answers.name
						}, function (err, apps) {
							if (err) {
								console.error(err);
								spinner2.error({ text: "Failed to start app" });
							}
							spinner2.success();
							pm2.disconnect();
						});
					} else if (answers.type == "custom interpreter") {
						pm2.start({
							script: answers.path.name,
							cwd: answers.path.path,
							name: answers.name,
							interpreter: answers.interpreter,
							interpreter_args: answers.interpreter_args
						}, function (err, apps) {
							if (err) {
								console.error(err);
								spinner2.error({ text: "Failed to start app" });
							}
							spinner2.success();
							pm2.disconnect();
						});
					} else if (answers.type == "npm script") {
						pm2.start({
							name: answers.name,
							script: 'npm',
							args: answers.script,
							interpreter: 'none',
						}, function (err, apps) {
							if (err) {
								console.error(err);
								spinner2.error({ text: "Failed to start app" });
							}
							spinner2.success();
							pm2.disconnect();
						});
					}
				});
			});
		});
	program.command('start')
		.description('Start a pm2 application instance.')
		.action(() => {
			const spinner1 = createSpinner('Connecting to pm2 instance').start();
			pm2.connect(function (err) {
				if (err) {
					console.error(err);
					spinner1.error({ text: "Failed to connect" });
					process.exit(2);
				}
				spinner1.success();

				const spinner2 = createSpinner('Getting list of applications').start();
				pm2.list(function (err, list) {
					if (err) {
						console.error(err);
						spinner2.error({ text: "Failed to get list of applications" });
						process.exit(2);
					}
					spinner2.success();

					var choices = [];
					for (app of list) {
						choices.push(app.name);
					}

					prompt({
						type: 'list',
						name: 'app_name',
						message: 'What application do you want to start?',
						choices
					}).then((answer) => {
						const spinner3 = createSpinner('Starting application').start();
						pm2.restart(answer.app_name, (err, proc) => {
							if (err) {
								console.error(err);
								spinner3.error({ text: "Failed to start application" });
								process.exit(2);
							}

							spinner3.success();
							pm2.disconnect();
						});
					});

				});
			});
		});
	program.command('stop')
		.description('Stop a pm2 application instance.')
		.action(() => {
			const spinner1 = createSpinner('Connecting to pm2 instance').start();
			pm2.connect(function (err) {
				if (err) {
					console.error(err);
					spinner1.error({ text: "Failed to connect" });
					process.exit(2);
				}
				spinner1.success();

				const spinner2 = createSpinner('Getting list of applications').start();
				pm2.list(function (err, list) {
					if (err) {
						console.error(err);
						spinner2.error({ text: "Failed to get list of applications" });
						process.exit(2);
					}
					spinner2.success();

					var choices = [];
					for (app of list) {
						choices.push(app.name);
					}

					prompt({
						type: 'list',
						name: 'app_name',
						message: 'What application do you want to stop?',
						choices
					}).then((answer) => {
						const spinner3 = createSpinner('Stop application').start();
						pm2.stop(answer.app_name, (err, proc) => {
							if (err) {
								console.error(err);
								spinner3.error({ text: "Failed to start application" });
								process.exit(2);
							}
							spinner3.success();
							pm2.disconnect();
						})
					});

				});
			});
		});
	program.command('restart')
		.description('Restart a pm2 application instance.')
		.action(() => {
			const spinner1 = createSpinner('Connecting to pm2 instance').start();
			pm2.connect(function (err) {
				if (err) {
					console.error(err);
					spinner1.error({ text: "Failed to connect" });
					process.exit(2);
				}
				spinner1.success();

				const spinner2 = createSpinner('Getting list of applications').start();
				pm2.list(function (err, list) {
					if (err) {
						console.error(err);
						spinner2.error({ text: "Failed to get list of applications" });
						process.exit(2);
					}
					spinner2.success();

					var choices = [];
					for (app of list) {
						choices.push(app.name);
					}

					prompt({
						type: 'list',
						name: 'app_name',
						message: 'What application do you want to restart?',
						choices
					}).then((answer) => {
						const spinner3 = createSpinner('Restarting application').start();
						pm2.restart(answer.app_name, (err, proc) => {
							if (err) {
								console.error(err);
								spinner3.error({ text: "Failed to restart application" });
								process.exit(2);
							}

							spinner3.success();
							pm2.disconnect();
						});
					});

				});
			});
		});
	program.command('dashboard')
		.description('Getting pm2 dashboard')
		.action(() => {
			const spinner1 = createSpinner('Connecting to pm2 instance').start();
			pm2.connect(function (err) {
				if (err) {
					console.error(err);
					spinner1.error({ text: "Failed to connect" });
					process.exit(2);
				}
				spinner1.success();

				const pm2_dash = require("../node_modules/pm2/lib/API");
				new pm2_dash().dashboard();
			});
		});
	program.parse();
}