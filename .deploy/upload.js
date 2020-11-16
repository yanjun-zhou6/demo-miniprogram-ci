const ci = require('miniprogram-ci');
const path = require('path');

(async () => {
  const project = new ci.Project({
    appid: process.env.APP_ID,
    type: 'miniProgram',
    projectPath: path.join(__dirname, '..'),
    privateKeyPath: process.env.KEY_PATH, //path.join(__dirname, `./private.${process.env.APP_ID}.key`),
    ignores: ['node_modules/**/*'],
  });
  const uploadResult = await ci.upload({
    project,
    version: process.env.VERSION,
    desc: `描述：${process.env.DESCRIPTION}`,
    setting: {
      es6: true,
    },
    robot: 2,
    onProgressUpdate: console.log,
  });
  console.log(uploadResult);
})();
