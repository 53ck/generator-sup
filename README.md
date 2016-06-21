# generator-sup

> Generate a SASS and Jade base project with Gulp. A modified version of [generator-webapp](https://github.com/yeoman/generator-webapp).

## Features

* CSS Autoprefixing
* Remove unused styles from CSS with [UnCSS](http://github.com/ben-eb/gulp-uncss)
* Built-in preview server with [BrowserSync](http://github.com/BrowserSync/browser-sync)
* Automated build process that includes: compilation of preprocessors (Jade, Sass, etc), minification of CSS and HTML, compression of Javascript, and optimization of images
* Reduce compilation time for Jade with [jade-inheritance](http://github.com/juanfran/gulp-jade-inheritance)
* Map compiled CSS to source stylesheets with source maps
Wire-up dependencies installed with [Bower](http://bower.io)

## Getting Started

- Install [Node](https://nodejs.org/en/)
- Install other dependencies: `npm install -g yo gulp-cli bower`
- Install the generator: `npm install -g generator-sup`
- Run `yo sup` to scaffold your web app
- Run `gulp serve` to preview and watch for changes
- Run `gulp build` to preview the production build