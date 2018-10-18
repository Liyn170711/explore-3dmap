<template>
  <div>
    <div id="cesiumer" style="position: absolute; width: 100%; height: 100%;"></div>
    <div class="oprationTips">
        <table class="infoPanel">
            <tbody>
                <tr>
                    <td>Click on the 3D window then use the keyboard to change settings.</td>
                </tr>
                <tr>
                    <td>Heading: <input id="headingRange" type="range" min="0" max="360" step="1" v-model="headingDegrees"> <span>{{ headingDegrees }}</span>°</td>
                </tr>
                <tr>
                    <td>← to left/→ to right</td>
                </tr>
                <tr>
                    <td>Pitch: <input id="pitchRange" type="range" min="0" max="360" step="1" v-model="pitchDegrees"> <span>{{ pitchDegrees }}</span>°</td>
                </tr>
                <tr>
                    <td>↑ to up/↓ to down</td>
                </tr>
                <tr>
                    <td>roll: <input id="rollRange" type="range" min="0" max="360" step="1" v-model="rollDegrees"> <span>{{ rollDegrees }}</span>°</td>
                </tr>
                <tr>
                    <td>← + ⇧ left/→ + ⇧ right</td>
                </tr>
            </tbody>
        </table>
     </div>
  </div>
</template>

<script>
import 'cesium/Widgets/widgets.css'
import Cesium from 'cesium/Cesium'

export default {
  name: 'ModelRoration',
  data () {
    return {
      viewer: null, // 三维视图
      hpRoll: new Cesium.HeadingPitchRoll(), // 构造朝向俯仰角滚动对象（用于控制模型的旋转）
      hpRollZero: new Cesium.HeadingPitchRoll(), // 控制3D模型参考坐标系的旋转的朝向、俯仰和滚动角度对象
      deltaRadians: Cesium.Math.toRadians(3.0), // 弧度变化量
      planePrimitive: null, // 飞机3D模型要素
      position: Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 5000.0), // 位置对象
      fixedFrameTransform: Cesium.Transforms.eastNorthUpToFixedFrame // 设置局部参考坐标系：（x 轴：north， y 轴： west， z 轴：up）
    }
  },
  computed: {
    headingDegrees: { // 朝向角度
      get () { // 获取值
         return Cesium.Math.toDegrees(this.hpRoll.heading).toFixed(1);
      },
      set (newVal) { // 设置值
        this.hpRoll.heading = Cesium.Math.toRadians(newVal);
      } 
    },
    pitchDegrees: { // 俯仰角度
      get () {
        return Cesium.Math.toDegrees(this.hpRoll.pitch).toFixed(1);
      },
      set (newVal) {
        this.hpRoll.pitch = Cesium.Math.toRadians(newVal);
      }
    },
    rollDegrees: { // 滚动角度
      get () {
        return Cesium.Math.toDegrees(this.hpRoll.roll).toFixed(1);
      },
      set (newVal) {
        this.hpRoll.roll = Cesium.Math.toRadians(newVal);
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
      shouldAnimate : true
    });
    this.add3DModel(); // 添加3D模型
    this.regListeners(); // 注册事件监听
  },
  methods: {
    /**
    * 添加3D模型
    */
    add3DModel () {
        this.planePrimitive = this.viewer.scene.primitives.add(Cesium.Model.fromGltf({
            url : 'static/SampleData/models/CesiumAir/Cesium_Air.glb',
            modelMatrix : Cesium.Transforms.headingPitchRollToFixedFrame(this.position, this.hpRoll, Cesium.Ellipsoid.WGS84, this.fixedFrameTransform),
            minimumPixelSize : 128
        }));
        // 添加显示模型的参考坐标系
        var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(this.position, this.hpRollZero, Cesium.Ellipsoid.WGS84, this.fixedFrameTransform); // 构造参考坐标系矩阵
        this.viewer.scene.primitives.add(new Cesium.DebugModelMatrixPrimitive({ // 添加显示参考坐标系
            modelMatrix : modelMatrix, // 参考坐标系模型矩阵
            length : 300.0, // 坐标轴的长度
            width : 2.0 // 坐标轴的宽度
        }));
        // 初始化相机位置
        this.planePrimitive.readyPromise.then((model) => {
             // Play and loop all animations at half-speed
            model.activeAnimations.addAll({
                speedup : 0.5, // 加速度
                loop : Cesium.ModelAnimationLoop.REPEAT // 循环方式
            });
            // Zoom to model
            var r = 2.0 * Math.max(model.boundingSphere.radius, this.viewer.camera.frustum.near);
            var hpRange = new Cesium.HeadingPitchRange(); // 朝向角度、俯仰角度、范围（距离参考坐标系原点的位置）
            var center = new Cesium.Cartesian3(); // 构造中心点
            this.viewer.scene.screenSpaceCameraController.minimumZoomDistance = r * 0.5;
            // Cesium.Matrix4.multiplyByPoint(matrix:转换矩阵, cartesian：转换坐标, result：存储转换结果的对象) 根据转换矩阵计算坐标转换 
            Cesium.Matrix4.multiplyByPoint(model.modelMatrix, model.boundingSphere.center, center); // 设置中心点位置
            var heading = Cesium.Math.toRadians(30.0);
            var pitch = Cesium.Math.toRadians(-45.0);
            hpRange.heading = heading;
            hpRange.pitch = pitch;
            hpRange.range = r * 100.0; 
            this.viewer.camera.lookAt(center, hpRange); // 设置相机
        });
    },

    /**
    * 注册事件监听
    */
    regListeners () {
        document.addEventListener('keydown', this.handleKeyDown); // 监听鼠标按下事件
        // 监听场景更新之前
        this.viewer.scene.preUpdate.addEventListener((scene, time) => {
            Cesium.Transforms.headingPitchRollToFixedFrame(this.position, this.hpRoll, Cesium.Ellipsoid.WGS84, this.fixedFrameTransform, this.planePrimitive.modelMatrix);
        });
    },

    /**
    * 鼠标按下处理
    */
    handleKeyDown (e) {
        switch (e.keyCode) {
            case 40: // down
                // pitch down
                this.hpRoll.pitch -= this.deltaRadians;
                if (this.hpRoll.pitch < -Cesium.Math.TWO_PI) {
                    this.hpRoll.pitch += Cesium.Math.TWO_PI;
                }
                this.pitchDegrees = Cesium.Math.toDegrees(this.hpRoll.pitch).toFixed(1);
                break;
            case 38: // up
                // pitch up
                this.hpRoll.pitch += this.deltaRadians;
                if (this.hpRoll.pitch > Cesium.Math.TWO_PI) {
                  this.hpRoll.pitch -= Cesium.Math.TWO_PI;
                }
                this.pitchDegrees = Cesium.Math.toDegrees(this.hpRoll.pitch).toFixed(1);
                break;
            case 39: // right
                if (e.shiftKey) {
                    // roll right
                    this.hpRoll.roll += this.deltaRadians;
                    if (this.hpRoll.roll > Cesium.Math.TWO_PI) {
                        this.hpRoll.roll -= Cesium.Math.TWO_PI;
                    }
                    this.rollDegrees = Cesium.Math.toDegrees(this.hpRoll.roll).toFixed(1);
                } else {
                    // turn right
                    this.hpRoll.heading += this.deltaRadians;
                    if (this.hpRoll.heading > Cesium.Math.TWO_PI) {
                        this.hpRoll.heading -= Cesium.Math.TWO_PI;
                    }
                    this.headingDegrees = Cesium.Math.toDegrees(this.hpRoll.heading).toFixed(1);
                }
                break;
            case 37: //left
                if (e.shiftKey) {
                    // roll left until
                    this.hpRoll.roll -= this.deltaRadians;
                    if (this.hpRoll.roll < 0.0) {
                        this.hpRoll.roll += Cesium.Math.TWO_PI;
                    }
                    this.rollDegrees = Cesium.Math.toDegrees(this.hpRoll.roll).toFixed(1);
                } else {
                    // turn left
                    this.hpRoll.heading -= this.deltaRadians;
                    if (this.hpRoll.heading < 0.0) {
                        this.hpRoll.heading += Cesium.Math.TWO_PI;
                    }
                    this.headingDegrees = Cesium.Math.toDegrees(this.hpRoll.heading).toFixed(1);
                }
                break;
            default:
        }
    },

    /**
    * 朝向角度改变处理
    */
    headingRangeChange (target) {
        console.log("Heading：", target.value);
        this.hpRoll.heading = Cesium.Math.toRadians(parseFloat(target.value));
    },

    /**
    * 俯仰角度改变处理
    */
    pitchRangeChange (target) {
        console.log("pitch：", target.value);
        this.hpRoll.pitch = Cesium.Math.toRadians(parseFloat(target.value));
    },

    /**
    * 滚动角度改变处理
    */
    rollRangeChange (target) {
        console.log("roll：", target.value);
        this.hpRoll.roll = Cesium.Math.toRadians(parseFloat(target.value));
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#cesiumer {
  position: absolute; width: 100%; height: 100%;
}
.oprationTips {
  position: absolute;
  left: 5px;
  top: 5px;
  width: 400px;
  height: auto;
  border-radius: 5px;
  background: transparent;
  color: #fff;
  padding: 15px;
  text-align: left;
}
.infoPanel {
  background: rgba(42, 42, 42, 0.8);
  padding: 4px;
  border: 1px solid #444;
  border-radius: 4px;
}
</style>
