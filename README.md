# REGEX-FINDER

If you need create static file from itens you use in given directory.
Use this plugin! For now only help to find the html id is used to svg extractor.

## New feature (bug fixed!!!)
* Can pass multiple directory using array.
* Pass a list of aceptable extesion to find (optional)

## First Steps NO MORE!
Now use es2015, don't need first steps!
Thanks for:
[npm~lucasmreis](https://www.npmjs.com/~lucasmreis)

npm install npm install regex-finder

## Example:
Example:
```javascript
// list of find itens in this exaple is a html id without a #
const list = ['navbar', 'simple', 'slogan', 'icon-brand-cut']

// directory to find recursively in files the list
const directory = './test/'

// the list is returned, value is "ALL" | "FOUND" | "NOT_FOUND"(default)
const resumeOf = 'FOUND'

var notFound = find({
  list: list,
  path: directory,
  extension: ['html', 'js', 'json'], // (optional)
  getResumeOf: 'NOT_FOUND' // (can be omited)
});

notFound // this a new list of not found in directory
```
