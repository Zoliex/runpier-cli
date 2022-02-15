module.exports.run = function (program) {
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
}