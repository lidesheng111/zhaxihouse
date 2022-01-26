const MRoomlist = require('../models/roomlist')
const {Store} = require('westore')

/* 
* 1.上个页面传来的roomNumbers 初始化【楼层-房间结构】
* 2.用传来的公寓id，获取公寓对应的租客
*/
class RoomlistStore extends Store{
  constructor(){
    super()

    this.data = {
      _roomlist: [],
      _roomNumbers: [],

      _floor: 0,
      _apartment: []
    }
  }

  initiateFloor(roomNumbers){
    this.data._roomNumbers = roomNumbers

    /* 
    * 第一步
    * 
    * 根据roomNumbers数组长度 --> 得到楼层 --> 根据楼层数，循环，以初始化【楼层结构】：_apartment: [{}, {}, {}, ...]
    * 注意，不能是这样的结构：_apartment: [[], [], [], ...]
    */
    let len = roomNumbers.length
    for(let i=0;i<len;i++){
      this.data._apartment.push({})
    }

    /* 
    * 第二步
    *
    * 将roomNumbers中的房间，注入上面得到的【楼层结构】_apartment
    * 得到如下结构：
    * _apartment: [{101: {roomNo: 101}, 102: {roomNo: 102}, ...}, {201: {roomNo: 201}, 202: {roomNo: 202}, ...}]
    * 
    * {roomNo: 201}结构的作用：页面list循环时，就算是空房间，也能显示房间号
    */
    roomNumbers.forEach((floor,key) => {
      floor.forEach(room => {
        // [key]后面不加[room]，循环只会得到：_apartment: [{roomNo: 109}, {roomNo: 210}, ...]
        this.data._apartment[key][room] = {roomNo: room} 
      })
    })

    this.update()
  }

  async getRoomlist(id){
    const res = await MRoomlist.getRoomlist(id)
    console.log(res)

    res.forEach( item => {
       // [item.floor-1]:楼层序号  [item.roomNo]：key值
      this.data._apartment[item.floor-1][item.roomNo] = item
    })

    this.update()
  }

  // wxs 控制楼层切换
  switchFloor(direction){
    if( direction === -1 && this.data._floor > 0){
      this.data._floor--
    }else if( direction === 1 && this.data._floor < 3 ){
      this.data._floor++
    }
    this.update()
  }
}

module.exports = new RoomlistStore
