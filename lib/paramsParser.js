export default function parser(argv) {
  
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

  let glue = /^win/.test(process.platform) ? '\\' : '\/';
  settings["tests_path"] = [process.cwd(), argv[1]].join(glue)
  
  settings.compile = argv.indexOf("--no-compile") != -1 ? false : true
  settings["use_tape"] = argv.indexOf("--use-tape") != -1 ? true : false 

  let sauce = argv.indexOf("--sauce")
  let testdroid = argv.indexOf("--tesdroid")

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
