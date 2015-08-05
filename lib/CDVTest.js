import fs from 'fs'
import cordova from 'cordova-lib'
import logger from './CDVLogger.js'
import child_process from 'child_process'
import glue from 'glue-path'
import android_caps from './caps/android.json'
import ios_caps from './caps/ios.json'
import finf from 'finf'
import fop from 'fop'

export default class CDVTest {

  constructor(settings) {
    this.platforms = ['android', 'ios']
    this.platform = settings.platform
    this.nocompile  = !settings.compile
    this.tests_path = settings.tests_path
    this.useTape = settings.use_tape
    this.logger = settings.logger || logger()
    this.platform_path = settings.platform_path

    if(settings.udid) this.udid = settings.udid

    if(settings.sauce) this.sauce = settings.sauce
    else if(settings.testdroid) this.testdroid = settings.testdroid
  }

  is_platform_supported(platform) {
    return this.platforms.indexOf(platform) != -1 ? true : false
  }

  is_tests_path_reacheable(tests_path) {
    try {
      if(fs.accessSync(tests_path, fs.R_OK) == null)
        return true;
    }catch(e){}
    return false;
  }

  is_cordova_installed() {
    let child = child_process.spawnSync("which", ["cordova"])
    if(child.stderr && child.stderr.toString() !="") { 
      return false
    }
    return true
  }

  get_cordova_version() {
    let child = child_process.spawnSync("cordova", ["-v"])
    if(child.stderr && child.stderr.toString() !="") { 
      return false
    }
    return child.stdout.toString()
  }

  get_existing_capabilities() {
    
    let platform = this.platform
    let caps = platform == 'android' ? android_caps : ios_caps
    let tests_path = this.tests_path
    if(fs.lstatSync(tests_path).isFile()) {
      tests_path = fop(tests_path)
    }
    let caps_path = glue([tests_path, platform+".json"])
    try {
      caps = require(caps_path)
    }catch(e) {}
   
    // remove extra capabilities
    let schema    = this.get_caps_schema()
    let caps_keys = Object.keys(caps)
    for(let i=0;i<caps_keys.length;i++) {
      let key = caps_keys[i]
      if(schema.indexOf(key) == -1)
        delete caps[key]
    }
    return caps
  }

  update_capabilities(caps) {
    
    let logger = this.logger
    let platform = this.platform

    let tests_path = this.tests_path
    if(fs.lstatSync(tests_path).isFile()) {
      tests_path = fop(tests_path)
    }
    let caps_path = glue([tests_path, platform+".json"])
    try {
      let err = fs.writeFileSync(caps_path, JSON.stringify(caps))
      if(err) return err
    }catch(e) {
      console.log(e)
      return e;
    }
    logger.ok("Platform capabilities updated")
  }

  checkSettings() {
   
    let logger = this.logger
    if(!this.is_platform_supported(this.platform)) {
      return new Error("Platform not supported "+ this.platform)
    }
    logger.ok("Checking selected platform is supported")
    logger.echo(this.platform.toUpperCase()+"\n")
    
    if(!this.is_tests_path_reacheable(this.tests_path)) {
      return new Error("Tests path not found, "+ this.tests_path)
    }
    logger.ok("Checking test(s) path exists")

    if(!this.is_cordova_installed()) {
      return new Error("cordova missing, make sure you have cordova installed")
    }
    let cdv_version = this.get_cordova_version()
    if(cdv_version) {
      logger.ok("Cordova installed, cordova version: "+cdv_version)
    }else{
      logger.ok("Cordova installed")
    }
  }

  before_compile() {
    // get cordova project info 
    let logger = this.logger
    
    let info = {}
    try {
      let configPath = glue([process.cwd(), "config.xml"])
      let ConfigParser = cordova.configparser;

      let config = new ConfigParser(configPath)
      info.packageName = config.packageName()
      info.name = config.name()

    }catch(e) {
      return e
    }
    logger.ok("Getting cordova project info")
    logger.echo("Project name: "+info.name);
    logger.echo("Package name: "+info.packageName);

    this.packageName = info.packageName
    this.name = info.name
  }

  compile() {
    
    let logger = this.logger
    var err = this.before_compile()
    if(err) return err
    
    if(this.platform == 'ios') {
      var [err, app_path] = this.compile_ios()
    } else {
      var [err, app_path] = this.compile_android()
    }
    if(err) return err
    
    var err = this.after_compile(app_path)
    if(err) return err
    
    logger.ok("Checking compiled application exists")
    this.app_path = app_path;
  }

  after_compile(app_path) {
    // check compile app path exists
    try {
      if(fs.accessSync(app_path, fs.R_OK) == null)
        return null;
    }catch(e){}
    return new Error("Compiled application not found; "+app_path);
  }

  compile_android() {
    let logger = this.logger
    let apk_path = glue([this.platform_path, "ant-build","CordovaApp-debug.apk"])
    if(!this.nocompile) {
      // compile android
      logger.echo("\nCompiling cordova application, this may take a while!")
      let child = child_process.spawnSync("cordova", ["build", "android"])
      if(child.stderr && child.stderr.toString() !="") { 
        return [new Error(child.stderr.toString())]
      }
      logger.ok("Cordova project compiled")
    }
    return [null, apk_path];
  }

  compile_ios() {
    let logger = this.logger
    let app_name = [this.name, "app"].join(".")
    let ipa_name = [this.name, "ipa"].join(".")
    let app_path = glue([this.platform_path,"build","emulator", app_name])
    let ipa_path = glue([this.platform_path,"build","emulator", ipa_name])
    if(!this.nocompile) {
      // compile ios
      logger.echo("\nCompiling cordova application, this may take a while!")
      let child = child_process.spawnSync("cordova", ["build", "ios"])
      if(child.stderr && child.stderr.toString() !="") { 
        return [new Error(child.stderr.toString())]
      }
      // build ipa
      let params= [
        "-sdk", "iphoneos","PackageApplication",
        "-v", app_path, "-o", ipa_path]

      child = child_process.spawnSync("/usr/bin/xcrun", params)
      if(child.stderr && child.stderr.toString() !="") { 
        return [new Error(child.stderr.toString())]
      }
      logger.ok("Cordova project compiled")
    }
    return [null, ipa_path]
  }

  run_mocha_test(test, list) {
    
    let logger = this.logger
    let mocha = glue([__dirname,"..","node_modules","mocha","bin","mocha"])
    let params= [test, "--platform", this.platform]
    let self = this 
    logger.echo("Running test, mocha "+test+" --platform "+this.platform)
    let child = child_process.spawn(mocha, params, { stdio: 'inherit' })
    
    child.on('close', (code) => {
      logger.echo("Test finished\n")
      self.run_tests(list)
    });
  }

  run_tape_test(test, list) {
    
    let logger = this.logger
    let mocha = glue([__dirname,"..","node_modules","tape","bin","tape"])
    let params= [test, "--platform", this.platform]
    let self = this 
    logger.echo("Running test, tape "+test+" --platform "+this.platform)
    let child = child_process.spawn(mocha, params, { stdio: 'inherit' })
    
    child.on('close', (code) => {
      logger.echo("Test finished\n")
      self.run_tests(list)
    });
  }

  run_tests(list) {
    
    if(!list.length) {
      // this.after_tests()
      process.exit(0)
      return
    }
    let test = list.shift()
    if(this.useTape) {
      this.run_tape_test(test, list)
    }else {
      this.run_mocha_test(test, list)
    }
  }

  test() {
   
    let tests_list = []
    if(fs.lstatSync(this.tests_path).isFile()) {
      tests_list = [this.tests_path]
    }else{
      let [err, list] = finf(this.tests_path, '*.js')
      if(err) { 
        logger.fail(err)
        process.exit(0)
      }
      for(let i=0;i<list.length;i++) {
        let test = glue([this.tests_path, list[i]])
        list[i] = test
      }
      tests_list = list
    }
    
    this.run_tests(tests_list)
  }

  run() {
    
    let logger = this.logger
    let err = this.compile()
    if(err) {
      logger.fail(err.toString())
      process.exit(0)
    }
    
    err = this.before_tests() 
    if(err) {
      logger.fail(err.toString())
      process.exit(0)
    }

    err = this.build_capabilities()
    if(err) {
      logger.fail(err.toString())
      process.exit(0)
    }
    
    this.test()
  }

}
