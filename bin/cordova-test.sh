#!/bin/bash

echo_fail()
{
  echo -e "\033[31m✗ \033[0m${1}";
  exit 1
}

echo_ok()
{
  echo -e "\033[32m✓ \033[0m${1}";
}

echo_help()
{
  echo "Usage cordova-test <android_or_ios> <relative_path_to_appium_tests> [--no-compile] [--sauce <user> <access_key>]"
  exit 1
}

__DIRNAME=$(dirname $0);

PLATFORM=$1
PLATFORM=$(echo $PLATFORM | awk '{print tolower($0)}')

# help
if [ "${PLATFORM}" == help ] || [ "${PLATFORM}" == --help ] ; 
then
  echo_help
fi

#check platforms
SUPPORTED_PLATFORM[0]=android
SUPPORTED_PLATFORM[1]=ios
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
fi
echo_ok "Checking selected platform is supported"

# check tests path exists
TEST_PATH=$"${PWD}/$2"
if [ ! -d "$TEST_PATH" ] && [ ! -f "$TEST_PATH" ];
then
  echo_fail "Tests path not found; $TEST_PATH"
fi
echo_ok "Checking test(s) path exists"

if [ -f "$TEST_PATH" ];
then
  TESTS_PATH=$(dirname "${TEST_PATH}")
else
  TESTS_PATH=$TEST_PATH
fi

# read Cordova config.xml & get info
CONFIG_PATH="$PWD/config.xml"
if [ ! -f "$CONFIG_PATH" ];
then
  echo_fail "Error loading cordova config.xml, $CONFIG_PATH"
fi
PACKAGE_ID=$($__DIRNAME/../lib/config_parser.js $CONFIG_PATH id)
APP_NAME=$($__DIRNAME/../lib/config_parser.js $CONFIG_PATH name)

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
  # checking cordova is installed
  echo "Checking cordova cli is installed"
  CDV_EXISTS=$(which cordova)
  if [ -z $CDV_EXISTS ];
  then
    echo_fail "Cant compile appliction, cordova cli not installed"
  fi
  CDV_VERSION=$(cordova -v)
  echo_ok "Cordova installed, cordova version: $CDV_VERSION"
  echo "Compiling cordova application, this may take a while!"
  COMPILE=$(cordova build $PLATFORM)
  echo_ok "Cordova app compiled"
fi

# getting platform app path
echo "Getting compiled application path"
PLATFORMS_PATH=$"$PWD/platforms/$PLATFORM"
if [ ${PLATFORM} = android ];
then
  APP_PATH=$"$PLATFORMS_PATH/ant-build/CordovaApp-debug.apk"
else [ ${PLATFORM} = ios ];
  APP_PATH=$"$PLATFORMS_PATH/build/emulator/$APP_NAME.app"
  # create .ipa
  IPA_PATH=$"$PLATFORMS_PATH/build/emulator/$APP_NAME.ipa"
  IPA=$(/usr/bin/xcrun -sdk iphoneos PackageApplication -v $APP_PATH -o $IPA_PATH)
  echo_ok "Creating ipa"
  APP_PATH=$IPA_PATH
fi

# Check compiled application exists
if [ ! -f $APP_PATH ] && [ ! -d $APP_PATH ];
then
  echo_fail "Compiled application not found; $APP_PATH"
fi
echo_ok "Checking compiled application exists"

# check if tests will run local or in sauce labs
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
  # check appium is installed 
  echo "Checking appium is installed"
  APPIUM_EXISTS=$(which appium)
  if [ -z $APPIUM_EXISTS ];
  then
    echo_fail "Appium is not installed"
  fi
  APPIUM_VERSION=$(appium -v)
  echo_ok "Appium installed, appium version: $APPIUM_VERSION"

  # check appum is running and available
  IS_RUNNING=$(curl -v --max-time 2 --silent http://127.0.0.1:4723/wd/hub/status 2>&1 | grep \"status\":0)
  if [ -z $IS_RUNNING ];
  then
    echo_fail "Appium is not running or available, run appium &"
  fi
  echo_ok "Checking appium is running"

  #check local web driver capabilities
  LOCAL_WD="$TESTS_PATH/local.json"
  if [ ! -f $LOCAL_WD ];
  then
    LOCAL_CAPS=$($__DIRNAME/../lib/capabilities_parser.js local)
    echo -e $LOCAL_CAPS > "$LOCAL_WD"
    echo_ok "Creating local wed driver capabilities for the first time"
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
  
  SAUCE_CAPS_PATH="$TESTS_PATH/sauce.json"
  SAUCE_CAPS=$($__DIRNAME/../lib/capabilities_parser.js sauce $SAUCE_USER $SAUCE_KEY)
  echo -e $SAUCE_CAPS > "$SAUCE_CAPS_PATH"
  echo_ok "Creating sauce labs web driver capabilities"
  
  #upload temp APK to sauce labs
  echo "Uploading $PLATFORM app to sauce labs"
  APP_NAME="${APP_PATH##*/}"
  UPLOAD=$(curl -u $SAUCE_USER:$SAUCE_KEY -X POST -H "Content-Type: application/octet-stream" https://saucelabs.com/rest/v1/storage/$SAUCE_USER/$APP_NAME?overwrite=true --data-binary @$APP_PATH)

  APP_PATH=$"sauce-storage:$APP_NAME"
  echo_ok "App uploaded to Sauce Labs storage"
fi

# create platform capabilities
CAPS_PATH="$TESTS_PATH/$PLATFORM.json"
if [ $PLATFORM = 'android' ];
then
  CAPS=$($__DIRNAME/../lib/capabilities_parser.js android $CAPS_PATH $APP_PATH $PACKAGE_ID)
  echo -e $CAPS > "$CAPS_PATH"
fi

if [ $PLATFORM = 'ios' ];
then
  # get connected iphone udid
  if [ $IS_LOCAL -eq 1 ];
  then
    UDID=$(idevice_id -l)
    CAPS=$($__DIRNAME/../lib/capabilities_parser.js ios $CAPS_PATH $APP_PATH $PACKAGE_ID $UDID)
    echo -e $CAPS > "$CAPS_PATH"
  else
    CAPS=$($__DIRNAME/../lib/capabilities_parser.js ios $CAPS_PATH $APP_PATH $PACKAGE_ID)
    echo -e $CAPS > "$CAPS_PATH"
  fi
fi

echo_ok "$PLATFORM capabilities updated"

WD="--local"
if [ $IS_LOCAL -eq 0 ];
then
  WD="--sauce"
fi

run_mocha_test() {
  echo "Running test:"
  echo "  mocha $1 --platform $2 $3"
  $__DIRNAME/../node_modules/mocha/bin/mocha $1 --platform $2 $3
}

run_tape_test() {
  echo "Running test:"
  echo "  tape $1 --platform $2 $3"
  $__DIRNAME/../node_modules/tape/bin/tape $1 --platform $2 $3
}

TEST_CMD=run_mocha_test
USE_TAPE=0
for i in "$@"
do
  if [ $i = '--use-tape' ];
  then
    USE_TAPE=1
    break
  fi
done
if [ $USE_TAPE -eq 1 ];
then
  TEST_CMD=run_tape_test
fi

# Run test sequentially
if [ -f "$TEST_PATH" ];
then
  $TEST_CMD $TEST_PATH $PLATFORM $WD
else
  for entry in "$TESTS_PATH"/*.js
  do
    $TEST_CMD $entry $PLATFORM $WD
  done
fi
