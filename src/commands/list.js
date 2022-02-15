const { createSpinner } = require('nanospinner');
const pm2 = require('pm2');
const { green, cyan } = require('kleur');

module.exports.run = function (program) {
	program.command('list')
		.description('Get list of running pm2 applications.')
		.action(() => {
			const spinner1 = createSpinner('Connecting to pm2 instance').start();
			pm2.connect(function (err) {
				if (err) {
					console.error(err);
					spinner1.error({ text: "Failed to connect" });
					process.exit(2);
				}
				spinner1.success();

				const spinner2 = createSpinner('Getting app list').start();
				pm2.list(function (err, list) {
					if (err) {
						console.error(err);
						spinner2.error({ text: "Failed to start app" });
					}
					spinner2.success();

					for (app of list) {
						console.log(cyan(`→ [${app.pm_id}] ${app.name}`));
					}

					pm2.disconnect();
				});
			});
		});
}