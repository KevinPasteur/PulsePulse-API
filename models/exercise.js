import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define the schema for users
const exerciseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    duration: {
      type: Number,
      required: true,
    },
    repetitions: {
      type: Number,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    bodyPart: {
      type: String,
      required: true,
    },
    videoLink: String,
    commentLink: String,
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    workouts: [{ type: Schema.Types.ObjectId, ref: "Workout" }],
  },
  { timestamps: true }
);

exerciseSchema.set("toJSON", {
  transform: transformJsonExercise,
});

function transformJsonExercise(doc, json, options) {
  delete json.__v;
  return json;
}

// Create the model from the schema and export it
export default mongoose.model("Exercise", exerciseSchema);