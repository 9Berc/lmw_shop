//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
  },

  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
    })
  },

  //
  home: function () {
    wx.switchTab({
      url: "/pages/index/index"
    })
  },
  onShow: function () {
    var that = this;
    //if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    that.getProduct();
  },

//删除收藏
deleteProduct:function(e){
  var that = this;
  //if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
  wx.request({
    url: app.globalData.baseUrl + '/mallPort/member/collection/deleteProduct',
    method: 'POST',
    header: {
      "content-type": "application/x-www-form-urlencoded",
      'Authorization':wx.getStorageSync('user_tokenHead')+' '+ wx.getStorageSync('user_token'),
    },
    data:{
      productId:e.currentTarget.dataset.id
    },
    success: function (res) {
      if (res.data.code == 200) {
        console.log(res.data.data);
        wx.showToast({
          title: '删除成功',
          icon: 'success',
          image: '../../images/addr-active.png',
          duration: 2000
        })
        wx.navigateTo({
          url:"/pages/fav-list/fav-list"
        })
      } 
    }
  })
},

// 获取用户收藏
getProduct:function(e){
  var that = this;
  //if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
  wx.request({
    url: app.globalData.baseUrl + '/mallPort/member/collection/listProduct/',
    method: 'GET',
    header: {
      'content-type': 'application/json',
      'Authorization':wx.getStorageSync('user_tokenHead')+' '+ wx.getStorageSync('user_token'),
    },
    success: function (res) {
      if (res.data.code == 200) {
        console.log(res.data.data);
        that.setData({
          favList: res.data.data,
          loadingMoreHidden: true
        });
      } else if (res.data.data.length == 0) {
        that.setData({
          favList: null,
          loadingMoreHidden: false
        });
      }
    }
  })
},

  
})