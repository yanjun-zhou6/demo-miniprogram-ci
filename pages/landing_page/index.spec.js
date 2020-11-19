import '../../app';
import './index';

const page = global.wxPageInstance;
const app = getApp();
jest.useFakeTimers();

test('temotion expression setting', () => {
  const origialExpresstion = page.data.emoji_url;
  page.setEmotionExpression();
  const newExpression = page.data.emoji_url;
  expect(newExpression).not.toEqual(origialExpresstion);
});

describe('wechat login', () => {
  const loginCode = 123;
  const openid = 'wx89043';
  const userInfo = {
    userInfo: {
      nickName: 'addy zhou',
      avatarUrl: '/wechat/addy.png',
    },
  };

  wx.login = jest.fn(({success}) => {
    success({code: loginCode});
  });

  wx.request = jest.fn(({success}) => {
    success({
      data: {
        openid,
      },
    });
  });

  wx.redirectTo = jest.fn();

  test('successfully login', () => {
    wx.getUserInfo = jest.fn(({success, complete}) => {
      success(userInfo);
      complete();
    });
    page.login();

    jest.runAllTimers();
    expect(app.nickname).toBe('addy zhou');
    expect(app.avatar_url).toBe('/wechat/addy.png');
    expect(app.openid).toBe(openid);
    expect(wx.redirectTo).toBeCalled();
  });

  test('fail to login', ()=>{
    wx.getUserInfo = jest.fn(({fail, complete}) => {
      fail();
      complete();
    });

    page.login();
    jest.runAllTimers();
    expect(app.nickname).toBe('未知用户');
    expect(app.avatar_url).toBe('/asset/images/default-avatar.png');
    expect(app.openid).toBe(openid);
    expect(wx.redirectTo).toBeCalled();
  })
});
