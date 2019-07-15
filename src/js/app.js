import BabylonScene from './scene'
import * as Posenet from '@tensorflow-models/posenet'

// Cache elements
const $scene = document.querySelector('#scene')
const $overlay = document.querySelector('#overlay')
const overlayCtx = $overlay.getContext('2d')
const $startPosenet = document.querySelector('#start-posenet')
const $startTraining = document.querySelector('#start-training')
const $sampleSize = document.querySelector('#sample-size')
let posenet = null
let curPose = {}
let training = {
  features: [],
  labels: []
}

// Start a new scene
const Scene = new BabylonScene($scene)

/**
 * Start PoseNet on click
 */
$startPosenet.addEventListener('click', function () {
  $startPosenet.classList.add('loading')
  this.disabled = true

  // Wait a frame to allow loader to be applied
  setTimeout(async function () {
    posenet = await Posenet.load()
    $startTraining.disabled = false
    $startPosenet.classList.remove('loading')

    Scene.use(async function () {
      curPose = await posenet.estimateSinglePose($scene)
      drawKeypoints(curPose)
    })
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
    if (pose.keypoints[i].score > .7) {
      overlayCtx.beginPath()
      overlayCtx.arc(pose.keypoints[i].position.x, pose.keypoints[i].position.y, 10, 0, 2 * Math.PI)
      overlayCtx.fill()
    }
  }
  pose.keypoints[0]
}

/**
 * Start Training
 */
$startTraining.addEventListener('click', function () {
  const sampleSize = +$sampleSize.value
  let curSampleIndex = 0
  $startTraining.classList.add('loading')
  $startTraining.disabled = true
  
  Scene.use(function () {
    if (curSampleIndex < sampleSize) {
      this.head.rotation.x = Math.asin(Math.random() - .5)
      this.head.rotation.y = Math.PI + Math.asin(Math.random() - .5)
      this.head.rotation.z = Math.asin((Math.random() - .5) / 2)
      
      this.head.position.x = Math.random() * 2000 - 1000
      this.head.position.y = Math.random() * 2000 - 1000
      this.head.position.z = Math.random() * -1500  
      
      // Features [x1, y1...x5, y5]
      training.features.push([
        curPose.keypoints[0].position.x,
        curPose.keypoints[0].position.y,
        curPose.keypoints[1].position.x,
        curPose.keypoints[1].position.y,
        curPose.keypoints[2].position.x,
        curPose.keypoints[2].position.y,
        curPose.keypoints[3].position.x,
        curPose.keypoints[3].position.y,
        curPose.keypoints[4].position.x,
        curPose.keypoints[4].position.y
      ])

      // Labels = [Pitch, Yaw, Roll]
      training.labels.push([
        this.head.rotation.x,
        this.head.rotation.y,
        this.head.rotation.z
      ])
    } else if (curSampleIndex === sampleSize) {
      $startTraining.classList.remove('loading')
      console.log(training)
    }
    curSampleIndex++
  })
})