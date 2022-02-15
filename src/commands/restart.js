const { prompt } = require('inquirer');
const { createSpinner } = require('nanospinner');
const pm2 = require('pm2');

module.exports.run = function (program) {
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
}