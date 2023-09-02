import { Document, model, Schema, Model } from "mongoose";
import IPR from "./prModel"; 
import IIssue from "./issueModel"; 

interface IUser extends Document {
  email: string;
  githubUsername: string;
  phoneNumber: string;
  score: number;
  isGithubUsername: boolean;
  noOfPRs: number;
  noOfIssuesRaised: number;
  noOfIssuesSolved: number;
  PRs: Array<IPR["_id"]>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    githubUsername: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    isGithubUsername: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ score: -1 });

userSchema.virtual("PRs", {
  ref: "PR",
  foreignField: "user",
  localField: "_id",
});

userSchema.virtual("issuesRaised", {
  ref: "Issue",
  foreignField: "raisedBy",
  localField: "_id",
});

userSchema.virtual("noOfPRs", {
  ref: "PR",
  localField: "_id",
  foreignField: "user",
  count: true,
});

userSchema.virtual("noOfIssuesRaised", {
  ref: "Issue",
  localField: "_id",
  foreignField: "raisedBy",
  count: true,
});

userSchema.virtual("noOfIssuesSolved", {
  get: function (this: IUser) {
    return this.PRs.filter((pr) => pr.isMerged).length;
  },
});

const User: Model<IUser> = model<IUser>("User", userSchema);

export default IUser;
