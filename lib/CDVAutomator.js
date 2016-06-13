import logger from './CDVLogger.js';
import parser from './paramsParser.js';

import CDVTestLocal from './CDVTestLocal.js';
import CDVTestSauce from './CDVTestSauce.js';
import CDVTestTestdroid from './CDVTestTestdroid.js';

export default class CDVAutomator {

  constructor(argv, silent) {
    this.settings = parser(argv);
    this.logger = logger();
    if (!silent) {
      this.logger.ok('Parsing cli params');
      this.logger.echo(JSON.stringify(this.settings) + '\n');
    }
    if (this.settings.sauce) 
      this.CDVTestClass = new CDVTestSauce(this.settings)
    else if (this.settings.testdroid) 
      this.CDVTestClass = new CDVTestTestdroid(this.settings)
    else
      this.CDVTestClass = new CDVTestLocal(this.settings)
  }
  
  fail(err) {
    this.logger.fail(err.toString())
    process.exit(0)
  }

  run() {
    let err = this.CDVTestClass.checkSettings()
    if(err) this.fail(err)

    this.CDVTestClass.run()
  }
}
