const Cloud = require('../src/util/cloudFunctions')

class Accounts {
  async getYearlyAccountsByAptmid(id, year){
    console.log(id, year)
    const res = await Cloud.call({
      $url: 'getYearlyAccountsByAptmid',
      apartmentId: id,
      year,
    })
    wx.setStorageSync('accounts', res.result.data)
    console.log(res, 'list')
    return res.result.data
  }
}

module.exports = new Accounts()