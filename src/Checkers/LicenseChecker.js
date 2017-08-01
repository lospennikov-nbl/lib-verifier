// Copyright (c) 2017 Electric Imp
// This file is licensed under the MIT License
// http://opensource.org/licenses/MIT

'use strict';

const AbstractChecker = require('./AbstractChecker');
const fs = require('fs');
const path = require('path');
const LICENSE_PATH = './license.txt';
const LICENSE_FILE_PATH = './LICENSE.example';


class LicenseCheckerError extends Error {
};

class LicenseChecker extends AbstractChecker {

  constructor() {
    super();
    this._extensionsSet = new Set(['.js', '.nut']);
  }

  check(dirpath) {
    const files = this._getFiles(dirpath, []);
    const errors = [];
    for (let i in files) {
      const parsedPath = path.parse(files[i]);
      if (this._extensionsSet.has(parsedPath.ext)) {
        errors.push(this._checkSourceFile(files[i]));
      } else if (parsedPath.name == 'LICENSE') {
          errors.push(this._checkLicenseFile(files[i]));
      }
    }
    return errors.filter((error) => error != null);
  }

  _checkLicenseFile(filepath) {
    const content = fs.readFileSync(filepath, 'utf-8');
    const originalLicense = fs.readFileSync(LICENSE_FILE_PATH, 'utf-8');
    const licenseString = content.replace(/\d\d\d\d(\-\d\d\d\d)?/, '');
    return this._compareLicenses(licenseString, originalLicense);
  }

  _checkSourceFile(filepath) {
    const content = fs.readFileSync(filepath, 'utf-8');
    const lines = content.split(/\n/);
    if (!lines) {
      return new LicenseCheckerError(`File ${filepath} have not License Header or have invalid header`); // to do : add own error
    }

    const licenseLines = [];
    let commentsType = '';
    for (let i = 0; i < lines.length; i++) {
      lines[i] = lines[i].trim();
      if (lines[i] == ' ') continue; // skip empty strings

      if (commentsType == '') {

        if (lines[i].startsWith('//')) {
          commentsType = '//';
          licenseLines.push(lines[i].substring(2).trim());
        } else if (lines[i].startsWith('/*')) {
          commentsType = '/*';
          licenseLines.push(lines[i].substring(2).trim());
        } else {
          return new LicenseCheckerError(`In file ${filepath} license should be in header`);
        }

      } else if (commentsType = '//') {

        if (lines[i].startsWith('//')) {
          licenseLines.push(lines[i].substring(2).trim());
        } else {
          break; // end
        }

      } else if (commentsType = '/*') {

        let index;
        if (index = lines[i].indexOf('*/') > -1) {
          licenseLines.push(lines[i].substring(0, index).trim());
          break;
        }
        if (lines[i].startsWith('*')) {
          lines[i] = lines[i].substring(1).trim();
        }
        licenseLines.push(lines[i]);

      }
    }
    const licenseString = licenseLines.reduce((prev, curr) => prev + ' ' + curr);
    const message = this._compareWithLicense(licenseString);
    if (message) {
      return new LicenseCheckerError(`In file ${filepath} ` + message);
    }
    return null;
  }

  _compareWithLicense(licenseString) {
    const originalLicense = fs.readFileSync(LICENSE_PATH, 'utf-8');
    licenseString = licenseString.replace(/\d\d\d\d(\-\d\d\d\d)?/, '');
    return this._compareLicenses(licenseString, originalLicense);
  }

  _compareLicenses(first, second) {
    let firstIndex = 0;
    let secondIndex = 0;

    for (; (firstIndex < first.length) && (secondIndex < second.length); firstIndex++, secondIndex++) {
      while ( (firstIndex < first.length) && (/\s/.test(first[firstIndex]))) {
        firstIndex++;
      }
      while ( (secondIndex < second.length) && (/\s/.test(second[secondIndex]))) {
        secondIndex++;
      }
      if (first[firstIndex] != second[secondIndex]) {
        const firstWord = this._findNearestWord(first, firstIndex);
        const secondWord = this._findNearestWord(second, secondIndex);
        return `expected "${secondWord}", but find "${firstWord}" in license`;
      }
    }
    return null;
  }

  _findNearestWord(str, position) {
    const end = str.indexOf(' ', position);
    while (str[position] != ' ' && position > 0) {
      position--;
    }
    return str.substring(position, end == -1 ? str.length : end);
  }

  _getFiles(dir, allFiles) {
    const files = fs.readdirSync(dir);
    for (const i in files) {
      if (!( new Set(['.git', 'node_modules']).has(files[i]))) {
        const name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
           this._getFiles(name, allFiles);
        } else {
            allFiles.push(name);
        }
      }
    }
    return allFiles;
  }

}


module.exports.Error = LicenseCheckerError;
module.exports  = LicenseChecker;
