var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();
var wd = require('wd');
var argv = require('minimist')(process.argv.slice(2));
var caps = require('./'+argv.platform+'.json');

var wdLocal = require('./local.json');
var wdSauce = require('./sauce.json');
var wdCaps = argv.local ? wdLocal : wdSauce;

chaiAsPromised.transferPromiseness = wd.transferPromiseness;

describe('Test example tests', function() {
  this.timeout(45000);

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
