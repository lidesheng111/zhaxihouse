const {Store} = require('westore')
const UserStore = require('../stores/user_store')
const MUser = require('../models/user')
const MAddapartment = require('../models/addapartment')
const MLandlord = require('../models/landlord')
const util = require('../src/util/util')

class Addapartment extends Store {
  constructor(){
    super()

    this.data = {
      apartmentName: '',
      address: '',
      subMchId: '',

      lowestPrice: null,
      highestPrice: null,
      ePrice: null,
      wPrice: '',
      gPrice: null,
      latePrice: null,
      graceDays: null,
      manageInfo: [
        {name: '承租经营',checked: false},
        {name: '自有房屋经营',checked: false},
        {name: '有雇员工',checked: false},
        {name: '没有雇员工',checked: false},
        {name: '每月固定日收租',checked: false},
      ],
      yearlyRental: 0,
      theFixedDay: '',


      roomTypes: [
        {name: '单间 | 15㎡以下',checked: false},
        {name: '单间 | 15-25㎡',checked: false},
        {name: '单间 | 25㎡以上',checked: false},
        {name: '1室1厅',checked: false},
        {name: '2室1厅',checked: false},
        {name: '3室1厅',checked: false},
      ],

      facilities: [
        {name: '电瓶车充电', checked: false},
        {name: '停三轮车', checked: false},
        {name: '车位', checked: false},
        {name: '独立卫生间', checked: false},
        {name: '独立厨房', checked: false},
        {name: '空房出租', checked: false},
        {name: '带家具出租', checked: false},
        {name: '拎包入住', checked: false},
        {name: '直接日照', checked: false},
        {name: '整体光线良好', checked: false},
        {name: '(部分）房间无采光', checked: false},
        {name: '有1室以上的套间', checked: false},
      ],

      numberOfRooms: null,
      roomNumbers: [],

      _index: 1, // _currentFloor是变动的
      _anchorFloor: 1, // _anchorFloor是校准值
      _roomsTemp: [],
      _editRooms: false,
      _confirmBtnShow: false, 

      _apartmentRented: false, // 承租经营
      _collectRentsAtFixedDay: false, // 每月固定日期收租

      _openid: UserStore.data.user.userInfo._openid
    }
  }

  async manageInfo(detail){//经营详情
    let info = this.data.manageInfo
    for(let i = 0; i< info.length; i++){
      if(info[i].name===detail.key){
        info[i].checked = detail.checked
        if(info[i].checked && detail.key==='承租经营'){ // 如果勾选承租经营，需要输入年租金
          this.data._apartmentRented = true
        }

        if(info[i].checked && detail.key==='每月固定日收租'){ // 如果勾选承租经营，需要输入年租金
          this.data._collectRentsAtFixedDay = true
        }
        break
      }
    }

    this.update()
  }

  async roomTypes(detail){//房型
    let info = this.data.roomTypes
    for(let i = 0; i< info.length; i++){
      if(info[i].name===detail.key){
        info[i].checked = detail.checked
        break
      }
    }

    this.update()
  }

  async facilities(detail){//公寓设施详情
    let info = this.data.facilities
    for(let i = 0; i< info.length; i++){
      if(info[i].name===detail.key){
        info[i].checked = detail.checked
        break
      }
    }

    this.update()
  }

  // 确认输入的房号
  confirmRooms(){
    this.data.roomNumbers.push(this.data._roomsTemp)
    
    this.data._index++
    this.data._anchorFloor = this.data._index // 用于校准
    this.data._confirmBtnShow = false
    this.update()
  }


  // 删除楼层
  deleteFloor(){
    this.data._index--
    this.data._anchorFloor--
    this.data.roomNumbers.pop()
    this.data._roomsTemp = []
    this.update()
  }

  //提交注册
  async submit(){
    wx.showLoading({title: '注册中'})
    const {apartmentName,address,subMchId,lowestPrice,highestPrice,
      ePrice,wPrice,gPrice,latePrice,graceDays,
      manageInfo,yearlyRental,theFixedDay,roomTyps,facilities,
      numberOfRooms,roomNumbers} = this.data

    const currentMonth = new Date().getMonth()+1+''

    if(apartmentName&&address&&subMchId&&lowestPrice&&highestPrice
      &&ePrice&&wPrice&&gPrice&&latePrice&&graceDays
      &&numberOfRooms&&roomNumbers){

      const res = await MAddapartment.addApartment({
        apartmentName,address,subMchId,lowestPrice,highestPrice,
        ePrice,wPrice,gPrice,latePrice,graceDays,
        manageInfo,yearlyRental,theFixedDay,roomTyps,facilities,
        numberOfRooms,roomNumbers,
        isMembership: false,
        // membershipExpiredIn: '',
        registeringDay: util.formatTime(new Date(), 'day'),
        anchorMonth: currentMonth,
        anchorDate: util.formatTime(new Date()),
      })

      if(res.result._id){
        // 给房东用户绑定公寓
        const resuser = await MUser.updateUserWithApartment({
          id: res.result._id,
          name: apartmentName
        })

        console.log(resuser, 'user')

        // 初始化accounts账单
        await MLandlord.setMonthBills(res.result._id)

        wx.hideLoading({title: '注册中'})

        wx.navigateTo({
          url: `/pages/landlord/landlord?=${res.result._id}`,
        })
      }
    } else {
      wx.showToast({
        title: '好好填哟',
        icon: 'none',
        duration: 3000
      })
    }
  }
}

module.exports = new Addapartment