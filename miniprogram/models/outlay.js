const Cloud = require('../src/util/cloudFunctions')

class Outlay {
  /* 添加公寓支出 */
  static async addExpenses(data){
    const res = await Cloud.call({
      $url: 'addExpenses',
      ...data
    })

    return res
  }

  /* 获取月度支出 */
  static async getMonthlyOutlay(data){
    const res = await Cloud.call({
      $url: 'getMonthlyOutlay',
      ...data
    })
    console.log(res)
    return res
  }

  /* 获取年度支出 */

  static async getYearlyOutlay(data){
    const res = await Cloud.call({
      $url: 'getYearlyOutlay',
      ...data
    })
    console.log(res)
    return res
  }
}

module.exports = Outlay