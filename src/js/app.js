import BabylonScene from './scene'
import * as Posenet from '@tensorflow-models/posenet'

// Cache elements
const $scene = document.querySelector('#scene')
const $overlay = document.querySelector('#overlay')
const overlayCtx = $overlay.getContext('2d')
const $startPosenet = document.querySelector('#start-posenet')
const $startTraining = document.querySelector('#start-training')

// Start a new scene
const Scene = new BabylonScene($scene)
let posenet = null

/**
 * Start PoseNet on click
 */
$startPosenet.addEventListener('click', async function () {
  this.disabled = true
  posenet = await Posenet.load()
  $startTraining.disabled = false

  Scene.use(async function () {
    const pose = await posenet.estimateSinglePose($scene)
    drawKeypoints(pose)
  })
})

/**
 * Draws the keypoints on the canvas
 * @param {Object} pose The PoseNet pose data
 */
overlayCtx.fillStyle = '#f0f'
function drawKeypoints (pose) {
  overlayCtx.clearRect(0, 0, $overlay.width, $overlay.height)
  for (let i = 0; i < 5; i++) {
    overlayCtx.beginPath()
    overlayCtx.arc(pose.keypoints[i].position.x, pose.keypoints[i].position.y, 10, 0, 2 * Math.PI)
    overlayCtx.fill()
  }
  pose.keypoints[0]
}