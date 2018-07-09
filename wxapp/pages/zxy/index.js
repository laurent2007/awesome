// pages/zxy/index.js

//获取应用实例
const app = getApp()

var imageObject = null

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageUrl: "https://cloud-minapp-15285.cloud.ifanrusercontent.com/1fSBvnQvuwceHvBK.png"
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
      imageFile: imageObject
    };
    if (news.title == "") {
      //console.log('Title不能为空')
      wx.showToast({
        title: 'Title不能为空',
        icon: 'info',
        duration: 1500
      })
      return;
    }
    product.set(news).save().then(res => {
      console.log('成功插入数据：', res)
      wx.showToast({
        title: '成功插入数据',
        icon: 'loading',
        duration: 1500
      })

    }, err => {
      console.log(err);
    })
  },
  //表单重置
  formReset: function () {
  },
  //ToListPage
  navToList: function () {
    wx.navigateTo({
      url: '/pages/zxy/list',
    })
  },

  uploadImage: function () {
    var _this = this
    wx.chooseImage({
      success: function (res) {
        let MyFile = new wx.BaaS.File()
        let fileParams = { filePath: res.tempFilePaths[0] }
        let metaData = { categoryName: 'NEWS' }
        let imageUrl = ""
        MyFile.upload(fileParams, metaData).then(res => {
          imageObject = res.data.file;
          imageUrl = res.data.path
          _this.setData({
            imageUrl: imageUrl
          })
        }, err => {
          imageObject = null;
        })
      }
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