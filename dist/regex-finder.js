"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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
  basePath = basePath[basePath.length - 1] === '/' ? basePath : basePath + '/';
  var list = fs.readdirSync(basePath);
  doEach(list, function (nodo) {
    if (findPattern === undefined) return;

    var nodoPath = basePath + nodo;
    var stats = fs.statSync(nodoPath);
    if (stats.isDirectory()) {
      recusiveFindInPath(nodoPath + '/');
    } else if (stats.isFile()) {
      if (verifyExtension(nodo)) {
        findInFile(nodoPath);
      }
    }
  });
};

var findInPathsList = function findInPathsList(pathsList) {
  doEach(pathsList, function (pathItem) {
    if (findPattern === undefined) return;

    var stats = fs.statSync(pathItem);
    if (stats.isDirectory()) {
      recusiveFindInPath(pathItem);
    } else if (stats.isFile()) {
      if (verifyExtension(pathItem)) {
        findInFile(pathItem);
      }
    }
  });
};

var updateFoundList = function updateFoundList(word, force) {
  if (word !== undefined && findList[word] !== undefined) {
    findList[word] = true;
    force = true;
  }
  if (force) {
    var _ret = function () {
      // convert object to array
      var newList = [];
      doEach(findList, function (state, word) {
        if (!state) {
          newList.push(word);
        }
      });
      // create new pattern with array
      if (newList.length) {
        var prePattern = newList.join("|");
        findPattern = patternBase.replace("__LIST__", prePattern);
        return {
          v: true
        };
      } else {
        findPattern = undefined;
      }
    }();

    if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
  }
  return false;
};

var initializeFoundList = function initializeFoundList(list) {
  doEach(list, function (word) {
    findList[word] = false;
  });
  updateFoundList(null, true);
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

var validatePathList = function validatePathList(pathList) {
  doEach(pathList, function (path) {
    var valid = fs.existsSync(path);
    if (valid) {
      var stats = fs.statSync(path);
      valid = stats.isDirectory() || stats.isFile();
    }
    if (!valid) {
      throw new Error("regex-finder: param \"path\" don't have a valid path list.\n    path:\"" + path + "\" is invalid");
    }
  });
};

var updateValidExtension = function updateValidExtension(extension) {
  if (extension === undefined) {
    return;
  }
  var tmpExtension = {},
      count = 0;
  doEach(extension, function (value, id) {
    if (value && typeof value === 'string') {
      tmpExtension[value] = true;
      count += 1;
    }
  });
  if (count > 0) {
    validExtension = tmpExtension;
  }
};

var startFind = function startFind(config) {
  if (config.list === undefined) {
    throw 'regex-finder: param "list" is undefined';
  };
  if (config.path === undefined) {
    throw 'regex-finder: param "path" is undefined';
  };

  config.path = typeof config.path === 'string' ? [config.path] : config.path;
  validatePathList(config.path);

  config.extension = config.extension !== undefined ? config.extension : ['html', 'js', 'json'];
  config.extension = typeof config.extension === 'string' ? [config.extension] : config.extension;
  updateValidExtension(config.extension);

  patternBase = typeof config.pattern === 'string' ? config.pattern : '(__LIST__)';

  var getResumeOf = config.getResumeOf === 'ALL' || config.getResumeOf === 'FOUND' ? config.getResumeOf : 'NOT_FOUND';
  var start = void 0,
      crono = void 0;
  if (config.debug) {
    start = +new Date();
  }

  // initialize list's'
  initializeFoundList(config.list);

  // find in directory
  findInPathsList(config.path);

  if (config.debug) {
    crono = (+new Date() - start) / 1000;
    console.log("\nregex-finder process in " + crono + " seconds\n");
  }
  return getFoundList(getResumeOf);
};

var doEach = function doEach(obj, func) {
  Object.keys(obj).forEach(function (n) {
    return func(obj[n], n);
  });
};

var validExtension = { 'html': true, 'js': true, 'json': true };
var patternBase = '';
var findPattern = undefined;
var findList = {};

var fs = require('fs-extra');

module.exports = {
  find: startFind
};