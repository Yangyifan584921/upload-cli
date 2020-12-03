const _ = require('lodash');
const chalk = require('chalk');
const inquirer = require('inquirer');
const fileOp = require('../../lib/up/uploadFile.js');
const dirpath = `${process.cwd()}/`;

module.exports = program => {
    program
        .command('upload') // 命令的名字
        .alias('upload-alias') // 命令的别名
        .description('上传资源命令：up upload')
        .action(options => {   // 执行命令时要执行的代码
            const config = _.assign({
                single: false,
                all: false
            }, options)
            let typeName = '';
            const params = [
                {
                    type: 'list',
                    name: 'uoloadType',
                    message: '请选择上传方式',
                    choices: [
                        {
                            name: '资源上传',
                            value: '1'
                        },
                        {
                            name: '图片上传',
                            value: '2'
                        }
                    ]
                }
            ];
            new Promise((rs, rj) => {
                inquirer.prompt(params).then(answer => {
                    typeName = answer.uploadType === '1' ? '资源' : '图片';
                    rs()
                })
            }).then(() => {
                const promps = [];
                console.log(chalk.red(`${typeName}正在上传：\n`));
                if(config.single === false && config.all === false) {
                    promps.push({
                        type: 'list',
                        name: 'upload',
                        message: `请选择${typeName}上传`,
                        choices: [{
                            name: `单个${typeName}上传`,
                            value: 'single'
                        }, {
                            name:  `多个${typeName}上传`,
                            value: 'more'
                        }]
                    })
                }
                inquirer.prompt(promps).then(answer => {
                    console.log('answer', answer)
                    if(answer.upload === 'single') {
                        console.log(chalk.red(`请选择单个${typeName}上传`));
                        typeName === '资源' ? '' : fileOp.getSingleImage(dirpath);
                        return;
                    }
                    if(answer.upload === 'more') {
                        console.log(chalk.red(`请选择多个${typeName}上传`));
                        typeName === '资源' ? '' : fileOp.getMoreImage(dirpath);
                        return;
                    }
                    if(answer.upload === 'all') {
                        console.log(chalk.red(`全部${typeName}上传`));
                    }
                })
            })
        })
        .on('--help', () => {
            console.log('--examples');
            console.log(chalk.green('\n指令 $up upload\n'));
            console.log(chalk.yellow("支持的格式：['svg', 'jpg', 'jpeg', 'gif', 'png', 'webp', 'ico', 'mp3', 'mp4', 'mov', 'flv', 'm3u', 'm3u8', 'ttf', 'eot', 'woff', 'json']\n"))
        })
}
