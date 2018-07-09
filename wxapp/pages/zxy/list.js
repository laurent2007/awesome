
import utils from '../../utils/index'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "信息管理T",
    newsList: [],
    tableID: 37752,
    creatingBookName: '', // 当前正在创建的书名
    editingBookName: '', // 当前正在编辑的书名
  },

  fetchNewsList: function () {
    var product = new wx.BaaS.TableObject(37752)
    product.orderBy('-created_At')
    product.find().then((res) => {
      if (res.data.objects.length > 0) {
        console.log(res.data.objects.length)
        this.setData({
          newsList: res.data.objects,
        });
      }
    }, (err) => {
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.BaaS.login().then(() => {
      profile: wx.BaaS.storage.get('userinfo')
    });

    this.fetchNewsList();
  },

  // 绑定每一行书目的“编辑”按钮点击事件，控制输入框和文本显示
  editNewsButtonClicked: function (e) {
    // console.log(e)
    let activeIndex = e.currentTarget.dataset.index
    let newsList = this.data.newsList

    newsList.forEach((elem, idx) => {
      if (activeIndex == idx) {
        elem.isEditing = true,
        this.setData({
          editingBookName: e.currentTarget.dataset.newsTitle,
        })
      } else {
        elem.isEditing = false
      }
    })

    this.setData({
      newsList
    })

  },

  // 绑定修改NAME的提交按钮点击事件，向服务器发送数据
  udpateNews: function (e) {
    console.log("updateNews",this.data.editingBookName)
    let activeId = e.target.dataset.newsId

    this.setData({
      curRecordId: activeId,
    })

    var product = new wx.BaaS.TableObject(37752)
    let MyRecord = product.getWithoutData(activeId)
    MyRecord.set({
      title: this.data.editingBookName,
    })
    MyRecord.update().then(res => {
      this.fetchNewsList()
      this.setData({ curRecordId: '' })
    }, err => {

    })
  },

  // 绑定每一行书目的输入框事件，设定当前正在编辑的书名
  bindEditBookNameInput: function (e) {
    let bookName = e.detail.value
    console.log(bookName)
    this.setData({
      editingBookName: bookName,
    })
  },

  deleteNews: function (e) {
    let activeId = e.target.dataset.newsId
    this.setData({
      curRecordId: activeId,
    })

    var product = new wx.BaaS.TableObject(37752)
    product.delete(activeId).then(res => {
      wx.showToast({
        title: '成功删除数据',
        icon: 'warn',
        duration: 1500
      })
      this.fetchNewsList()
    }, err => {
      console.log(err)
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