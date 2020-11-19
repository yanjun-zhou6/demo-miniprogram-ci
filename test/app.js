global.App = (config) => {
  global.wxAppInstance = config;
};

global.getApp = () => global.wxAppInstance;
