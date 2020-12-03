const paths = require('path');
const fs = require('fs');

module.exports = (program, {name, path}) => {
    console.log('path', path)
    const _require = filepath => {
        if(typeof filepath === 'string') {
            const _f = require(filepath)
            if(typeof _f === 'function') {
                _f(program)
            }
        }
        return program
    };
    const _loadCmds = dirpath => {
        if(fs.existsSync(dirpath) && fs.statSync(dirpath).isDirectory()) {
            fs.readdirSync(dirpath).forEach(filename => {
                const filePath = paths.join(dirpath, filename);
                _require(filePath)
            });
        } else {

        }
        return program;
    }
    if(path) {
        _loadCmds(path);
        const _lib = paths.join(path, `../${name}.js`);
        if(fs.existsSync(_lib)) {
            _require(_lib)
        }
    }
}
