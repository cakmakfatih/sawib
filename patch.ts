const https = require('https');
const fse = require("fs-extra");
const path = require("path");
const extract = require("extract-zip");

const appNodeModulesDir = path.join(__dirname, "release", "app", "node_modules");
const outDir = path.join(__dirname, "release", "build");

const firefoxDownloadUrl = "https://playwright.azureedge.net/builds/firefox/1354/firefox-win64.zip";
const ffPath = path.join(__dirname, "firefox");
const ffZipPath = path.join(__dirname, "firefox.zip");

const generatedDirectoriesAfterBuild = fse.readdirSync(outDir);
const appPaths: string[] = [];

async function downloadFirefox() {
  console.log("Downloading Firefox browser.");

  if (!fse.pathExistsSync(ffPath)) {
    fse.mkdirpSync(ffPath);
  }

  const file = fse.createWriteStream(ffZipPath);

  return new Promise((resolve, _) => {
    https.get(firefoxDownloadUrl, function (response: any) {
      response.pipe(file);

      file.on("finish", () => {
        file.close();

        console.log("Downloading Firefox completed.");

        resolve(null);
      });
    });
  });
}

async function unzipFirefox() {
  console.log("Unzipping [firefox.zip]");

  await extract(ffZipPath, { dir: ffPath });

  console.log("Unzipping completed.");
}

(async () => {
  console.log("Patching unpacked modules & downloading necessary files.");

  if (!fse.existsSync(ffZipPath)) {
    await downloadFirefox();
    await unzipFirefox();
  }

  generatedDirectoriesAfterBuild.forEach((dir: string) => {
    const p = path.join(outDir, dir);

    if (!p.includes("firefox") && fse.statSync(p).isDirectory() && p.includes("unpacked")) {
      appPaths.push(path.join(outDir, dir));
    }
  });

  for (let p of appPaths) {
    let unpackedDir = path.join(p, "resources", "app.asar.unpacked", "node_modules");

    if (!fse.pathExistsSync(unpackedDir)) {
      fse.mkdirpSync(unpackedDir);
    }

    fse.copySync(appNodeModulesDir, unpackedDir, { overwrite: true, recursive: true }, function (err: any) {
      if (err) {
        console.error(err);
      }
    });

    const browserOutPath = path.join(p, "resources", "firefox");

    if (!fse.pathExistsSync(browserOutPath)) {
      fse.mkdirpSync(browserOutPath);
    }

    fse.copySync(ffPath, browserOutPath, { overwrite: true, recursive: true }, function (err: any) {
      if (err) {
        console.error(err);
      }
    });
  }

  console.log("Patching completed.");

  process.exit(0);
})();


