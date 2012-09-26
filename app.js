var cheerio = require('cheerio')
  , helpers = require('./helpers')
  , exec = require('child_process').exec;


helpers.crawl('http://www.gamestar.de/videos/latest/', function(html) {
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
