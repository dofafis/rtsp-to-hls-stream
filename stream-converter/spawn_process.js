const { spawn } = require('child_process')

module.exports = function(command, options) {
    return new Promise((resolve, reject) => {

        const ffmpeg = spawn(command, options, {stdio: ['ipc']})

        ffmpeg.on('error', (err) => {
            console.log('erro')
            reject()
        })
        
        ffmpeg.on('close', (code) => {
            console.log('Close codigo: ' + code)
            if(code !== 0)
                reject()
            else {
                console.log(code)
                ffmpeg.kill('SIGINT')
                resolve()
            }    
        })
        
        ffmpeg.stdout.on('data', (data) => {
            console.log('data')
            resolve()
        })

        ffmpeg.stderr.on('data', (data) => {
            resolve()
        })
    })
}