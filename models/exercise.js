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
    },
    repetitions: {
      type: Number,
    },
    sets: {
      type: Number,
    },
    level: {
      type: String,
      required: true,
    },
    bodyPart: {
      type: Array,
      required: true,
      validate: {
        validator: function (array) {
          return array && array.length > 0;
        },
        message: "bodyPart is required.",
      },
    },
    videoLink: String,
    commentLink: String,
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    workouts: [{ type: Schema.Types.ObjectId, ref: "Workout" }],
    status: String,
  },
  { timestamps: true }
);

exerciseSchema.set("toJSON", {
  transform: transformJsonExercise,
});

function transformJsonExercise(doc, json, options) {
  //Rename fields
  json.id = json._id;
  delete json._id;

  delete json.__v;
  return json;
}

// Create the model from the schema and export it
export default mongoose.model("Exercise", exerciseSchema);
