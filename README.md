# Amble Engine
Game engine written in JavaScript on top of electron (atom-shell) with visual scripting, for making web and mobile games.

## Prerequisite

- Install [node.js](https://nodejs.org/)

Next install gulp and bower via npm:

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
