//index.js
//获取应用实例
const app = getApp()

//var plugin = requirePlugin('zxy-sdk');

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
    ],
    //已选择城市--初始化应该是读取历史访问中的数据
    selectedCity: "", 
  },
  selectCity:function(){
    wx.navigateTo({
      url: '/pages/city/city',
    })
  },
  onShow:function(){
    //获取历史访问中的城市数据 2018-05-24
    var cityHistory = wx.getStorageSync("cityHistory") || [];
    var selectedCity = "";
    if (cityHistory.length > 0) {
      selectedCity = cityHistory[0];
    }
    this.setData({
      selectedCity: selectedCity,
    })
  },
  onLoad: function () {
    //判断首页数据是否抓取云端
    const isGetDataOnCloud = app.globalData.isGetDataOnCloud;
    if(isGetDataOnCloud){
      this.getProList(); //api获取线上数据
    }
  },
  toDetail:function(e){
    var index = e.currentTarget.dataset.index;
    console.log(index);
    var proList = this.data.proList;
    var title = proList[index].title;
    wx.navigateTo({
      url: '/pages/detail/detail?idx=' + index,
    })
    //传值 本地缓存
    wx.setStorageSync("indx", index);
  },
  getProList:function(){
    var self = this;
    //console.log(app.globalData.host);
    wx.request({
      url: app.globalData.host,
      method:'GET',
      success:function(res){
        //console.log(res);
        self.setData({
          proList: res.data.data
        });
      },
      fail:function(){
        console.log('error,data is not loaded!')
      }
    })
  },
  //知晓云插入数据测试
  createBook:function(){
    let tableID = app.globalData.tableId;
    let Product = new wx.BaaS.TableObject(tableID)
    let product = Product.create()
    let book = {
      bookName: 'apple',
    };
    product.set(book).save().then(res => {
      console.log('成功插入数据：', res)
    }, err => {
      console.log(err);
    })
  }
})
