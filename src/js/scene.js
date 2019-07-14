const BABYLON = window.BABYLON

export default class {
  /**
   * Create the scene
   * @param {CANVAS} $canvas The HTML Canvas to contain our Babylon (and PoseNet) scene
   */
  constructor ($canvas) {
    this.plugins = []
    this.engine = new BABYLON.Engine($canvas, true)
    this.scene = new BABYLON.Scene(this.engine)
    this.head = null

    this.createScene($canvas)
    this.startLoop()
  }

  /**
   * Creates the scene
   */
  createScene ($canvas) {
    const camera = new BABYLON.ArcRotateCamera('Camera', Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0,0,5), this.scene)

    BABYLON.SceneLoader.Append('./3d/', 'scene.gltf', this.scene, scene => {
      this.head = scene.meshes[0]
      this.head.rotationQuaternion = null
      this.head.rotation.y = Math.PI
      scene.createDefaultCameraOrLight(true, true, true)
      scene.activeCamera.alpha += Math.PI

      camera.attachControl(scene)
      $canvas.style.width = '100%'
    })
  }

  /**
   * Starts the render loop
   */
  startLoop () {
    this.engine.runRenderLoop(() => {
      this.scene.render()

      this.plugins.forEach(plugin => {
        plugin.call()
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