# cordova-test [![Build Status](https://travis-ci.org/Urucas/cordova-test.svg)](https://travis-ci.org/Urucas/cordova-test)
cli-tool to automate Appium tests suite for Cordova apps

#Install
```bash
npm install -g cordova-test
```

#Usage
Inside your cordova application folder
```bash
cordova-test <platform> <relative_path_to_tests_dir_or_file> 
  [--no-compile]
  [--babel use babel transpiler] 
  [--env environment files_regex]
  [--sauce user accessKey]
  [--udid ios_udid]
  [--device-name device name]
  [--platform-version platform version]
```

#Environment
As default ```cordova-test``` will run the tests with [mocha](http://mochajs.org/), but it can also be integrated to run with any other environment you want by setting the ```--env``` param.

For ex.:
```bash
$ cordova-test android tests/tape --env tape *.js
$ cordova-test android tests/python --env python *.py
```

#Example
As an example we create a simple **Hello World** app with cordova,

```bash
cordova create example com.urucas.testexample TestExample
cordova platform add android
```
and add a few elements to the [index.html](https://github.com/Urucas/cordova-test/blob/master/example/www/index.html)

Now, we create 2 appium tests to run with mocha, the [first one](https://github.com/Urucas/cordova-test/blob/master/example/tests/mocha/1_index_test.js) will check that some elements on the **index.html** are displayed, and the [second test](https://github.com/Urucas/cordova-test/blob/master/example/tests/mocha/2_button_test.js) will click on a button and check a text is changed.

Inside our cordova project root folder run 
```cordova-test android tests/mocha``` 
and wait for the tests result.

<img src="https://raw.githubusercontent.com/Urucas/cordova-test/master/screen.png">

Thats all! 

**cordova-test** will compile the cordova app, verify the requested environment, create the test capabilities and run all the tests. 

#Integrate with Sauce Labs
Set your [Sauce Labs](https://saucelabs.com/) user and access key to run the tests suite in Sauce Labs mobile devices.

For ex. 
```bash
$ cordova-test android tests/mocha --sauce SAUCE_USER SAUCE_ACCESSKEY
```
Before running the tests, ```cordova-test``` will upload the compiled app to Sauce Labs Storage, and update the platform capabilities. 

<img src="https://raw.githubusercontent.com/Urucas/cordova-test/master/screen-sauce.png">

#Requirements
* [cordova](https://cordova.apache.org/)

**Local testing**
* [appium](https://github.com/appium/appium)

**iOS**
* xcode command-line tools

**Babel**
* To use the babel transpiler and es2015 in your tests you need to install these dependencies in your Cordova project:
```npm i --save-dev babel-core babel-plugin-transform-async-to-generator babel-polyfill babel-preset-es2015
```
* .babel.rc config:
```
{
 "presets": ["react", "es2015"],
 "plugins": ["transform-async-to-generator"]
}
```
