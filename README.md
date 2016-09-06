# REGEX-FINDER

If you need create static file from itens you use in given directory.
Use this plugin! For now only help to find the html id is used to svg extractor.

## First Steps NO MORE!
Now is is in es2015, don't need first steps!
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
  getResumeOf: 'NOT_FOUND' // can be omited
});

notFound // this a new list of not found in directory
```
