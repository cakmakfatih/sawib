const fse = require("fs-extra");
const path = require("path");

const appNodeModulesDir = path.join(__dirname, "release", "app", "node_modules");
const outDir = path.join(__dirname, "release", "build");

const generatedDirectoriesAfterBuild = fse.readdirSync(outDir);
const appPaths: string[] = [];

console.log("Patching unpacked modules.");

generatedDirectoriesAfterBuild.forEach((dir: string) => {
    if (fse.statSync(path.join(outDir, dir)).isDirectory()) {
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
      } else {

      }
  });
}

console.log("Patching completed.");

process.exit(0);
