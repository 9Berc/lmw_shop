//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    coupons: [],
  }, 
  onLoad: function () {
    var that = this
    //if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    that.getCoupons();
  },

  //获取所有可领取的优惠券
  getCoupons: function () {
    var that = this;
    var user_tokenHead = wx.getStorageSync('user_tokenHead')
    var user_token = wx.getStorageSync('user_token')
    wx.request({
      url: app.globalData.baseUrl + '/mallAdmin/coupon/list',
      method: 'GET',
      header: {
        'content-type': 'application/json',
         'Authorization':user_tokenHead +' '+ user_token,
      },
      data: {
        isUse: 1,
        platformList:'0,1',
        isCountZero:1,
        pageSize:5,
        pageNum:1
      },
      success: function (res) {
        if (res.data.code == 200) {
          that.setData({
            coupons: res.data.data.list
          });
        }
      }
    })
  },

  // 领取券
  gitCoupon: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var user_tokenHead = wx.getStorageSync('user_tokenHead');
    var user_token = wx.getStorageSync('user_token')
    var totalr //剩余个数
    wx.request({
      url: app.globalData.baseUrl + '/mallPort/member/coupon/add/' + id,
      method: 'POST',
      header: {
        'content-type': 'application/json',
         'Authorization':user_tokenHead +' '+ user_token,
      },
      success: function (res) {
        console.log(res);
        if (res.data.code == 20001 || res.data.code == 20002) {
          wx.showModal({
            title: '错误',
            content: '礼券已经领完了',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20003) {
          wx.showModal({
            title: '错误',
            content: '您已经领过了',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20004) {
          wx.showModal({
            title: '错误',
            content: '礼券已经过期',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 200) {
          wx.showToast({
            title: '礼券领取成功',
            icon: 'success',
            duration: 2000
          })
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
  }
})
