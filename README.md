# UI for merging MARC records [![NPM Version](https://img.shields.io/npm/v/@natlibfi/marc-merge-ui.svg)](https://npmjs.org/package/@natlibfi/marc-merge-ui) [![Build Status](https://travis-ci.org/NatLibFi/marc-merge-ui.svg?branch=master)](https://travis-ci.org/NatLibFi/marc-merge-ui)
## Building the application

Install all dependencies:
`npm install`

Run build task:
`npm run build`

This will build the application into `build` directory.

## Start the application in production
```
npm install --prod
cd build
node index.js

(Application can be configured using environment variables, like HTTP_PORT=4000 node index.js for alternate port)
```

## Start the application in development
`npm run dev`

This will start webpack-dev-server for frontend codebase and nodemon for the backend.

## License and copyright

Copyright (c) 2015-2017 **University Of Helsinki (The National Library Of Finland)**

This project's source code is licensed under the terms of **GNU Affero General Public License Version 3** or any later version.
