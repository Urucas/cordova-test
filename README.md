# cordova-test
command-line tool to automate Cordova Appium tests suite

#Install
```bash
npm install -g cordova-test
```

#Usage
Inside your cordova application folder
```bash
cordova-test <platform> <relative_path_to_appium_tests> [--no-compile]
```

#Example
As an example to use ```cordova-test```, we create a simple ```Hello World``` app with cordova.
```bash
cordova create example com.urucas.testexample TestExample
cordova platform add android
```

Looking at [index.html](https://github.com/Urucas/cordova-test/blob/master/example/www/index.html), we create an appium test that will check that an ```<h1>``` and a ```Hello World``` is present on our app. Check the test code [here](https://github.com/Urucas/cordova-test/blob/master/example/tests/appium_test.js)

In the cordova project folder we run ```cordova-test android tests/``` and wait for the tests result.

<img src="https://raw.githubusercontent.com/Urucas/cordova-test/master/screen.png">

#Requirements
* [appium](https://github.com/appium/appium)
* [mocha](https://github.com/mochajs/mocha)
