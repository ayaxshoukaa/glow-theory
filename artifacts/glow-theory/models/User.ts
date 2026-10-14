import mongoose, { type InferSchemaType } from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false, collection: "glow_theory_users" },
);

export type UserRecord = InferSchemaType<typeof UserSchema>;

const User =
  (mongoose.models.User as mongoose.Model<UserRecord> | undefined) ??
  mongoose.model<UserRecord>("User", UserSchema);

export default User;
