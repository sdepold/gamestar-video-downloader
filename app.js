var cheerio = require('cheerio')
  , helpers = require('./helpers')
  , exec = require('child_process').exec;


helpers.crawl('http://www.gamestar.de/videos/latest/', function(html) {
  var $          = cheerio.load(html)
    , videoPages = $('.videoPreview > a').map(function() { return this.attr('href'); })

  videoPages.forEach(function(videoPage) {
    videoPage = "http://www.gamestar.de" + videoPage

    console.log('Processing: ' + videoPage)

    helpers.crawl(videoPage, function(html) {
      var lines = html.split('\n')

      lines = lines.filter(function(line) {
        return line.indexOf("'file':") > -1
      }).map(function(line) {
        return decodeURIComponent(line.split(':')[1].split(',')[0].match(/'(.*)'/)[1])
      })

      if (lines.length === 0) {
        console.log('No results for ' + videoPage)
      } else {
        var path = "http://www.gamestar.de" + lines[0]

        console.log('Found video on ' + videoPage + ': ' + path)

        helpers.crawl(path, function(html) {
          var $            = cheerio.load(html)
            , downloadPath = $('body a').attr('HREF')

          console.log('Start download of: ' + downloadPath)

          helpers.download(downloadPath, function() {
            console.log('Just downloaded: ' + downloadPath)
          })
        })
      }
    })
  })
})
