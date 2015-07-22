var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();
var wd = require('wd');
var argv = require('minimist')(process.argv.slice(2));
var caps = require('./'+argv.platform+'.json');

chaiAsPromised.transferPromiseness = wd.transferPromiseness;

describe('Test example tests', function() {
  this.timeout(45000);

  describe("Checking all elements are displayed", function() {
    var browser;
    
    before(function() {
      browser = wd.promiseChainRemote("localhost", 4723);
      return browser
        .init(caps);
    });

    after(function() {
      return browser
        .quit();
    });
    
    it("should show hello world", function(done) {
      browser
      .context('WEBVIEW_com.urucas.testexample')
      .elementByClassName("hello")
      .isDisplayed()
      .then(function(isDisplayed){
        isDisplayed.should.equal(true)
      })
      .nodeify(done);
    });

    it("should show h1", function(done) {
      browser
      .context('WEBVIEW_com.urucas.testexample')
      .elementByTagName("h1")
      .isDisplayed()
      .then(function(isDisplayed){
        isDisplayed.should.equal(true)
      })
      .nodeify(done);
    });
  
  });

});

