//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    title:''
  },


  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
    })
  },
  onLoad: function (e) {
    if(e.name){
      this.setData({
        title:e.name
      })
    }else{
      this.setData({
        title:'分类列表'
      })
    }
    wx.setNavigationBarTitle({
      title: this.data.title
    })

    wx.showLoading();
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    wx.request({
      url: app.globalData.baseUrl + '/mallSearch/esProduct/search',
      data: {
        productCategoryId: e.id,
        pageSize: 100
      },
      success: function (res) {
        console.log(res.data.data.list);
        wx.hideLoading();
        that.setData({
          goods: [],
          loadingMoreHidden: true
        });
        if(res.data.data.list.length == 0){
          that.setData({
            loadingMoreHidden: false
          });
        }

        var goods = [];
        if (res.data.code != 200 || res.data.data.length == 0) {
          that.setData({
            loadingMoreHidden: false,
          });
          return;
        }
        for (var i = 0; i < res.data.data.list.length; i++) {
          goods.push(res.data.data.list[i]);
        }
        that.setData({
          goods: goods,
        });
      }
    })
  }

})
