#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development and basic DOM parsing.

references:

  +  cheerio
     -  https://github.com/MatthewMuller/cheerio
     -  http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
     -  http://maxogden.com/scraping-with-node.html

  + commander.js
     -  https://github.com/visionmedia/commander.js
     -  http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

  +  JSON
     -  http://en.wikipedia.org/wiki/JSON
     -  https://developer.mozilla.org/en-US/docs/JSON
     -  https://developer.mozilla,org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://quiet-scrubland-9023.herokuapp.com";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http;//nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var checkUrl = function(url, checksfile) {
    rest.get(url).on('complete', function(data) {
	$ = cheerio.load(data);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for(var ii in checks) {
	    var present = $(checks[ii]).length > 0;
	    out[checks[ii]] = present;
	}
	var outJson = JSON.stringify(out, null, 4);
	console.log(outJson);
    });
}
		     
var cheerioHtmlFile = function(htmlfile){
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile){
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile){
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks){
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn){
    // Workaround for commaner.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module){
    program
//      .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
//      .option('-f, --file <html_file>', 'URL to index.html', HTMLFILE_DEFAULT)
      .option('-f, --file <html_file>', 'Path to index.html')
      .option('-u, --url <url>', 'URL to index.html')
      .option('-c, --checks <check_file>', 'Path to check.json')

//      .option('-u, --url <html_file>', 'Link to url', clone(assertFileExists), URL_DEFAULT)
      .parse(process.argv);
//    var checkJson = checkHtmlFile(program.file, program.checks);
//    var outJson = JSON.stringify(checkJson, null, 4);
//    console.log(outJson);

    if(program.url){
//	var checkJson = checkUrl(program.url, program.checks);
//	var outJson = JSON.stringify(checkJson,null,4);
//	console.log(outJson);
	checkUrl(program.url, program.checks);
    }else{
	var checkJson = checkHtmlFile(program.file, program.checks);
	var outJson = JSON.stringify(checkJson,null,4);
	console.log(outJson);
    }
}else{
    exports.checkHtmlFile = checkHtmlFile;
}
