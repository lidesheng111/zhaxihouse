// components/_picker/_picker.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    mode: {
      type: String,
      value: 'selector'
    },
    range: Array,
    label: String,
    value: String,
    noline: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    value: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    change(e){
      let value = this.properties.range[e.detail.value]
      this.setData({ value })
      this.triggerEvent('picker', value)
    }
  }
})
