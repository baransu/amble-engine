# Amble Engine
Game engine written in JavaScript on top of [Electron](http://electron.atom.io/), for making web and mobile games.

## Prerequisite

- Install [node.js](https://nodejs.org/)

Next install [gulp](https://www.npmjs.com/package/gulp) and [bower](https://www.npmjs.com/package/bower) via npm:

```bash
npm install -g bower gulp
```

### Install

In cloned project folder, run the following commands to download npm and bower dependencies:

```bash
npm install
```
```bash
bower install
```

### Building editor

First time, and every other when you enter some changes to source code, you must build editor.

```bash
gulp
```

### Running editor

To run editor, run the following command in project folder:

```bash
npm start
```

### Game build

For android build, Amble Engine use [Apache Cordova](https://cordova.apache.org/) and [Crosswalk Project](https://crosswalk-project.org/). To build to android you must fulfill their requirements.
