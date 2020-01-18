const puppeteer = require('puppeteer');
const fs = require('fs');
const request = require('request');
var crypto = require('crypto');

// DÜMDÜZ KOD, YUKARIAN AŞAĞI KOD

const USERNAME = ''
const PASSWORD = ''


var download = function (uri, filename, callback) {
  request.head(uri, function (err, res, body) {
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

fs.mkdir('data', { recursive: true }, (err) => {
  if (err) throw err;
});

(async () => {

  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  // sayfanin sonundaki elementler de gelsin diye height yuksek tuttum
  // zira scroll da edilebilir vs vs
  page.setViewport({width: 1300, height: 3000})

  // linkedin'i kandirma cabalari
  page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36")

  // login sayfasina git
  await page.goto('https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin');
  await page.waitFor(1000)

  // tell me ur secrets so i can login
  await page.type('input#username', USERNAME);
  await page.type('input#password', PASSWORD);
  await page.waitFor(500)
  await page.click('#app__container > main > div > form > div.login__form_action_container > button')
  await page.waitFor(1000)

  // +2 kisileri ara
  // linki elle kopyaladım fakat bu da otomatize edilebilirdi
  await page.goto('https://www.linkedin.com/search/results/people/?facetGeoRegion=%5B%22tr%3A0%22%2C%22tr%3A7585%22%5D&facetNetwork=%5B%22S%22%5D&origin=FACETED_SEARCH')
  await page.waitFor(1000)
  
  
  while(true) {

    let images = await page.$$('img[class^=ivm-view-attr__img--centered]')
    let details = await page.$$('div[class^=search-result__info]')

    var zipped = images.map(function(e, i) {
      return [e, details[i]];
    });

    for (const z of zipped) {
      let image = z[0]
      let detail = z[1]
      
      const detailText = await page.evaluate(el => el.innerText, detail)
      let _id = crypto.createHash('md5').update(detailText).digest("hex");

      fileName = 'data/' + _id + '.txt'
      fs.writeFileSync(fileName, detailText)

      const imgLink = await page.evaluate(el => el.getAttribute("src"), image)
      fileName = 'data/' + _id + '.jpg'
      download(imgLink, fileName, function() {}) 
    }

    await page.waitFor(2000)
    await page.click('button[aria-label="Next"]');
  }

  await browser.close();
})();
