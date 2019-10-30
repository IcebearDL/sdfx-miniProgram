//app.js
// import apis from "/servers/apis"

App({
  globalData: {
    userInfo: null
  },
  onLaunch: function () {
    const _checkWXSession = () => new Promise((resolve, reject) => {
      wx.checkSession({
        success() {
          //session_key 未过期，并且在本生命周期一直有效
          resolve()
        },
        fail() {
          // session_key 已经失效，需要重新执行登录流程
          reject()
        }
      })
    })

    const _checkServerSession = () => new Promise((resolve, reject) => {
      wx.request({
        url: apis.checkSession,
        data: {
          sessionKey: wx.getStorageSync('sessionKey')
        },
        method: 'POST'
      }).then(res => {
        //验证服务端session成功
        res.ok ? resolve() : reject();
      }).catch(() => {
        reject()
      })
    })

    const _WXlogin = () => new Promise((resolve, reject) => {
      // 登录
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          res.code ? resolve(res) : reject(res);
        },
        fail: err => {
          reject(err);
        }
      })
    })

    const _serverLogin = code => new Promise((resolve, reject) => {
      wx.request({
        url: apis.login,
        data: { code },
        method: 'POST'
      }).then(res => {
        //储存session
        if (res.data.status) {
          resolve(res.data.sessionKey)
        } else reject()
      }).catch(() => {
        reject()
      })
    })

    //检测登陆状态
    const sessionKey = wx.getStorageSync('sessionKey');
    if (sessionKey) {
      //检查用户的登录态在微信服务端是否过期
      //检查用户登录态在开发者服务器端是否过期
      Promise.all([_checkWXSession, _checkServerSession]).then(() => {
        // 获取用户信息
        wx.getSetting({
          success: res => {
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              wx.getUserInfo({
                success: res => {
                  // 可以将 res 发送给后台解码出 unionId
                  this.globalData.userInfo = res.userInfo

                  // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处加入 callback 以防止这种情况
                  if (this.userInfoReadyCallback) {
                    this.userInfoReadyCallback(res)
                  }
                }
              })
            }
          }
        })
      }).catch(() => {
        //sessionKey校验未通过，重新登陆
        _WXlogin().then(res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          return _serverLogin(res.code)
        }).then(sessionKey => {
          //登陆成功保存sessionKey
          wx.setStorageSync('sessionKey', sessionKey)
        }).catch(err => {
          //登陆失败
        })
      })
    } else {
      //sessionKey为空 直接走登陆流程
      _WXlogin().then(res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        return _serverLogin(res.code)
      }).then(sessionKey => {
        //登陆成功保存sessionKey
        wx.setStorageSync('sessionKey', sessionKey)
      }).catch(err => {
        //登陆失败
      })
    }
  }
})