const BABYLON = window.BABYLON

export default class {
  /**
   * Create the scene
   * @param {CANVAS} $canvas The HTML Canvas to contain our Babylon (and PoseNet) scene
   */
  constructor ($canvas) {
    this.$canvas = $canvas
    this.plugins = []
    this.engine = new BABYLON.Engine($canvas, true)
    this.scene = new BABYLON.Scene(this.engine)
    this.head = null
    this.camera = null

    this.createScene()
    this.startLoop()
  }

  /**
   * Creates the scene
   */
  createScene () {
    this.camera = new BABYLON.ArcRotateCamera('Camera', Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0,0,5), this.scene)
    
    BABYLON.SceneLoader.Append('./3d/', 'scene.gltf', this.scene, scene => {
      this.head = scene.meshes[0]
      this.head.rotationQuaternion = null
      this.head.rotation.y = Math.PI
      scene.createDefaultCameraOrLight(true, true, false)
      scene.activeCamera.alpha += Math.PI

      this.$canvas.style.width = '100%'
      this.camera.detachControl(this.$canvas)
    })
  }

  /**
   * Starts the render loop
   */
  startLoop () {
    this.engine.runRenderLoop(() => {
      this.scene.render()
      this.camera.detachControl(this.$canvas)

      this.plugins.forEach(plugin => {
        plugin.call(this)
      })
    })
  }

  /**
   * Adds a plugin to be called on every scene render
   * @param {Function} callback The callback to call
   */
  use (callback) {
    this.plugins.push(callback)
  }
}

/**
 * Rotate head
 */
// canvas.addEventListener("pointerdown", function (evt) {
//   currentPosition.x = evt.clientX;
//   currentPosition.y = evt.clientY;
  
//   clicked = true;
// });

// canvas.addEventListener("pointermove", function (evt) {
//   if (!clicked) {
//     return;
//   }
//   cylinder.rotation.y = (evt.clientX - currentPosition.x) / 10.0;
//   cylinder.rotation.x = (evt.clientY - currentPosition.y) / 10.0;
// });

// canvas.addEventListener("pointerup", function (evt) {
//   clicked = false;
// });