const BillsdetailsStore = require('../../stores/billsdetails_store')
const app = getApp()

Page({
  data: BillsdetailsStore.data,

  onLoad: function (options) {
    BillsdetailsStore.bind(this)
console.log(options)
    // 初始化 store数据
    BillsdetailsStore.initiate(options.index)
  },

  /* 
  * 管理蒙版
  */
  showOfflineMask(){ this.setData({_showMaskOffline: true }) },
  closeMaskOffline(){ this.setData({_showMaskOffline: false }) },


  // to do 待完善
  remindLessees(){
    // 提醒交租
  },


  /* 
  * 功能：
  * 1.如果是房东：设置线下支付金额
  * 2.如果是租户：自定义付款金额
  */
  customizeAmount(e){
    BillsdetailsStore.customizeAmount( 1*(e.detail.value ) )
  },

  /* 
  * 【提交】button
  * 房东提交租户线下支付的金额，以更新数据库。
  * 由_mask组件触发。
  */
  submitOffline(){ BillsdetailsStore.submitOfflinePayment() },

  /* 
  * 租户交租
  */
  payRental(){
    BillsdetailsStore.payRental()
  },

  onReady: function () {

  },

  onShow: function () {

  },

  onHide: function () {

  },

  onUnload: function () {
    // 将【数据变动】在上级页面更新
    BillsdetailsStore._updateFatherPage()
  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  }
})