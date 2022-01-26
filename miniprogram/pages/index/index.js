const UserStore = require('../../stores/user_store')
const MainpageStore = require('../../stores/mainpage_store')

Page({

  /**
   * 页面的初始数据
   */
  data:{
    user: UserStore.data.user,
    main: MainpageStore.data.main,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    UserStore.bind(this)
    this.getUser()

    wx.loadFontFace({
      family:"MotionPicture",
      source:"url('https://7265-rent-6gritc2gc2f51bb9-1256857292.tcb.qcloud.la/%E6%A2%A6%E5%B2%9B%E5%85%AC%E5%AF%93/MotionPicture.ttf?sign=3405ab004dc131270e63213938f993be&t=1636108805')",
      success: res => { console.log},
      fail: err => console.error(err)
    })
  },

  async getUser() {
    const res = await UserStore.getUser()
    if(res.length===0){
      wx.navigateTo({
        url: '/pages/login/index',
        events: {
          updateAvatar: (url)=>{
            UserStore.updateAvatar(url)
          }
        }
      })
    }
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
    if(!UserStore.data.user.userInfo.tel){
      UserStore.getUser()
    }
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