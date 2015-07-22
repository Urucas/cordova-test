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
As an example to use ```cordova-test```, we create a simple ```Hello World``` app with cordova, and add some elements to the [index.html](https://github.com/Urucas/cordova-test/blob/master/example/www/index.html).
```bash
cordova create example com.urucas.testexample TestExample
cordova platform add android
```
We create two appium tests, the [first one](https://github.com/Urucas/cordova-test/blob/master/example/tests/1_index_test.js) will check that some elements on the [index.html](https://github.com/Urucas/cordova-test/blob/master/example/www/index.html) are displayed, and the [second tests](https://github.com/Urucas/cordova-test/blob/master/example/tests/2_button_test.js) will click on a button and check a text is changed.

Now, in the cordova project folder we run ```cordova-test android tests/``` and wait for the tests result.
<img src="https://raw.githubusercontent.com/Urucas/cordova-test/master/screen.png">

#Requirements
* [appium](https://github.com/appium/appium)
* [mocha](https://github.com/mochajs/mocha)
