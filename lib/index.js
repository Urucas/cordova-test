import fs from 'fs';
import jsonfile from 'jsonfile';
import finf from 'finf';
import ar from 'appium-running';

export default function () {
  
  let instance = {};
  
  instance.error = (err) => {
    console.log(err);
    process.exit(1);
  }

  instance.set_platform = (platform) => {
    let supported_platforms = ['android'];
    if(supported_platforms.indexOf(platform) == -1) {
      return [new Error("Unsupported platform: "+platform)];
    }
    return [null, platform];
  }

  instance.read_capabilities = (caps_path) => {
   
    try {
      let caps = jsonfile.readFileSync(caps_path);
      return [null, caps];
    }catch(e) {
      return [err]
    }
  }

  instance.capabilities_path = (platform, tests) => {
    let tests_path = tests.replace(/\/$/, "");
    return [tests_path,"/", platform, ".json"].join("");
  }

  instance.capabilities_exists = (caps_path) => {
    try {
      let err = fs.accessSync(caps_path, fs.R_OK);
      if(err == undefined) return true;
      return false;
    }catch(e) {
      return false;  
    }
  }

  instance.list_tests = (tests_path) => {
    let [err, list] = finf(tests_path, "*.js");
    if(err) return [err];

    return [null, list];
  }

  instance.check_appium_is_running = (cb) => {
    ar(4723, cb);
  }

  instance.run_test = (test_path, caps) => {
  }

  instance.run = (platform, tests_path) => {
    let [err, plt] = instance.set_platform(platform);
    if(err) return instance.error(err);

    let caps_path = instance.capabilities_path(platform, tests_path);
    if(!instance.capabilities_exists(caps_path)) 
      return [new Error("Capabilities not found, "+caps_path)];

    let [err1, caps] = instance.read_capabilities(caps_path);
    if(err1) return instance.error(err1);
    
    let [err2, tests] = instance.list_tests(tests_path);
    if(err2) return instance.error(err2);

    instance.check_appium_is_running( (isRunning) => {
      
      if(!isRunning) return instance.error(new Error("Appium is not running"));
      for(let i=0; i< tests; i++) {
        let test_path = tests[i];
            test_path = [tests_path, test_path].join('\/');

        let err3 = instance.run_test(test_path);
        if(err3) return instance.error(err3);
      }
    });
  }

  return instance;
}
