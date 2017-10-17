# webpack-handlebars-precompiler

A webpack plugin to precompile handlebars templates, partials and helpers into one concatenated file

## Installation

`npm i webpack-handlebars-precompiler --save-dev`

## Usage

### Example

```javascript
const HandlebarsPrecompiler = require('webpack-handlebars-precompiler');

module.exports = {
    ...
    plugins: [
        new HandlebarsPrecompiler({
            precompileOpts: {preventIndent: true},
            templatesPath: path.join(__dirname, 'templates'),
            templatesExt: '.hbs',
            helpersPath: path.join(__dirname, 'helpers'), // optional
            outputFile: path.join(__dirname, 'some/folder/bundle.js')
    })
  ]
  ...
}
```
