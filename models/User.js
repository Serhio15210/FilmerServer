const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const UserModel= new mongoose.Schema({
  // googleId:{
  //   type:String,
  //   unique:true,
  //   required:false
  // },
  userName:{
    type:String,
    required:true,
    unique:true
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  password:{
    type:String,
    required:true
  },
  fcmToken:{
    type:String,
    default:''
  },
  notifications:{
    type:[mongoose.Schema.Types.ObjectId],
    default:[],
    ref:'Notification'
  },
  favGenres:{
    type:[Number],
    default:[],
  },
  favActors:{
    type:[String],
    default:[],
  },
  subscribers:{
    type:[mongoose.Schema.Types.ObjectId],
    default:[],
    ref:'User'
  },
  subscriptions:{
    type:[mongoose.Schema.Types.ObjectId],
    default:[],
    ref:'User'
  },
  lists:{
    type:[mongoose.Schema.Types.ObjectId],
    default:[],
    ref:'List'
  },

  avatar:{
    type:String,
    default:''
  }
},{
  timestamps:true
})
UserModel.plugin(mongoosePaginate);
module.exports=mongoose.model('User',UserModel)
// export default mongoose.model('User',UserModel)
