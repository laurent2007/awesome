//index.js
//获取应用实例
const app = getApp()

Page({
  data: {

    imgUrls: [
      '/images/swiper01.jpg',
      '/images/swiper02.jpg',
      '/images/swiper03.jpg'
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    proList:[
      {
        logo: "/images/pro_01.jpg",
        title: "测试标题1",
        desc: "测试内容1\n测试内容1"
      },
      {
        logo: "/images/pro_02.jpg",
        title: "测试标题2",
        desc: "测试内容2\n测试内容2"
      },
      {
        logo: "/images/pro_03.jpg",
        title: "测试标题3",
        desc: "测试内容3\n测试内容3"
      }
    ]
  },

  onLoad: function () {
    //api获取线上数据
    //this.getProList();
  },
  toDetail:function(e){
    //console.log(e);
    var index = e.currentTarget.dataset.index;
    console.log(index);
    var proList = this.data.proList;
    var title = proList[index].title;
    wx.navigateTo({
      url: '/pages/detail/detail?title=' + title,
    })
    //传值 本地缓存
    //wx.setStorageSync(key, data);
  },
  getProList:function(){
    var self = this;
    console.log(app.globalData.host);
    wx.request({
      url: app.globalData.host,
      method:'GET',
      success:function(res){
        console.log(res);
        self.setData({
          proList: res.data.data
        });
      }
    })
  }

})
