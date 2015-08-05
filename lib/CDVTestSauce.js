import CDVTest from './CDVTest.js'
import child_process from 'child_process'
import path from 'path'

export default class CDVTestSauce extends CDVTest {

  before_tests() {
    let logger = this.logger
    // upload app to sauce storage
    let curl_url = [
      "https://saucelabs.com/rest/v1/storage/",this.sauce.user,"/",
       path.basename(this.app_path),"?overwrite=true"].join("")

    let params = [
      "-u", this.sauce.user+":"+this.sauce.accessKey, "-X",
      "POST", "-H", "Content-Type: application/octet-stream",
      curl_url, "--data-binary", "@"+this.app_path
    ]
    logger.echo("Uploading app to Sauce Labs, this may take a while!")
    let child = child_process.spawnSync("curl", params)
    
    logger.ok("App uploaded to Sauce Labs storage")
  }

  get_caps_schema() {
    return {
      "host":"", "port":"", "username":"",
      "accessKey":"", "app":"", "deviceName":"", 
      "browserName":"", "app-package":"", "platformName":"",
      "appium-version":"", "platformVersion":""
    }
  }

  build_capabilities() {
    let caps = this.get_existing_capabilities()
        caps["host"] = "ondemand.saucelabs.com"
        caps["port"] = 80
        caps["username"] = this.sauce.user
        caps["accessKey"] = this.sauce.accessKey
        caps["app"] = "sauce-storage:"+path.basename(this.app_path)
        caps["app-package"] = this.packageName
        caps["browserName"] = ""
        caps["appium-version"] = "1.4.7"
    
    if(this.platform == 'ios') {
      caps["deviceName"] = "iPhone Simulator"
      caps["platformName"] = "ios"
      caps["platformVersion"] = "8.4"
    }else {
      caps["deviceName"] = "Android Emulator"
      caps["platformName"] = "Android"
      caps["platformVersion"] = "5.0"
    }
    return this.update_capabilities(caps) 
  }
}
