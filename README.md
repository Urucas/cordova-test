# cordova-test
cli-tool to automate Appium tests suite for Cordova apps

#Install
```bash
npm install -g cordova-test
```

#Usage
Inside your cordova application folder
```bash
cordova-test <platform> <relative_path_to_tests_dir_or_file> [--no-compile] [--sauce user accessKey] [--use-tape]
```

#Example
As an example to use ```cordova-test```, we create a simple ```Hello World``` app with cordova, and add some elements to the [index.html](https://github.com/Urucas/cordova-test/blob/master/example/www/index.html).
```bash
cordova create example com.urucas.testexample TestExample
cordova platform add android
```
We create two appium tests integrated with mocha, the [first one](https://github.com/Urucas/cordova-test/blob/master/example/mocha/tests/1_index_test.js) will check that some elements on the [index.html](https://github.com/Urucas/cordova-test/blob/master/example/www/index.html) are displayed, and the [second tests](https://github.com/Urucas/cordova-test/blob/master/example/mocha/tests/2_button_test.js) will click on a button and check a text is changed.

Now, in the cordova project folder root we run ```cordova-test android tests/mocha``` and wait for the tests result.

<img src="https://raw.githubusercontent.com/Urucas/cordova-test/master/screen.png">

#Integrate with Sauce Labs
Set your [Sauce Labs](https://saucelabs.com/) user and access key to run the tests suite in Sauce Labs mobile devices.

For ex. 
```bash
$ cordova-test android tests --sauce SAUCE_USER SAUCE_ACCESSKEY
```
Before running the tests, ```cordova-test``` will upload the compiled app to Sauce Labs Storage, and update the platform capabilities. And then run every test remotely. 

<img src="https://raw.githubusercontent.com/Urucas/cordova-test/master/screen-sauce.png">

#Use Tape
As default ```cordova-test``` cli will run every tests with [mocha](http://mochajs.org/), but it can also be integrated to run with [tape](https://github.com/substack/tape) by setting the ```--use-tape``` param.

```cordova-test android tests/tape --use-tape```

#Requirements
* [cordova](https://cordova.apache.org/)
* [appium](https://github.com/appium/appium)

**iOS**
* xcode command-line toolds
* [libimobiledevice](libimobiledevice)
