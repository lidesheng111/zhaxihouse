const Cloud = require('../src/util/cloudFunctions')

class Myroom {
  static async getMyroom(){
    return await Cloud.call({
      $url: 'getMyroom'
    })
  }
}

module.exports = Myroom