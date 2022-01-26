const AddapartmentStore = require('../../stores/addapartment_store')

Page({
  data: AddapartmentStore.data,

  onLoad: function (options) {
    AddapartmentStore.bind(this)
  },

  // 【名称，地址，商户号】
  apartmentName(e){ this.setData({apartmentName: e.detail.value }) },
  address(e){ this.setData({address: e.detail.value }) },
  subMchId(e){ this.setData({subMchId: e.detail.value }) },

  // 【经营详情】
  lowestPrice(e){ this.setData({lowestPrice: 1*(e.detail.value) }) },
  highestPrice(e){ this.setData({highestPrice: 1*(e.detail.value) }) },
  eprice(e){ this.setData({ePrice: (e.detail.value)*1 }) },
  wprice(e){ this.setData({wPrice: (e.detail.value)*1 }) },
  gprice(e){ this.setData({gPrice: (e.detail.value)*1 }) },
  gracedays(e){ this.setData({graceDays: (e.detail.value)*1 }) },
  lateprice(e){ this.setData({latePrice: (e.detail.value)*1 }) },
  manageInfo(e){ AddapartmentStore.manageInfo(e.detail) },
  yearlyRental(e){ this.setData({yearlyRental: (e.detail.value)*1 }) },
  theFixedDay(e){ this.setData({theFixedDay: e.detail.value }) },

  // 【公寓房型】
  roomTypes(e){ AddapartmentStore.roomTypes(e.detail) },

  // 【公寓详情】
  facilities(e){ AddapartmentStore.facilities(e.detail) },
  

  // 【添加房间号】
  numberOfRooms(e){ this.setData({numberOfRooms: e.detail.value }) },
  
  inputRooms(e){
    // 去掉字符串中间所有空格；去掉前后的逗号——【中、英文输入法的】
    //trim()去掉两边空白，\s匹配空白字符，
    let roomStr = e.detail.value.trim().replace(/\s+|,+$|，+$/, '') // 去掉字符串中间所有空格
    let roomArr = roomStr.split(/，+|,+/)
    this.setData({_roomsTemp: roomArr, _confirmBtnShow: true})
  },

  confirmRooms(){
    if(this.data._editRooms){
      let i = this.data._index-1
      this.setData({
        ['roomNumbers['+i+']']: this.data._roomsTemp,
        _roomsTemp: [],
        _index: this.data._anchorFloor, // 编辑介绍，_index楼层恢复正常序号
        _editRooms: false,
        _confirmBtnShow: false
      })
      return
    }

    AddapartmentStore.confirmRooms()
    this.setData({ _roomsTemp: []})// 【bug】如果在store里更新，view里的value="{{_roomsTemp}}"值不会被清空
  },

  tapEdit(e){
    let i = parseInt(e.currentTarget.id)
    this.setData({
      _editRooms: true,
      _index: i + 1,
      _roomsTemp: this.data.roomNumbers[i]
    })
  },
  deleteFloor(){ // 删除楼层
    AddapartmentStore.deleteFloor()
  },

  submit(){
    AddapartmentStore.submit()
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