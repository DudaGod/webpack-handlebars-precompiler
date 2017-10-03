'use script';

const _ = require('lodash');
const path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

exports.getFilePaths = (basePath) => {
    function readDirFiles(basePath) {
        return fs.readdirAsync(basePath)
            .then((paths) => {
                return Promise.all(paths.map((p) => exports.getFilePaths(path.join(basePath, p))))
                    .then(_.flatten);
            });
    }

    return fs.statAsync(basePath)
        .then((stat) => stat.isFile() ? [basePath] : readDirFiles(basePath))
        .catch((err) => {
            throw new Error(err.stack || err.message);
        });
};

exports.readFiles = (paths) => Promise.map(paths, (p) => fs.readFileAsync(p, 'utf-8'));

exports.getFileNames = (paths) => paths.map((p) => path.basename(p, path.extname(p)));
