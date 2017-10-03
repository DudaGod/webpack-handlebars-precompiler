'use strict';

const path = require('path');
const _ = require('lodash');
const Handlebars = require('handlebars');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const mkdirp = require('mkdirp');
const utils = require('./utils');

module.exports = class HandlebarsPrecompile {
    constructor(options = {}) {
        this._options = _.defaults(options, {
            templatesDir: `${__dirname}/templates`,
            templateExt: '.hbs',
            helpersDir: `${__dirname}/helpers`,
            outputFile: `${__dirname}/output/compiled-handlebars.js`
        });
    }

    apply(compiler) {
        compiler.plugin('run', (compilation, cb) => {
            this._cb = cb;

            return Promise.all([
                prepareHandlebars(),
                prepareTemplates(this._options.templatesDir, this._options.templateExt),
                preparePartials(),
                prepareHelpers(this._options.helpersDir)
            ])
            .spread((handlebars, templates, partials, helpers) => {
                const result = _.concat(handlebars, templates, partials, helpers).join('');
                const dirName = path.dirname(this._options.outputFile);

                return Promise.resolve(mkdirp(dirName))
                    .then(() => fs.writeFileAsync(this._options.outputFile, result));
            })
            .then(cb)
            .catch(cb);
        });
    }
};

function prepareHandlebars() {
    return [
        `Handlebars = Handlebars || {};\n`,
        `Handlebars.templates = Handlebars.templates || {};\n\n`
    ];
}

function prepareTemplates(templatesDir, extension) {
    return utils.getFilePaths(templatesDir)
        .then((paths) => filterByExtension(paths, extension))
        .then((paths) => {
            return Promise.all([
                utils.getFileNames(paths),
                utils.readFiles(paths)
            ])
            .spread(_.zipObject);
        })
        .then(precompileTemplates);
}

function filterByExtension(templatePaths, extension) {
    return templatePaths.filter((p) => path.extname(p) === extension)
}

function precompileTemplates(templates) {
    const fileNames = _.keys(templates);

    return Promise.map(_.values(templates), (tmplData, key) => {
        tmplData = Handlebars.precompile(tmplData);
        return `Handlebars.templates['${fileNames[key]}'] = Handlebars.template(${tmplData});\n\n`;
    });
}

function preparePartials() {
    // there isn't really any difference between a partial and a template
    return `Handlebars.partials = Handlebars.templates\n\n`;
}

function prepareHelpers(helpersDir) {
    return utils.getFilePaths(helpersDir).then(utils.readFiles);
}
