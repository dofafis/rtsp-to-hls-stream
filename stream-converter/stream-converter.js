var router = require('express').Router()
var crypto = require('crypto')
var fs = require('fs')
var glob = require('glob')
var spaw_process = require('./spawn_process')

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
                    /* Executing ffmpeg command to convert the RTSP stream to HLS, you can add more options if you find it necessary,
                    in my case, more options generated more problems, so I kept it to a minimum */
                
                spaw_process('ffmpeg', [
                    '-rtsp_transport', 'tcp',
                    '-n',
                    '-t', '18000'
                    '-i', req.body.rtsp,
                    '-hls_time', '1',
                    '-hls_list_size', '1000',
                    '-start_number', '0',
                    '-y', './streams/' + streamFileName + '.m3u8'
                ])
                .then(
                    ()=> {
                        store.push(streamFileName)
                        fs.writeFile(__dirname + '/streams/store.json', JSON.stringify(store), function() {
                            console.log(store)
                        })
                        res.end(JSON.stringify({
                            streamURI: '/streams/' + streamFileName + '.m3u8'
                        }))
                    }
                )
                .catch(
                    () => {                            
                        res.end(JSON.stringify({
                            status: 400, 
                            error: 'Error creating stream, verify your rtsp URL or try again later'
                        }))
                    }
                )

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