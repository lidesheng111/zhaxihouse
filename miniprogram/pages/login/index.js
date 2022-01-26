const UserStore = require("../../stores/user_store")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: UserStore.data.user,
    show: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    UserStore.bind(this)
    setTimeout( () => {
      if(this.data.user.userInfo.avatarUrl==='../../src/images/avatar.png'){
        this.setData({ show: true })
      }
    }, 1500)
  },

  getAvatar(){
    /* 获取用户头像 */ 
    wx.getUserProfile({
      desc: '用于页面展示',
      success: res => {
        this.setData({ 
          show: false
        })

        UserStore.updateAvatar(res.userInfo.avatarUrl)
      },
    })
  },

  inputName(e){ this.setData({ 'user.userInfo.name': e.detail.value }) },
  tap(){ this.setData({ show: true }) },

  async getTel(e){
    //授权获取手机号
    if(e.detail.errMsg == "getPhoneNumber:ok") {
      const res = await UserStore.getTel(e.detail.cloudID)
      if(res){ this.setData({ show: false }) }
      return
    } 

    //未授权
    wx.showToast({
      title: '填写号码方便使用哦',
      icon: 'none'
    })
  },

  async submit(){
    const {tel, name, avatarUrl} = this.data.user.userInfo
    if(avatarUrl === '../../src/images/avatar.png'){
      this.setData({ show: true })
      return
    }
    if(tel && name){
      await UserStore.login()
      return
    }

    wx.showToast({
      title: '好好填哟',
      icon: 'none'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
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