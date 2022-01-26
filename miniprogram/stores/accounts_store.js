const {Store} = require('westore')
const MAccounts = require('../models/accounts')

class Accounts extends Store {
  constructor(){
    super()

    this.data = {
      year: '',
      apartmentId: '',

      yearlyAccounts: [],
      
      rentalTotal: 0,
      eTotal: 0,
      wTotal: 0,
      gTotal: 0,
      oTotal: 0,
      pTotal: 0,
      totality: 0,
      
    }
  }

  async initiate(id){
    this.data.apartmentId = id
    let _year = new Date().getFullYear().toString()
    this.data.year = _year[1] ? _year : `0${_year}`

    await this._getYearlyAccountsByAptmid()

    this.update()
  }

  async _getYearlyAccountsByAptmid(){
    let list = await MAccounts.getYearlyAccountsByAptmid(this.data.apartmentId, this.data.year)
    
    this.data.yearlyAccounts = list

    /* map遍历，计算合计 */
    this.data.yearlyAccounts.map(item => {
      item.total = item.rentalBills+item.eBills+item.wBills+item.gBills+item.oBills+item.punishmentBills
    })

    this.data.yearlyAccounts.forEach(item => {
      this.data.rentalTotal += item.rentalBills
      this.data.eTotal += item.eBills
      this.data.wTotal += item.wBills
      this.data.gTotal += item.gBills
      this.data.oTotal += item.oBills
      this.data.pTotal += item.punishmentBills
      this.data.totality += item.total
      this.update()
    })
  }

  async year(year){
    this.data.year = year
    
    await this._getYearlyAccountsByAptmid()
    this.update()
  }
}

module.exports = new Accounts