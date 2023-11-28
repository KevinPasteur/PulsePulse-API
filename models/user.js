import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define the schema for users
const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: String,
    role: String,
    exercises: [{ type: Schema.Types.ObjectId, ref: "Exercise" }],
    workouts: [{ type: Schema.Types.ObjectId, ref: "Workout" }],
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
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
export default mongoose.model("User", userSchema);
