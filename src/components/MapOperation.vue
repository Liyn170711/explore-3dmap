<!-- 3D 地图基本操作
    1.显示地图比例尺
    2.显示指北针，通过罗盘控制三维视角
    3.通过按钮控制放缩
 -->
<template>
  <div>
    <div id="cesiumer" style="position: absolute; width: 100%; height: 100%;"></div>
  </div>
</template>

<script>

export default {
  name: 'MapOperation',
  data () {
    return {
      viewer: null, // 三维视图
    }
  },
  mounted () {
    // 初始化三维视图
    this.viewer = new Cesium.Viewer('cesiumer', {
      timeline : false, // 不显示时间轴
      animation : false, // 不显示动画控制
      infoBox: false, // 不显示消息框
      selectionIndicator: false,// 不显示选择指示器
    });
    this.viewer.extend(Cesium.viewerCesiumNavigationMixin, {enableZoomControls: false});
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
