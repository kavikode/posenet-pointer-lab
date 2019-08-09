import * as tf from '@tensorflow/tfjs'
import * as tfvis from '@tensorflow/tfjs-vis'

const NUM_EPOCHS = 200
const BATCH_SIZE = 40
const LEARNING_RATE = 0.01
const tensors = {}

/**
 * Start training
 */
const $startTraining = document.querySelector('#start-training')
$startTraining.addEventListener('click', function () {
  const training = window.training
  const rawData = splitTrainingAndTest(training)
  
  // Setup tensors
  tensors.rawTrainFeatures = tf.tensor2d(rawData.trainFeatures)
  tensors.trainTargetA = tf.tensor2d([rawData.trainTargets[0]])
  tensors.trainTargetB = tf.tensor2d([rawData.trainTargets[1]])
  tensors.trainTargetC = tf.tensor2d([rawData.trainTargets[2]])
  
  tensors.rawTestFeatures = tf.tensor2d(rawData.testFeatures)
  tensors.testTargetA = tf.tensor2d([rawData.testTargets[0]])
  tensors.testTargetB = tf.tensor2d([rawData.testTargets[1]])
  tensors.testTargetC = tf.tensor2d([rawData.testTargets[2]])

  // Normalize mean and standard deviation of data.
  let {dataMean, dataStd} = getMeanAndStandardDeviation(tensors.rawTrainFeatures)
  
  tensors.trainFeatures = normalizeTensor(tensors.rawTrainFeatures, dataMean, dataStd)
  tensors.testFeatures = normalizeTensor(tensors.rawTestFeatures, dataMean, dataStd)
})

/**
 * Gets the Mean and Standard Deviation of each column of a data array
 */
function getMeanAndStandardDeviation (data) {
  const dataMean = data.mean(0)
  const diffFromMean = data.sub(dataMean)
  const squareDiffFromMean = diffFromMean.square()
  const variance = squareDiffFromMean.mean(0)
  const dataStd = variance.sqrt()
  return {dataMean, dataStd}
}

/**
 * Given expected mean and standard deviation, normalize dataset
 */
function normalizeTensor (data, dataMean, dataStd) {
  return data.sub(dataMean).div(dataStd)
}

/**
 * Splits a given dataset into a 7:3 Training:Test
 */
function splitTrainingAndTest (data) {
  return {
    trainFeatures: data.features.slice(0, Math.floor(data.features.length * .7)),
    testFeatures: data.features.slice(0, Math.floor(data.features.length * .3)),
    trainTargets: data.labels.slice(0, Math.floor(data.labels.length * .7)),
    testTargets: data.labels.slice(0, Math.floor(data.labels.length * .3))
  }
}