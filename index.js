const fs = require('fs');
const path = require("path");
const chalk = require('chalk');

const regex = /<reference[^>]*?path=(?<quote>["\'])?(?<path>(?:.(?!\1|>))*.?)\1?/g;

const getAllFiles = (dirPath, arrayOfFiles) => {
    arrayOfFiles = arrayOfFiles || {};

    files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const fullPath = path.join(dirPath, "/", file);

        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else if (file.endsWith('.ts')) {
            arrayOfFiles[fullPath.toLowerCase()] = fullPath;
        }
    })

    return arrayOfFiles;
}

const fixReferences = (arrayOfFiles) => {

    for (const lcFullPath in arrayOfFiles) {
        const fullPath = arrayOfFiles[lcFullPath];

        fs.readFile(fullPath, 'utf8', (err, data) => {
            if (err) {
                console.error(err)
                return
            }

            const parentDirectory = path.dirname(fullPath);
            const matches = data.matchAll(regex);

            for (const match of matches) {
                if (match.groups) {
                    const wrongReferencePath = match.groups.path;
                    const referenceFullPath = arrayOfFiles[path.resolve(parentDirectory, wrongReferencePath).toLowerCase()];
                    const fixedReferenceRelativePath = path.relative(parentDirectory, referenceFullPath);

                    if (wrongReferencePath !== fixedReferenceRelativePath) {
                        console.log(`\nUpdated reference:\n${chalk.strikethrough.gray(wrongReferencePath)} by ${chalk.blue(fixedReferenceRelativePath)} ${chalk.grey('\n(' + fullPath + ')')}`);

                        data = data.replace(new RegExp(match.groups.quote + wrongReferencePath + match.groups.quote, 'g'),
                            match.groups.quote + fixedReferenceRelativePath + match.groups.quote);
                    }
                }
            }

            fs.writeFile(fullPath, data, 'utf8', (err) => {
                if (err) return console.log(err);
            });
        });
    }
};

module.exports = {
    fixReferences,
    getAllFiles
}