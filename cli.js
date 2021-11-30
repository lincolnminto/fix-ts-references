const fs = require('fs');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const {fixReferences, getAllFiles} = require('./index');

const init = async () => {
    console.log(
        chalk.blue(
            figlet.textSync('Fix TS References', {
                horizontalLayout: 'default',
                verticalLayout: 'default'
            })
        )
    );

    console.log(`by ${chalk.bold('Lincoln Minto')} - ${chalk.gray('lincolnminto@gmail.com')}\n`);

    const questions = [{
        name: 'projectDirectory',
        type: 'input',
        message: `What is the full project ${chalk.yellow('parent directory')}?`,
        validate: (input) => new Promise((resolve, reject) => {
            if (!fs.existsSync(input)) {
                reject('😣 The directory does not exists.');
            } else if (!fs.lstatSync(input).isDirectory()) {
                reject('🤔 It is not a directory.');
            } else {
                resolve(true);
            }
        })
    },
    {
        name: 'warning',
        type: 'confirm',
        message: `Are you sure you want to proceed? ${chalk.red(`All '.ts' files with wrong references will be overriten!`)}`,
        default: false

    },
    {
        name: 'proceed',
        type: 'confirm',
        message: `Are you absolute sure you want to proceed? ${chalk.yellow(`I'm not asking again!`)}`,
        default: false

    }];

    const { projectDirectory, warning, proceed } = await inquirer.prompt(questions);

    if (proceed) {
        const filesFixed = fixReferences(getAllFiles(projectDirectory));
    }
};

init();