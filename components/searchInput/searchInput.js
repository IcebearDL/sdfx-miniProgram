// components/searchBar/searchBar.js
Component({
  properties: {
    placeholder:String
  },
  data: {
    inputValue:'',
    ifClearButton:false
  },
  methods: {
    bindInput: function (e) {
      let inputValue = e.detail.value;
      //控制显示input的clear button
      if (inputValue !== ''){
        this.setData({
          ifClearButton:true
        })
      }else{
        this.setData({
          ifClearButton: false
        })
      }
      //双向绑定
      this.setData({ inputValue })
    },
    //点击搜索之后的选项
    bindconfirm:function(){
      let inputValue = this.data.inputValue;
      if (inputValue.trim() !== ''){
        //触发父函数
        this.triggerEvent('dispatchInput', { inputValue })
      }
    },
    clearInputValue: function () {
      this.setData({ 
        inputValue: '',
        ifClearButton: false 
      })
    }
  }
})
