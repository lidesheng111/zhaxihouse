const CheckingoutStore = require('../../stores/checkingout_store')

Page({
  data: CheckingoutStore.data,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    CheckingoutStore.bind(this)
    CheckingoutStore.initiate(options.id)
  },

  /* 选中房间 */
  choose(e){ CheckingoutStore.choose(e.currentTarget.dataset.i)},

  /* 更新todos */
  checkboxChange(e){ CheckingoutStore.updateTodos(e.detail.value) },

  /* 更改押金扣减金额 */
  depositDocked(e){ 
    if(!e.detail.value){ return }
    
    wx.showModal({
      title: '已与租户沟通扣减金额？',
      content: `扣减押金${e.detail.value}元`,
      confirmColor: '#2c6e49',
      cancelColor: '#97a97c',
      success: res => {
        if(res.confirm){
          CheckingoutStore.depositDocked( (e.detail.value)*1 )
        } else{
          wx.showToast({
            title: '为避免纠纷，与租户沟通好哦',
            icon: 'none'
          })
        }
      }
    })
   },

  /* 完成退房：删除房间 */
  completelyCheckout(){
    wx.showModal({
      title: '提醒！',
      content: '此操作不可逆！仅当完成全部退房手续后可点击！',
      confirmColor: 'red',
      success: res => {
        if(res.confirm){
          CheckingoutStore.completelyCheckout()
        }else{
          wx.showToast({
            title: '检查一下吧',
            icon: 'none'
          })
        }
      }
    })
  },

  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
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