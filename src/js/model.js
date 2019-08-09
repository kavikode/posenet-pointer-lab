import * as tf from '@tensorflow/tfjs'
import * as tfvis from '@tensorflow/tfjs-vis'

const NUM_EPOCHS = 100
const BATCH_SIZE = 50
const LEARNING_RATE = 0.001
const tensors = {}
let rawData = {}
let trainLogs = []
let localModel = null

const $useModel = document.querySelector('#use-model')
const $chart = document.querySelector('#chart')

/**
 * Load model if it exists
 */
maybeLoadLocalModel()
async function maybeLoadLocalModel () {
  console.log('Checking for local model...')
  localModel = await tf.loadLayersModel('localstorage://posenetCursor')

  if (localModel) {
    window.model = localModel
    $useModel.disabled = false
    console.log('...model loaded 🎉', localModel)
  } else {
    console.log('...no local models found')
  }
}

/**
 * Start training
 */
const $startTraining = document.querySelector('#start-training')
$startTraining.addEventListener('click', function () {
  const training = window.training
  rawData = splitTrainingAndTest(training)

  // Setup tensors
  tensors.rawTrainFeatures = tf.tensor2d(rawData.trainFeatures)
  tensors.trainTargetA = tf.tensor2d(rawData.trainTargets.map(i => [i[0]]))
  tensors.trainTargetB = tf.tensor2d(rawData.trainTargets.map(i => [i[1]]))
  tensors.trainTargetC = tf.tensor2d(rawData.trainTargets.map(i => [i[2]]))
  
  tensors.rawTestFeatures = tf.tensor2d(rawData.testFeatures)
  tensors.testTargetA = tf.tensor2d(rawData.testTargets.map(i => [i[0]]))
  tensors.testTargetB = tf.tensor2d(rawData.testTargets.map(i => [i[1]]))
  tensors.testTargetC = tf.tensor2d(rawData.testTargets.map(i => [i[2]]))

  // Normalize mean and standard deviation of data.
  let {dataMean, dataStd} = getMeanAndStandardDeviation(tensors.rawTrainFeatures)
  
  tensors.trainFeatures = normalizeTensor(tensors.rawTrainFeatures, dataMean, dataStd)
  tensors.testFeatures = normalizeTensor(tensors.rawTestFeatures, dataMean, dataStd)

  const model = createLinearRegressionModel()
  compileAndTrain(model)
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

/**
 * Builds a Multi Layer Perceptron Regression Model each with
 * with 2 hidden layers, each with 10 units activated by sigmoid
 */
function createLinearRegressionModel () {
  const model = tf.sequential()
  // Simple linear regression
  model.add(tf.layers.dense({inputShape: [rawData.trainFeatures[0].length], units: 1}));

  // Multi layer perceptron
  // model.add(tf.layers.dense({
  //   inputShape: [rawData.trainFeatures[0].length],
  //   units: 50,
  //   activation: 'sigmoid',
  //   kernelInitializer: 'leCunNormal'
  // }))
  // model.add(tf.layers.dense({
  //   units: 50,
  //   activation: 'sigmoid',
  //   kernelInitializer: 'leCunNormal'
  // }))
  // model.add(tf.layers.dense({units: 1}))
  model.summary()

  return model
}

/**
 * Compiles and trains the model
 */
async function compileAndTrain (model) {
  model.compile({
    optimizer: tf.train.sgd(LEARNING_RATE),
    loss: 'meanSquaredError'
  })

  console.log('Training...', tensors)
  await model.fit(tensors.trainFeatures, tensors.trainTargetA, {
    batchSize: BATCH_SIZE,
    epochs: NUM_EPOCHS,
    validationSplit: 0.3,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        console.log(`⏳ Epoch ${epoch + 1} of ${NUM_EPOCHS} completed`)
        trainLogs.push(logs)
        tfvis.show.history($chart, trainLogs, ['loss', 'val_loss'])
      }
    }
  })

  console.log('🎉 Training complete! Now running tests...')
  const result = model.evaluate(tensors.testFeatures, tensors.testTargetA, {batchSize: BATCH_SIZE})
  const testLoss = result.dataSync()[0]
  const trainLoss = trainLogs[trainLogs.length - 1].loss
  const valLoss = trainLogs[trainLogs.length - 1].val_loss

  console.log(`Final train-set loss: ${trainLoss.toFixed(4)}`)
  console.log(`Final validation-set loss: ${valLoss.toFixed(4)}`)
  console.log(`Test-set loss: ${testLoss.toFixed(4)}`)

  await model.save('localstorage://posenetCursor')
  await model.save('downloads://posenetCursor')
}