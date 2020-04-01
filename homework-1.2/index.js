const fs = require('fs');
const path = require('path');

const { program } = require('commander');

const dir = process.cwd();

const createPath = (str) => path.join(dir, str);

program.version('0.0.1');

program
  .option('-r, --remove', 'remove source folder')
  .requiredOption('-s, --source <path>', 'must have source path', createPath)
  .requiredOption('-t, --target <path>', 'must have target path', createPath)
  .parse(process.argv);


const { source: sourcePath, target: targetPath } = program;

const makeDirAsync = async (path) => {
  try {
    if (!fs.existsSync(path)) {
      return fs.mkdirSync(path);
    }
    throw new Error('folder already created');
  } catch (e) {
    console.log({ e });
  }
  // не ловится в try-catch в create()
};

const readDirAsync = async (source) => fs.readdirSync(source);

const copyAsync = async (source, target) => fs.copyFileSync(source, target);

const deleteDirAsync = async (source) => fs.rmdirSync(source);

const deleteFileAsync = async (source) => fs.unlinkSync(source);

const create = async (source, target) => {
  const res = await readDirAsync(source);

  for (const file of res) {
    // бесполезный try-catch ?

    try {
      const newSource = path.join(source, file);
      const newTarget = path.join(target);
      if (fs.statSync(newSource).isDirectory()) {
        await create(newSource, newTarget);
      } else {
        const name = file[0];
        const dir = path.join(target, name);
        const targetFile = path.join(dir, file);

        await makeDirAsync(dir);
        await copyAsync(newSource, targetFile);

        console.log(`${name} copied`);
      }
    } catch (e) {
      console.log(e);
    }
  }
};

const removeDirectoryRecursive = async (dir) => {
  const res = await readDirAsync(dir);
  debugger;
  if (!res.length) {
    return await deleteDirAsync(dir);
  }

  for (const file of res) {
    const newSource = path.join(dir, file);

    if (fs.statSync(newSource).isFile()) {
      await deleteFileAsync(newSource);
    } else {
      await removeDirectoryRecursive(newSource);
    }

    await removeDirectoryRecursive(dir);
  }
};

const start = async (source, target) => {
  await makeDirAsync(target);
  await create(source, target);
  if (program.remove) {
    await removeDirectoryRecursive(sourcePath);
  }
};

start(sourcePath, targetPath)
  .then(() => console.log('Done'))
  .catch(console.log);
