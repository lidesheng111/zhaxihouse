const {Store} = require('westore')
const MOutlay = require('../models/outlay')

class Outlay extends Store {
  constructor(){
    super()

    this.data = {
      activeKey: '0',
      apartmentId: '',

      curYear: '',
      curMonth: '',

      monthly: [],
      monthlyTotal: 0,
      yearly: [],
      yearlyTotal: 0,

      spendedon: '',
      howmuch: 0,

    }
  }

  initiate(id){
    let y = new Date().getFullYear().toString()
    let m = new Date().getMonth() + 1 +''
    this.data.curYear = y[1] ? y : `0${y}`
    this.data.curMonth = m[1] ? m : `0${m}`
    this.data.apartmentId = id
    this.update()
    this.getMonthlyOutlay()
  }

  /**
   * 月度支出
   */
  async getMonthlyOutlay(){
    this.data.monthlyTotal = 0
    const {apartmentId, curMonth, curYear} = this.data
    const res = await MOutlay.getMonthlyOutlay({
      year: curYear,
      month: curMonth,
      apartmentId
    })

    this.data.monthly = res.result.data
    this.data.monthly.forEach(item => {
      this.data.monthlyTotal += item.howmuch
    })
    this.update()
  }

  /**
   * 年度支出
   */
  async getYearlyOutlay(){
    this.data.yearlyTotal = 0
    const res = await MOutlay.getYearlyOutlay({
      year: this.data.curYear,
      apartmentId: this.data.apartmentId
    })
    this.data.yearly = res.result.list
    this.data.yearly.forEach(item => {
      this.data.yearlyTotal  += item.total
    })
    this.update()
  }

  /**
   * 记一笔
  */
  async submit(){ 
    let day = new Date().getDate().toString()
    day = day[1] ? day : `0${day}`

    const {apartmentId,curYear, curMonth, spendedon, howmuch} = this.data
    const res = await MOutlay.addExpenses({
      apartmentId,
      year: curYear,
      month: curMonth,
      day,
      spendedon,
      howmuch
    })
    if(res.result._id){ wx.showToast({title: '记好了'}) }
  }
}

module.exports = new Outlay