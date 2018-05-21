# Theme Version Bump

Easily bump theme version in Creative Exchange packages

## Installation

    $ npm install -g theme-bump

## Usage

    $ theme-bump patch 

        Version bumped to 0.4.1 in package.json and component.json.

## API

#### bump(root, version, force)

    bump('/path/to/package', 'minor');
    bump('/path/to/package', 'major', true); // also protected themes

## License

MIT
