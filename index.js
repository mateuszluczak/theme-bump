const increment = require('semver').inc;
const { writeFileSync, lstatSync, readdirSync, existsSync } = require('fs');
const { join, resolve } = require('path');

const excludedDirs = ['node_modules', 'content'];
const themeInfoName = 'theme.json';

const isExcludedDirectory = (source) => {
   return source.startsWith('.') || excludedDirs.indexOf(source) > -1;
};

const isDirectory = (source) => {
    return lstatSync(source).isDirectory();
};

const isTheme = (source) => {
    const contents = readdirSync(source);
	return contents.includes(themeInfoName);
};

const getThemeInfo = (source) => {
    const path = resolve(source, themeInfoName);
    if (!existsSync(path)) return {};
    return require(path);
};

const getName = (path) => {
    return /[^/]*$/.exec(path)[0];
};

const getThemes = (source) => {
    let themes = [];

    if (!existsSync(source)) {
        throw new Error('Not existing directory'); 
        return false;
    }

    if (isDirectory(source) && isTheme(source)) {
        themes.push(source);
    } else {
        readdirSync(source).forEach((file) => {
            const filename = join(source, file);
    
            if (isExcludedDirectory(source)) {
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
};

const bump = (root, version, force) => {
    const themePaths = getThemes(root);
    const themes = {};  

    themePaths.forEach((themePath) => {
        const res = {};
        const info = getThemeInfo(themePath);
        const path =  resolve(themePath, themeInfoName);

        if (!info.version) throw new Error(`Invalid theme.json in ${getName(themePath)}`);
        if (info.protectedTheme && !force) return;

        res.title = info.title;                
        res.old = info.version;
        
        info.version = info.version.replace(/-/g, '.');

        const bumped = (!~version.indexOf('.')) ? increment(info.version, version) : version;
        if (!bumped) throw new Error('Invalid version specified');

        info.version = bumped.replace(/\./g, '-');
        res.new = info.version;

        themes[themePath] = res;

        writeFileSync(path, JSON.stringify(info, null, 2));
    });

    return themes;
};

module.exports = bump;
