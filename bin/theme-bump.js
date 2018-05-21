#!/usr/bin/env node

const pkg = require('../package.json');
const program = require('commander');
const bump = require('..');
const chalk = require('chalk');

const log = (msg) => {
    console.log(msg || '');
};

const error = (msg) => {
    console.error();
    console.error(chalk.red(msg));
    process.exit(1);
};

program
  .usage('[options] <version>')
  .version(pkg.version)
  .option('-d, --directory <dir>', 'Determine the directory to use as the root (default: pwd)', process.cwd())
  .option('-f, --force', 'Update version on protected themes', false)
  .description('Bump the version number in your themes, where <version> can be semver version or type')
  .parse(process.argv);

if (program.args.length !== 1) program.help();

try {
    const dir = program.directory;
    const force = program.force;
    const version = program.args.shift();

    var info = bump(dir, version, force);
    var themes = Object.keys(info);
} catch (e) {
    error(e.message);
}

log();
themes.forEach((theme) => {
    const output = info[theme];
    log(`Version bumped to ${chalk.green(output.version)} for ${chalk.green(output.title.toLowerCase())}`);
})
