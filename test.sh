#!/bin/bash

echo_fail()
{
  echo -e "\033[31m˟ \033[0m${1}";
}

echo_ok()
{
  echo -e "\033[32m✓ \033[0m${1}";
}

PLATFORM=$1
PLATFORM=$(echo $PLATFORM | awk '{print tolower($0)}')

# help
if [ "${PLATFORM}" == help ]; 
then
  echo_fail "Usage cordova-test <platform> <appium_tests_relative_path> [--no-compile] [--sauce <user> <access_key>]"
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
IS_LOCAL=1
for i in "$@"
do
  if [ $i = '--sauce' ];
  then
    IS_LOCAL=0
  fi
done

if [ $IS_LOCAL -eq 1 ];
then
  IS_RUNNING=$(curl -v --max-time 2 --silent http://127.0.0.1:4723/wd/hub/status 2>&1 | grep \"status\":0)
  if [ -z $IS_RUNNING ];
  then
    echo_fail "Appium is not running or available, run appium &"
    exit 0;
  fi
  echo_ok "Checking appium is running"

  #check local web driver capabilities
  LOCAL_WD="$TEST_PATH/local.json"

  if [ ! -f $LOCAL_WD ];
  then
    echo '{"host":"localhost", "port":"4723"}' > "$LOCAL_WD"
    echo_ok "Creating local weddriver capabilities for the first time"
  fi
else
  #check sauce labs params and create web driver capabilities
  for((i=1 ; i<= $#;i++))
  do
    PARAM=${@:i:1}
    if [ $PARAM = '--sauce' ];
    then
      break
    fi
  done
  SAUCE_USER=${@:i+1:1}
  if [ -z $SAUCE_USER ];
  then
    echo_fail "Sauce user not defined"
  fi
  
  SAUCE_KEY=${@:i+2:1}
  if [ -z $SAUCE_KEY ];
  then
    echo_fail "Sauce key not defined"
  fi
  
  SAUCE_CAPS="$TEST_PATH/sauce.json"
  echo -e "{\"host\":\"ondemand.saucelabs.com\",\"port\":\"80\",\"username\":\""$SAUCE_USER"\",\"accessKey\":\""$SAUCE_KEY"\"}" > "$SAUCE_CAPS"
fi

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
  echo "Compiling cordova application, this may take a while!"
  COMPILE=$(cordova build $PLATFORM)
  echo_ok "Cordova app compiled"
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

# create platform capabilities
CAPS_PATH="$TEST_PATH/$PLATFORM.json"
if [ ! -f $CAPS_PATH ];
then
  if [ $PLATFORM = 'android' ];
  then
    echo -e "{\"deviceName\":\"Android\",\"platformName\":\"Android\",\"platformVersion\":\"5.0\",\"app\":\""$APP_PATH"\"}" > "$CAPS_PATH"
  fi
  echo_ok "Creating $PLATFORM capabilities for the first time"
fi

WD="--local"
if [ $IS_LOCAL -eq 0 ];
then
  WD="--sauce"
fi

# Run test sequentially
for entry in "$TEST_PATH"/*.js
do
  echo "Running $entry test"
  mocha $entry --platform $PLATFORM $WD
done
