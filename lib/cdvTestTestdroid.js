import CDVTest from './cdvTest.js'

export default class CDVTestTestdroid extends CDVTest {
  
  build_capabilities() {
    let caps = this.get_existing_capabilities
        caps.host = "appium.testdroid.com"
        caps["testdroid_username"] = ""
        caps["testdroid_password"] = ""
        caps["testdroid_project"]  = "My Cordova Project"
        caps["testdroid_testrun"]  = "Appium test"
        caps["testdroid_device"]   = "Samsung Galaxy Nexus GT-I9250 4.2.2"
        caps["testdroid_app"] = ""

    return this.update_capabilities(caps) 
  }
}
