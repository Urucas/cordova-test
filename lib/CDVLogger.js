import colors from 'colors'; // eslint-disable-line no-unused-vars

export default function logger() {
  return {
    fail: function fail(msg) {
      console.log('✗ '.red + msg);
    },
    ok: function ok(msg) {
      console.log('✓ '.green + msg);
    },
    echo: function echo(msg) {
      console.log(msg);
    },
  };
}
