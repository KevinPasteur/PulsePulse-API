import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define the schema for workouts
const workoutSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      unique: true,
      required: true,
    },
    isPublic: {
      type: Boolean,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    exercises: [{ type: Schema.Types.ObjectId, ref: "Exercise" }],
  },
  { timestamps: true }
);

workoutSchema.set("toJSON", {
  transform: transformJsonUser,
});

function transformJsonUser(doc, json, options) {
  //Rename fields
  json.id = json._id;
  delete json._id;

  // Remove the hashed password from the generated JSON.
  delete json.password;
  delete json.__v;
  return json;
}

// Create the model from the schema and export it
export default mongoose.model("Workout", workoutSchema);
