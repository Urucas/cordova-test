#!/bin/bash

echo_fail()
{
  echo -e "\033[31m${1}";
}

echo_ok()
{
  echo -e "\033[32m✓ \033[0m${1}";
}

compile()
{
  echo "Compiling cordova application, this could take a while!"
  cordova prepare $1 && cordova prepare $1
  echo_ok "Cordova app compiled"
}

PLATFORM=$1
PLATFORM=$(echo $PLATFORM | awk '{print tolower($0)}')

# help
if [ "${PLATFORM}" == help ]; 
then
  echo_fail "Usage cordova-test [platform] [appium_tests_full_path]"
  exit 0
fi

# check tests directory exists
TEST_PATH=$"${PWD}/$2"
if [ ! -d "$TEST_PATH" ];
then
  echo_fail "Tests directory not found; $TEST_PATH"
  exit 1
fi
echo_ok "Checking tests directory exists"

#check platforms
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
  echo_fail "Platform not supported; $PLATFORM"
  exit 1
fi
echo_ok "Checking selected platform is supported"

# check appum is running
IS_RUNNING=$(curl -v --max-time 2 --silent http://127.0.0.1:4723/wd/hub/status 2>&1 | grep \"status\":0)
if [ -z $IS_RUNNING ];
then
  echo_fail "Appium is not running or available, run appium &"
  exit 0;
fi
echo_ok "Checking appium is running"


# compile cordova app
NO_COMPILE=1
for i in "$@"
do
  if [ $i = '--no-compile' ];
  then
    NO_COMPILE=0
    break
  fi
done

if [ $NO_COMPILE -eq 1 ];
then
  compile $PLATFORM
fi

# getting platform app path
echo "Getting compiled application path"
PLATFORMS_PATH=$"$PWD/platforms/$PLATFORM"
if [ ${PLATFORM} = android ];
then
  APP_PATH=$"$PLATFORMS_PATH/ant-build/CordovaApp-debug-unaligned.apk"
fi

# Check compiled application exists
if [ ! -f $APP_PATH ];
then
  echo_fail "Compiled application not found; $APP_PATH"
  exit 1
fi
echo_ok "Checking compiled application exists"

# Run test sequentialy
for entry in "$TEST_PATH"/*.js
do
  echo "Running $entry test"
  mocha $entry --platform $PLATFORM
done
