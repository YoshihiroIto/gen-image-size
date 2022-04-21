import fs from 'fs';
import path from 'path';
import glob from 'glob';
import sizeOf from 'image-size';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .options({
    'target-dir': { type: 'string', demandOption: true },
    output: { type: 'string', demandOption: true },
    ext: { type: 'string', default: 'png;jpg' },
  })
  .parseSync();

const targetDir = path.resolve(argv.targetDir).replaceAll('\\', '/');
const output = path.resolve(argv.output);
const exts = argv.ext.split(';');

const targetFiles = glob.sync(targetDir + '/**/*.*').filter(x => {
  if (exts.length === 0) {
    return true;
  } else {
    for (const ext of exts) {
      if (x.endsWith(ext)) {
        return true;
      }
    }
    return false;
  }
});

// 出力
const tsLines = new Array<string>();
const scssLines = new Array<string>();

for (const file of targetFiles) {
  const name = path.relative(targetDir, file).replaceAll('.', '_').replaceAll('/', '_').replaceAll('\\', '_');
  const { width, height } = sizeOf(file);

  tsLines.push(`export const ${name}_width = ${width};`);
  tsLines.push(`export const ${name}_height = ${height};`);
  tsLines.push('');

  scssLines.push(`$${name}_width: ${width};`);
  scssLines.push(`$${name}_height: ${height};`);
  scssLines.push('');
}

fs.writeFileSync(output + '.ts', tsLines.join('\n'));
fs.writeFileSync(output + '.scss', scssLines.join('\n'));
