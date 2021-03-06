'use strict'

const exec = require('child_process').exec;
const ora = require('ora');
const git = require('git-exec');
const co = require('co');
const prompt = require('co-prompt');
const config = require('../config.json');
const chalk = require('chalk');

module.exports = () => {
    co(function *() {
        let tmplName = yield prompt('Template Name: ');
        let projectName = yield prompt('Project Name: ');
        let gitUrl;
        let branch;
        if(!config[tmplName]){
            console.log(chalk.red('\n x Template does not exist!'));
            process.exit();
        }
        gitUrl = config[tmplName].url;
        branch = config[tmplName].branch;

        let spinner = ora('downloading... (just take a break, these whole things may take a long time.)')
        spinner.start();

        //git clone
        exec(`git clone ${gitUrl} ${projectName} --progress && cd ${projectName} && git checkout ${branch}`, (error, stdout, stderr) => {
            spinner.stop();
            if (error) {
                console.log(error)
                process.exit()
            }
            console.log(chalk.green('\n √ download finished!'));

            //npm install
            let spinner2 = ora('installing...')
            spinner2.start();
            exec(`cd ${projectName} && npm install`, (error, stdout, stderr) => {
                if (error) {
                    console.log(error)
                    process.exit()
                }
                
                // install vic-common
                exec(`npm config set registry http://192.168.151.68:8001`, (error, stdout, stderr) => {
                    
                    if (error) {
                        console.log(error)
                        process.exit()
                    }

                    exec(`cd ${projectName} && npm install vic-common --save`, (error, stdout, stderr) => {
                        if (error) {
                            console.log(error)
                            process.exit()
                        }   

                        //reset npm
                        exec(`npm config set registry https://registry.npmjs.org`, (error, stdout, stderr) => {
                            spinner2.stop();
                            if (error) {
                                console.log(error)
                                process.exit()
                            }   
                            console.log(chalk.green('\n √ competed!'));
                            process.exit()
                        })
                    })

                    
                })
            })
        })
    })
};

