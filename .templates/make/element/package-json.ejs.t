---
to: packages/<%= packageName %>/<%= elementName %>/package.json
---
{
  "name": "@webtides/<%= elementName %>",
  "version": "0.1.0",
  "description": "An element that...",
  "author": "@webtides",
  "homepage": "https://github.com/webtides/element-library",
  "license": "MIT",
  "type": "module",
  "main": "src/<%= elementName %>.js",
  "module": "src/<%= elementName %>.js",
  "repository": {
    "type": "git",
    "url": "https://github.com/webtides/element-library.git",
    "directory": "packages/<%= packageName %>/<%= elementName %>"
  },
  "scripts": {
    "test": "karma start ../../../karma.conf.js --grep \"packages/<%= packageName %>/<%= elementName %>/tests/**/*.test.js\"",
    "test:watch": "karma start ../../../karma.conf.js --auto-watch=true --single-run=false --grep \"packages/<%= packageName %>/<%= elementName %>/tests/**/*.test.js\""
  },
  "keywords": [
    "web-components",
    "custom-elements",
    "<%= elementName %>"
  ],
  "files": [
    "docs",
    "src",
    "stories",
    "tests",
    "translations",
    "*.js"
  ],
  "dependencies": {
    "@webtides/element-js": "0.2.0"
  },
  "devDependencies": {
    "@open-wc/demoing-storybook": "^1.13.3",
    "@open-wc/testing": "^2.5.0"
  }
}


