const fs = require('fs');
const path = require('path');

const { program } = require('commander');

const dir = process.cwd();

program.version('0.0.1');

program
    .option('-r, --remove', 'remove source folder')
    .requiredOption('-s, --source <path>', 'must have source path', createPath)
    .requiredOption('-t, --target <path>', 'must have target path', createPath)
    .parse(process.argv);

function createPath(str) {
    return path.join(dir, str)
}


const {source: sourcePath, target: targetPath}  = program

start(sourcePath, targetPath, (err) => {
    if (err) {
        console.log({err})
    }
    if (program.remove) {
        removeDirectoryRecursive(sourcePath, () => console.log('deleted'))
    }
});

function start(source, target, cb) {
    makeDir(target, (err) => {
        if (err) {
            throw new Error(err.message)
        }
        create(source, target, cb)
    })
}

function create(source, target, cb) {
    return fs.readdir(source, (err, res) => {
        if (err) {
            throw new Error(err.message)
        }
        for (let i = 0; i < res.length; i++) {
            const newSource = path.join(source, res[i]);
            const newTarget = path.join(target);
            if (fs.statSync(newSource).isDirectory()) {
                create(newSource, newTarget, cb)
            } else {
                const name = res[i][0];
                const dir = path.join(target, name);
                makeDir(dir, (err) => {
                    if (err) {
                        console.log({err})
                    }
                    const target = path.join(dir, res[i]);
                    fs.copyFile(newSource, target, () => {
                        console.log(name + 'copied');
                        cb()
                    })
                })
            }
        }
    })
}

function makeDir(path, cb) {
    if (!fs.existsSync(path)) {
        return fs.mkdir(path, {}, cb)
    }
    cb()
}

function removeDirectoryRecursive(dir, cb) {
    return fs.readdir(dir, (err, res) => {
        debugger
        if (err) {
            cb(err);
            throw new Error(err.message)
        }

        let count = 0;
        const folderDone = (err) => {
            count++;
            if (count >= res.length || err) {
                fs.rmdir(dir, cb);
            }
        };

        if (!res.length) {
            folderDone();
            return;
        }

        for (let i = 0; i < res.length; i++) {
            const newSource = path.join(dir, res[i]);
            const stats = fs.statSync(newSource);
            if (stats.isFile()) {
                fs.unlink(newSource, folderDone)
            } else {
                removeDirectoryRecursive(newSource, folderDone)
            }
        }
    })
}