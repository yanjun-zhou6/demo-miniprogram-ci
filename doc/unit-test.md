### 小程序unit test可行性分析

##### component
因为小程序运行环境的特殊性，不同于常见的浏览器环境，采用双线程架构。如果需要在单元测试的nodejs和dom环境中跑，需要对小程序的渲染机制进行改造，对于组件，官方提供了[miniprogram-simulate](https://github.com/wechat-miniprogram/miniprogram-simulate)库来帮助组件渲染到单线程的nodejs和dom环境中。但这个库并没有兼容到page的渲染，所以导致page的unit test并不能通过这个库来完成。

##### page
对于page,我们采用把Page方法在nodejs环境下mock的方式来做unit test。然后通过验证页面state（即data）是否满足预期来做断言。这种方式可以测试页面逻辑的正确性，但因为不能直接在dom上断言，所以如果页面对应的wxml文件在取值state时有语法错误，可能就无法通过unit test覆盖到。

Page的mock示例如下
```js
global.Page = ({ data, ...rest }) => {
  const page = {
    data,
    setData: jest.fn((newData, cb) => {
      page.data = {
        ...page.data,
        ...newData
      }

      // eslint-disable-next-line no-unused-expressions
      cb && cb()
    }),
    onLoad: noop,
    onReady: noop,
    onUnLoad: noop,
    // eslint-disable-next-line no-plusplus
    __wxWebviewId__: wId++,
    ...rest
  }
  global.wxPageInstance = page
  return page
}

```

##### wx小程序接口
至于小程序接口我们jest来mock。比如
```
global.wx = {
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  showModal: jest.fn()
}
```

##### 分析结论
综合来看，有点瑕疵的地方是page无法在dom上断言，但page涉及到的逻辑是可以被unit test覆盖到的，并且只有js文件才会被计入覆盖率，wxml文件类型并不会被计入，所以小程序单元测试达到高覆盖率是可以做到的。

### 小程序unit test环境搭建

##### 安装miniprogram-simulate
安装`miniprogram-simulate`依赖包
```sh
npm install --save-dev miniprogram-simulate
或
yarn add --dev miniprogram-simulate
```

##### Mock小程序Page,App和接口，并配置Jest
在小程序项目根目录新建Jest配置文件jest.config.json，配置为
```json
{
  "setupFiles": ["./test/wx.js", "./test/page.js", "./test/app.js"],
  "collectCoverage": true
}
```
`./test/wx.js`是小程序接口mock文件
```js
global.wx = {
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  showModal: jest.fn(),
  request: jest.fn(),
  getStorageSync: jest.fn(),
  showShareMenu: jest.fn(),
  setStorageSync: jest.fn()
}

// eslint-disable-next-line no-underscore-dangle
global.__wxConfig = {
  envVersion: 'develop'
}
```
`./test/page.js`是小程序Page方法mock文件
```js
const noop = () => {}

let wId = 0

global.Page = ({ data, ...rest }) => {
  const page = {
    data,
    setData: jest.fn((newData, cb) => {
      page.data = {
        ...page.data,
        ...newData
      }

      // eslint-disable-next-line no-unused-expressions
      cb && cb()
    }),
    onLoad: noop,
    onReady: noop,
    onUnLoad: noop,
    // eslint-disable-next-line no-plusplus
    __wxWebviewId__: wId++,
    ...rest
  }
  global.wxPageInstance = page
  return page
}
```
`./test/app.js`小程序App方法mock文件
```js
global.App = (config) => {
  global.wxAppInstance = config
}

global.getApp = () => global.wxAppInstance
```

##### 配置babel
因为小程序项目中使用的是es6模块并可能使用了一些es6高级特性，所以需要在单测中引入babel编译。
安装babel
```sh
npm install --save-dev @babel/core @babel/preset-env babel-jest
或
yarn add --dev @babel/core @babel/preset-env babel-jest
```
在项目根目录下配置.babelrc，内容如下
```json
{
  "presets": [
    ["@babel/preset-env",
      {
        "targets": { "node": "current" }
      }
    ]
  ]
}
```

##### 添加test到scripts
在package.json文件的scripts下新增`test`命令
```json
{
    ...
    "scripts": {
        "test": "jest --config jest.config.json --coverage --detectOpenHandles --forceExit --no-cache",
     }
    ... 
}
```

### 小程序示例unit test结果
挑选whisper-pome真实小程序项目的`collect-gift`page，`checkin-calendar`component，`app.js`来做单元测试。从报告上看，都达到了比较高的单测覆盖率。
- `collect-gift` page
  ![](https://raw.githubusercontent.com/unnKoel/mini-program-pipeine-doc/master/doc/collect-gift.coverage.JPG)
- `checkin-calendar`component
  ![](https://raw.githubusercontent.com/unnKoel/mini-program-pipeine-doc/master/doc/checkin-calendar.coverage.JPG)
- `app.js`
  ![](https://raw.githubusercontent.com/unnKoel/mini-program-pipeine-doc/master/doc/app.coverage.JPG)
