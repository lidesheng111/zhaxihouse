const app = getApp()
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    room: Object,
    level: Number
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 显示价格目录
    prices: app.globalData.prices,

    // showMask: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showMask(e){ 
      let i = e.currentTarget.id
      this.setData({ ['prices['+i+']show']: true })
    },

    inputPrices(e){
      let value = (e.detail.value)*1
      this.triggerEvent('input', {value})
    },

    closeMask(e){ //由_mask组件触发
      let i = e.detail.index
      this.setData({ ['prices['+i+']show']: false}) 
    }, 

    submit(e){ //由_mask组件触发
      console.log(e)
      let i = e.detail.index
      this.triggerEvent('submit', e.detail)
      this.setData({ ['prices['+i+']show']: false}) 
    }, 

    // showMask(e){ RoomdetailsStore.showPriceMask(e.currentTarget.id)},
  }
})
