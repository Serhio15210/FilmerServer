const mongoose =require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const NotificationModel = new mongoose.Schema({

  text:{
    type:String,
    default:''
  },
  title:{
    type:String,
    default:'',
    required:true
  },
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'User'
  },
  isRead:{
    type:Boolean,
    default:false
  },
  imdb_id:{
    type:String,
    default:''
  },
  filmTitle:{
    type:String,
    default:''
  },
  isSerial:{
    type:Boolean,
    default:false
  },
  rate:{
    type:Number,
    default:0
  }
},{
  timestamps:true
})
NotificationModel.plugin(mongoosePaginate);

module.exports=mongoose.model('Notification',NotificationModel)
