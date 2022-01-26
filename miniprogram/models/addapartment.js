const Cloud = require('../src/util/cloudFunctions')

class AddApartment {
  static async addApartment(data){
    return await Cloud.call({
      $url: 'addapartment',
      data
    })
  }
}

module.exports = AddApartment