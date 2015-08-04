import fs from 'fs'
import cordova from 'cordova-lib'
import logger from './cdvLogger.js'
import child_process from 'child_process'

export default class CDVTest {

  constructor(settings) {
    this.platforms = ['android', 'ios']
    this.platform = settings.platform
    this.compile  = settings.compile
    this.tests_path = settings.tests_path
    this.useTape = settings.useTape
    this.logger = settings.logger || logger()
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

  is_appium_installed() {
    let child = child_process.spawnSync("which", ["appium"])
    if(child.stderr && child.stderr.toString() !="") { 
      return false
    }
    return true
  }

  is_appium_available() {
    let glue = /^win/.test(process.platform) ? '\\' : '\/';
    let ar = [__dirname, "node_modules/appium-running/cli.js"].join(glue)
    let child = child_process.spawnSync(ar, [])
    if(child.stderr && child.stderr.toString() !="") { 
      return false
    }
    let stdout = child.stdout.toString()
    return stdout == "YES" ? true : false
  }

  checkSettings() {
    
    if(!this.is_platform_supported(this.platform)) {
      return new Error("Platform not supported "+ this.platform)
    }
    this.logger.ok("Checking selected platform is supported")
    
    if(!this.is_tests_path_reacheable(this.tests_path)) {
      return new Error("Tests path not found, "+ this.tests_path)
    }
    this.logger.ok("Checking test(s) path exists")

    if(!this.is_cordova_installed()) {
      return new Error("cordova missing, make sure you have cordova installed")
    }
    let cdv_version = this.get_cordova_version()
    if(cdv_version) {
      this.logger.ok("Cordova installed, cordova version: "+cdv_version)
    }else{
      this.logger.ok("Cordova installed")
    }
  }

  compile_platform(platform) {
    if(platform == 'ios')
      return this.compile_ios()

    return this.compile_android()
  }

  compile_android() {
    
  }

  compile_ios() {
  }

  build_capabilities() {
    
  }

  before_run() {
  }

  run() {
    
  }

  after_run() {
  }
}
