const {Store} = require('westore')
const MApproving = require('../models/approving')

class Approving extends Store {
  constructor(){
    super()

    this.data = {
      apartmentId: '',

      list: []
    }
  }

  initiate(id){
    this.data.apartmentId = id
    this.update()
    this.getUnvalidRooms()
    
  }

  /**
   * 获取待确认房间
   */
  async getUnvalidRooms(){
    const res = await MApproving.getUnvalidRooms(this.data.apartmentId)
    this.data.list = res.result.list
    this.update()
  }

  /**
   * 操作：确认入住
  */
  async approve(roomId, i){
    const res = await MApproving.approve(roomId)
    if(res.result.stats.updated === 1){
      wx.showToast({ title: '入住成功' })
      this.data.list[i].valid = true
      this.update()
    }
  }
}

module.exports = new Approving