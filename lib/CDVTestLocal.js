import CDVTest from './CDVTest.js';
import childProcess from 'child_process';
import glue from 'glue-path';

export default class CDVTestLocal extends CDVTest {

  isAppiumInstalled() {
    const child = childProcess.spawnSync('which', ['appium']);
    if (child.stderr && child.stderr.toString() !== '') {
      return false;
    }
    return true;
  }

  isAppiumAvailable() {
    const ar = glue([__dirname, '..', 'node_modules', 'appium-running', 'cli.js']);
    const child = childProcess.spawnSync(ar, []);
    if (child.stderr && child.stderr.toString() !== '') {
      return false;
    }
    const stdout = child.stdout.toString().trim();
    return stdout === 'YES';
  }

  getAppiumVersion() {
    const child = childProcess.spawnSync('appium', ['-v']);
    if (child.stderr && child.stderr.toString() !== '') {
      return false;
    }
    return child.stdout.toString();
  }

  beforeTests() {
    const logger = this.logger;
    // check appium is installed
    if (!this.isAppiumInstalled()) {
      return new Error('Appium is not installed');
    }
    logger.ok('Checking appium is installed');
    const appiumVersion = this.getAppiumVersion();

    if (appiumVersion) {
      logger.echo(`Appium installed, appium version: ${appiumVersion}`);
    }
    // check appium is available
    if (!this.isAppiumAvailable()) {
      return new Error('Appium is not running or available, run appium &');
    }
    logger.ok('Checking appium is running & available');
    return null;
  }

  getCapsSchema() {
    return [
      'host', 'port', 'app',
      'app-package', 'deviceName',
      'platformName', 'udid',
      'platformVersion',
    ];
  }

  buildCapabilities() {
    const caps = this.getExistingCapabilities();
    caps.host = '127.0.0.1';
    caps.port = 4723;
    caps.app = this.app_path;
    caps['app-package'] = this.package_name;
    caps.deviceName = this.device_name;
    if (this.platform === 'ios') {
      caps.platformName = 'iOS';
      caps.udid = this.udid;
    } else {
      caps.platformName = 'Android';
    }
    caps.platformVersion = this.platform_version;

    return this.updateCapabilities(caps);
  }
}
