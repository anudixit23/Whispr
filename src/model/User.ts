import mongoose,{Schema ,Document} from 'mongoose';


//this code is written for typescript : Defines the type/shape of data for TypeScript.
// Document(mongoose) Represents an actual MongoDB record with Mongoose functionality, such as _id, .save(), .deleteOne(), etc.
export interface Message extends Document {
    content : string;
    createdAt : Date;
}

//Defines database structure + validation/rules.
const MessageSchema: Schema<Message> = new mongoose.Schema ({
    content: {
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        required: true,
        default: Date.now,

    },


});

export interface User extends Document {
    username: string;
    email :string;
    password:string;
    verifyCode: string;
    
    verifyCodeExpiry: Date; 
    isVerified: boolean;
    isAcceptingMessages: boolean;
    messages: Message[];
}

// Updated User schema
const UserSchema: Schema<User> = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  verifyCode: {
    type: String,
    required: [true, 'Verify Code is required'],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, 'Verify Code Expiry is required'],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessages: {
    type: Boolean,
    default: true,
  },
  messages: [MessageSchema],
});

// MOdel :The API you use to interact with MongoDB

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>('User', UserSchema);

export default UserModel;