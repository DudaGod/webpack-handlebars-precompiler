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
      templatesDir: path.join(__dirname, 'templates'),
      templateExt: '.hbs',
      helpersDir: path.join(__dirname, 'helpers'),
      outputFile: path.join(__dirname, 'some/folder/bundle.js')
    })
  ]
  ...
}
```
