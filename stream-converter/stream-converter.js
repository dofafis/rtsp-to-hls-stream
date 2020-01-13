var router = require('express').Router()
var ffmpeg = require('fluent-ffmpeg')
var crypto = require('crypto')
var fs = require('fs')
var glob = require('glob')

router.post('/', createStreamFileName, function (req, res) {
  
    console.log(req.body.streamFileName)
    var streamFileName = req.body.streamFileName
    
    store = JSON.parse(fs.readFileSync(__dirname + '/../streams/store.json', 'utf8'));
    if(store.find((a)=>{ return a === streamFileName }))
        res.end(JSON.stringify({streamURI: '/streams/' + streamFileName + '.m3u8'}))
    else {
        fs.stat(__dirname + '/../streams/' + streamFileName + '.m3u8', function(err, stat) {
            
            if(err == null) {
                
                console.log('Stream already exists, just send it\'s URI on the response')
                res.end(JSON.stringify({streamURI: '/streams/' + streamFileName + '.m3u8'}))
                
            } else if(err.code === 'ENOENT') {
                
                console.log('Stream doesn\'t exist yet')
                try {
                    
                    /* Executing ffmpeg command to convert the RTSP stream to HLS, you can add more options if you find it necessary,
                    in my case, more options generated more problems, so I kept it to a minimum */
                    ffmpeg(req.body.rtsp, { timeout: 432000 }).addOptions([
                        '-rtsp_transport tcp',
                        '-y', // baseline profile (level 3.0) for H264 video codec
                        '-f hls',
                        '-start_number 0',
                        '-hls_time 4'
                    ]).output('./streams/' + streamFileName + '.m3u8')
                    .on('error', function(err, stdout, stderr) {
                        console.log(err)
                        res.end(JSON.stringify({status: 400, error: 'Error creating stream, verify your rtsp URL or try again later'}))
                    })
                    .on('progress', ()=>{
                        res.end(JSON.stringify({streamURI: '/streams/' + streamFileName + '.m3u8'}))
                    })
                    .on('end', ()=>{
                        store.push(streamFileName);
                        fs.writeFileSync(__dirname + '/../streams/store.json', JSON.stringify(store))
                    })
                    .run()
                    
                } catch (error) {
                    
                    console.log('Error ffmpeg creating stream: ')
                    console.log(error)
                    res.end(JSON.stringify({status: 400, error: 'Error creating stream, verify your rtsp URL or try again later'}))
                    
                }
                
            } else {
                
                console.log('Some other error: ', err.code)
                res.end(JSON.stringify({status: 500, message: 'Server error, try again later'}))
                
            }
        
        })
    }
    
})

router.delete('/:streamHash', function (req, res) {
    store = JSON.parse(fs.readFileSync(__dirname + '/../streams/store.json', 'utf8'))
    if (typeof(req.params.streamHash) === 'undefined')
        res.end(JSON.stringify({ status: 400, message: 'Url parameter streamHash is required' }))
    else {
        glob(__dirname + '/../streams/' + req.params.streamHash + '*', function (er, files) {
            if(er === null) {
              console.log(files)
              for(let file of files)
                fs.unlink(file, (err) => {
                    if(err !== null){
                        console.log('Error deleting file ' + file)
                        res.end(JSON.stringify({ status: 500, message: 'Error deleting file ' + file }))
                    }
                    else{
                        store = store.filter(stream => {
                            return stream !== req.params.streamHash
                        })
                        fs.writeFileSync(__dirname + '/../streams/store.json', JSON.stringify(store))
                        console.log('The stream was cleared successfully')
                        res.end(JSON.stringify({ status: 200, message: 'Error deleting file ' + file }))
                  }
                })
            }else 
                console.log('Error on finding archives of the stream ' + streamHash)
        })
    } 
})

// Middleware to generate the name of the stream file before ffmpeg executes
function createStreamFileName(req, res, next) {
    // generate a hash frmo the RTSP URL
    if(typeof(req.body.rtsp) === 'undefined')
        res.end(JSON.stringify({ status: 400, message: 'Attribute rtsp is required' }))
    else {
        var streamFileName = crypto.createHmac('md5', req.body.rtsp).digest('hex')
        req.body.streamFileName = streamFileName
        next()
    }
}

module.exports = router;