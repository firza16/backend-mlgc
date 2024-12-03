const predictClassification = require("../services/inferenceService");
const storeData = require("../services/storeData");
const crypto = require("crypto");
const { Firestore } = require("@google-cloud/firestore");

async function postPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;

  const { label, suggestion } = await predictClassification(model, image);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const data = {
    id,
    result: label,
    suggestion,
    createdAt,
  };

  await storeData(id, data);

  const response = h.response({
    status: "success",
    message: "Model is predicted successfully",
    data,
  });
  response.code(201);
  return response;
}

async function getAllData(request, h) {
  try {
    const db = new Firestore();
    const predictionsCol = db.collection("predictions");
    const firestoreData = await predictionsCol.get();

    const data = firestoreData.docs.map((doc) => {
      const docData = doc.data();
      return {
        id: doc.id,
        history: {
          result: docData.result,
          createdAt: docData.createdAt,
          suggestion: docData.suggestion,
          id: docData.id,
        },
      };
    });

    return h.response({
        status: "success",
        data,
      })
      .code(200);
  } catch (error) {
    return h.response({
        status: "fail",
        message: "Failed to fetch data from Firestore.",
      })
      .code(500);
  }
}

module.exports = {postPredictHandler, getAllData};
