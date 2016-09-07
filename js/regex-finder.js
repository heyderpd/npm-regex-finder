
/*!
 * regex-finder
 * Copyright (c) 2016 heyderpd <heyderpd@gmail.com>
 * ISC Licensed
 */

const getExtensionOfFile = function (filePath) {
  const Pattern = new RegExp("^[^\\n]*\\.([^.]*)", "i")
  let result = null;
  if ((result = Pattern.exec(filePath)) !== null) {
    return result[1];
  }
  return undefined;
}

const verifyExtension = function (filePath) {
  const ext = getExtensionOfFile(filePath);
  return !!validExtension[ext];
}

const recusiveFindInPath = function (basePath) {
  basePath = basePath[basePath.length -1] === '/' ? basePath : basePath +'/' ;
  const list = fs.readdirSync(basePath);
  doEach(list, function (nodo) {
    if (findPattern === undefined)
      return;
    
    const nodoPath = basePath + nodo;
    const stats = fs.statSync(nodoPath);
    if (stats.isDirectory()){
      recusiveFindInPath(nodoPath +'/');
    } else if (stats.isFile()){
      if(verifyExtension(nodo)){
        findInFile(nodoPath);      
      }
    }
  });
}

const findInPathsList = function (pathsList) {
  doEach(pathsList, function (pathItem) {
    if (findPattern === undefined)
      return;
    
    const stats = fs.statSync(pathItem);
    if (stats.isDirectory()){
      recusiveFindInPath(pathItem);
    } else if (stats.isFile()){
      if(verifyExtension(pathItem)){
        findInFile(pathItem);      
      }
    }
  });
}

const updateFoundList = function (word, force) {
  if (word !== undefined && findList[word] !== undefined) {
    findList[word] = true;
    force = true;
  }
  if (force) {
    // convert object to array
    let newList = [];
    doEach(findList, function (state, word) {
      if (!state) {
        newList.push(word);
      }
    });
    // create new pattern with array
    if (newList.length) {
      const prePattern = newList.join("|");
      findPattern = patternBase.replace("__LIST__", prePattern);
      return true;
    } else {
      findPattern = undefined;
    }
  }
  return false;
};

const initializeFoundList = function (list) {
  doEach(list, function (word) {
    findList[word] = false;
  });
  updateFoundList(null, true);
}

const findInFile = function (filePath) {
  if (findPattern === undefined)
    return;
  
  const fileRaw = fs.readFileSync(filePath, {flag: 'r'});
  let persist = true;
  while (persist) {
    const Pattern = new RegExp(findPattern, "im");
    let result = null;
    if ((result = Pattern.exec(fileRaw)) !== null) {
      persist = updateFoundList(result[1]);
    } else {
      persist = false;      
    }
  }
}

const getFoundList = function (getResumeOf) {
  const resume = {
    found: [],
    notFound: [],
  }
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

const validatePathList = function (pathList) {
  doEach(pathList, function (path) {
    let valid = fs.existsSync(path);
    if (valid) {
      let stats = fs.statSync(path);
      valid = stats.isDirectory() || stats.isFile() ;
    }
    if (!valid)
      throw new Error(`regex-finder: param "path" don\'t have a valid path list.\n    path:"${path}" is invalid`);
  });
};

const startFind = function (config) {
  if (config.list === undefined) { throw 'regex-finder: param "list" is undefined' };
  if (config.path  === undefined) { throw 'regex-finder: param "path" is undefined' };
  config.path = typeof(config.path) === 'string' ? [config.path] : config.path ;
  validatePathList(config.path);

  const getResumeOf = (config.getResumeOf === 'ALL' || config.getResumeOf === 'FOUND') ? config.getResumeOf : 'NOT_FOUND';
  let start, crono
  if (config.debug) { start = +new Date() }

  // initizlize list's'
  initializeFoundList(config.list);
  
  // find in directory
  findInPathsList(config.path);

  if (config.debug) {
    crono = (+new Date() -start) /1000;
    console.log(`\nregex-finder process in ${crono} seconds\n`);
  }
  return getFoundList(getResumeOf);
}

const doEach = function (obj, func) { Object.keys(obj).forEach(n => func(obj[n], n)) };

const validExtension = { 'html': true, 'js': true, 'json': true };
let patternBase = '[^\\w-](__LIST__)[^\\w-]';
let findPattern = undefined;
let findList = {};

const fs = require('fs-extra');

module.exports = {
  find: startFind
}
