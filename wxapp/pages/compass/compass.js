
//获取应用实例
const app = getApp()
Page({
  data: {
    rotate: 0,
    direction: "--",
    angle: "--"
  },
  onLoad: function () {
    var me = this;
    wx.onCompassChange(function (res) {
      console.log(res);
      var value = res.direction;
      me.setData({
        rotate: -value,
        direction: me.getDirectionText(value),
        angle: value.toFixed(2),
      })

    })

    //如果手机不支持罗盘或者已被禁用则给予用户提示信息
    setTimeout(function () {
      if (me.data.direction === '--' && me.data.angle === '--') {
        wx.showToast({
          title: '您的手机不支持罗盘或者已被禁用',
          icon: 'loading',
          duration: 3000
        })
      }
    }, 2000);


  },
  getDirectionText: function (value) {
    var dir = "正北 东北 正东 东南 正南 西南 正西 西北".split(' ');
    var dirAngle = 360 / 8;
    var index = Math.floor((value + dirAngle / 2) / dirAngle % 8);
    return dir[index];
  }
})
