#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');

(async() => {
    require('../util/loader')(program, {
        path: path.join(process.mainModule.filename, '../../cmds/up'),
        name: 'up'
    });
    // 解析命令
    program.parse(process.argv);
    if(!process.argv.slice(2).length) {
        console.log("\nNo command specified, see 'gen --help'");
        program.outputHelp();
        // process.exit(1);
    }
})()
