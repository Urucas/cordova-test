import fs from 'fs';
import jsonfile from 'jsonfile';
import finf from 'finf';

export default function () {
  
  let instance = {};
  
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

  instance.run_test = (caps, test_path) => {
      
  }

  instance.run = (platform, tests_path) => {
    let [err, plt] = instance.set_platform(platform);
    if(err) return [err];

    let caps_path = instance.capabilities_path(platform, tests_path);
    if(!instance.capabilities_exists(caps_path)) 
      return [new Error("Capabilities not found, "+caps_path)];

    let [err1, caps] = instance.read_capabilities(caps_path);
    if(err1) return [err1];
    
    let [err2, tests] = instance.list_tests(tests_path);
    if(err2) return [err2];

    console.log(tests);
  }

  return instance;
}
