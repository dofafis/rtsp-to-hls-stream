var cleanOldStreams = require('node-schedule')
var rule = new cleanOldStreams.RecurrenceRule()
var fs = require('fs')
var glob = require('glob')

rule.second = 1
var job = cleanOldStreams.scheduleJob(rule, function(){
  console.log('Cleaning streams folder...')
  store = JSON.parse(fs.readFileSync(__dirname + '/streams/store.json', 'utf8'))
  if(store.length > 100) {
    glob(__dirname + '/streams/' + store[0] + '*', function (er, files) {
      if(er === null) {
        for(let file of files)
          fs.unlink(file, (err) => {
            if(err !== null)
              console.log('Error deleting file ' + file)
            else{
                store.shift()
                fs.writeFileSync(__dirname + '/streams/store.json', JSON.stringify(store))
                console.log('The streams folder was cleared successfully')
            }
          })
      }else 
        console.log('Error on finding archives of the stream ' + store[0])
    })
  }else 
    console.log('No files to clean yet')
});

module.exports = job