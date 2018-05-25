# Theme Version Bump

Easily bump theme version in Creative Exchange packages

## Installation

    $ npm i theme-bump -g

## Usage

    $ theme-bump patch 

        Version bumped by patch in theme.json of theme in package

## API

#### bump(root, version, force)

    bump('/path/to/package', 'minor');
    bump('/path/to/package', 'major', true); // also protected themes

## License

MIT
