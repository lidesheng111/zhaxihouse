const {Store} = require('westore')

class Myspace extends Store {
  constructor(){
    super()

    this.data = {
      functions: [
        {
          text: '我是房东',
          icon: 'landlord',
          func: 'gotoLandlord'
        },
        {
          text: '我是租户',
          icon: 'zuhu',
          func: 'gotoZuhu'
        },
        {
          text: '办理入住',
          icon: 'luggage',
          func: 'gotoZuhu'
        }
      ]
    }
  }


}

module.exports = new Myspace