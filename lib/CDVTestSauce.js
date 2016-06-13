import CDVTest from './CDVTest.js';
import childProcess from 'child_process';
import path from 'path';

export default class CDVTestSauce extends CDVTest {

  beforeTests() {
    const logger = this.logger;
    // upload app to sauce storage
    const curlUrl = [
      'https://saucelabs.com/rest/v1/storage/', this.sauce.user, '/',
      path.basename(this.app_path), '?overwrite=true'].join('');

    const params = [
      '-u', `${this.sauce.user} : ${this.sauce.accessKey}`, '-X',
      'POST', '-H', 'Content-Type: application/octet-stream',
      curlUrl, '--data-binary', `@ ${this.app_path}`,
    ];
    logger.echo('Uploading app to Sauce Labs, this may take a while!');
    childProcess.spawnSync('curl', params);

    logger.ok('App uploaded to Sauce Labs storage');
  }

  getCapsSchema() {
    return [
      'host', 'port',
      'username', 'accessKey',
      'app', 'deviceName',
      'browserName', 'app-package',
      'platformName', 'appium-version',
      'platformVersion',
    ];
  }

  buildCapabilities() {
    const caps = this.getExistingCapabilities();
    caps.host = 'ondemand.saucelabs.com';
    caps.port = 80;
    caps.username = this.sauce.user;
    caps.accessKey = this.sauce.accessKey;
    caps.app = `sauce-storage: ${path.basename(this.app_path)}`;
    caps['app-package'] = this.packageName;
    caps.browserName = '';
    caps['appium-version'] = '1.4.7';

    if (this.platform === 'ios') {
      caps.deviceName = 'iPhone Simulator';
      caps.platformName = 'ios';
      caps.platformVersion = '9.3';
    } else {
      caps.deviceName = 'Android Emulator';
      caps.platformName = 'Android';
      caps.platformVersion = '6.0';
    }
    return this.updateCapabilities(caps);
  }
}
