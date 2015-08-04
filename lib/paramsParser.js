import glue from 'glue-path'

export default function parser(argv = []) {
  
  let settings = {}

  // supported platforms
  let platforms = {
    android : 'android',
    ios : 'ios'
  }
  let platform = argv[0];
  if(platforms[platform] == undefined)
    platform = 'android'
  settings.platform = platform
  settings.platform_path = glue([process.cwd(), "platforms", platform])
  settings["tests_path"] = glue([process.cwd(), argv[1]])
  
  settings.compile = argv.indexOf("--no-compile") != -1 ? false : true
  settings["use_tape"] = argv.indexOf("--use-tape") != -1 ? true : false 

  let sauce = argv.indexOf("--sauce")
  let testdroid = argv.indexOf("--testdroid")

  let udid = argv.indexOf("--udid");
  if(udid != -1) {
    settings.udid = argv[udid+1]
  }

  if(sauce != -1) {
    settings.sauce = {
      user : argv[sauce+1],
      accessKey: argv[sauce+2]
    }
  }
  else if(testdroid != -1) {
    settings.testdroid = {
      username: argv[testdroid+1],
      password: argv[testdroid+2],
      device: argv[testdroid+3],
    }
  }else settings.isLocal = true

  return settings
}
