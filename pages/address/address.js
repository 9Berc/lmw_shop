//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    addressList:[],
    addressDefault:false
  },

  // selectTap: function (e) {
  //   var id = e.currentTarget.dataset.id;
  //   wx.request({
  //     url: app.globalData.urls +'/user/shipping-address/update',
  //     data: {
  //       token:app.globalData.token,
  //       id:id,
  //       isDefault:'true'
  //     },
  //     success: (res) =>{
  //       wx.navigateBack({})
  //     }
  //   })
  // },

  addAddess : function () {
    wx.navigateTo({
      url:"/pages/address-add/address-add"
    })
  },
  
  editAddess: function (e) {
    wx.navigateTo({
      url: "/pages/address-update/address-update?id=" + e.currentTarget.dataset.id
    })
  },
  
  onLoad: function () {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
  },
  onShow : function () {
    this.initShippingAddress();
  },
  initShippingAddress: function () {
    var that = this;
    var user_tokenHead = wx.getStorageSync('user_tokenHead')
    var user_token = wx.getStorageSync('user_token')
    wx.request({
      url: app.globalData.baseUrl +'/mallPort/member/address/list',
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization':user_tokenHead+' '+ user_token,
      },
      success: (res) =>{
        if (res.data.code == 200) {
          console.log(res)
          that.setData({
            addressList:res.data.data,
            loadingMoreHidden: true
          });
        } else if (res.data.code !== 200){
          that.setData({
            addressList: null,
            loadingMoreHidden: false
          });
        }
      }
    })
  }

})
