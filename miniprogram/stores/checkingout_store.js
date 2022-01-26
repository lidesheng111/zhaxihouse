const {Store} = require('westore')
const UserStore = require('../stores/user_store')
const MCheckingout = require('../models/checkingout')

class Checkingout extends Store {
  constructor(){
    super()

    this.data = {
      apartmentId: '',
      activeKey: '0',
      list: [], // 退房房间列表

      roomId: '',
      roomNo: '',
      deposit: 0,
      totalArrears: 0,
      depositDocked: 0,
      depositLeft: 0,
      todos: [],
      todosChecked: [],
      todosPercent: 0,
    }
  }

  async initiate(id){
    const level = UserStore.data.user.userInfo.level
    this.data.level = level

    if(level === 3 || level === 4){ // 租户查看
      this.data.activeKey = '1'
    }

    this.data.apartmentId = id
    this.update()

    await this.getLeftRooms()
    this._afterChoosed('0')
  }

  async getLeftRooms(){
    const res = await MCheckingout.getLeftRooms(this.data.apartmentId)
    if(res.result.list){
      this.data.list = res.result.list
    }
    this.update()
  }

  /**
   * 选中房间
  */
  choose(i){
    this.data.activeKey = '1'
    this._afterChoosed(i)
  }

  _afterChoosed(i){
    this.data.totalArrears = 0 // 先清空
    this.data.todosChecked = [] // 先清空

    if(this.data.list.length === 0) {return} // list为空
    let room = this.data.list[i]

    /* 计算总欠费 */
    room.monthlyBills.forEach(item => {
      if(!item.allPaid){
        this.data.totalArrears += item.arrears
      }
    })

    this.data.roomId = room._id
    this.data.roomNo = room.roomNo
    this.data.deposit = room.depositInfo.deposit
    this.data.todos = room.checkoutTodos
    this.data.depositDocked = room.depositDocked

    /* 计算剩余押金 */
    this._calculateDepositLefted()

    /* 检查todos的checked, 方便计算进度百分比 */
    this.data.todos.forEach((item, key) => {
      if(item.checked){
        this.data.todosChecked.push(key+'')
      }
    })

    this._calculatePercent()
    this.update()
  }

  _calculateDepositLefted(){
    this.data.depositLeft = this.data.deposit - this.data.totalArrears - this.data.depositDocked
  }

  _calculatePercent(){
    const denominator = this.data.todos.length
    const numerator = this.data.todosChecked.length
    let float = numerator/denominator
    float = Math.floor(float*100)
    this.data.todosPercent = float
  }

  /**
   * 押金扣减
  */
  async depositDocked(value){
    const res = await MCheckingout.updateDepositDocked(this.data.roomId, value)
    if(res.result.stats.updated === 1){
      wx.showToast({ title: '操作成功' })
      this.data.depositDocked = value
      this._calculateDepositLefted()
      this.update()
    }
  }

  /**
   * todos 更新
  */
  async updateTodos(allChecked){
    this.data.todosChecked = allChecked
    /* 进度手续勾选 */
    let todos = this.data.todos
    todos.forEach((item, key) => {
      item.checked = false
      allChecked.forEach(_item => {
        if(key == _item){
          item.checked = true
        } 
      })
    })

    const res = await MCheckingout.updateTodos(this.data.roomId, this.data.todos)
    if(res.result.stats.updated === 1){
      wx.showToast({ duration: 500 })
    }

    /* 计算退房进度百分比 */
    this._calculatePercent()

    this.update()
  }

  /**
   * 完全退房
  */
  async completelyCheckout(){
    const res = await MCheckingout.completelyCheckout(this.data.list[0])
    if(res.result.code === 200){
      wx.showToast({
        title: '退房成功',
      })
      wx.navigateBack({
        delta: 1,
      })
    }
  }
}

module.exports = new Checkingout