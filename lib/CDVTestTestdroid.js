import CDVTest from './CDVTest.js';
import childProcess from 'child_process';

export default class CDVTestTestdroid extends CDVTest {

  beforeTests() {
    const logger = this.logger;
    // zip file to upload
    /*
     params = [this.app_path, this.name];
     child = childProcess.spawnSync(glue(['..', 'zipipa.sh']), params);
    this.app_path = this.app_path.replace('.ipa', '.zip');
    */

    // upload app to testdroid
    const curlUrl = 'http://appium.testdroid.com/upload';
    const params = [
      '-s', '--user',
      `${this.testdroid.username} : ${this.testdroid.password}`,
      '-F', 'myCDVApp=@\'' + this.app_path + '\'',
      curlUrl,
    ];
    logger.echo('Uploading app to Testdroid, this may take a while!');
    let uploadResponse;
    const child = childProcess.spawnSync('curl', params);
    try {
      uploadResponse = JSON.parse(`${child.stdout}`);
    } catch (e) {
      return e;
    }
    this.testdroid.sessionId = uploadResponse.sessionId;
    this.app_path = uploadResponse.value.uploads.myCDVApp;
    return null;
  }
  getCapsSchema() {
    return [
      'host', 'testdroid_username',
      'testdroid_password', 'testdroid_project',
      'testdroid_testrun', 'testdroid_device',
      'testdroid_app', 'app',
      'deviceName', 'device',
      'testdroid_target', 'testdroid_locale',
    ];
  }

  buildCapabilities() {
    const caps = this.getExistingCapabilities();
    caps.host = 'appium.testdroid.com';
    caps.testdroid_username = this.testdroid.username;
    caps.testdroid_password = this.testdroid.password;
    caps.testdroid_project = this.name;
    caps.testdroid_testrun = 'Appium tests using cordova-test';
    caps.testdroid_device = this.testdroid.device;
    caps.testdroid_app = this.app_path;
    caps.app = this.package_name;
    caps.testdroid_locale = 'en';

    if (this.platform === 'ios') {
      delete caps.deviceName;
      caps.device = 'iphone';
      // caps['testdroid_target'] = 'ios'
    }

    return this.updateCapabilities(caps);
  }
}
