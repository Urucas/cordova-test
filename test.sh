#!/bin/bash
PLATFORM=$1
PLATFORM=$(echo $PLATFORM | awk '{print tolower($0)}')

# help
if [ "${PLATFORM}" == help ]; 
then
  echo "Usage cordova-test [platform] [appium_tests_full_path]"
  exit 0
fi

# check tests directory exists
echo "Checking tests directory exists"
TEST_PATH=$"${PWD}/$2"
if [ ! -d "$TEST_PATH" ];
then
  echo "Tests directory not found; $TEST_PATH"
  exit 1
fi

#check platforms
echo "Checking selected platform is supported"
SUPPORTED_PLATFORM[0]=android
# SUPPORTED_PLATFORM[1]=ios
IS_SUPPORTED=0
for i in "${!SUPPORTED_PLATFORM[@]}"; do
  if [ "${SUPPORTED_PLATFORM[$i]}" = "${PLATFORM}" ];
  then
    IS_SUPPORTED=1
    break
  fi
done

if [ $IS_SUPPORTED -eq 0 ]; then
  echo "Platform not supported; $PLATFORM"
  exit 1
fi

# check appum is running
echo "Checking appium is running"
IS_RUNNING=$(curl -v --max-time 2 --silent http://127.0.0.1:4723/wd/hub/status 2>&1 | grep \"status\":0)
if [ -z $IS_RUNNING ];
then
  echo "Appium is not running or available, run appium &"
  exit 0;
fi

# compile cordova app
echo "Compiling cordova application, this could take a while!"
cordova prepare $PLATFORM && cordova prepare $PLATFORM

# getting platform app path
echo "Getting compiled application path"
PLATFORMS_PATH=$"$PWD/platforms/$PLATFORM"
if [ ${PLATFORM} = android ];
then
  APP_PATH=$"$PLATFORMS_PATH/ant-build/CordovaApp-debug-unaligned.apk"
fi

# Check compiled application exists
echo "Checking compiled application exists"
if [ ! -f $APP_PATH ];
then
  echo "Compiled application not found; $APP_PATH"
  exit 1
fi

# Run test sequentialy
for entry in "$TEST_PATH"/*.js
do
  TEST=$(mocha $entry --platform $PLATFORM)
  echo $TEST
done

