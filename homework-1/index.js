const fs = require('fs');
const path = require('path');

const dir = process.cwd();
const args = process.argv.slice(2)

if (!args[0] || !args[1]) {
    return console.log('Необходимо ввести относительные пути: <source> <target>')
}

const sourcePath = path.join(dir, args[0]);
const targetPath = path.join(dir, args[1]);


start(sourcePath, targetPath, (err) => {
    if (err) {
        console.log({err})
    }
    if (args[2]) {
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