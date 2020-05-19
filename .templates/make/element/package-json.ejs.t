---
to: packages/<%= packageName %>/<%= elementName %>/package.json
---
{
  "name": "@currentjs/element-library_<%= packageName %>_<%= elementName %>",
  "version": "0.1.0",
  "description": "An element that...",
  "author": "@currentjs",
  "homepage": "https://github.com/currentjs/element-library",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/currentjs/element-library.git",
    "directory": "packages/<%= packageName %>/<%= elementName %>"
  },
  "scripts": {
    "test": "karma start ../../../karma.conf.js --grep \"packages/<%= packageName %>/<%= elementName %>/tests/**/*.test.js\"",
    "test:watch": "karma start ../../../karma.conf.js --auto-watch=true --single-run=false --grep \"packages/<%= packageName %>/<%= elementName %>/tests/**/*.test.js\""
  },
  "keywords": [
    "maya-element",
    "maya-elements",
    "web-components",
    "custom-elements",
    "<%= elementName %>"
  ],
  "main": "index.js",
  "module": "index.js",
  "files": [
    "docs",
    "src",
    "stories",
    "tests",
    "translations",
    "*.js"
  ],
  "dependencies": {
    "@currentjs/element": "^0.1.0"
  },
  "devDependencies": {
    "@open-wc/demoing-storybook": "^1.13.3",
    "@open-wc/testing": "^2.5.0"
  }
}


