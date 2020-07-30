//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    coupons:[]
  },

  onLoad: function () {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
  },
  onShow : function () {
    this.getMyCoupons();
  },

  //获取用户优惠券
  getMyCoupons: function () {
    var that = this;
    var user_tokenHead = wx.getStorageSync('user_tokenHead')
    var user_token = wx.getStorageSync('user_token')
    wx.request({
      url: app.globalData.baseUrl + '/mallPort/member/coupon/list',
      // data: {
      //   pageNum: 1,
      //   pageSize: 10
      // },
      method: 'GET',
      header: {
        'content-type': 'application/json',
         'Authorization':user_tokenHead +' '+ user_token,
      },
      success: function (res) {
        if (res.data.code == 200) {
          //console.log(res.data.data);
          var couponsData = res.data.data;
					var coupons = [];
					
          if (couponsData.length > 0) {
						for (var i=0;i<couponsData.length;i++) {
							if (couponsData[i].useStatus == 0) {
								coupons.push(couponsData[i]);
							}
						}
						
            that.setData({
              coupons: coupons,
              loadingMoreHidden: true
            });
          }
        }else{
          that.setData({
            loadingMoreHidden: false
          });
        }
      }
    })
  },

  goBuy:function(){
    wx.navigateTo({
      url: '/pages/coupons/coupons'
    })
  },

  gohome: function () {
    wx.switchTab({
      url: "/pages/index/index"
    })
  }

})
