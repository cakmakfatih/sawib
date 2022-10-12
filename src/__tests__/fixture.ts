import fs from 'fs';

function fixture(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

export default fixture;
