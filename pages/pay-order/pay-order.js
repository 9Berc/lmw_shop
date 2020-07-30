//index.js
//获取应用实例
var app = getApp()

Page({
	data: {
		goodsList: [],
		isNeedLogistics: 0, // 是否需要物流信息
		allGoodsPrice: 0,
		yunPrice: 0,
		promotionPrice: 0,
		payPrice: 0,
		integralPrice: 0,
		finalPrice: 0,
		youhuijine: 0, //优惠券金额
		goodsJsonStr: "",
		orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，
		curAddressData: '',
		defaultAddress: '',
		cartIds: '',
		hasNoCoupons: false,
		coupons: [],
		couponStatus: 0, //是否可与优惠券同时用
		curCoupon: '', // 当前选择使用的优惠券
		showAllAddress: false,
		integral: 0,
		useIntegral: '',
		useUnit: '',
		useIntegralStatus: false,
		disabledIntegral: false,
		deductionPerAmount: 0, //每一元需要抵扣的积分数
		maxPercentPerOrder: 0 ,//每笔订单最高抵用百分比
		remark: ''
	},

	onLoad: function(e) {
		this.setData({
			cartIds: e.cartIds
		})
		this.getOrdeInfo();
	},
	
	getFinalPrice: function() {
		var that = this;
		var yunPrice = that.data.yunPrice; //运费
		var payPrice = that.data.payPrice; //优惠后的价格
		var	youhuijine = that.data.youhuijine; //优惠券金额
		var integral = that.data.integral;
		var couponStatus = that.data.couponStatus;
		var deductionPerAmount = that.data.deductionPerAmount;
		var maxPercentPerOrder = that.data.maxPercentPerOrder;
		var useUnit = that.data.useUnit;
		var finalPrice = 0;
		var useIntegral = 0;
		
		var integralPrice = Number((integral / deductionPerAmount).toFixed(1)); //目前积分可用金额
		var maxIntegralPriceAndCoupon = (maxPercentPerOrder / 100) * (payPrice - youhuijine); //积分最大可用金额
		var maxIntegralPrice = (maxPercentPerOrder / 100) * payPrice; //积分最大可用金额
		
		// console.log(typeof(maxIntegralPrice));
		
		if (useUnit > integral) {
			that.setData({
				disabledIntegral: true,
				useIntegralStatus: false
			})
			//return false;
		} 
		

		//可与优惠券叠加使用  积分抵扣金额小于最高规定值
		if (couponStatus == 1 && integralPrice < maxIntegralPriceAndCoupon) {
			var useIntegralStatus = that.data.useIntegralStatus;
			
			if (useIntegralStatus == true) {
				finalPrice = payPrice - integralPrice - youhuijine;
				that.setData({
					useIntegral: integral
				})
			} else {
				finalPrice = payPrice - youhuijine;
				that.setData({
					useIntegral: ''
				})
			}
			
			that.setData({
				integralPrice: integralPrice,
				finalPrice: finalPrice,
				//useIntegral: integral,
				disabledIntegral: false
			})
		}
		//可与优惠券叠加使用  积分抵扣金额大于最高规定值
		if (couponStatus == 1 && integralPrice > maxIntegralPriceAndCoupon) {
			var useIntegralStatus = that.data.useIntegralStatus;
			integralPrice = maxIntegralPriceAndCoupon;
			useIntegral = integralPrice * deductionPerAmount;
			if (useIntegralStatus == true) {
				finalPrice = payPrice - integralPrice - youhuijine;
				that.setData({
					useIntegral: useIntegral
				})
			} else {
				finalPrice = payPrice - youhuijine;
				that.setData({
					useIntegral: ''
				})
			}
			
			that.setData({
				integralPrice: integralPrice,
				finalPrice: finalPrice,
				//useIntegral: useIntegral,
				disabledIntegral: false
			})
		}
		
		
		
		
		//不可与优惠券同用  积分抵扣金额小于最高规定值
		if (couponStatus == 0 && integralPrice < maxIntegralPrice) {
			if (youhuijine == 0) {
				var useIntegralStatus = that.data.useIntegralStatus;
				if (useIntegralStatus == true) {
					finalPrice = payPrice - integralPrice;
					that.setData({
						useIntegral: integral
					})
				} else {
					finalPrice = payPrice
					that.setData({
						useIntegral: ''
					})
				}
			
				that.setData({
					integralPrice: integralPrice,
					finalPrice: finalPrice,
					//useIntegral: useIntegral,
					disabledIntegral: false
				})
				
			} else {
				finalPrice = payPrice - youhuijine;
				that.setData({
					integralPrice: integralPrice,
					finalPrice: finalPrice,
					useIntegral: '',
					disabledIntegral: true,
					useIntegralStatus: false
				})
			}
			
		}
		//不可与优惠券同用  积分抵扣金额大于最高规定值
		if (couponStatus == 0 && integralPrice > maxIntegralPrice) {
			if (youhuijine == 0) {
				var useIntegralStatus = that.data.useIntegralStatus;
				integralPrice = maxIntegralPrice;
				useIntegral = integralPrice * deductionPerAmount;
				if (useIntegralStatus == true) {
					finalPrice = payPrice - integralPrice;
					that.setData({
						useIntegral: useIntegral
					})
				} else {
					finalPrice = payPrice;
					that.setData({
						useIntegral: ''
					})
				}
			
				that.setData({
					integralPrice: integralPrice,
					finalPrice: finalPrice,
					//useIntegral: 0,
					disabledIntegral: false
				})
				
			} else {
				finalPrice = payPrice - youhuijine;
				that.setData({
					integralPrice: integralPrice,
					finalPrice: finalPrice,
					useIntegral: '',
					disabledIntegral: true,
					useIntegralStatus: false
				})
			}
			
		}
		


	},
	
	//选择使用积分
	useChooseIntegral: function() {
		// console.log(1);
		this.getFinalPrice();
	},
	

	//获取订单信息
	getOrdeInfo: function() {
		var that = this;
		var user_tokenHead = wx.getStorageSync('user_tokenHead');
		var user_token = wx.getStorageSync('user_token');

		var cartIds = that.data.cartIds;
		//console.log(cartIds);
		wx.request({
			url: app.globalData.baseUrl + '/mallPort/order/generateConfirmOrder', //根据购物车信息生成确认单信息
			method: 'POST',
			header: {
				'content-type': 'application/x-www-form-urlencoded',
				'Authorization': user_tokenHead + ' ' + user_token,
			},
			data: {
				cartIds: cartIds
			},
			success: function(res) {
				console.log(res);
				res.data.data.cartPromotionItemList.forEach(function(item, index) {
					item.productAttr = JSON.parse(item.productAttr);
				});

				var addressList = res.data.data.memberReceiveAddressList;
				var defaultAddress = '';
				var coupons = res.data.data.couponHistoryDetailList;
				var hasNoCoupons = '';
				if (coupons.length == 0) {
					hasNoCoupons = true;
				} else {
					hasNoCoupons = false;
				}

				if (addressList.length < 1) {
					that.setData({
						isNeedLogistics: 0
					})
				} else {
					for (var i = 1; i < addressList.length; i++) {
						if (addressList[i].defaultStatus == 1) {
							defaultAddress = addressList[i]
						} else {
							defaultAddress = addressList[0]
						}
					}
					that.setData({
						isNeedLogistics: 1
					})
				}

				that.setData({
					goodsList: res.data.data.cartPromotionItemList,
					allGoodsPrice: res.data.data.calcAmount.totalAmount,
					promotionPrice: res.data.data.calcAmount.promotionAmount,
					yunPrice: res.data.data.calcAmount.freightAmount,
					payPrice: res.data.data.calcAmount.payAmount,
					curAddressData: addressList,
					defaultAddress: defaultAddress,
					hasNoCoupons: hasNoCoupons,
					coupons: coupons,
					couponStatus: res.data.data.integrationConsumeSetting.couponStatus,
					deductionPerAmount: res.data.data.integrationConsumeSetting.deductionPerAmount,
					maxPercentPerOrder: res.data.data.integrationConsumeSetting.maxPercentPerOrder,
					useUnit: res.data.data.integrationConsumeSetting.useUnit,
					integral: res.data.data.memberIntegration
				})

				that.getFinalPrice();
			}
		})

	},
	

	//添加收货地址
	addAddress: function() {
		wx.showToast({
			title: '请到个人中心设置收货地址',
			duration: 1000, //显示时长
			mask: true, //是否显示透明蒙层，防止触摸穿透，默认：false 
			icon: 'none',
		})
	},

	//选择收货地址
	selectAddress: function(e) {
		//console.log(e);
		// var that = this;
		var defaultAddress = '';
		var curAddressData = this.data.curAddressData;
		var addressId = e.currentTarget.dataset.id;
		for (var i = 0; i < curAddressData.length; i++) {
			if (curAddressData[i].id == addressId) {
				defaultAddress = curAddressData[i];
			}
		}
		this.setData({
			defaultAddress: defaultAddress
		})
		this.closeSelectAddress();
	},

	showSelectAddress: function() {
		//var that = this;
		this.setData({
			showAllAddress: true
		})

	},

	closeSelectAddress: function() {
		this.setData({
			showAllAddress: false
		})
	},


	//使用优惠券
	bindChangeCoupon: function(e) {
		const selIndex = e.detail.value[0] - 1;
		if (selIndex == -1) {
			this.setData({
				youhuijine: 0,
				curCoupon: []
			});
			//return;
		} else {
			this.setData({
				youhuijine: this.data.coupons[selIndex].coupon.amount,
				curCoupon: this.data.coupons[selIndex]
			});
		}

		this.getFinalPrice();

	},
	
	//提交订单
	createOrder: function() {
		var that = this;
		var user_tokenHead = wx.getStorageSync('user_tokenHead');
		var user_token = wx.getStorageSync('user_token');
		
		var cartIds = that.data.cartIds;
		var memberReceiveAddressId = that.data.defaultAddress.id;
		var useIntegration = that.data.useIntegral;
		var couponId =  that.data.curCoupon.couponId;
		var remark = that.data.remark;
		if (couponId == undefined) {
			couponId = ''
		}
		console.log(couponId);
		console.log(typeof(useIntegration));
		console.log(useIntegration);
		
		
		wx.request({
			url: app.globalData.baseUrl + '/mallPort/order/generateOrder', //根据购物车信息生成订单
			method: 'POST',
			header: {
				'content-type': 'application/x-www-form-urlencoded',
				'Authorization': user_tokenHead + ' ' + user_token,
			},
			data: {
				cartIds: cartIds,
				memberReceiveAddressId: memberReceiveAddressId,
				couponId: couponId,
				useIntegration: useIntegration,
				payType: 0,
				remark: remark
				
			},
			success: function(res) {
				console.log(res);
			}
		})
	
	}
	




})
