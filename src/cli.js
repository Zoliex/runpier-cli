const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const { createSpinner } = require('nanospinner');

const config = require("../package.json");

module.exports.cli = async function (args) {
	const loading = createSpinner('Loading command').start();
	const program = new Command();
	program
		.name(config.name)
		.description(config.description)
		.version(config.version);

	fs.readdirSync(path.join(__dirname + "/commands")).forEach(command => {
		require(path.join(__dirname + `/commands/${command}`)).run(program);
	})

	loading.success();
	program.parse();
}