<template>
  <div>
    <div id="cesiumer" style="position: absolute; width: 100%; height: 100%;"></div>
    <popup v-show="popupShow" :popupData="popupData" @closePopup="closePopup" height="130"></popup>
  </div>
</template>

<script>
import 'cesium/Widgets/widgets.css'
import Cesium from 'cesium/Cesium'
import CesiumViewTools from '../utils/CesiumViewTool'
import popup from './common/Popup'

export default {
  name: 'ApplyPopup',
  components: {popup},
  data () {
    return {
      viewer: null, // 三维视图
      popupShow: false, // 是否显示弹出框
      popupData: null, // 传入弹出层组件的数据
      selectedEntity: null, // 选择的实体
      slectedEntityCo: null, // 选择实体的Cartesian3世界坐标
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
    this.addPins(this.viewer); // 添加针头图标
    this.regListen(this.viewer); // 注册事件的监听

  },
  methods: {
    addPins (viewer) { //  添加针图标
      var pinBuilder = new Cesium.PinBuilder(); // 构造针头工厂
      // 添加蓝色无内容针头
      var bluePin = viewer.entities.add({
          name : 'Blank blue pin',
          position : Cesium.Cartesian3.fromDegrees(-75.170726, 39.9208667),
          billboard : { // 广告牌
              image : pinBuilder.fromColor(Cesium.Color.ROYALBLUE, 48).toDataURL(),
              verticalOrigin : Cesium.VerticalOrigin.BOTTOM
          }
      });
      // 添加问题针头
      var questionPin = viewer.entities.add({
          name : 'Question mark',
          position : Cesium.Cartesian3.fromDegrees(-75.1698529, 39.9220071),
          billboard : {
              image : pinBuilder.fromText('?', Cesium.Color.BLACK, 48).toDataURL(),
              verticalOrigin : Cesium.VerticalOrigin.BOTTOM
          }
      });
      // 添加绿色商店针头，提供图片地址
      var url = Cesium.buildModuleUrl('Assets/Textures/maki/grocery.png');
      var groceryPin = Cesium.when(pinBuilder.fromUrl(url, Cesium.Color.GREEN, 48), function(canvas) {
          return viewer.entities.add({
              name : 'Grocery store',
              position : Cesium.Cartesian3.fromDegrees(-75.1705217, 39.921786),
              billboard : {
                  image : canvas.toDataURL(),
                  verticalOrigin : Cesium.VerticalOrigin.BOTTOM
              }
          });
      });

      //添加红色医院针头图标（图标从图标集合中获取），Create a red pin representing a hospital from the maki icon set.
      var hospitalPin = Cesium.when(pinBuilder.fromMakiIconId('hospital', Cesium.Color.RED, 48), function(canvas) {
          return viewer.entities.add({
              name : 'Hospital',
              position : Cesium.Cartesian3.fromDegrees(-75.1698606, 39.9211275),
              billboard : {
                  image : canvas.toDataURL(),
                  verticalOrigin : Cesium.VerticalOrigin.BOTTOM
              }
          });
      });

      //视图缩放至图标所在的位置，Since some of the pins are created asynchronously, wait for them all to load before zooming/
      Cesium.when.all([bluePin, questionPin, groceryPin, hospitalPin], function(pins){
          viewer.zoomTo(pins);
      });
    },
    regListen (viewer) { // 注册事件的监听
        var handler3D = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        var scene = viewer.scene;
        //绑定鼠标单击
        handler3D.setInputAction(this.handleLeftClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //  监听实体选择改变事件
        // this.viewer.selectedEntityChanged.addEventListener(this.handleViewSlectedEntityChanged);
        // // 监听左键抬起事件
        // handler3D.setInputAction( (movement) => {
        //     this.popupShow = false;
        // }, Cesium.ScreenSpaceEventType.LEFT_UP);
        // // 监听鼠标滚动事件
        // handler3D.setInputAction( (movement) => {
        //     this.popupShow = false;
        // }, Cesium.ScreenSpaceEventType.WHEEL);
        // // 监听鼠标滚轮点击事件
        // handler3D.setInputAction( (movement) => {
        //     this.popupShow = false;
        // }, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);
        // // 监听相机移动开始事件
        // this.viewer.camera.moveStart.addEventListener(this.handleCameraMove); 
        // // 监听相机移动结束事件
        this.viewer.camera.moveEnd.addEventListener(this.handleCameraMove); 
        // 监听视图场景请求更新或重新渲染之前事件，（可用于实时监听地图移动）
        this.viewer.scene.postUpdate.addEventListener(this.handleScenePostUpdate); 
    },
    handleLeftClick (movement) { // 鼠标左键点击事件处理
      var picked = this.viewer.scene.pick(movement.position);
      if (picked && picked.id) {
            var id = Cesium.defaultValue(picked.id, picked.primitive.id);
            if (id instanceof Cesium.Entity) {
                // console.log('实体位置：',cartesian3Co.toString());
                this.selectedEntity = id; // 设置选择的实体
                this.slectedEntityCo = cartesian3Co; // 设置选择的实体的Cartesian3坐标
                this.popupShow = true;   
                var cartesian3Co = id.position.getValue(Cesium.JulianDate.now());
                var ellipsoid = this.viewer.scene.globe.ellipsoid;
                var cartographic = ellipsoid.cartesianToCartographic(cartesian3Co);
                var lat = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
                var lng = Cesium.Math.toDegrees(cartographic.longitude); // 经度
                var alt = cartographic.height; // 高度
                // console.log("实体当前位置的经纬度坐标：", lat, lng, alt);
                var name = id.name;
                var contentHtml = '<table><tbody>';       
                contentHtml += '<tr><td>名称 :</th><td> '+name+' </td></tr>'; 
                contentHtml += '<tr><td>经度 :</th><td> '+lng.toFixed(6)+' </td></tr>'; 
                contentHtml += '<tr><td>纬度 :</th><td> '+lat.toFixed(6)+' </td></tr>'; 
                contentHtml += '<tr><td>高度 :</th><td> '+alt.toFixed(6)+' </td></tr>'; 
                contentHtml += '</tbody></table>';
                this.popupData = { screenCo: movement.position, contentHtml: contentHtml, title: name};
            }
      }else {
        //   this.closePopup(); // 关闭弹出层
      }
    },
    handleCameraMove () { // 相机移动处理事件
        if (this.selectedEntity) {
            var cartesian3Co = this.selectedEntity.position.getValue(Cesium.JulianDate.now());
            var ellipsoid = this.viewer.scene.globe.ellipsoid;
            var cartographic = ellipsoid.cartesianToCartographic(cartesian3Co);
            var lat = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
            var lng = Cesium.Math.toDegrees(cartographic.longitude); // 经度
            var alt = cartographic.height; // 高度
            console.log("实体当前位置的经纬度坐标：", lat, lng, alt);
            var viewExtent = CesiumViewTools.getViewExtent(this.viewer);
            console.log("当前视图范围：", viewExtent);
            var viewCenter = CesiumViewTools.getViewerCenter(this.viewer);
            console.log("当前视图中心：", viewCenter);
            var flag = false;
            if (viewExtent.minLon<=lng &&  viewExtent.maxLon>=lng && viewExtent.minLat<=lat &&  viewExtent.maxLat>=lat) {
                flag = true;
            }
            console.log("选择实体是否在当前范围之内：", flag);
        }
    },
    handleViewSlectedEntityChanged (entity) { // 视图选择实体改变事件
        console.log("handleViewSlectedEntityChanged 实体：", entity);
    },
    handleScenePostUpdate (scene,time) { // 地图移动处理
        if (this.selectedEntity) {
            var cartesian3Co = this.selectedEntity.position.getValue(time);
            // console.log("实体当前位置的Cartesian3世界坐标：", cartesian3Co.toString());
            var cartesian2Co = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, cartesian3Co); // 世界坐标转换为屏幕坐标
            // console.log("实体当前位置的cartesian2屏幕坐标：", cartesian2Co.toString());
            if (this.popupData) {
                this.popupData.screenCo = cartesian2Co; // 更新实体位置的屏幕坐标
            }
        }
    },
    closePopup () { // 关闭弹出层
        this.popupShow = false;
        this.selectedEntity = null;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#cesiumer {
  position: absolute; width: 100%; height: 100%;
}
</style>
