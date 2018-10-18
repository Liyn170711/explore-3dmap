<template>
  <div>
    <div id="cesiumer" style="position: absolute; width: 100%; height: 100%;"></div>
    <div id="popup" class="popup">
      <div class="popup_top">
        <span class="popup_top_title"></span>
        <span class="popup_top_close">x</span>
      </div>
      <div id="popup_content" class="popup_content"></div>
    </div>
  </div>
</template>

<script>
import 'cesium/Widgets/widgets.css'
import Cesium from 'cesium/Cesium'

export default {
  name: 'HelloWorld2',
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
    this.addPins(this.viewer); // 添加针头图标
    this.regPopup(this.viewer); // 注册弹出框

  },
  methods: {
    testLoadWMS () {
      // 测试加载wms
      var provider = new Cesium.WebMapServiceImageryProvider({ 
                url: '/wmsapi',
                layers: 'nurc:Arc_Sample',
                parameters: {
                    service : 'WMS',
                    format: 'image/png',
                    transparent: true,
                },
                baseLayerPicker:false  // 去掉自带的图层选择器
            });
      this.viewer.imageryLayers.addImageryProvider(provider);
    },
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
    regPopup (viewer) { // 注册弹出框
      var handler3D = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      var scene = viewer.scene;
      //绑定鼠标单击
      handler3D.setInputAction(function (movement) {
          var pick = scene.pick(movement.position);
          if (pick && pick.id) {
              $('#popup').show();
              $(".popup_top_title").text(pick.id._name);
              var content = '<table><tbody><tr><td>名称 :</th><td> '+pick.id._name+' </td></tr></tbody></table>';                 
              var obj = { position: movement.position, content: content };
              infoWindow(obj);
              function infoWindow(obj) {
                  var picked = scene.pick(obj.position);
                  if (Cesium.defined(picked)) {
                      var id = Cesium.defaultValue(picked.id, picked.primitive.id);
                      if (id instanceof Cesium.Entity) {
                          $(".popup_content").show();
                          $('#popup_content').empty();
                          $('#popup_content').append(obj.content);
                          function positionPopUp(c) {
                              var x = c.x - ($('#popup').width()) / 2;
                              var y = c.y - ($('#popup').height()) - 30;
                              $('#popup').css('transform', 'translate3d(' + x + 'px, ' + y + 'px, 0)');
                          }
                          var c = new Cesium.Cartesian2(obj.position.x, obj.position.y);
                          $('#popup').show();
                          positionPopUp(c); // Initial position
                          $('.popup_top_close').click(function () {
                              $('#popup').hide();
                              $('#popup_content').empty();
                              $(".popup_content").hide();
                              return false;
                          });
                          return id;
                      }
                  }
              }
          }
          else {
            $('#popup').hide();
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //绑定地图移动
        handler3D.setInputAction(function (movement) {
            $('#trackPopUp').hide();
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
        //绑定地图缩放
        handler3D.setInputAction(function (movement) {
            $('#trackPopUp').hide();
        }, Cesium.ScreenSpaceEventType.WHEEL);
        //绑定滚轮点击事件
        handler3D.setInputAction(function (movement) {
            $('#trackPopUp').hide();
        }, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/*--------------------------气泡弹窗Start---------------------------*/
/*leaflet风格气泡窗口样式模板*/
.popup {
  display: none;
  position: absolute;
	background: #88b7d5;
	border: 2px solid #c2e1f5;
  padding: 0;
  width: 200px;
  height: 100px;
  border-radius: 6px;
}
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

.popup:after {
	border-color: rgba(136, 183, 213, 0);
	border-top-color: #88b7d5;
	border-width: 12px;
	margin-left: -12px;
}
.popup:before {
	border-color: rgba(194, 225, 245, 0);
	border-top-color: #c2e1f5;
	border-width: 15px;
	margin-left: -15px;
}

.popup_top {
  height: 25px;
  background: #00cccc;
}

.popup_top_title {
  height: 25px;
  line-height: 25px;
  margin-left: 10px;
  float: left;
  text-align: left;
}

.popup_top_close {
  height: 15px;
  margin: -2px 2px 0 0;
  float: right;
  text-align: right;
  font-weight: bold;
}
.popup-content {
    margin: 5px 20px;
}
.popup-content div{
    text-align: center;
}
 
.popup-content div {
    font-size: 18px;
}

.popup-content table {
    margin-top: 15px;
}

.popup-content table tr {
    height: 25px;
}
/*--------------------------气泡弹窗END---------------------------*/

</style>
