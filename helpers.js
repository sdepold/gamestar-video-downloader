var http    = require('http')
  , exec    = require('child_process').exec
  , fs      = require('fs')
  , cheerio = require('cheerio')

var helpers = module.exports = {
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

  download: function(page, title, callback) {
    var filename = title.replace(/ /g, '-').split("").filter(function(char) {
          return !!char.match(/[-\w]/)
        }).join('')
      , path     = "videos/" + filename + ".mp4"
      , cmd      = 'curl -L "' + page + '" > ' + path

    fs.exists(__dirname + '/' + path, function(exists) {
      if (!exists) {
        exec('mkdir ./videos; ' + cmd, callback)
      } else {
        callback()
      }
    })
  },

  downloadVideo: function(pageUrl, callback) {
    helpers.crawl(pageUrl, function(html) {
      var lines = html.split('\n')
        , video = null
        , title = null

      video = lines.filter(function(line) {
        return line.indexOf("'file':") > -1
      }).map(function(line) {
        return decodeURIComponent(line.split(':')[1].split(',')[0].match(/'(.*)'/)[1])
      })[0]

      title = lines.filter(function(line) {
        return line.indexOf('<title>') > -1
      }).map(function(line) {
        return line.match(/<title>(.*)<\/title>/)[1]
      })[0]

      if (!video) {
        console.log('No results for ' + pageUrl)
      } else {
        var path = "http://www.gamestar.de" + video

        title = title.replace(' - Video bei GameStar.de', '')

        helpers.crawl(path, function(html) {
          var $            = cheerio.load(html)
            , downloadPath = $('body a').attr('HREF')

          console.log('Downloading: ' + title)
          helpers.download(downloadPath, title, function() {
            console.log('Downloaded: ' + title)
            callback()
          })
        })
      }
    })
  }
}
