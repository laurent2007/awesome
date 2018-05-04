//index.js
//获取应用实例
const app = getApp()

Page({
  data: {

    imgUrls: [
      '/images/swiper01s.jpg',
      '/images/swiper02s.jpg',
      '/images/swiper03s.jpg'
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    proList:[
      {
        logo: "/images/pro_01s.jpg",
        title: "四川山水甲天下",
        desc: "四川山水甲天下\n有山有水好风光"
      },
      {
        logo: "/images/pro_02.jpg",
        title: "地中海传奇",
        desc: "地中海传奇\n一生一定要去的地方"
      },
      {
        logo: "/images/pro_03s.jpg",
        title: "印度泰姬陵",
        desc: "印度泰姬陵\n看阿三看阿三"
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
      url: '/pages/detail/detail?idx=' + index,
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
