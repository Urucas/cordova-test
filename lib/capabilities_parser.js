#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');

var sauce_wd_config = {
  "host":"ondemand.saucelabs.com",
  "port":"80",
  "username":"",
  "accessKey":""
}

var local_wd_config = {
  "host":"localhost", 
  "port":"4723"
}

var default_ios_caps = {
  "appium-version":"1.4.7",
  "deviceName":"ios",
  "platformName":"iOS",
  "platformVersion":"8.2",
  "app":"",
  "app-package":"",
  "browserName":""
}

var default_android_caps = {
  "appium-version":"1.4.7",
  "deviceName":"Android",
  "platformName":"Android",
  "platformVersion":"5.0",
  "app":"",
  "app-package":""
}

var build = argv["_"][0]
if(build == 'local') {
  console.log(JSON.stringify(local_wd_config));
  process.exit(0);
}
if(build == 'sauce') {
  sauce_wd_config.username = argv["_"][1];
  sauce_wd_config.accessKey  = argv["_"][2];
  console.log(JSON.stringify(sauce_wd_config));
  process.exit(0);
}
if(build == 'android') {
  var caps_path =  argv["_"][1]
  var android_caps = default_android_caps;
  try {
    if(fs.accessSync(caps_path, fs.R_OK) == null) {
      android_caps = require(caps_path);
    }
  }catch(e){}
  android_caps["app"] = argv["_"][2]
  android_caps["app-package"] = argv["_"][3]
  console.log(JSON.stringify(android_caps));
  process.exit(0);
}
if(build == 'ios') {
  var caps_path =  argv["_"][1]
  var ios_caps = default_ios_caps;
  try {
    if(fs.accessSync(caps_path, fs.R_OK) == null) {
      ios_caps = require(caps_path);
    }
  }catch(e){}
  ios_caps["app"] = argv["_"][2]
  ios_caps["app-package"] = argv["_"][3]
  if(argv["_"][4]){
    ios_caps["udid"] = argv["_"][4];
  }else {
    delete ios_caps["udid"];
  }
  console.log(JSON.stringify(ios_caps));
  process.exit(0);
}
