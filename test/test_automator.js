import CDVAutomator from '../lib/CDVAutomator.js';

describe('CDVAutomator tests', () => {
  it('should create CDVTestLocal object', (done) => {
    const automator = new CDVAutomator(['android'], true);
    const CDVTestSuite = automator.CDVTestSuite;
    if (CDVTestSuite.constructor.name !== 'CDVTestLocal') {
      throw new Error(`Error creating CDVTestLocal object; ${CDVTestSuite.constructor.name}`);
    }
    done();
  });

  it('should create CDVTestSauce object', (done) => {
    const automator = new CDVAutomator(
      ['android', null, '--sauce', 'user', 'key', null, null], true);
    const CDVTestSuite = automator.CDVTestSuite;
    if (CDVTestSuite.constructor.name !== 'CDVTestSauce') {
      throw new Error(`Error creating CDVTestSauce object; ${CDVTestSuite.constructor.name}`);
    }
    done();
  });

  it('should create CDVTestTestdroid object', (done) => {
    const automator = new CDVAutomator(['android', '--testdroid', 'user', 'pass', 'device'], true);
    const CDVTestSuite = automator.CDVTestSuite;
    if (CDVTestSuite.constructor.name !== 'CDVTestTestdroid') {
      throw new Error(`Error creating CDVTestTestdroid object; ${CDVTestSuite.constructor.name}`);
    }
    done();
  });
});
