const ci = require('miniprogram-ci');
const path = require('path');

(async () => {
  const project = new ci.Project({
    appid: process.env.APP_ID,
    type: 'miniProgram',
    projectPath: path.join(__dirname, '..'),
    privateKeyPath: process.env.KEY_PATH,
    ignores: ['node_modules/**/*'],
  });
  const previewResult = await ci.preview({
    project,
    desc: '',
    setting: {
      es6: true,
    },
    robot: 1,
    qrcodeFormat: 'image',
    qrcodeOutputDest: `${process.env.PREVIEW_PATH}/preview-dev.png`,
    onProgressUpdate: console.log,
  });
  console.log(previewResult);
})();
