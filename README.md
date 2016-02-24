# Amble Engine
Game engine written in JavaScript on top of [Electron](http://electron.atom.io/), for making web and mobile games.

## Prerequisite

- Install [node.js](https://nodejs.org/)

Next install [gulp](https://www.npmjs.com/package/gulp) and [bower](https://www.npmjs.com/package/bower) via npm:

```bash
npm install -g bower gulp
```

### Install

In cloned project folder, run the following command to download npm dependencies:

```bash
npm install
```

### Building editor

Building editor with dependencies:
```bash
gulp build
```

Building editor without dependencies:
```bash
gulp build-code
```

Building editor to standalone version:
```bash
gulp build-standalone
```

### Running editor

If you built editor, you can run it following command in cloned folder to start editor:

```bash
npm start
```

### Game build

For android build, Amble Engine use [Apache Cordova](https://cordova.apache.org/) and [Crosswalk Project](https://crosswalk-project.org/). To build to android you must fulfill their requirements.
