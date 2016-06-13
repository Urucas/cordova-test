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
      this.logger.echo(`${JSON.stringify(this.settings)}\n`);
    }
    if (this.settings.sauce) {
      this.CDVTestSuite = new CDVTestSauce(this.settings);
      return;
    }
    if (this.settings.testdroid) {
      this.CDVTestSuite = new CDVTestTestdroid(this.settings);
      return;
    }
    this.CDVTestSuite = new CDVTestLocal(this.settings);
  }

  fail(err) {
    this.logger.fail(err.toString());
    process.exit(0);
  }

  run() {
    const err = this.CDVTestSuite.checkSettings();
    if (err) this.fail(err);

    this.CDVTestSuite.run();
  }
}
