"use strict";

/*!
 * regex-finder
 * Copyright (c) 2016 heyderpd <heyderpd@gmail.com>
 * ISC Licensed
 */

var getExtensionOfFile = function getExtensionOfFile(filePath) {
  var Pattern = new RegExp("^[^\\n]*\\.([^.]*)", "i");
  var result = null;
  if ((result = Pattern.exec(filePath)) !== null) {
    return result[1];
  }
  return undefined;
};

var verifyExtension = function verifyExtension(filePath) {
  var ext = getExtensionOfFile(filePath);
  return !!validExtension[ext];
};

var recusiveFindInPath = function recusiveFindInPath(basePath) {
  var list = fs.readdirSync(basePath);
  doEach(list, function (nodo) {
    var nodoPath = basePath + nodo;
    var stats = fs.statSync(nodoPath);
    if (stats.isDirectory()) {
      recusiveFindInPath(nodoPath + '/');
    } else if (stats.isFile()) {
      if (verifyExtension(nodo)) {
        findInFile(nodoPath);
      }
    }
    return;
  });
};

var updateFoundList = function updateFoundList(word, force) {
  if (word !== undefined && findList[word] !== undefined) {
    findList[word] = true;
    force = true;
  }
  if (force) {
    var newList = [];
    doEach(findList, function (state, word) {
      if (!state) {
        newList.push(word);
      }
    });
    if (newList.length) {
      var prePattern = newList.join("|");
      findPattern = patternBase.replace("__LIST__", prePattern);
      return true;
    } else {
      findPattern = undefined;
    }
  }
  return false;
};

var findInFile = function findInFile(filePath) {
  if (findPattern === undefined) return;

  var fileRaw = fs.readFileSync(filePath, { flag: 'r' });
  var persist = true;
  while (persist) {
    var Pattern = new RegExp(findPattern, "im");
    var result = null;
    if ((result = Pattern.exec(fileRaw)) !== null) {
      persist = updateFoundList(result[1]);
    } else {
      persist = false;
    }
  }
};

var getFoundList = function getFoundList(getResumeOf) {
  var resume = {
    found: [],
    notFound: []
  };
  doEach(findList, function (state, word) {
    if (state) {
      resume.found.push(word);
    } else {
      resume.notFound.push(word);
    }
  });
  if (getResumeOf === 'ALL') {
    return resume;
  } else {
    if (getResumeOf === 'FOUND') {
      return resume.found;
    } else {
      return resume.notFound;
    }
  }
};

var startFind = function startFind(config) {
  if (config.list === undefined) {
    throw 'regex-finder: param "list" is undefined';
  };
  if (config.path === undefined) {
    throw 'regex-finder: param "path" is undefined';
  };
  var getResumeOf = config.getResumeOf === 'ALL' || config.getResumeOf === 'FOUND' ? config.getResumeOf : 'NOT_FOUND';

  var start, crono;
  if (config.debug) {
    start = +new Date();
  }

  doEach(config.list, function (word) {
    findList[word] = false;
  });
  updateFoundList(null, true);
  recusiveFindInPath(config.path);

  if (config.debug) {
    crono = (+new Date() - start) / 1000;
    console.log("\nregex-finder process in " + crono + " seconds");
  }
  return getFoundList(getResumeOf);
};

var doEach = function doEach(obj, func) {
  Object.keys(obj).forEach(function (n) {
    return func(obj[n], n);
  });
};

var validExtension = { 'html': true, 'js': true, json: true };
var patternBase = '[^\\w-](__LIST__)[^\\w-]';
var findPattern = undefined;
var findList = {};

var fs = require('fs-extra');

module.exports = {
  find: startFind
};