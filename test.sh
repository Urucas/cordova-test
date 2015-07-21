PLATFORM=$1
echo $PLATFORM
if ["$PLATFORM" -eq "help"]; then
  echo "Usage cordova-test [platform] [appium_tests_full_path]"
  exit 0
fi

TEST_PATH=$2
for entry in "$TEST_PATH"/*
do
  echo "$entry"
done

