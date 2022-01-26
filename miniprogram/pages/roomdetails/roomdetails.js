const RoomdetailsStore = require('../../stores/roomdetails_store')
const LandlordStore = require('../../stores/landlord_store')
const apartmentId = LandlordStore.data.am._id // 公寓id
/*
*
*/
Page({
  data: RoomdetailsStore.data,

  onLoad: function (options) {
    RoomdetailsStore.bind(this)
    // const res = wx.getStorageSync('details')
    // if(res){
    //   RoomdetailsStore.initiateDetails(res)
    //   return
    // }

    RoomdetailsStore.getRoomById(options.id)
  },

  showRoomPicker(){ this.setData({ showRoomPicker: true }) },
  inputNewRoom(e){ this.setData({newRoom: e.detail.value }) }, // 输入房间号
  inputNewFloor(e){ this.setData({newFloor: e.detail.value }) }, // 输入楼层号
  async confirmNewRoom(){ 
    const res = await RoomdetailsStore.changeRoom() 
    if(res){this.setData({ showRoomPicker: false })}
  },

  checkoutAll(){ 
    wx.showModal({
      title: '创建账单提醒！',
      content: '创建上月产生的水电卫生等费用，便于结算退房',
      cancelText: '去创建',
      cancelColor: '#97a97c',
      confirmText: '已创建',
      confirmColor: '#2c6e49',
      success: res => {
        if(res.confirm){
          RoomdetailsStore.checkoutAll() 
        }else {
          wx.showToast({title: '先创建账单吧', icon: 'none'})
        }
      }
    })
    
  },

  /* 
   * 管理室友
   */
  TRPObtained(e){ RoomdetailsStore.TRPObtained(e.detail.index) }, // 由组件更新：已办暂住证
  checkout(e){ RoomdetailsStore.checkout(e.detail.index) }, // 由组件更新：离开

  matesIndex(e){ this.setData({_roommatesIndex: e.detail.index}) }, // 由组件更新：修改
  roomatesTel(e){ RoomdetailsStore.inputRoommatesTel(e.detail.value) },
  roomatesWork(e){ RoomdetailsStore.inputRoommatesWork(e.detail.value) },

  async submitMates(e){
    const res = await RoomdetailsStore.submitMates(e.currentTarget.id)
    if(res){ this.setData({ showMask: false }) } // 在store中更新有bug
  },

  /* 
  *暂住证管理
  */ 
  // 页面跳转：permits为空时跳转至resiPermitsInfo
  addNew(){
    const roomId = this.data.details._id
    const roomNo = this.data.details.roomNo
    wx.navigateTo({
      url: '/pages/resiPermitsInfo/resiPermitsInfo?roomId='+roomId+'&roomNo='+roomNo,
      events: {
        // 新增：由页面resiPermitsInfo驱动 
        add: (data) => {
          RoomdetailsStore.resiPermitAdd(data)
        }
      }
    })
  },
  // 页面跳转：permits不为空，跳转至resiPermitsInfo
  toResiPermitsInfo(e){
    let index = e.currentTarget.dataset.index
    const roomId = this.data.details._id
    const roomNo = this.data.details.roomNo
    this.setData({ resiPermitIndex: index })
    wx.navigateTo({
      url: '/pages/resiPermitsInfo/resiPermitsInfo',
      events: {
        // 编辑：由页面resiPermitsInfo驱动  
        resiPermitEdited: data => {
          RoomdetailsStore.resiPermitEdited(data)
        },
        // 删除：由页面resiPermitsInfo驱动
        resiPermitDelete: () => {
          RoomdetailsStore.resiPermitDelete()
        },
        resiPermitAdd: (data) => {
          RoomdetailsStore.resiPermitAdd(data)
        }
      },
      success: res => {
        res.eventChannel.emit('resiPermits', {
          id: apartmentId, 
          info: this.data.details.permits[0].permits[index], 
          index,
          roomId,
          roomNo
        })
      }
    })
  },
  // 删除

  showMaskTRP(){ this.setData({ _showMaskTPR: true })}, // 暂住证list控制
  inputTRPExpiredIn(e){ this.setData({ ['details.TRPExpiredIn']: e.detail.value })},
  closeMaskTRP(){ this.setData({ _showMaskTPR: false })},
  submitTRP(){ RoomdetailsStore.updateTRP() }, // 更新暂住证有效期

  /* 
  * 价格管理/显示
  */
  getPrices(e){ this.setData({price: e.detail.value}) }, // 由_priceList组件触发
  submit(e){ RoomdetailsStore.updatePrices(e.detail.key, e.detail.index) }, //_mask组件 --> _priceList组件 --> this

  /**
   * 押金管理
   */
  depositPaidOffline(){
    if(this.data.details.depositInfo.depositLateFees !== 0){
      wx.showModal({
        title: '输入已收的逾期费金额：',
        editable: true,
        placeholderText: '如放弃收取可不填写',
        cancelText: "取消",
        confirmText: "继续",
        success: res => {
          let lateFeePaid = (res.content)*1
          if(res.confirm){
            RoomdetailsStore.depositPaidOffline(lateFeePaid)
          } else {
            console.log('取消')
          }
          
        }
      })
      return
    }
    
    wx.showModal({
      title: '确定已收取全部押金?',
      success: res => {
        if(res.confirm){
          RoomdetailsStore.depositPaidOffline(null)
        } else {
          console.log('取消')
        }
        
      }
    })
  },

  // 合同管理
  showLeaseMask(){ this.setData({_showLeaseMask: true}) },
  newLeaseEndDate(e){ this.setData({ newLeaseDate: e.detail.value }) },
  closeLeaseMask(){ this.setData({_showLeaseMask: false}) },
  async submitLease(){ 
    const res = await RoomdetailsStore.updateLease() 
    if(res){ this.setData({ _showLeaseMask: false })}
  },
  contract(e){
    if(e.detail.value){
      wx.showModal({
        title: '确定已签合同？',
        success: res => {
          if(res.confirm){ RoomdetailsStore.updateContract(true) }
          if(res.cancel){ console.log('取消') }
        }
      })
      return
    }
    RoomdetailsStore.updateContract(false)
  },

  // 创建账单
  billFrom(e){ this.setData({ from: e.detail.date }) }, // _calendar组件触发
  billEnd(e){ this.setData({ till: e.detail.date }) }, // _calendar组件触发
  rental(e){
    if(e.detail.value !== ''){
      wx.showModal({
        title: '确定要修改房租租金？',
        success: res => {
          if(res.confirm){ 
            this.setData({ rental: (e.detail.value)*1 })
          } else {
            console.log('取消')
          }
        }
      })
    }
  },
  eBill(e){ this.setData({ eBill: Number(e.detail.value) }) },
  wBill(e){ this.setData({ wBill: Number(e.detail.value) }) },
  gBill(e){ this.setData({ gBill: Number(e.detail.value) }) },
  oBill(e){ this.setData({ oBill: Number(e.detail.value) }) },
  monthlyBill(){ RoomdetailsStore.setMonthlyBill() },

  /* *
   *水电表管理
   */
  radio(e){ RoomdetailsStore.useWaterMeterRadio() },  // 启用水表与否
  getMeterReading(e){ RoomdetailsStore.manageE_W(e.detail)},

  updatePaymentChange(data){
    RoomdetailsStore.updatePaymentChange(data)
  },

  onReady: function () {

  },

  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})