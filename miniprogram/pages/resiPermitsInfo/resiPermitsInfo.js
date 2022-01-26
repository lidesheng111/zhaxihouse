const db = wx.cloud.database()
const _ = db.command
const permits = db.collection('ResiPermits')
const util = require('../../src/util/util')

const LandlordStore = require('../../stores/landlord_store')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    eventChannel: '',
    apartmentId: '',
    permitsEmpty: false,

    index: '',
    activeKey: '2',
    roomId: '',
    roomNo: '',

    _name: '',
    _idNumber: '',
 
    _expiredIn: '',

    name: '',
    idNumber: '',
    expiredIn: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const eventChannel = this.getOpenerEventChannel()

    // 上个页面跳转时permits为空，ResiPermits集合无数据
    if(options.roomId){
      this.setData({
        eventChannel,
        apartmentId: LandlordStore.data.am._id, // 公寓id
        roomId: options.roomId,
        roomNo: options.roomNo,
        permitsEmpty: true
      })

      return
    }

    // permits不为空
    // 从上级页面获取初始数据
    eventChannel.on('resiPermits', data => {
      this.setData({ 
        activeKey: '0',
        eventChannel,
        apartmentId: LandlordStore.data.am._id, 
        index: data.index, 
        roomId: data.roomId, 
        roomNo: data.roomNo,  
        _name: data.info.name,
        _idNumber: data.info.idNumber,

        _expiredIn: data.info.expiredIn
      })
    })
  },

  doEdit(e){
    this.setData({activeKey: '1'})
  },

  editName(e){ this.setData({ _name: e.detail.value }) },
  editIdNumber(e){ this.setData({ _idNumber: e.detail.value }) },
  // editRoomNo(e){ this.setData({ _roomNo: e.detail.value }) },
  editExpiredIn(e){ this.setData({ _expiredIn: e.detail.date }) },
  submitEdit(e){
    const {index, _name, _idNumber, roomId, _expiredIn} = this.data

    if(!_name || !_idNumber || !roomId || !_expiredIn){ 
      util.toastWrong('未填写完整')
      return 
    }
    let i = index
    permits.where({
      roomId: this.data.roomId
    }).update({ // 更新数据库
      data: {
        ['permits.'+i+'.name']: _name,
        ['permits.'+i+'.idNumber']: _idNumber,
        ['permits.'+i+'.expiredIn']: _expiredIn,
      },
      success: res => {
        if(res.stats.updated === 1){
          this.data.eventChannel.emit('resiPermitEdited', { // 触发事件: 更新上级页面
            name: _name, 
            idNumber: _idNumber, 
            expiredIn: _expiredIn
          })
        }
      },
      fail: err => console.log(err)
    })
  },


  delete(){
    permits.doc(this.data.apartmentId).update({
      data: {
        permits: _.pull({ // 更新数据库
          name: _.eq(this.data._name)
        })
      },
      success: res => {
        if(res.stats.updated === 1){
          this.data.eventChannel.emit('resiPermitDelete') // 触发事件: 更新上级页面
          wx.navigateBack({delta: 1})
        }
      }
    })
  },


  /* 
  * 新增暂住证
  */
  addName(e){ this.setData({ name: e.detail.value }) },
  addIdNumber(e){ this.setData({ idNumber: e.detail.value }) },
  // addRoomNo(e){ this.setData({ roomNo: e.detail.value }) },
  addExpiredIn(e){ this.setData({ expiredIn: e.detail.date }) },
  add(){
    const {apartmentId, name, idNumber, roomId, roomNo, expiredIn} = this.data

    if(!name || !idNumber || !roomId || !expiredIn){ 
      util.toastWrong('未填写完整')
      return 
    }

    /* 完全新增暂住证 */
    if(this.data.permitsEmpty){
      permits.add({ // 更新数据库
        data: {
          apartmentId,
          roomId,
          roomNo,
          permits: [{
            name,
            idNumber,
            expiredIn
          }]
        },
        success: res => {
          if(res._id){
            this.data.eventChannel.emit('add', { // 触发事件: 更新上级页面
              name: this.data.name, 
              idNumber: this.data.idNumber, 
              expiredIn: this.data.expiredIn
            })
        
            wx.navigateBack({delta: 1})
            return
          }

          util.toastWrong('出错了')
        },
        fail: err => console.log(err)
      })

      return
    }

    /* 新增：已有部分暂住证 */
    permits.where({
      roomId: this.data.roomId
    }).update({
      data: {
        permits: _.push({ // 更新数据库
          name,
          idNumber,
          expiredIn
        })
      },
      success: res => {
        if(res.stats.updated === 1){
          this.data.eventChannel.emit('resiPermitAdd', { // 触发事件：更新上级页面
            name, 
            idNumber,
            expiredIn
          })
          wx.navigateBack({delta: 1})
          return
        }

        util.toastWrong('出错了')
      },
      fail: err => console.log(err)
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