
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    level: Number,
    who: Array,
    showMask: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showMask: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    TRPObtained(e){
      let index = e.currentTarget.dataset.index
      this.triggerEvent('update', {index})
    },

    edit(e){
      let index = e.currentTarget.dataset.index
      this.triggerEvent('index', {index})

      this.setData({showMask: true})  // 打开蒙版
    },

    checkout(e){
      wx.showModal({
        title: '此操作将删除该记录',
        content: '确定祂已离开？',
        success: res => {
          if(res.confirm){
            let index = e.currentTarget.dataset.index
            this.triggerEvent('leave', {index})
          } else {
            console.log('取消')
          }
        }
      })
      
    },

    closeMaskRM(){ this.setData({showMask: false}) }, // 关闭蒙版mask

    submitRM(){
      this.triggerEvent('submit')
    }
  }
})
