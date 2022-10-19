# SAWIB
SAWIB stands for "Scraping Application With InBuilt Browser". This software is used for scraping data from certain websites and comparing/editing output based on client's blueprint.

SAWIB is built on top of [electron-react boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate). It has additional tweaks that are required by the external libraries used by the software.
## 1. Installation
- To install the project use `yarn` or `npm install` script on your terminal.

## 2. Development
- To run in development mode, use `yarn start` or `npm run start` on your terminal.

## 3. Test
- To test the project, use `yarn test` or `npm run test` or script.

## 4. Build
Building works differently compared to `electron-react-boilerplate`. For now, the software is only buildable for Windows.

To build, run the following script:
- `npm run make` or `yarn make`

The above script will build the project and patch required files & browser into it using the `patch.ts` script file it has. You can launch the project from the `.exe` file inside `win-unpacked` directory under the `release/build` folder.

## 5. Deployment
This project uses GitHub Actions for deployment. At it's current phase, any merges that are made to `stage` branch will automatically used to build a release for Windows & tag it on GitHub.

