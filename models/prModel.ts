import { Document, model, Schema, Model } from "mongoose";
import  IUser  from "./userModel"; 
import  IIssue  from "./issueModel"; 

interface IPR extends Document {
  user: IUser["_id"];
  issue: IIssue["_id"];
  prURL: string;
  isClosed: boolean;
  isMerged: boolean;
  createdAt: Date;
}

const PRSchema = new Schema<IPR>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    issue: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
    },
    prURL: String,
    isClosed: {
      type: Boolean,
      default: false,
    },
    isMerged: {
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

PRSchema.index({ createdAt: -1 });

PRSchema.pre<IPR>("find", async function (next) {
  (await this.populate("user")).populate("issue");
  next();
});

const PR: Model<IPR> = model<IPR>("PR", PRSchema);

export default IPR;
