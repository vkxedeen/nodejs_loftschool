const fs = require('fs');
const path = require('path');

const {program} = require('commander');

const dir = process.cwd();

program.version('0.0.1');

program
    .option('-r, --remove', 'remove source folder')
    .requiredOption('-s, --source <path>', 'must have source path', createPath)
    .requiredOption('-t, --target <path>', 'must have target path', createPath)
    .parse(process.argv);

const createPath = (str) => path.join(dir, str);

const {source: sourcePath, target: targetPath} = program;

const start = (source, target, cb) => {
    makeDir(target, (err) => {
        if (err) {
            throw new Error(err.message)
        }

        create(source, target, cb)
    })
};

const makeDir = (path, cb) => {
    if (!fs.existsSync(path)) {
        return fs.mkdir(path, {}, cb)
    }

    cb()
};

const create = (source, target, cb) => {
    fs.readdir(source, (err, res) => {
        if (err) {
            console.log(err)
        }
        res.forEach((file) => {
            const newSource = path.join(source, file);
            const newTarget = path.join(target);
            if (fs.statSync(newSource).isDirectory()) {
                return create(newSource, newTarget, cb)
            }

            const name = res[i][0];
            const dir = path.join(target, name);

            makeDir(dir, (err) => {
                if (err) {
                    console.log({err})
                }

                const target = path.join(dir, file);

                fs.copyFile(newSource, target, () => {
                    console.log(name + 'copied');
                    cb()
                })
            })
        })
    })
};


const removeDirectoryRecursive = (dir, cb) =>  {
    fs.readdir(dir, (err, res) => {
        if (err) {
            cb(err);
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

        res.forEach((file) => {
            const newSource = path.join(dir, res[i]);
            const stats = fs.statSync(newSource);

            if (stats.isFile()) {
                return fs.unlink(newSource, folderDone)
            }

            removeDirectoryRecursive(newSource, folderDone)
        })
    })
}

start(sourcePath, targetPath, (err) => {
    if (err) {
        console.log({err})
    }

    if (program.remove) {
        removeDirectoryRecursive(sourcePath, () => console.log('deleted'))
    }
});

