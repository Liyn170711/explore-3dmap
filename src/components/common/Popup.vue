<template>
  <div>
    <div class="popup" :style="popupStyle">
      <div class="popup_top">
        <span class="popup_top_title">{{ title }}</span>
        <span class="popup_top_close" @click="closePopup">x</span>
      </div>
      <div class="popup_content" v-html="contentHtml"></div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Popup',
  data () {
      return {
          popuper: null
      }
  },
  props: { // 父组件传入的数据
    popupData: { // 弹出框数据
        type: Object
    },
    width: {
        type: String,
        default: 'auto'

    },
    height: {
        type: String,
        default: 'auto'

    }
  },
  computed: {
      title () {
        return this.popupData ? this.popupData.title : '';
      },
      contentHtml () {
        return this.popupData ? this.popupData.contentHtml : '';
      },
      popupStyle () {
        var style = {};
        if (this.width) {
            style.width = this.width;
        }
        if (this.height) {
            style.height = this.height;
        }
        return style;
      }
  },
  watch: {
    popupData: {
        handler(newVal, oldVal) {
            if (newVal && newVal.screenCo) { // 有位置数据时
                this.popUpPosition(newVal.screenCo); // 移动弹出框的位置
            }
        },
        deep: true
    }
  },
  mounted () { // 组件挂载完成处理函数
    this.popuper = this.$el.children[0];
    if (this.popupData && this.popupData.screenCo) { // 有位置数据时
        this.popUpPosition(this.popupData.screenCo); // 移动弹出框的位置
    }
  },
  methods: {
    popUpPosition(screenCo) { // 计算弹出框的位置，传入参数屏幕坐标
        if (this.popuper) {
            var x = screenCo.x - this.popuper.clientWidth / 2;
            var y = screenCo.y - this.popuper.clientHeight - 30;
            this.popuper.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
        }
    },
    closePopup() {
        this.$emit('closePopup')
    }
  }
}
</script>

<style scoped>
/* 气泡容器样式 */
.popup {
    position: absolute;
    background: #88b7d5;
    border: 1px solid #c2e1f5;
    padding: 0;
    border-radius: 5px;
}
/* 气泡容器渲染前后的公用样式 */
.popup:after, .popup:before {
	top: 100%;
	left: 50%;
	border: solid transparent;
	content: " ";
	height: 0;
	width: 0;
	position: absolute;
	pointer-events: none;
}
/* 气泡容器渲染后的样式 */
.popup:after {
	border-color: rgba(136, 183, 213, 0);
	border-top-color: #88b7d5;
	border-width: 11px;
	margin-left: -11px;
}
/* 气泡容器渲染前的样式 */
.popup:before {
	border-color: rgba(194, 225, 245, 0);
	border-top-color: #c2e1f5;
	border-width: 12px;
	margin-left: -12px;
}
/* 气泡顶部的样式 */
.popup_top {
    height: 25px;
    background: #00cccc;
}
/* 气泡标题的样式 */
.popup_top_title {
    height: 25px;
    line-height: 25px;
    margin-left: 10px;
    float: left;
    text-align: left;
}
/* 气泡关闭按钮的样式 */
.popup_top_close {
    height: 15px;
    margin: -2px 2px 0 0;
    float: right;
    text-align: right;
    font-weight: bold;
}
/* 气泡内容的样式 */
.popup-content {
    margin: 5px 20px;
}
/* 气泡表格的样式 */
.popup-content table {
    margin-top: 15px;
}
/* 气泡表格行的样式 */
.popup-content table tr {
    height: 25px;
}
</style>
