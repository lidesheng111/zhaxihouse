const Cloud = require('../src/util/cloudFunctions')

class Landlord {
  constructor(){
    let year = new Date().getFullYear() + ''
    let month = new Date().getMonth() + 1 + ''
    this.currentYear = year[1] ? year : `0${year}`
    this.currentMonth = month[1] ? month : `0${month}`
  }

  async getApartmentById(id){
    return await Cloud.call({
      $url: 'getApartmentById',
      id
    })
  }

  // 获取公寓暂住证信息
  async getPermitsByAptmid(aptmid){
    const res = await Cloud.call({
      $url: 'getPermitsByAptmid',
      aptmid
    })

    return res
  }

  // 月份交替之际初始化月份账单
  async setMonthBills(aptmid){
    const res = await Cloud.call({
      $url: 'setMonthBills',
      data: {
        aptmid,
        year: this.currentYear,
        month: this.currentMonth
      }
    })

    return res
  }

  // 更新月份账单
  async updateAccounts(data){
    data.year = this.currentYear
    data.month = this.currentMonth
   
    const res = await Cloud.call({
      $url: 'updateAccounts',
      data
    })

    return res
  }

  /* 更新公寓账目：违约费用 */
  async updatePunishmentBills(data){
    data.year = this.currentYear
    data.month = this.currentMonth
   console.log(data)
    const res = await Cloud.call({
      $url: 'updatePunishmentBills',
      data
    })
    console.log(res)
    return res
  }

  // 更新公寓信息：比如anchorMonth
  async updateMyApartment(id, data){
    const res = await Cloud.call({
      $url: 'updateMyApartment',
      aptmid: id,
      data
    })

    return res
  }

  async getCurrentMonthBills(id){
    const res = await Cloud.call({
      $url: 'getCurrentMonthBills',
      aptmid: id,
      year: this.currentYear,
      month: this.currentMonth 
    })

    console.log(res, 'get bills')
    return res
  }
}

module.exports = new Landlord()