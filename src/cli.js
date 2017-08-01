'use strict';


const program = require('commander');
const Verifier = require('./index.js');
const url = require('url');
let checkedUrl = '';
const verifier = new Verifier();

program
.version('0.0.1')
.arguments('<path>')
.action(function (path) {
  if (url.parse(path)) {
    checkedUrl = path;
  }
})
.option('-l, --local', 'Do not pull before every run', () => verifier.local = true)
.parse(process.argv);

verifier.verify(checkedUrl).then(result => {
  console.log(result);
});
