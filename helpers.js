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

  getVideoUrl: function(html) {
    var lines = html.split('\n')

    return lines.filter(function(line) {
      return line.indexOf("'file':") > -1
    }).map(function(line) {
      return decodeURIComponent(line.split(':')[1].split(',')[0].match(/'(.*)'/)[1])
    })[0]
  },

  getVideoTitle: function(html) {
    var lines = html.split('\n')
      , title = null

    title = lines.filter(function(line) {
      return line.indexOf('<title>') > -1
    }).map(function(line) {
      return line.match(/<title>(.*)<\/title>/)[1]
    })[0]

    if (title) {
      title = title.replace(' - Video bei GameStar.de', '')
    }

    return title
  },

  getVideoDate: function(html) {
    var $     = cheerio.load(html)
      , text  = $('.contentMiddle > div > span').first().text()
      , split = text.split('|')[0].replace('Datum: ', '').replace(/\s/g, '').split('.')

    return [split[2], split[1], split[0]].join('-')
  },

  downloadVideo: function(pageUrl, callback) {
    helpers.crawl(pageUrl, function(html) {
      var video = helpers.getVideoUrl(html)
        , title = helpers.getVideoTitle(html)
        , date  = helpers.getVideoDate(html)

      if (!video) {
        console.log('No results for ' + pageUrl)
      } else if (title.toLowerCase().indexOf('trailer') !== -1) {
        console.log('Skipping trailer: ' + title)
      } else {
        var path = "http://www.gamestar.de" + video

        helpers.crawl(path, function(html) {
          var $            = cheerio.load(html)
            , downloadPath = $('body a').attr('HREF')

          console.log('Downloading: ' + title)
          helpers.download(downloadPath, date + '-' + title, function() {
            console.log('Downloaded: ' + title)
            callback()
          })
        })
      }
    })
  }
}
