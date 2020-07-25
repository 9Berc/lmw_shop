//index.js
//获取应用实例
var app = getApp()

Page({
  data: {
    goodsList: [],
    isNeedLogistics: 0, // 是否需要物流信息
    allGoodsPrice: 0,
    yunPrice: 0,
    allGoodsAndYunPrice: 0,
    goodsJsonStr: "",
    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，
   // curAddressData:'',
	curAddressData: 
	      {
	        "id": 35,
	        "memberId": 1,
	        "name": "fenganran",
	        "phoneNumber": "13112345678",
	        "defaultStatus": 1,
	        "postCode": "打算",
	        "province": "大三大杀手",
	        "city": "大大大",
	        "region": "大大大",
	        "detailAddress": "大叔大婶的"
	      },
    hasNoCoupons: false,
    coupons: [],
    youhuijine: 0, //优惠券金额
    curCoupon: null // 当前选择使用的优惠券
  },
  
  onShow: function () {
    //console.log(this.data.orderType)
     
    //立即购买下单
    // if ("buyNow" == that.data.orderType) {
    //   var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
    //   if (buyNowInfoMem && buyNowInfoMem.shopList) {
    //     shopList = buyNowInfoMem.shopList
    //   }
    // } else {
    //   //购物车下单
    //   var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
    //   if (shopCarInfoMem && shopCarInfoMem.shopList) {
    //     // shopList = shopCarInfoMem.shopList
    //     shopList = shopCarInfoMem.shopList.filter(entity => {
    //       return entity.active;
    //     });
    //   }
    // }
    // that.setData({
    //   goodsList: shopList,
    // });
    //that.initShippingAddress();
    
  },

  onLoad: function (e) {
    console.log(e)
	var goodsList = [];
	var totalPrice = e.totalPrice;
	var cartIdsList = e.cartIds.split(',');
	var allGoodsList = JSON.parse(e.list);
	
	for (var i = 0; i < cartIdsList.length;i++){
		for (var j = 0; j < allGoodsList.length;j++){
			if (cartIdsList[i] == allGoodsList[j].id) {
				goodsList.push(allGoodsList[j]);
			}
		}
	}
	this.setData({
	   goodsList: goodsList,
	   allGoodsPrice: totalPrice,
	   // allGoodsAndYunPrice: totalPrice,
	 });
	 
	
	
	// var that = this;
	// var user_tokenHead = wx.getStorageSync('user_tokenHead');
	// var user_token = wx.getStorageSync('user_token');
	// var shopList = [];
	
	// wx.request({
	//   url: app.globalData.baseUrl + '/mallPort/cart/list',
	//   method: 'GET',
	//   header: {
	//     'content-type': 'application/json',
	//     'Authorization':user_tokenHead+' '+ user_token,
	//   },
	//   success: function (res) {
	//     if (res.data.code == 200) {
	//       console.log(res);
	// 	  var goodsList = [];
	//       var allGoodsList = res.data.data;
	// 	  var cartIdsList = that.data.cartIdsList;
	//       for (var i = 0; i < cartIdsList.length;i++){
	// 			for (var j = 0; j < allGoodsList.length;j++){
	// 				if (cartIdsList[i] == allGoodsList[j].id) {
	// 					goodsList.push(allGoodsList[j]);
	// 				}
	// 			}
	//       }
	//       that.setData({
	// 		goodsList: goodsList
	//       })
	
	//     }
	//   }
	// })
	
	
    this.getAddressList();
  },

  //获取用户所有收获地址
  getAddressList:function(){
    var that = this;
    var user_tokenHead = wx.getStorageSync('user_tokenHead');
    var user_token = wx.getStorageSync('user_token');
    wx.request({
      url: app.globalData.baseUrl + '/mallPort/member/address/list',  //创建订单接口
      method: 'GET',
        header: {
          'content-type': 'application/json',
          'Authorization':user_tokenHead+' '+ user_token,
        },
      success: function (res) {
        console.log(res.data.data.length);
        that.setData({
          curAddressData:res.data.data,
        })
        if(res.data.data.length<1){
          that.setData({
            isNeedLogistics:1
          })
        }else{
          that.setData({
            isNeedLogistics:0
          })
        }
      },
      error:function(err){
        console.log(err);
        that.setData({
          curAddressData: null
        });

      }
    })
    console.log(that.data.isNeedLogistics);
  },


  //获取分区ID
  getDistrictId: function (obj, aaa) {
    if (!obj) {
      return "";
    }
    if (!aaa) {
      return "";
    }
    return aaa;
  },

  //提交订单
  createOrder: function (e) {
    //wx.showLoading();
    var that = this;
    var loginToken = app.globalData.token // 用户登录 token
    var remark = ""; // 备注信息
    if (e) {
      remark = e.detail.value.remark; // 备注信息
    }
    /* 备注信息必填
    if (e && that.data.orderType == 'buykj' && remark == '') {
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: '请添加备注信息！',
        showCancel: false
      })
      return;
    }
    */
    var postData = {
      token: loginToken,
      goodsJsonStr: that.data.goodsJsonStr,
      remark: remark
    };
    if (that.data.isNeedLogistics < 1) {
      
        wx.hideLoading();
        wx.showModal({
          title: '友情提示',
          content: '请先设置您的收货地址！',
          showCancel: false
        })
        return;
      
      // if ("buyPT" == that.data.orderType) {
      //   postData.pingtuanOpenId = that.data.goodsList[0].pingtuanId;
      // } else if ("buykj" == that.data.orderType) {
      //   postData.kjid = that.data.goodsList[0].kjid
      // }

      // postData.provinceId = that.data.curAddressData.provinceId;
      // postData.cityId = that.data.curAddressData.cityId;
      // if (that.data.curAddressData.districtId) {
      //   postData.districtId = that.data.curAddressData.districtId;
      // }
      // postData.address = that.data.curAddressData.address;
      // postData.linkMan = that.data.curAddressData.linkMan;
      // postData.mobile = that.data.curAddressData.mobile;
      // postData.code = that.data.curAddressData.code;
      // postData.expireMinutes = app.siteInfo.closeorder;
    }
    // if (that.data.curCoupon) {
    //   postData.couponId = that.data.curCoupon.id;
    // }
    // if (!e) {
    //   postData.calculate = "true";
    // }
    var user_tokenHead = wx.getStorageSync('user_tokenHead');
    var user_token = wx.getStorageSync('user_token');
    var generateOrder = {
      cartIds:'',
      memberReceiveAddressId:'',//会员接收地址
      couponId:'',//优惠券ID
      useIntegration:'',
      payType:'',//支付类型
      payStyle:''//支付方式
    };
    console.log(generateOrder);
    // wx.request({
    //   url: app.globalData.baseUrl + '/mallPort/order/generateOrder',
    //   method: 'POST',
    //   header: {
    //     'content-type': 'application/json',
    //     'Authorization':user_tokenHead+' '+ user_token,
    //   },
      
    //   data: generateOrder, // 设置请求的 参数
    //   success: (res) => {
		// 		// console.log(postData)
    //     wx.hideLoading();
    //     if (res.data.code != 200) {
    //       wx.showModal({
    //         title: '错误',
    //         content: res.data.msg,
    //         showCancel: false
    //       })
    //       return;
    //     }

    //     if (e && "buyNow" != that.data.orderType) {
    //       // 清空购物车数据
    //       wx.removeStorageSync('shopCarInfo');
    //       wx.removeStorageSync('buykjInfo');
    //       wx.removeStorageSync('PingTuanInfo');
    //     }
    //     //console.log(that.data.goodsList[0].price)
    //     if (!e) {
    //       var allGoodsAndYunPrice = res.data.data.amountLogistics + res.data.data.amountTotle

    //       that.setData({
    //         isNeedLogistics: res.data.data.isNeedLogistics,
    //         allGoodsPrice: res.data.data.amountTotle,
    //         allGoodsAndYunPrice: allGoodsAndYunPrice,//res.data.data.amountLogistics + res.data.data.amountTotle,
    //         yunPrice: res.data.data.amountLogistics
    //       });
    //       that.getMyCoupons();
    //       return;
    //     }
    //     // 配置模板消息推送
    //     var postJsonString = {};
    //     postJsonString.keyword1 = { value: res.data.data.dateAdd, color: '#173177' }
    //     postJsonString.keyword2 = { value: res.data.data.amountReal + '元', color: '#173177' }
    //     postJsonString.keyword3 = { value: res.data.data.orderNumber, color: '#173177' }
    //     postJsonString.keyword4 = { value: '订单已关闭', color: '#173177' }
    //     postJsonString.keyword5 = { value: '您可以重新下单，请在30分钟内完成支付', color: '#173177' }
    //     app.sendTempleMsg(res.data.data.id, -1,
    //       app.siteInfo.closeorderkey, e.detail.formId,
    //       'pages/index/index', JSON.stringify(postJsonString));
    //     postJsonString = {};
    //     postJsonString.keyword1 = { value: '您的订单已发货，请注意查收', color: '#173177' }
    //     postJsonString.keyword2 = { value: res.data.data.orderNumber, color: '#173177' }
    //     postJsonString.keyword3 = { value: res.data.data.dateAdd, color: '#173177' }
    //     app.sendTempleMsg(res.data.data.id, 2,
    //       app.siteInfo.deliveryorderkey, e.detail.formId,
    //       'pages/order-detail/order-detail?id=' + res.data.data.id, JSON.stringify(postJsonString));
    //     wx.redirectTo({
    //       url: "/pages/success/success?order=" + res.data.data.orderNumber + "&money=" + res.data.data.amountReal + "&id=" + res.data.data.id
    //     });
    //   }
    // })
  },

  //获取默认寄送地址
  initShippingAddress: function () {
    var that = this;
    wx.request({
      url: app.globalData.baseUrl + '/user/shipping-address/default',
      data: {
        token: app.globalData.token
      },
      success: (res) => {
        if (res.data.code == 200) {
          that.setData({
            curAddressData: res.data.data
          });
        } else {
          that.setData({
            curAddressData: null
          });
        }
        that.processYunfei();
      }
    })
  },

  //运费
  processYunfei: function () {
    var that = this;
    var goodsList = this.data.goodsList;
    var goodsJsonStr = "[";
    var isNeedLogistics = 1;
    var allGoodsPrice = 0;

    for (let i = 0; i < goodsList.length; i++) {
      let carShopBean = goodsList[i];
      if (carShopBean.logistics) {
        isNeedLogistics = 1;
      }
      allGoodsPrice += carShopBean.price * carShopBean.number;

      var goodsJsonStrTmp = '';
      if (i > 0) {
        goodsJsonStrTmp = ",";
      }


      let inviter_id = 0;
      let inviter_id_storge = wx.getStorageSync('inviter_id_' + carShopBean.goodsId);
      if (inviter_id_storge) {
        inviter_id = inviter_id_storge;
      }


      goodsJsonStrTmp += '{"goodsId":' + carShopBean.goodsId + ',"number":' + carShopBean.number + ',"propertyChildIds":"' + carShopBean.propertyChildIds + '","logisticsType":0, "inviter_id":' + inviter_id + '}';
      goodsJsonStr += goodsJsonStrTmp;


    }
    goodsJsonStr += "]";
    //console.log(goodsJsonStr);
    that.setData({
      isNeedLogistics: isNeedLogistics,
      goodsJsonStr: goodsJsonStr
    });
    that.createOrder();
  },

  //添加收货地址
  addAddress: function () {
    wx.navigateTo({
      url: "/pages/address-add/address-add"
    })
  },

  //选择收货地址
  selectAddress: function () {
    wx.navigateTo({
      url: "/pages/address/address"
    })
  },

  //获取用户优惠券
  getMyCoupons: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/discounts/my',
      data: {
        token: app.globalData.token,
        status: 0
      },
      success: function (res) {
        if (res.data.code == 200) {
          var coupons = res.data.data.filter(entity => {
            return entity.moneyHreshold <= that.data.allGoodsAndYunPrice;
          });
          if (coupons.length > 0) {
            that.setData({
              hasNoCoupons: false,
              coupons: coupons
            });
          }
        }
      }
    })
  },

  //使用优惠券
  bindChangeCoupon: function (e) {
    const selIndex = e.detail.value[0] - 1;
    if (selIndex == -1) {
      this.setData({
        youhuijine: 0,
        curCoupon: null
      });
      return;
    }
    //console.log("selIndex:" + selIndex);
    this.setData({
      youhuijine: this.data.coupons[selIndex].money,
      curCoupon: this.data.coupons[selIndex]
    });
  }
})