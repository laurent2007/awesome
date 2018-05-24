// pages/clock/clock.js
//获取应用实例
const app = getApp()

const rule = {
  lat: 31.07834815979004, //公司的纬度
  lng: 121.4970703125, //公司的经度
  maxDistance: 500, //最大的允许偏差距离单位米
  BSSID: '78:11:dc:4d:00:be', //SSID:"Xiaomi_Laurent502_5G"
}

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    locationChecked: false, //位置是否已经确认
    distance: '',//当前用户的距离
    wifiChecked: false,//wifi确认状态
    isChecked: false,//最终状态

    //初始化Map组件地址
    latitude:rule.lat,
    longitude:rule.lng,
    markers:[{
      id: 1,
      latitude: 23.099994,
      longitude: 113.324520,
      name: 'T.I.T 创意园'
    }],
    covers:[{
        latitude: 23.099994,
        longitude: 113.344520,
        iconPath: '/images/location.png'
      }, {
        latitude: 23.099994,
        longitude: 113.304520,
        iconPath: '/images/location.png'
    }],
  },
  onReady: function (e) {
    this.mapCtx = wx.createMapContext('myMap')
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  bingGetLocationTap: function () {
    let that = this;
    //地图移动到位置中心
    this.mapCtx.moveToLocation();
    
    wx.getLocation({
      success: function (res) {
        console.log(res);
        //判断距离
        const distance = that.getDistance(res.latitude, res.longitude);
        console.log(distance);
        //如果距离小于等于预设的最大距离差
        if (distance <= rule.maxDistance) {
          that.setData({
            distance: Math.floor(distance),
            locationChecked: true,
          })
          that.openWifi();
        } else {
          wx.showModal({
            title: '提示',
            content: '当前的位置已经超出允许范围！',
          })
        }
      },
    })
  },
  //计算用户位置与预设位置之间的距离差
  getDistance: function (lat, lng) {
    let distance = 0;
    const radLat1 = lat * Math.PI / 180;
    const radLat2 = rule.lat * Math.PI / 180;
    const deltaLat = radLat1 - radLat2;
    const deltaLng = lng * Math.PI / 180 - rule.lng * Math.PI / 180;
    distance = 2 * Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(deltaLat / 2), 2)
        +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)
      )
    );
    return distance * 6378137;
  },
  //开启wifi
  openWifi: function () {
    let that = this;
    wx.startWifi({
      success: function (res) {
        // console.log(res);
        that.getCurrentWifi();
      },
      fail: function () {
        wx.showModal({
          title: '提示',
          content: '无法开启wifi，请开启wifi重试',
        })
      }
    })
  },
  //获取当前已连接的wifi
  getCurrentWifi: function () {
    let that = this;
    wx.getConnectedWifi({
      success: function (res) {
        // console.log(res);
        that.checkCurrentWifi(res.wifi);
      },
      fail: function () {
        wx.showModal({
          title: '提示',
          content: '未连接wifi',
        })
      }
    })
  },
  //验证当前连接wifi是否是公司指定wifi
  checkCurrentWifi: function (wifi) {
    let that = this;
    if (wifi.BSSID === rule.BSSID) {
      that.setData({
        wifiChecked: true,
        isChecked: true,
      });
      wx.showModal({
        title: '提示',
        content: '您已经完成了打卡',
      });
      //还需要获取当前微信用户的OpenId，然后最终确认该用户已经打卡
      that.getCurrentUserOpenId();
    } else {
      wx.showModal({
        title: '提示',
        content: '未连接指定的路由器，请重新连接wifi',
      });
    }
  },
  //获取当前用户的OPENID，
  //此方法不安全，千万不要在实际项目中使用
  getCurrentUserOpenId: function () {
    //https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code
    const appId = 'wx5debe7ba5638b666';
    const appSecret = 'f79375e66f069b4564701f76315adc3d';
    wx.login({
      success: function (res) {
        const url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appId + '&secret=' + appSecret + '&js_code=' + res.code + '&grant_type=authorization_code';
        if (res.code) {
          wx.request({
            url: url,
            success: function (res) {
              console.log(res);
              wx.showModal({
                title: '成功提示',
                content: '尊敬的用户，您的标志是' + res.data.openid + '您已经成功打卡，并且已提交服务器。',
              })
            }
          })
        }
        else {
          console.log("登陆失败", res.errMsg)
        }
      },
    })
  },
  onLoad: function () {
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
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})