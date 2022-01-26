const Cloud = require('../src/util/cloudFunctions')

class Mainpage {
  static async getMyApartments(){
    return await Cloud.call({
      $url: 'getMyApartments'
    })
  }
}

module.exports = Mainpage
