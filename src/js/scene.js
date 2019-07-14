const BABYLON = window.BABYLON

export default class {
  /**
   * Create the scene
   * @param {CANVAS} $canvas The HTML Canvas to contain our Babylon (and PoseNet) scene
   */
  constructor ($canvas) {
    this.engine = new BABYLON.Engine($canvas, true)
    this.scene = new BABYLON.Scene(this.engine)
    this.head = null

    BABYLON.SceneLoader.Append('./3d/', 'scene.gltf', this.scene, scene => {
      this.head = scene.meshes[0]
      this.head.rotationQuaternion = null
      this.head.rotation.y = Math.PI
      scene.createDefaultCameraOrLight(true, true, true)
      scene.activeCamera.alpha += Math.PI
    })
  }
}