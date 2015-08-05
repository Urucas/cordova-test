import os
from time import sleep

import unittest
import argparse
import json
import re

from appium import webdriver

PATH = lambda p: os.path.abspath(
    os.path.join(os.path.dirname(__file__), p)
)

class CordovaAppTests(unittest.TestCase):

    def appiumHost(self, caps):
        url=""
        if re.match("http://", caps["host"]) is None: url = "http://"
        url+= caps["host"]
        if caps["port"] is not None: url+= ":"+str(caps["port"])
        url+="/wd/hub"
        return url

    def setUp(self):
        desired_caps = caps
        host = self.appiumHost(caps)
        self.driver = webdriver.Remote(host, desired_caps)

    def tearDown(self):
        # end the session
        self.driver.quit()

    def test_check_contexts(self):
        sleep(.5)
        contexts = self.driver.contexts
        self.assertIsNotNone(contexts)
        self.assertEqual(contexts[0], "NATIVE_APP")
        self.assertEqual(contexts[1], "WEBVIEW_com.urucas.testexample")

        self.driver.switch_to.context("WEBVIEW_com.urucas.testexample")
        el = self.driver.find_element_by_class_name("hello")
        self.assertIsNotNone(el)

        el = self.driver.find_element_by_tag_name("h1")
        self.assertIsNotNone(el)


if __name__ == '__main__':
    # create platform arguments parser
    parser = argparse.ArgumentParser(description='Process platform param.')
    parser.add_argument("--platform")
    args = parser.parse_args()

    # set android platform as default
    platform = 'android'
    if args.platform == 'ios':
        platform == 'ios'

    # read platform capabilities
    caps_path = PATH("./"+platform+".json")
    with open(caps_path) as data:
        caps = json.load(data)

    # run test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(CordovaAppTests)
    unittest.TextTestRunner(verbosity=2).run(suite)


