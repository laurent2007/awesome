// pages/zxy/index.js

//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  //保存表单
  saveForm:function(){
    let tableID = 37752; //TableName:News
    let Product = new wx.BaaS.TableObject(tableID)
    let product = Product.create()
    let news = {
      title:'testTitle',
      summary:'testSummary',
      content:'testContent',
      auth_id:'test_auth_id'
    };
    product.set(news).save().then(res => {
      console.log('成功插入数据：', res)
    }, err => {
      console.log(err);
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