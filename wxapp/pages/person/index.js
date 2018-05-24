// pages/person/index.js

//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    menus: [
      { header: true },
      { icon: "avatar_0.jpg", name: "钱包" },
      { header: true },
      { icon: "avatar_0.jpg", name: "收藏" },
      { icon: "avatar_1.jpg", name: "相册" },
      { icon: "avatar_2.jpg", name: "卡包" },
      { icon: "avatar_3.jpg", name: "表情" },
      { header: true },
      { icon: "avatar_0.jpg", name: "设置", href: true, url: '/pages/zxy/index' },
    ],
  },
  bindNavgation: function (e) {
    //console.log(e.currentTarget.dataset.href)
    if (e.currentTarget.dataset.href)
    {
      wx.navigateTo({
        url: e.currentTarget.dataset.url,
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.myUserInfo();
  },


  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },


  myUserInfo: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })


    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        // console.log(res.userInfo);

      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  //放大我的二维码图片
  largeQrCodeImage: function () {
    wx.navigateTo({
      url: '/pages/qrcode/index',
    })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})