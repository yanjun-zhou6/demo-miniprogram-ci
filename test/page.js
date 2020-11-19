const noop = () => {};

let wId = 0;

global.Page = ({data, ...rest}) => {
  const page = {
    data,
    setData: jest.fn((newData, cb) => {
      page.data = {
        ...page.data,
        ...newData,
      };

      cb && cb();
    }),
    onLoad: noop,
    onReady: noop,
    onUnLoad: noop,
    __wxWebviewId__: wId++,
    ...rest,
  };

  global.wxPageInstance = page;
  return page;
};
