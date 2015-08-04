import colors from 'colors'

export default function logger() {
  return {
    fail: function(msg) {
      console.log("✗ ".red + msg)
    },
    ok: function(msg) {
      console.log("✓ ".green + msg)
    },
    echo: function(msg) {
      console.log(msg)
    }
  }
}
