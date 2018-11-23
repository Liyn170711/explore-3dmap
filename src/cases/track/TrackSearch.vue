<!-- 轨迹查询测试  -->
<template>
  <div>
    <div id="cesiumer" class="cesiumContainer"></div>
    <button class="trackButton" @click="openSearchModal">轨迹</button>
    <button v-show="showTrack" class="clearTrackButton" @click="clearTrack">清除轨迹</button>
    <TrackModal></TrackModal>
  </div>
</template>

<script>
import 'cesium/Widgets/widgets.css'
import Cesium from 'cesium/Cesium'
import {mapState, mapMutations} from 'vuex'
import TrackModal from './TrackModal'

export default {
  name: 'TrackSearch',
  components: {TrackModal},
  data () {
    return {
      viewer: null, // 三维视图
      trackArr: null // 轨迹实体数组
    }
  },
  computed: {
    ...mapState({
          showTrack: ({ trackSearch }) => trackSearch.showTrack, // 显示绘制轨迹
          degreesArrayHeights: ({ trackSearch }) => trackSearch.degreesArrayHeights, // 轨迹绘制测试数据
    })
  },
  watch: {
    showTrack (newVal, oldVal) { // 监听轨迹是否显示
      if (newVal) {
        this.drawTrack(); // 绘制轨迹
      }
    }
  },
  mounted () {
    // 初始化三维视图
    this.viewer = new Cesium.Viewer('cesiumer', {
      timeline : false, // 不显示时间轴
      animation : false, // 不显示动画控制
      infoBox: false, // 不显示消息框
      selectionIndicator: false,// 不显示选择指示器
      shouldAnimate: true, // 显示动画
    });
  },
  methods: {
    ...mapMutations(['SET_SHOWMODAL_STATUS', 'SET_SHOWTRACK_STATUS']),
    openSearchModal () { // 打开查询弹出框
      this.SET_SHOWMODAL_STATUS(true);
    },
    clearTrack () { // 清除轨迹绘制
      if (this.trackArr && this.trackArr.length > 0) {
        for (const entity of this.trackArr) { // 遍历轨迹实体数组
            this.viewer.entities.remove(entity); // 移除实体
        }
        this.trackArr = null;
      }
      this.SET_SHOWTRACK_STATUS(false);
    },
    drawTrack () { // 绘制轨迹
      this.trackArr = new Array(); // 轨迹实体数组
      let lineEntity = this.viewer.entities.add({ // 添加轨迹线
          polyline : {
              positions: Cesium.Cartesian3.fromDegreesArrayHeights(this.degreesArrayHeights),
              width: 5,
              material: new Cesium.PolylineOutlineMaterialProperty({
                  color: Cesium.Color.ORANGE,
                  // outlineWidth : 2,
                  // outlineColor : Cesium.Color.BLACK,
              }),
              zIndex: 1001,
              clampToGround: true
          }
      });
      this.trackArr.push(lineEntity);
      let positions = lineEntity.polyline.positions._value;
      if (positions && positions.length > 0) {
        this.addTrackPoints(positions); // 添加轨迹点和label
        this.addStreamingLine(positions); // 添加动态线效果
      }
    },
    addTrackPoints (positions) { // 添加轨迹点和label
      for (let index = 0; index < positions.length; index++) { // 遍历位置数组， 添加轨迹点位置和针头图标
         let position = positions[index]; // 位置
         let text = 'point：' + (index+1); 
         //  添加点和label
         let pointEntity = this.viewer.entities.add({
             position : position,
             point : {
                 pixelSize: 5,
                 color: Cesium.Color.RED,
                 outlineColor: Cesium.Color.WHITE,
                 outlineWidth: 2,
                 zIndex: 1002
             },
             label : {
                 text: text,
                 font: '14pt monospace',
                 style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                 outlineWidth: 2,
                 verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                 pixelOffset: new Cesium.Cartesian2(0, -9),
                 zIndex: 1003
             }
         })
         this.trackArr.push(pointEntity);
         //  添加针头索引图标
         let pinBuilder = new Cesium.PinBuilder(); // 构造针头工厂
         let pinEntity = this.viewer.entities.add({
             name : text,
             position : position,
             billboard : {
                 image : pinBuilder.fromText((index+1), Cesium.Color.ROYALBLUE, 72).toDataURL(),
                 verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
                 zIndex: 1001
             }
         });
         this.trackArr.push(pinEntity);
      }
      this.viewer.zoomTo(this.viewer.entities, new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-90)));
    },
    addStreamingLine (positions) { // 添加动态线效果
      let animateTime = 5000; // 动画持续时间为5秒
      let start = 0; // 开始时间
      for (let i = 0; i < 9; i++) { // 遍历9次，颜色透明度递增的线
        let streamLineEntity = this.viewer.entities.add({
            polyline : {
                positions : new Cesium.CallbackProperty((time, result) => {
                    var end = Cesium.JulianDate.toDate(time).getTime();
                    if (start == 0) {
                        start = end;
                    }
                    var index = ((end - start) % animateTime)/animateTime * positions.length; // index可能是小数，可根据情况进行取整
                    console.log("位置索引: ", index);
                    return positions.slice(index+i-1,index+i+1); // 选取临近的两点组成线段的位置
                }, false),
                width : 5,
                material : Cesium.Color.WHITE.withAlpha(0.1*i+0.1), // 设置颜色
                zIndex: 1005,
                clampToGround : true,
            }
        })
        this.trackArr.push(streamLineEntity);
      }
    }

  }
}
</script>

<style scoped>
    .cesiumContainer {
        position: absolute;
        width: 100%;
        height: 100%;
    }
    .trackButton {
        position: absolute;
        top: 10px;
        left: 10px;
    }
    .clearTrackButton {
        position: absolute;
        top: 40px;
        left: 10px;
    }
</style>