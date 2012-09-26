var cheerio = require('cheerio')
  , helpers = require('./helpers')
  , exec = require('child_process').exec;

for (var i = 0; i < 4; i++) {
  (function(pageNumber) {
    var url = 'http://www.gamestar.de/videos/latest/'

    if (i !== 0) {
      url += pageNumber + '.html'
    }

    helpers.crawl(url, function(html) {
      var $          = cheerio.load(html)
        , videoPages = $('.videoPreview > a').map(function() { return this.attr('href'); })

      videoPages.forEach(function(videoPage) {
        videoPage = "http://www.gamestar.de" + videoPage

        console.log('Processing: ' + videoPage)
        helpers.downloadVideo(videoPage, function() {
          console.log('Finished: ' + videoPage)
        })
      })
    })
  })(i)
}

