import { Document, model, Schema, Model } from "mongoose";
import IUser from "./userModel"; 

interface IIssue extends Document {
  repo: string;
  repoURL: string;
  raisedBy: IUser["_id"]; 
  title: string;
  issueURL: string;
  labels: string[];
  difficulty: "beginner" | "easy" | "medium" | "hard" | "expert";
  isClosed: boolean;
  createdAt: Date;
}

const issueSchema = new Schema<IIssue>(
  {
    repo: String,
    repoURL: String,
    raisedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: String,
    issueURL: String,
    labels: [String],
    difficulty: {
      type: String,
      enum: ["beginner", "easy", "medium", "hard", "expert"],
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

issueSchema.index({ createdAt: -1 });

const Issue: Model<IIssue> = model<IIssue>("Issue", issueSchema);

export default IIssue;
