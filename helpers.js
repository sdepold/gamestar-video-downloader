var http = require('http')
  , exec = require('child_process').exec

module.exports = {
  crawl: function(page, callback) {
    http.get(page, function(res) {
      var body = ""

      res.on('data', function(data) {
        body += data.toString()
      })

      res.on('end', function() {
        callback(body)
      })
    })
  },

  download: function(page, callback) {
    var filename = page.split("").filter(function(char) { return !!char.match(/\w/) }).join('')
      , cmd      = 'curl -L "' + page + '" > ' + filename + '.mp4'

    console.log('Executing: ' + cmd)

    exec(cmd, callback)
  }
}
