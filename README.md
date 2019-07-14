<div align="center">
  <h1>PoseNet Plus</h1>
  <p>Extracts head pose data (pitch, yaw, roll) from PoseNet estimations and optionally moves a pointer/mouse cursor on the screen 🐭</p>
  <p><strong>Coming soon</strong></p>
</div>

---

## Local Development

### Requirements
First, [install NodeJS](https://nodejs.org/en/download/) and then run `npm install -g parcel-bundler` to install [ParcelJS](https://parceljs.org). Then, from this projects root directory run `npm install` to download all the depedencies. Once that's done, you'll have the following scripts from the project root:

```bash
# Start a local development server on http://localhost:1234
npm start
```

---

## Instantiating

```js
// These are the config defaults, pass null to just use these
const posenetCursor = new PoseNetCursor({
  // Confidence needed for a keypoint to be registered
  confidence: 0.75,
  training: {
    size: 100
  },
  imageScaleFactor: 0.5,
  outputStride: 16
})
```

---

## Why was this started?

I want to build a Chrome Extension that lets people with disabilities browse the web handsfree using head tracking. To keep things optimized and file sizes low, I'd like to build everything around [TensorFlow.js](https://www.tensorflow.org/js)

![PoseNet ported over to TensorFlow.js](https://github.com/tensorflow/tfjs-models/raw/master/posenet/demos/camera.gif)

The TensorFlow team is continuously releasing and maintaining a library of deep learning models, one of them being [PoseNet](https://www.npmjs.com/package/@tensorflow-models/posenet). PoseNet is a very lightweight, very fast human pose estimator that can track many people simultaneously.

I believe that we can leverage PoseNet to help us quickly create customizable, handsfree interfaces for the web. By creating a library we leave open the possibility of porting the project to different platforms.

---

## Sources

- 3D head: https://sketchfab.com/3d-models/face-e2b2143b03714b97afc9c87f8d75acb3