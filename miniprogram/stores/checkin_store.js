const {Store} = require('westore')
const UserStore = require('../stores/user_store')
const MCheckin = require('../models/checkin')
const util = require('../src/util/util')

class CheckinStore extends Store {
  constructor(){
    super()
    this.data = {
      _floors: [],
      _allRooms: [],
      contractInfo: [{value: false, text: '稍后签合同'}, {value: true, text: '已签合同'}],

      apartmentName: '',
      apartmentId: '',
      lateprice: 0,
      graceDays: 0,
      ePrice: 0,
      wPrice: 0,
      gPrice: 0,
      oPrice: 0, // 其他费用
      payDay: '', // 交租日

      floor: '1',
      roomNo: '',
      checkinDate: '',
      termEndDate: '',
      paidTill: '',
      rental: 0,
      deposit: 0,
      eReadingStarts: 0,
      workat: '',
      numberOfPeople: 0,
      roomMates: [],
      contractSigned: false,

      _apartments: [],
      _show: false
    }
  }

  async search(name){
    const res = await MCheckin.search(name)
    this.data._apartments = res.result.list
    this.update()
  }

  /* 
  * 选择租住的公寓
  */
  choose(index){
    // console.log(index)
    let apartment = this.data._apartments[index]
    this.data.apartmentName = apartment.apartmentName  // 公寓名
    this.data.apartmentId = apartment._id              // 公寓id
    this.data.graceDays = 1*(apartment.graceDays)      // 公寓政策：宽限期
    this.data.latePrice = 1*(apartment.latePrice)      // 公寓政策：逾期费
    this.data.ePrice = 1*(apartment.ePrice)            // 公寓收费：电费
    this.data.wPrice = apartment.wPrice                // 公寓收费：水费
    this.data.gPrice = 1*(apartment.gPrice)            // 公寓收费：卫生费
    this.data.payDay = apartment.payDay                // 交租日

    this.data._allRooms = apartment.roomNumbers
    this.data._allRooms.forEach((item,index) => {this.data._floors.push(index+1)}) // 获取楼层
    this.data._show = false
    this.update()
    
  }

  async checkin(){
    const {apartmentName,apartmentId,graceDays,latePrice,ePrice,wPrice,gPrice,payDay,floor,roomNo,checkinDate,termEndDate,rental,deposit,paidTill,eReadingStarts,workat,numberOfPeople,roomMates,contractSigned} = this.data
    if(apartmentName&&apartmentId&&floor&&roomNo&&checkinDate&&termEndDate&&rental&&deposit&&paidTill&&eReadingStarts&&workat&&numberOfPeople){

      // 检查roomMates是否填写完整
      const hasEmptyValue = roomMates.some(value => { 
        if(!value.name || !value.tel){ 
          wx.showToast({
            title: '室友信息有未填写',
            icon: 'none',
            duration: 3000
          })
          return true
        }
      })
      if(hasEmptyValue){ return }

      // 检查roomMates人数是否等于numberOfPeople减1
      if(roomMates.length<numberOfPeople-1){
        wx.showToast({
          title: '室友数量不对哦',
          icon: 'none',
          duration: 3000
        })
        return
      }

      /* 如果payDay为true，说明房东设置固定日期收租 */
      let _payDay = payDay ? payDay : new Date(checkinDate).getDate()
      if(_payDay === '31'){
        _payDay = '1'
      }

      const res = await MCheckin.checkin({
        apartmentName,apartmentId,graceDays,latePrice,ePrice,wPrice,gPrice,floor,roomNo,checkinDate,termEndDate,rental,numberOfPeople,workat,roomMates,contractSigned,
        oPrice: 0, // 其他费用
        eReadings: [{
          value: eReadingStarts,
          date: checkinDate
        }],
        depositInfo: {deposit, allPaid: false, havePaid: 0, depositLateFees: 0, paymentRecords: []},
        monthlyBills: [],
        // TRPExpiredIn: '',
        // TRPobtained: false, // TPR=暂住证
        useWaterMeter: false,
        payDay: _payDay, // 交租日
        anchorDate: util.formatTime(new Date()),
        isStaying: true,
        valid: false // 待审核
      })

      if(res.result._id){
        await UserStore.updateUser({
          data: {
            level: 3 // 租户
          }
        })
        wx.navigateTo({
          url: '/pages/myroom/myroom',
        })
      }

      return
    }

    wx.showToast({
      title: '入住信息未填完整',
      icon: 'none',
      duration: 3000
    })
  }
}

module.exports = new CheckinStore