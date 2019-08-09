import BabylonScene from './scene'
import * as Posenet from '@tensorflow-models/posenet'

// Cache elements
const $scene = document.querySelector('#scene')
const $overlay = document.querySelector('#overlay')
const overlayCtx = $overlay.getContext('2d')
const $startPosenet = document.querySelector('#start-posenet')
const $startTraining = document.querySelector('#start-training')
const $createData = document.querySelector('#create-data')
const $sampleSize = document.querySelector('#sample-size')
const $trainingFeatures = document.querySelector('#training-features')
const $trainingLabels = document.querySelector('#training-labels')
const $saveToLocalhost = document.querySelector('#save-to-localhost')
const $saveToFile = document.querySelector('#save-to-file')
let posenet = null
let curPose = {}
let training = window.training = {
  features: [],
  labels: []
}

// Start a new scene
const Scene = new BabylonScene($scene)

/**
 * Autoload data from localstorage
 */
let localTrainingData = localStorage.getItem('training')
if (localTrainingData) {
  $startTraining.disabled = false
  window.training = training = JSON.parse(localTrainingData)
  $trainingFeatures.value = JSON.stringify(training.features, null, 2)
  $trainingLabels.value = JSON.stringify(training.labels, null, 2)
}

/**
 * Start PoseNet on click
 */
$startPosenet.addEventListener('click', function () {
  $startPosenet.classList.add('loading')
  this.disabled = true

  // Wait a frame to allow loader to be applied
  setTimeout(async function () {
    posenet = await Posenet.load()
    $createData.disabled = false
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
 * Save to localstorage
 */
$saveToLocalhost.addEventListener('click', function () {
  this.classList.add('loading')
  setTimeout(() => {
    localStorage.setItem('training', JSON.stringify(training))
    this.classList.remove('loading')
  })
})

/**
 * Save to file
 */
$saveToFile.addEventListener('click', function () {
  this.classList.add('loading')
  setTimeout(() => {
    let $a = document.createElement('a')
    let file = new Blob([JSON.stringify(training)], {type: 'application/json'})
    $a.href = URL.createObjectURL(file)
    $a.download = `posenet-cursor-training-${training.labels.length}.json`
    $a.click()
    $a.remove()
    
    localStorage.setItem('training', JSON.stringify(training))
    this.classList.remove('loading')
  })
})

/**
 * Collect training data
 */
$createData.addEventListener('click', function () {
  const sampleSize = +$sampleSize.value
  let curSampleIndex = 0
  $createData.classList.add('loading')
  $createData.disabled = true
  
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
        curPose.keypoints[0].position.x / this.$canvas.width,
        curPose.keypoints[0].position.y / this.$canvas.height,
        curPose.keypoints[1].position.x / this.$canvas.width,
        curPose.keypoints[1].position.y / this.$canvas.height,
        curPose.keypoints[2].position.x / this.$canvas.width,
        curPose.keypoints[2].position.y / this.$canvas.height,
        curPose.keypoints[3].position.x / this.$canvas.width,
        curPose.keypoints[3].position.y / this.$canvas.height,
        curPose.keypoints[4].position.x / this.$canvas.width,
        curPose.keypoints[4].position.y / this.$canvas.height
      ])

      // Labels = [Pitch, Yaw, Roll]
      training.labels.push([
        this.head.rotation.x,
        this.head.rotation.y,
        this.head.rotation.z
      ])
    // Enable save buttons
    } else if (curSampleIndex === sampleSize) {
      window.training = training
      $createData.classList.remove('loading')
      $startTraining.disabled = false
      $trainingFeatures.value = JSON.stringify(training.features.slice(0, 3), null, 2)
      $trainingLabels.value = JSON.stringify(training.labels.slice(0, 3), null, 2)

      $saveToLocalhost.disabled = false
      $saveToFile.disabled = false
    }
    curSampleIndex++
  })
})