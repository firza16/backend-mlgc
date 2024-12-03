const tf = require("@tensorflow/tfjs-node");
const InputError = require("../exceptions/InputError");

async function predictClassification(model, image) {
  try {
    const tensor = tf.node.decodeJpeg(image).resizeNearestNeighbor([224, 224]).expandDims().toFloat();

    const prediction = model.predict(tensor);
    const score = (await prediction.data())[0]; 
    const isCancer = score > 0.5;

    const label = isCancer ? "Cancer" : "Non-cancer";
    const suggestion = isCancer
      ? "Segera periksa ke dokter!"
      : "Penyakit kanker tidak terdeteksi.";

    return { label, suggestion };
  } catch (error) {
    throw new InputError("Terjadi kesalahan dalam melakukan prediksi");
  }
}

module.exports = predictClassification;
