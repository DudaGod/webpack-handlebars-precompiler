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
            precompileOpts: {},
            templatesPath: path.join(__dirname, 'templates'),
            templatesExt: '.hbs',
            outputFile: path.join(__dirname, 'hbs-precompiled.js')
        });
    }

    apply(compiler) {
        compiler.plugin('run', (compilation, cb) => {
            this._cb = cb;
            const {templatesPath, templatesExt, precompileOpts} = this._options;

            return Promise.all([
                prepareHandlebars(),
                prepareTemplates({templatesPath, templatesExt, precompileOpts}),
                preparePartials(),
                prepareHelpers(this._options.helpersPath)
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

function prepareTemplates({templatesPath, templatesExt, precompileOpts}) {
    return utils.getFilePaths(templatesPath)
        .then((paths) => filterByExtension(paths, templatesExt))
        .then((paths) => {
            return Promise.all([
                utils.getFileNames(paths),
                utils.readFiles(paths)
            ])
            .spread(_.zipObject);
        })
        .then((templates) => precompileTemplates(templates, precompileOpts));
}

function filterByExtension(templatePaths, extension) {
    return templatePaths.filter((p) => path.extname(p) === extension)
}

function precompileTemplates(templates, precompileOpts) {
    const fileNames = _.keys(templates);

    return Promise.map(_.values(templates), (tmplData, key) => {
        tmplData = Handlebars.precompile(tmplData, precompileOpts);
        return `Handlebars.templates['${fileNames[key]}'] = Handlebars.template(${tmplData});\n\n`;
    });
}

function preparePartials() {
    // there isn't really any difference between a partial and a template
    return `Handlebars.partials = Handlebars.templates\n\n`;
}

function prepareHelpers(helpersPath) {
    if (!helpersPath) {
        return;
    }

    return utils.getFilePaths(helpersPath).then(utils.readFiles);
}
