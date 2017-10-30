var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var writeStream = fs.createWriteStream('3dModels.csv');

var curObject=0;

function makeRequest(offset) {

  var requestUrl = 'https://www.shapeways.com/designer/mz4250/creations?s=' + offset + '#more-products';
  // console.log('Request URL:' + requestUrl);
  request(requestUrl, function (err, resp, html) {
    var productsFound = 0;
    if (!err) {
      $ = cheerio.load(html);
      $('.product-url').each(function (i, elem) {
        if (i % 2 == 0) {
          productsFound++;
          var link = $(this).attr('href');
          var linkParts = link.split('/');
          var namePart = linkParts[linkParts.length - 1];
          var info = {
            'link': link,
            'name': namePart.substring(0, namePart.indexOf('?'))
          }

          addTags(info, offset+(i/2))
        }

      });


    }
    else {
      console.log(err);
      return;

    }
    if (productsFound > 0) {
      // console.log('Found products?'+productsFound);
      makeRequest(offset + productsFound);
    }
    else{
      console.log('finished:'+(offset+productsFound))
    }


  });
}

function addTags(elem, i) {
  var tags=[];
  console.log('Adding tags for '+i)

  console.log('Request URL:' + elem.link);
  request(elem.link, function (err, resp, html) {
    if (!err) {
      $ = cheerio.load(html);
      $('.product-keyword').each(function (i, elem) {
        tags.push($(this).attr('data-sw-tracking-link-id'))
      })
    }
    else {
      console.log(err);
    }
    writeStream.write('"'+elem.name + '","'+tags.join(';')+'","' + elem.link+'"\n');
  })
}

makeRequest(0);


return;
