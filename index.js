const increment = require('semver').inc;
const { writeFileSync, lstatSync, readdirSync, existsSync } = require('fs');
const { join, resolve } = require('path');
const diff = require('lodash.difference');

const excludedDirs = ['node_modules'];
const themesPath = 'etc/designs/zg';
const themeInfoName = 'theme.json';
const themeContents = ['desktop', themeInfoName]

const isDirectory = (source) => {
    return lstatSync(source).isDirectory();
};

const getDirectories = (source) => {
    return readdirSync(source).map(name => join(source, name)).filter(isDirectory);
};

const isTheme = (source) => {
    const contents = readdirSync(source);
    return diff(contents, themeContents).length === 0;
}

const getThemes = (source) => {
    let themes = [];

    if (!existsSync(source)) {
        throw new Error('Not existing directory'); 
        return;
    }

    if (isDirectory(source) && isTheme(source)) {
        themes.push(source);
    } else {
        readdirSync(source).forEach((file) => {
            const filename = join(source, file);
    
            if (file.startsWith('.') || excludedDirs.indexOf(file) > -1) {
                return false;
            }
    
            if (isDirectory(filename)) {
                if (isTheme(filename)) {
                    themes.push(filename);
                } else {
                    themes = themes.concat(getThemes(filename)); 
                }
            }
        });
    }

    return themes;
}

const getThemeInfo = (source) => {
    const path = resolve(source, themeInfoName);
    if (!existsSync(path)) return {};
    return require(path);
};

const getName = (path) => {
    return /[^/]*$/.exec(path)[0];
};

const bump = (root, version, force) => {
    if (!existsSync(root)) throw new Error('Not existing directory'); 

    const themePaths = getThemes(root);
    const themes = {};  

    themePaths.forEach((themePath) => {
        const info = getThemeInfo(themePath);
        const path =  resolve(themePath, themeInfoName);

        if (!info.version) throw new Error('No version in theme "' + getName(themePath) + '"');
        if (info.protectedTheme && !force) return;

        info.version = info.version.replace(/-/g, '.');

        const bumped = (!~version.indexOf('.')) ? increment(info.version, version) : version;
        if (!bumped) throw new Error('Invalid version specified');

        info.version = bumped.replace(/\./g, '-');

        themes[themePath] = info;

        writeFileSync(path, JSON.stringify(info, null, 2));
    });

    return themes;
};

module.exports = bump;