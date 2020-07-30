var app = getApp()
Page({
  data: {
    saveHidden: true,
    totalPrice: 0,
    allSelect: false,
    noSelect: true,
    list: [],
    cartIds:'',
    dataShowBool:false,
    delBtnWidth: 120,    //删除按钮宽度单位（rpx）
  },

  //获取元素自适应后的实际宽度
  getEleWidth: function (w) {
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth;
      var scale = (750 / 2) / (w / 2);  //以宽度750px设计稿做宽度的自适应
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },

  initEleWidth: function () {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },

  // 猜你喜欢跳/至商品详情页
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
    })
  },

  onLoad: function () {
    this.initEleWidth();
  },
  onShow: function () {
    var that = this;
    var user_tokenHead = wx.getStorageSync('user_tokenHead');
    var user_token = wx.getStorageSync('user_token');
    //if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    that.showBool();
    wx.request({
      url: app.globalData.baseUrl + '/mallPort/cart/list',
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization':user_tokenHead+' '+ user_token,
      },
      success: function (res) {
        if (res.data.code == 200) {
          console.log(res);
          that.data.list = res.data.data;
          for (let i = 0; i < that.data.list.length;i++){
            that.data.list[i].productAttr = JSON.parse(that.data.list[i].productAttr);
          }
          that.setData({
            list: that.data.list,
            dataShowBool:true,
            totalPrice:that.totalPrice(),
            allSelect: that.allSelect(),
            noSelect:that.noSelect(),
            saveHidden: true
          })
          that.showBool();
        }
      }
    })
  },

  //返回首页
  toIndexPage: function () {
    wx.switchTab({
      url: "/pages/index/index"
    });
  },

  touchS: function (e) {
    if (e.touches.length == 1) {
      this.setData({
        startX: e.touches[0].clientX
      });
    }
  },
  touchM: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    if (e.touches.length == 1) {
      var moveX = e.touches[0].clientX;
      var disX = that.data.startX - moveX;
      var delBtnWidth = that.data.delBtnWidth;
      var left = "";
      if (disX == 0 || disX < 0) {//如果移动距离小于等于0，container位置不变
        left = "margin-left:0px";
      } else if (disX > 0) {//移动距离大于0，container left值等于手指移动距离
        left = "margin-left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          left = "left:-" + delBtnWidth + "px";
        }
      }
      var list = that.data.list;
      if (index != "" && index != null) {
        list[parseInt(index)].left = left;
        that.setData({
          saveHidden: that.getSaveHide(),
          totalPrice: that.totalPrice(),
          allSelect: that.allSelect(),
          noSelect: that.noSelect(),
          list: list
        }) 
      }
    }
  },

  touchE: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    if (e.changedTouches.length == 1) {
      var endX = e.changedTouches[0].clientX;
      var disX = that.data.startX - endX;
      var delBtnWidth = that.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left = disX > delBtnWidth / 2 ? "margin-left:-" + delBtnWidth + "px" : "margin-left:0px";
      var list = that.data.list;
      if (index !== "" && index != null) {
        list[parseInt(index)].left = left;
        that.setData({
          saveHidden: that.getSaveHide(),
          totalPrice: that.totalPrice(),
          allSelect: that.allSelect(),
          noSelect: that.noSelect(),
          list: list
        }) 
      }
    }
  },

  //删除某个商品
  delItem: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var user_tokenHead = wx.getStorageSync('user_tokenHead');
    var user_token = wx.getStorageSync('user_token');
    var ids = 'ids:' + index
    wx.request({
      url: app.globalData.baseUrl +'/mallPort/cart/delete',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization':user_tokenHead+' '+ user_token,
      },
      data:{
        ids:index
      },
      success: (res) =>{
        if (res.data.code == 200) {
          that.onShow();
          that.showBool();
        } else if (res.data.code !== 200){
          console.log(res)
        }
      },
    })
  },
  showBool:function(){
    var that = this;
    var list = that.data.list;
    var onOff = true;
    if(list.length){
      onOff = true;
    }else{
      onOff = false;
    }
    that.setData({
      dataShowBool: onOff
    })
  },
  //选中某个商品
  selectTap: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var list = that.data.list;
    if (index !== "" && index != null) {
      list[parseInt(index)].active = !list[parseInt(index)].active;
      that.setData({
        totalPrice: that.totalPrice(),
        list:list,
        noSelect: that.noSelect(),
        allSelect: that.allSelect(),
      })
    }
  },

  // 总价
  totalPrice: function () {
    var list = this.data.list;
    var total = 0;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (curItem.active) {
        total += parseFloat(curItem.price) * curItem.quantity;
      }
    }
    total = parseFloat(total.toFixed(2));//js浮点计算bug，取两位小数精度
    return total;
  },

  //全选
  allSelect: function () {
    var list = this.data.list;
    var allSelect = false;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (curItem.active) {
        allSelect = true;
      } else {
        allSelect = false;
        break;
      }
    }
    return allSelect;
  },

  //取消全选
  noSelect: function () {
    var list = this.data.list;
    var noSelect = 0;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (!curItem.active) {
        noSelect++;
      }
    }
    if (noSelect == list.length) {
      return true;
    } else {
      return false;
    }
  },
  bindAllSelect: function () {
    var that = this;
    var currentAllSelect = that.data.allSelect;
    var list = that.data.list;
    if (currentAllSelect) {
      for (var i = 0; i < list.length; i++) {
        var curItem = list[i];
        curItem.active = false;
      }
    } else {
      for (var i = 0; i < list.length; i++) {
        var curItem = list[i];
        curItem.active = true;
      }
    }
    that.setData({
      list:list,
      allSelect: that.allSelect(),
      noSelect: that.noSelect(),
      totalPrice:that.totalPrice()
    })
  },
  jiaBtnTap: function (e) {
    let that = this,
      user_tokenHead = wx.getStorageSync('user_tokenHead'),
      user_token = wx.getStorageSync('user_token'),
      index = e.currentTarget.dataset.index,
      list = that.data.list,
      quantity = list[index].quantity,
      id = list[index].id;
    quantity++;
    list[index].quantity = quantity;
    wx.request({
      url: app.globalData.baseUrl + '/mallPort/cart/update/quantity',
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': user_tokenHead + ' ' + user_token,
      },
      data: { 'id': id, 'quantity': quantity },
      success: (res) => {
        if (res.data.code == 200) {
          that.setData({
            list: list,
            totalPrice: that.totalPrice()
          })
        } else if (res.data.code !== 200) {
          console.log(res)
        }
      }
    })
  },
  jianBtnTap: function (e) {
    let that = this,
      user_tokenHead = wx.getStorageSync('user_tokenHead'),
      user_token = wx.getStorageSync('user_token'),
      index = e.currentTarget.dataset.index,
      list = that.data.list,
      quantity = list[index].quantity,
      id = list[index].id;
    quantity--;
    if (quantity < 1) quantity=1;
    list[index].quantity = quantity;
    wx.request({
      url: app.globalData.baseUrl + '/mallPort/cart/update/quantity',
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': user_tokenHead + ' ' + user_token,
      },
      data: { 'id': id, 'quantity': quantity },
      success: (res) => {
        if (res.data.code == 200) {
          that.setData({
            list: list,
            totalPrice: that.totalPrice()
          })
        } else if (res.data.code !== 200) {
          console.log(res)
        }
      }
    })
  },
  bindMinus: function() {  
    var num = this.data.num;  
    // 如果大于1时，才可以减  
    if (num > 1) {  
        num --;  
    }  
    // 只有大于一件的时候，才能normal状态，否则disable状态  
    var minusStatus = num <= 1 ? 'disabled' : 'normal';  
    // 将数值与状态写回  
    this.setData({  
        num: num,  
        minusStatus: minusStatus  
    });  
},

  //
  editTap: function () {
    var that = this;
    var list = that.data.list;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      curItem.active = false;
    }
    that.setData({
      saveHidden: !that.getSaveHide(),
      totalPrice: that.totalPrice(),
      allSelect: false,
      noSelect: true,
      list: list
    })
  },
  saveTap: function () {
    var that = this;
    var list = that.data.list;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      curItem.active = false;
    }
    that.setData({
      saveHidden: !that.getSaveHide(),
      totalPrice: that.totalPrice(),
      allSelect: false,
      noSelect: true,
      list: list
    })
  },
  getSaveHide: function () {
    var saveHidden = this.data.saveHidden;
    return saveHidden;
  },

  // 删除订单
  deleteSelected: function () {
    var that = this;
    var list = that.data.list;
    var string = '';
    for(let i = 0 ; i < list.length ; i++){
      let curItem = list[i];
      if(curItem.active){
        if (i === list.length-1){
          string += curItem.id
        }else{
          string += curItem.id + ','
        }
      }
    }
    var user_tokenHead = wx.getStorageSync('user_tokenHead');
    var user_token = wx.getStorageSync('user_token');
    wx.request({
      url: app.globalData.baseUrl + '/mallPort/cart/delete',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': user_tokenHead + ' ' + user_token,
      },
      data: {
        ids: string
      },
      success: (res) => {
        console.log(res);
        if (res.data.code == 200) {
          that.onShow();
        } else if (res.data.code !== 200) {
          console.log(res)
        }
      },
    })
   
  },

  //生成订单信息数据
  toPayOrder: function () {
    wx.showLoading();
    var that = this;
    var user_tokenHead = wx.getStorageSync('user_tokenHead');
    var user_token = wx.getStorageSync('user_token');
	
	var list = that.data.list;
	var cartIdsList = [];
	list.forEach(function (item,index){
		if (item.active == true) {
			cartIdsList.push(item.id);
		}
	})
	
	if (cartIdsList.length == 0) {
		that.setData({
			cartIds: ''
		})
		wx.showToast({
		  title: '请选择商品',
		  duration:1000,//显示时长
		  mask:true,//是否显示透明蒙层，防止触摸穿透，默认：false 
		  icon:'none',
		})
		
		return false;
	} else {
		cartIdsList =  cartIdsList.toString();
		that.setData({
			cartIds: cartIdsList
		})
		that.navigateToPayOrder();
	}
	
    
  },


  //跳至支付结果页
  navigateToPayOrder: function () {
    wx.hideLoading();
	//var allGoods = JSON.stringify(this.data.list);
    wx.navigateTo({
      url: "/pages/pay-order/pay-order?orderType=cart&cartIds="+this.data.cartIds
	  // url: "/pages/pay-order/pay-order?orderType=cart&cartIds="+this.data.cartIds+"&list="+allGoods+"&totalPrice="+this.data.totalPrice
    })
  }
})
