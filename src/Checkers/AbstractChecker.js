// Copyright (c) 2017 Electric Imp
// This file is licensed under the MIT License
// http://opensource.org/licenses/MIT

'use strict';

const Errors = {};

Errors.LicenseCheckerError = class LicenseCheckerError extends Error {
};

class AbstractChecker {

  /**
   * Check path
   * @param {string} path
   * @return {string}
   */
  check(path) {
  }

  /**
   * @return {{debug(),info(),warning(),error()}}
   */
  get logger() {
    return this._logger || {
        debug: console.log,
        info: console.info,
        warning: console.warning,
        error: console.error
      };
  }

  /**
   * @param {{debug(),info(),warning(),error()}} value
   */
  set logger(value) {
    this._logger = value;
  }
}

module.exports = AbstractChecker;
module.exports.Errors = Errors;
