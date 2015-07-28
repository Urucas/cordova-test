var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();
var wd = require('wd');
var argv = require('minimist')(process.argv.slice(2));
var caps = require('./'+argv.platform+'.json');

var wdCaps = require(argv.local ? './local.json' : './sauce.json');

chaiAsPromised.transferPromiseness = wd.transferPromiseness;

describe('Test example tests', function() {
  this.timeout(0);

  describe("Checking button action", function() {
    var browser;
    
    before(function() {
      browser = wd.promiseChainRemote(wdCaps);
      return browser
        .init(caps);
    });

    after(function() {
      return browser
        .quit();
    });
    
    it("should click a button", function(done) {
      browser
      .setImplicitWaitTimeout(5000)
      .context('WEBVIEW_com.urucas.testexample')
      .elementByClassName("hello")
      .isDisplayed()
      .then(function(isDisplayed){
        isDisplayed.should.equal(true)
      })
      .elementById("btt")
      .click()
      .nodeify(done);
    });

    it("should have changed home text", function(done) {
      browser
      .setImplicitWaitTimeout(5000)
      .context('WEBVIEW_com.urucas.testexample')
      .elementByClassName("hello")
      .isDisplayed()
      .then(function(isDisplayed){
        isDisplayed.should.equal(true)
      })
      .elementByClassName("hello")
      .text()
      .then(function(text){
        text.should.equal("HELLO APPIUM!")
      })
      .nodeify(done);
    });
     
  });

});

