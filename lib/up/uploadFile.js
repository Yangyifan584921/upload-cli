const co = require('co');
const OSS = require('ali-oss');
const moment = require('moment');
const timesheet = moment().format('YYYYMMDD');
const chalk = require('chalk');
const { v1: uuid } = require('uuid');
const fs = require('fs');
const paths = require('path');
const inquirer = require('inquirer');
const url = 'https://fr-static.shopshopslive.com/';

const client = new OSS({
    region: 'xxx',
    accessKeyId: 'xxx',
    accessKeySecret: 'xxx',
    bucket: 'xxx',
    timeout: '5000000'
});

class File {
    // 获取文件夹下的所有文件
    getFileList(path) {
        const fileLists = [];
        this.getAllFiles(path, fileLists);
        return fileLists;
    }
    // 文件夹下的所有文件
    getAllFiles(path, filesList) {
        const files = fs.readdirSync(path);
        files.forEach(item => {
            const stat = fs.statSync(path + item);
            if(!stat.isDirectory()) {
                filesList.push({
                    path,
                    filename: item
                })
            }
        })
    }
    // 获取文件夹下的所有图片
    getImageFiles(path) {
        const imgObj = {
            pathList: [],
            namesArr: []
        };
        this.getFileList(path).forEach(item => {
            imgObj.pathList.push(item.path + item.filename);
            imgObj.namesArr.push(item.filename);
        });
        return imgObj;
    }
    // 单个图片上传
    getSingleImage(path) {
        const self = this;
        let promps = [];
        let chooses = this.getImageFiles(path).pathList || [];
        promps.push({
            type: 'rawlist',
            name: 'imgName',
            choices: chooses,
            message: '选择需要上传的图片',
            pageSize: 20
        });
        console.log(chooses)
        inquirer.prompt(promps).then(answer => {
            console.log(chalk.green(JSON.stringify(`您选择的照片：${answer.imgName}`)));
            console.log('answer', answer)
            self.singleUpload(answer.imgName);
        })
    }
    singleUpload(name) {
        const self = this;
        const imgFileArr = name.split('/');
        const fileName = imgFileArr[imgFileArr.length - 1];
        const imgType = fileName.split('.')[1];
        const names = fileName.split('.')[0];
        console.log('imgType', imgType)
        console.log('names', names)
        co(function* () {
            const result = yield client.put(
                `${timesheet}/${names}.${Date.now()}.${imgType}`,
                `${name}`
            )
            if(result.res.status === 200) {
                console.log('result', result)
                console.log(chalk.green(`${fileName}:${url}${result.name}`));
            }else {
                console.log(chalk.red(`${fileName}上传失败`));
            }
        }).catch(err => {
            console.log(chalk.red(err))
        })
    }
    // 多个图片上传
    getMoreImage(path) {
        const self = this;
        let promps = [];
        let chooses = this.getImageFiles(path).pathList || [];
        promps.push({
            type: 'checkbox',
            message: '选择需要上传的图片',
            choices: chooses,
            name: 'imgName'
        })
        inquirer.prompt(promps).then(answer => {
            const nameArr = [];
            const imgTypeArr = [];
            const name = answer.imgName
            for(let i = 0; i < name.length; i++) {
                const imgFileArr = name[i].split('/');
                const fileName = imgFileArr[imgFileArr.length - 1];
                const imgType = fileName.split('.')[1];
                const names = fileName.split('.')[0];
                nameArr.push(names)
                imgTypeArr.push(imgType)
            }
            this.allUpload(nameArr, imgTypeArr, name, path)
        })
    }
    allUpload(nameArr = [], imgType = [], name = [], path) {
        const filepath = paths.join(path, 'image.json')
        const json = {}
        co(function* () {
            for(let i = 0; i < nameArr.length; i++) {
                const result = yield client.put(
                    `${timesheet}/${nameArr[i]}.${Date.now()}.${imgType[i]}`,
                    `${name[i]}`
                )
                if(result.res.status === 200) {
                    json[nameArr[i]] = `${url}${result.name}`
                    fs.writeFile(filepath, JSON.stringify(json), (err) => {
                        if(err) {
                            console.log(chalk.red(err))
                        }
                    })
                    console.log(chalk.green(`${nameArr[i]}:${url}${result.name}`));
                }else {
                    console.log(chalk.red(`${nameArr[i]}上传失败`));
                }
            }
        }).catch(err => {
            console.log(chalk.red(err))
        })
    }
}
module.exports = new File()
