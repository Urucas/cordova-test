import CDVAutomator from '../lib/CDVAutomator.js'

describe("CDVAutomator tests", () => {
  
  it("should create CDVTestLocal class", (done) => {
    let automator = new CDVAutomator(["android"], true)
    let CDVTestClass = automator.CDVTestClass
    if(CDVTestClass.constructor.name != "CDVTestLocal")
      throw new Error("Error creating CDVTestLocal class; "+ CDVTestClass.constructor.name)
    done()
  })

  it("should create CDVTestSauce class", (done) => {
    let automator = new CDVAutomator(["android",,"--sauce","user","key",,], true)
    let CDVTestClass = automator.CDVTestClass
    if(CDVTestClass.constructor.name != "CDVTestSauce")
      throw new Error("Error creating CDVTestSauce class; "+ CDVTestClass.constructor.name)
    done()
  })
  
  it("should create CDVTestTestdroid class", (done) => {
    let automator = new CDVAutomator(["android","--testdroid","user","pass","device"], true)
    let CDVTestClass = automator.CDVTestClass
    if(CDVTestClass.constructor.name != "CDVTestTestdroid")
      throw new Error("Error creating CDVTestTestdroid class; "+ CDVTestClass.constructor.name)
    done()
  })

})
