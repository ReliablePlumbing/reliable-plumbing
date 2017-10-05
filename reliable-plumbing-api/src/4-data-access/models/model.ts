// import { Model } from "mongoose";
// import { IStudentModel } from "./student";

// export class Models {
//   student: Model<IStudentModel>;
// }
import { Document } from 'mongoose';
export interface Model<T> extends Document {

}