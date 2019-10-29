import fs from 'fs';
import cordova from 'cordova-lib';
import logger from './CDVLogger.js';
import childProcess from 'child_process';
import androidCaps from './caps/android.json';
import iosCaps from './caps/ios.json';
import finf from 'finf';
import fop from 'fop';
import path from 'path';

export default class CDVTest {

  constructor(settings) {
    this.platforms = ['android', 'ios'];
    this.platform = settings.platform;
    this.compile = settings.compile;
    this.testsPath = settings.tests_path;
    this.env = settings.env;
    this.env_files = settings.env_files;
    this.logger = settings.logger || logger();
    this.platform_path = settings.platform_path;
    this.device_name = settings.device_name;
    this.platform_version = settings.platform_version;
    this.babel = settings.babel;
    this.teamcity = settings.teamcity;
    this.device = settings.device;

    if (settings.udid) this.udid = settings.udid;

    if (settings.sauce) this.sauce = settings.sauce;
    else if (settings.testdroid) this.testdroid = settings.testdroid;

    if (!this.compile) this.app_path = path.join(process.cwd(), settings.app_path);
  }

  isPlatformSupported(platform) {
    return this.platforms.indexOf(platform) !== -1;
  }

  isTestsPathReachable(testsPath) {
    try {
      if (fs.accessSync(testsPath, fs.R_OK) == null) return true;
    } catch (e) {
      console.log(e);
    }
    return false;
  }

  isCordovaInstalled() {
    const child = childProcess.spawnSync('which', ['cordova']);
    if (child.stderr && child.stderr.toString() !== '') return false;
    return true;
  }

  getCordovaVersion() {
    const child = childProcess.spawnSync('cordova', ['-v']);
    if (child.stderr && child.stderr.toString() !== '') return false;
    return child.stdout.toString();
  }

  getExistingCapabilities() {
    const platform = this.platform;
    let caps = platform === 'android' ? androidCaps : iosCaps;
    let testsPath = this.testsPath;
    if (fs.lstatSync(testsPath).isFile()) {
      testsPath = fop(testsPath);
    }
    const capsPath = path.join(testsPath, `${platform}.json`);
    try {
      caps = require(capsPath);
    } catch (e) {
      console.log(e);
    }
    // remove extra capabilities
    const schema = this.getCapsSchema();
    const capsKeys = Object.keys(caps);
    for (let i = 0; i < capsKeys.length; i++) {
      const key = capsKeys[i];
      if (schema.indexOf(key) === -1) delete caps[key];
    }
    return caps;
  }

  updateCapabilities(caps) {
    const platform = this.platform;

    let testsPath = this.testsPath;
    if (fs.lstatSync(testsPath).isFile()) {
      testsPath = fop(testsPath);
    }
    const capsPath = path.join(testsPath, `${platform}.json`);
    try {
      console.log(JSON.stringify(caps));
      const err = fs.writeFileSync(capsPath, JSON.stringify(caps));
      if (err) return err;
    } catch (e) {
      console.log(e);
      return e;
    }
    return this.logger.ok('Platform capabilities updated');
  }

  checkSettings() {
    if (!this.isPlatformSupported(this.platform)) {
      return new Error(`Platform not supported ${this.platform}`);
    }
    this.logger.ok('Checking selected platform is supported');
    this.logger.echo(`${this.platform.toUpperCase()} \n`);

    if (!this.isTestsPathReachable(this.testsPath)) {
      return new Error(`Tests path not found, ${this.testsPath}`);
    }
    this.logger.ok('Checking test(s) path exists');

    if (!this.isCordovaInstalled()) {
      return new Error('cordova missing, make sure you have cordova installed');
    }
    const cdvVersion = this.getCordovaVersion();
    if (cdvVersion) {
      return this.logger.ok(`Cordova installed, cordova version: ${cdvVersion}`);
    }
    return this.logger.ok('Cordova installed');
  }

  beforeBuild() {
    // get cordova project info
    const info = {};
    try {
      const configPath = path.join(process.cwd(), 'config.xml');
      const ConfigParser = cordova.configparser;

      const config = new ConfigParser(configPath);
      info.packageName = config.packageName();
      info.name = config.name();
    } catch (e) {
      this.logger.echo(e);
      return;
    }
    this.logger.ok('Getting cordova project info');
    this.logger.echo(`Project name: ${info.name}`);
    this.logger.echo(`Package name: ${info.packageName}`);

    this.package_name = info.packageName;
    this.name = info.name;
  }

  build() {
    let err;
    let appPath;
    const err1 = this.beforeBuild();
    if (err1) return err1;

    if (this.platform === 'ios') {
      ([err, appPath] = this.buildIos());
    } else {
      ([err, appPath] = this.buildAndroid());
    }
    if (err) return err;

    const err2 = this.afterBuild(appPath);
    if (err2) return err2;

    this.app_path = appPath;
    return this.logger.ok('Checking compiled application exists');
  }

  afterBuild(appPath) {
    // check build app path exists
    try {
      if (fs.accessSync(appPath, fs.R_OK) == null) return null;
    } catch (e) {
      console.log(e);
    }
    return new Error(`Built application not found; ${appPath}`);
  }

  buildAndroid() {
    const apkPath = path.join(this.platform_path, 'app/build/outputs/apk/debug', 'app-debug.apk');
    // build android
    this.logger.echo('\nCompiling cordova application, this may take a while!');
    const child = childProcess.spawnSync('cordova', ['build', 'android']);
    if (child.stderr && child.stderr.toString() !== '') {
      return [new Error(child.stderr.toString())];
    }
    this.logger.ok('Cordova project buildd');
    this.logger.echo(apkPath);
    return [null, apkPath];
  }

  buildIos() {
    const appName = [this.name, 'app'].join('.');
    const ipaName = [this.name, 'ipa'].join('.');
    let appPath = path.join(this.platform_path, 'build', 'emulator', appName);
    let ipaPath = path.join(this.platform_path, 'build', 'emulator', ipaName);
    if (this.device) {
      appPath = path.join(this.platform_path, 'build', 'device', appName);
      ipaPath = path.join(this.platform_path, 'build', 'device', ipaName);
    }
    // build ios
    this.logger.echo('\nCompiling cordova application, this may take a while!');
    let iosBuildArgs = ['build', 'ios', '--debug'];
    if (this.device) iosBuildArgs = iosBuildArgs.concat('--device');

    const child = childProcess.spawnSync('cordova', iosBuildArgs);
    if (child.stderr && child.stderr.toString() !== '') {
      return [new Error(child.stderr.toString())];
    }

    this.logger.ok('Cordova project buildd');
    return [null, this.device ? ipaPath : appPath];
  }

  runTest(test, list) {
    const mochaBabelParams = ['--compilers', 'js:babel-core/register',
      '--require', 'babel-polyfill'];
    const mochaTeamCityParams = ['--reporter', 'mocha-teamcity-reporter'];
    let params = [test, '--platform', this.platform];
    if (this.babel) params = params.concat(mochaBabelParams);
    if (this.teamcity) params = params.concat(mochaTeamCityParams);
    const self = this;
    this.logger.echo(`Running test; ${this.env} ${test} --platform ${this.platform}`);
    const child = childProcess.spawn(this.env, params, { stdio: 'inherit' });

    child.on('close', () => {
      self.logger.echo('Test finished\n');
      self.runTests(list);
    });
  }

  runTests(list) {
    if (!list.length) {
      this.logger.ok('All test finished!');
      process.exit(0);
      return;
    }
    const test = list.shift();
    this.runTest(test, list);
  }

  test() {
    let testsList = [];
    if (fs.lstatSync(this.testsPath).isFile()) {
      testsList = [this.testsPath];
    } else {
      const [err, list] = finf(this.testsPath, this.env_files);
      if (err) {
        logger.fail(err);
        process.exit(0);
      }
      for (let i = 0; i < list.length; i++) {
        const test = path.join(this.testsPath, list[i]);
        list[i] = test;
      }
      testsList = list;
    }
    this.runTests(testsList);
  }

  run() {
    let err;
    const self = this;
    if (this.compile) {
      err = self.build();
      if (err) {
        self.logger.fail(err.toString());
        process.exit(0);
      }
    }

    err = this.beforeTests();
    if (err) {
      this.logger.fail(err.toString());
      process.exit(0);
    }

    err = this.buildCapabilities();
    if (err) {
      this.logger.fail(err.toString());
      process.exit(0);
    }

    this.test();
  }

}
