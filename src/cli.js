const { Command } = require('commander');
const program = new Command();
const config = require("../package.json");

program
	.name(config.name)
	.description(config.description)
	.version(config.version);

program.command('split')
	.description('Split a string into substrings and display as an array')
	.argument('<string>', 'string to split')
	.option('--first', 'display just the first substring')
	.option('-s, --separator <char>', 'separator character', ',')
	.action((str, options) => {
		const limit = options.first ? 1 : undefined;
		console.log(str.split(options.separator, limit));
	});

program.parse();