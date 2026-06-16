import { Schema , model} from 'mongoose'
const userSchema=new Schema({
    name:{
        type:String,
        required:[true,"Name required"]
    },
    email:{
        type:String,
        unique:true,
        required:[true,"Email required"]
    },
    password:{
        type:String,
        required:[true,"Password required"]
    },
    photo:{
        type:String
    },
    refreshToken:{
        type:String
    }
    },{
     timestamps:true,
     versionKey:false,
     strict:"throw"
})
export const UserModel=model("user",userSchema)