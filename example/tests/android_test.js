var wd = require('wd');

function test(caps) {
  
  var browser = wd.remote('localhost', caps.port);
 
  function log(msg){
    if(caps.log) caps.log(msg);
  }

  browser.on('status', function(info) {
    if(caps.log && caps.verbose) log(info);
  });
  
  browser.on('command', function(meth, path, data) {
    if(caps.log && caps.verbose) log([meth, path, data].join(" "));
  });

  function error(caps, err) => {
    browser.quit();
  }

  browser.init(
    {browserName:'Chrome',deviceName:'Android',platformName: 'Android'}, 
    function() {
      
    }
  );
}

module.exports = test;
