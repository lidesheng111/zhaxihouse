// components/_picker/_mask.js
Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    index: String,
    key: String
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    submit(){ this.triggerEvent('submit', {
      key: this.properties.key, 
      index: this.properties.index
    })},
    cancel(){ this.triggerEvent('close', {index: this.properties.index})}
  }
})
