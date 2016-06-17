import glue from 'glue-path';

export default function parser(argv = []) {
  const settings = {};

  // supported platforms
  const platforms = {
    android: 'android',
    ios: 'ios',
  };
  let platform = argv[0];
  if (platforms[platform] === undefined) platform = 'android';
  settings.platform = platform;
  settings.platform_path = glue([process.cwd(), 'platforms', platform]);
  settings.tests_path = glue([process.cwd(), argv[1] || '']);

  settings.compile = argv.indexOf('--no-compile') === -1;
  settings.babel = argv.indexOf('--babel') !== -1;
  settings.teamcity = argv.indexOf('--teamcity') !== -1;
  settings.device = argv.indexOf('--device') !== -1;

  const env = argv.indexOf('--env');
  if (env !== -1) {
    settings.env = argv[env + 1];
    settings.env_files = argv[env + 2];
  } else {
    settings.env = 'mocha';
    settings.env_files = '*.js';
  }

  const sauce = argv.indexOf('--sauce');
  const testdroid = argv.indexOf('--testdroid');

  const udid = argv.indexOf('--udid');
  if (udid !== -1) {
    settings.udid = argv[udid + 1];
  }

  const deviceName = argv.indexOf('--device-name');
  if (deviceName !== -1) {
    settings.device_name = argv[deviceName + 1];
  } else {
    if (platform === 'android') settings.device_name = 'Android Emulator';
    else settings.device_name = 'iOS Simulator';
  }

  const appPath = argv.indexOf('--app');
  if (appPath !== -1) {
    settings.app_path = argv[appPath + 1];
    console.log(settings.app_path);
  }

  const platformVersion = argv.indexOf('--platform-version');
  if (platformVersion !== -1) {
    settings.platform_version = argv[platformVersion + 1];
  }

  if (sauce !== -1) {
    settings.sauce = {
      user: argv[sauce + 1],
      accessKey: argv[sauce + 2],
    };
  } else if (testdroid !== -1) {
    settings.testdroid = {
      username: argv[testdroid + 1],
      password: argv[testdroid + 2],
      device: argv[testdroid + 3],
    };
  } else settings.isLocal = true;

  return settings;
}
