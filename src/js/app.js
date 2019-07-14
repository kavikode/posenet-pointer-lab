import Scene from './scene'
const $canvas = document.querySelector('canvas')
const $startPosenet = document.querySelector('#start-posenet')
const $startTraining = document.querySelector('#start-training')

// Start a new scene
const scene = new Scene($canvas)

// Start posenet on click
$startPosenet.addEventListener('click', function () {
  this.disabled = true
  $startTraining.disabled = false
})