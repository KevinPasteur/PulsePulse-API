import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define the schema for users
const exerciseSchema = new Schema({
  name: {
    type: String,
    unique: true,
  },
  description: String,
  duration: Number,
  repetitions: Number,
  level: String,
  bodyPart: String,
  videoLink: String,
  commentLink: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

exerciseSchema.set("toJSON", {
  transform: transformJsonExercise,
});

function transformJsonExercise(doc, json, options) {
  delete json.__v;
  return json;
}

// Create the model from the schema and export it
export default mongoose.model("Exercise", exerciseSchema);
