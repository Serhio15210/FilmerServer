const mongoose =require("mongoose");

const ListModel = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  description:{
    type:String,
    default:''
  },
  mode:{
    type:String,
    required:true,
    default:'public'
  },
  subscribers:{
    type:[mongoose.Schema.Types.ObjectId],
    default:[],
    ref:'User'
  },
  films:{
    type:[mongoose.Schema.Types.ObjectId],
    default:[],
    ref:'Film'
  },
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'User'
  },
},{
  timestamps:true
})
// export default mongoose.model('List',ListModel)
module.exports= mongoose.model('List',ListModel)
