// pages/zxy/index.js

//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  //表单提交
  formSubmit: function (e) {
    //console.log('form发生了submit事件，携带数据为：', e.detail.value.title)
    let tableID = 37752; //TableName:News
    let Product = new wx.BaaS.TableObject(tableID)
    let product = Product.create()
    let news = {
      title: e.detail.value.title,
      summary: e.detail.value.summary,
      content: e.detail.value.content,
      auth_id: e.detail.value.auth_id,
      auth_name: e.detail.value.auth_name,
      auth_avatar: e.detail.value.auth_avatar,
    };
    product.set(news).save().then(res => {
      console.log('成功插入数据：', res)
    }, err => {
      console.log(err);
    })
  },
  //表单重置
  formReset: function () {
  },
  //ToListPage
  navToList:function(){
    wx.navigateTo({
      url: '/pages/zxy/list',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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