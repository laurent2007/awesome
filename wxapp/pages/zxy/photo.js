

const app = getApp()

Page({


  /**
   * 页面的初始数据
   */
  data: {
   
  },

  uploadFile:function(){
    wx.chooseImage({
      success: function (res) {
        let MyFile = new wx.BaaS.File()
        let fileParams = { filePath: res.tempFilePaths[0] }
        let metaData = { categoryName: 'SDK' }

        MyFile.upload(fileParams, metaData).then(res => {
          /*
           * 注: 只要是服务器有响应的情况都会进入 success, 即便是 4xx，5xx 都会进入这里
           * 如果上传成功则会返回资源远程地址,如果上传失败则会返回失败信息
           */

          let data = res.data  // res.data 为 Object 类型
          console.log(data)
          console.log(data.file.id)
        }, err => {

        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
  },
})