const increment = require('semver').inc;
const { writeFileSync, lstatSync, readdirSync, existsSync } = require('fs');
const { join, resolve } = require('path');
const diff = require('lodash.difference');

const packageDirectories = ['content', 'etc'];
const themesPath = 'etc/designs/zg';
const themeInfoName = 'theme.json';

const isDirectory = (source) => {
    return lstatSync(source).isDirectory();
};

const isPackageRoot = (source) => {
    return diff(packageDirectories, getDirectories(source).map(dir => getName(dir))).length === 0;
}

const getDirectories = (source) => {
    return readdirSync(source).map(name => join(source, name)).filter(isDirectory);
};

const getThemes = (source) => {
    const path = join(source, themesPath);
    if (!existsSync(path)) return [];
    return getDirectories(join(source, themesPath));
};

const getThemeInfo = (source) => {
    const path = resolve(source, themeInfoName);
    return require(path);
};

const getName = (path) => {
    return /[^/]*$/.exec(path)[0];
};

const bump = (root, version, force) => {
    if (!existsSync(root)) throw new Error('Not existing directory'); 
    if (!isPackageRoot(root)) throw new Error('Directory is not a root of Creative Exchange package');

    const themePaths = getThemes(root);
    const themes = {};  

    themePaths.forEach((themePath) => {
        const info = getThemeInfo(themePath);
        const path =  resolve(themePath, themeInfoName);

        if (!info.version) throw new Error('No version in theme "' + getName(themePath) + '"');
        if (info.protectedTheme && !force) return;

        info.version = info.version.replace(/-/g, '.');

        const bumped = increment(info.version, version);

        if (!bumped) throw new Error('Invalid version specified');

        info.version = bumped.replace(/\./g, '-');

        themes[themePath] = info;

        writeFileSync(path, JSON.stringify(info, null, 2));
    });

    return themes;
};

module.exports = bump;