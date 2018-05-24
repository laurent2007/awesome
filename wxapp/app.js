//app.js
App({
  onLaunch: function () {

    // 引入 知晓云 BaaS SDK
    require('/utils/sdk-v1.4.0')
    let clientId = this.globalData.clientId
    wx.BaaS.init(clientId)

    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
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
  },
  globalData: {
    userInfo: null,
    host: "http://127.0.0.1:9000/api/microapp/getlist",
    isGetDataOnCloud:true, //首页数据是否读取云端
    selectedCity:null, //选中的城市
    clientId: 'd478eeb9c3dc63455a53', // 从 BaaS 后台获取 ClientID
    tableId: 37683, // 从 https://cloud.minapp.com/dashboard/ 管理后台的数据表中获取
  }
})