var wd = require('wd');
var argv = require('minimist')(process.argv.slice(2));
var caps = require('./'+argv.platform+'.json');

var wdCaps = require(argv.local ? './local.json' : './sauce.json');
var test = require('tape');
test('contexts test', function (t) {
  t.plan(1);
  var browser = wd.remote(wdCaps);
  browser.init(caps, function(err) {
    browser.setImplicitWaitTimeout(5000, function(err) {
    if (err) return console.log('couldnt set wait', err);
      browser.contexts(function(err, list) {
        t.equal(list[0], "NATIVE_APP");
        browser.quit();
      });
    });
  });
});
