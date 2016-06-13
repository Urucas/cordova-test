import CDVTest from './CDVTest.js'
import child_process from 'child_process'
import glue from 'glue-path'

export default class CDVTestLocal extends CDVTest {
  
  is_appium_installed() {
    let child = child_process.spawnSync("which", ["appium"])
    if(child.stderr && child.stderr.toString() !="") { 
      return false
    }
    return true
  }

  is_appium_available() {
    let ar = glue([__dirname, "..","node_modules","appium-running","cli.js"])
    let child = child_process.spawnSync(ar, [])
    if(child.stderr && child.stderr.toString() !="") { 
      return false
    }
    let stdout = child.stdout.toString().trim()
    return stdout == "YES" ? true : false
  }

  get_appium_version() {
    
    let child = child_process.spawnSync("appium", ["-v"])
    if(child.stderr && child.stderr.toString() !="") { 
      return false
    }
    return child.stdout.toString()
  }

  before_tests() {
    let logger = this.logger
    // check appium is installed
    if(!this.is_appium_installed()) {
      return new Error("Appium is not installed")
    }
    logger.ok("Checking appium is installed")
    let appium_version = this.get_appium_version()
    if(appium_version) {
      logger.echo("Appium installed, appium version: "+appium_version)
    }
    
    // check appium is available
    if(!this.is_appium_available()) {
      return new Error("Appium is not running or available, run appium &")
    }
    logger.ok("Checking appium is running & available")
  }

  get_caps_schema() {
    return [
      "host", "port", "app",
      "app-package", "deviceName",
      "platformName", "udid"
    ]
  }

  build_capabilities() {
    let caps = this.get_existing_capabilities()
        caps["host"] = "127.0.0.1"
        caps["port"] = 4723
        caps["app"] = this.app_path
        caps["app-package"] = this.packageName;
        caps["deviceName"] = this.device_name;
    if(this.platform == 'ios') {
      caps["platformName"] = "ios"
      if(this.settings.udid) caps["udid"] = this.udid
    }else {
      caps["platformName"] = "Android"
    }

    return this.update_capabilities(caps)
  }
}
