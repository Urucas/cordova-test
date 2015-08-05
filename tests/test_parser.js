import parser from '../lib/paramsParser.js'

describe("paramsParser tests", () => {

  it("should set platform as android if undefined", (done) => {
    let settings = parser()
    if(settings.platform != "android")
      throw new Error("Error setting default platform as android")
    done();
  });
  
  it("should set platform as android", (done) => {
    let settings = parser(['android'])
    if(settings.platform != "android")
      throw new Error("Error setting platform as android")
    done();
  });
  
  it("should set platform as ios", (done) => {
    let settings = parser(['ios'])
    if(settings.platform != "ios")
      throw new Error("Error setting platform as ios")
    done();
  });

  it("should set platform path", (done) => {
    let settings = parser(['android'])
    if(settings["platform_path"] == undefined)
      throw new Error("Error setting platform path")
    done();
  });

  it("should set tests path", (done) => {
    let settings = parser(['android', __dirname])
    if(settings["tests_path"] == undefined)
      throw new Error("Error setting tests path")
    done();
  });
  
  it("should set compile as true", (done) => {
    let settings = parser(['android'])
    if(settings.compile == false)
      throw new Error("Error setting default compile as true")
    done();
  });

  it("should set compile as false", (done) => {
    let settings = parser(['android',,"--no-compile",,])
    if(settings.compile == true)
      throw new Error("Error setting compile as false")
    done();
  });
  
  it("should set mocha as default test environment", (done) => {
    let settings = parser(['android'])
    if(settings["env"] != "mocha")
      throw new Error("Error setting default env as mocha")
    if(settings["env_files"] != "*.js")
      throw new Error("Error setting default env_files as *.js")
    done();
  });

  it("should set tape as test environment", (done) => {
    let settings = parser(['android',,"--env", "tape", "*.js"])
    if(settings["env"] == "mocha")
      throw new Error("Error setting env")
    if(settings["env_files"] == undefined)
      throw new Error("Error setting env_files")
    done();
  });

  it("should set isLocal as true as default", (done) => {
    let settings = parser(['android'])
    if(settings.isLocale == false)
      throw new Error("Error setting default isLocal as true")
    done();
  });

  it("should set sauce settings", (done) => {
    let settings = parser(['android',,"--sauce","sauce_user","sauce_key",,])
    if(settings.sauce == undefined)
      throw new Error("Error setting sauce settings")
    if(settings.sauce.user == undefined)
      throw new Error("Error setting sauce username")
    if(settings.sauce.accessKey == undefined)
      throw new Error("Error setting sauce accessKey")
    done();
  });
  
  it("should set tesdroid settings", (done) => {
    let settings = parser(['android',,"--testdroid","td_user","td_pass","td_device",])
    if(settings.testdroid == undefined)
      throw new Error("Error setting testdroid settings")
    if(settings.testdroid.username == undefined)
      throw new Error("Error setting tesdroid username")
    if(settings.testdroid.password == undefined)
      throw new Error("Error setting stestdroid password")
    if(settings.testdroid.device == undefined)
      throw new Error("Error setting testdroid device")
    done();
  });

})
