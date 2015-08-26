import CDVTest from './CDVTest.js'
import child_process from 'child_process'
import glue from 'glue-path'

export default class CDVTestTestdroid extends CDVTest {
 
  before_tests() {
   
    let logger = this.logger
    
    // zip file to upload
    /*
    let params = [this.app_path, this.name];
    let child = child_process.spawnSync(glue(['..', 'zipipa.sh']), params);
    this.app_path = this.app_path.replace('.ipa', '.zip');
    */

    // upload app to testdroid
    let curl_url = "http://appium.testdroid.com/upload"
    let params = [
      "-s", "--user", 
      this.testdroid.username+":"+this.testdroid.password, 
      "-F", "myCDVApp=@\""+this.app_path+"\"",
      curl_url
    ]
    logger.echo("Uploading app to Testdroid, this may take a while!")
    let upload_response;
    let child = child_process.spawnSync("curl", params)
    try {
      upload_response = JSON.parse(child.stdout+"")
    }catch(e) {
      return e 
    }
    this.testdroid.sessionId = upload_response.sessionId
    this.app_path = upload_response.value.uploads.myCDVApp
  }
  get_caps_schema() {
    return [
      "host", "testdroid_username", 
      "testdroid_password", "testdroid_project", 
      "testdroid_testrun", "testdroid_device",
      "testdroid_app", "app", 
      "deviceName", "device", 
      "testdroid_target", "testdroid_locale"
    ]
  }

  build_capabilities() {
    
    let caps = this.get_existing_capabilities()
        caps["host"] = "appium.testdroid.com"
        caps["testdroid_username"] = this.testdroid.username
        caps["testdroid_password"] = this.testdroid.password
        caps["testdroid_project"]  = this.name
        caps["testdroid_testrun"]  = "Appium tests using cordova-test"
        caps["testdroid_device"]   = this.testdroid.device 
        caps["testdroid_app"]      = this.app_path
        caps["app"]                = this.packageName
        caps["testdroid_locale"]   = "en"
        
    if(this.platform == 'ios') {
      delete caps["deviceName"]
      caps["device"]     = "iphone"
      // caps["testdroid_target"] = "ios"
    }

    return this.update_capabilities(caps)
  }
}
