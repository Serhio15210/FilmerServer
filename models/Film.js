const mongoose =require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const FilmModel = new mongoose.Schema({
  imdb_id:{
    type:String,
    required:true
  },
  comment:{
    type:String,
    default:''
  },
  rate:{
    type:Number,
    default:0
  },
  title:{
    type:String,
    default:''
  },
  poster:{
    type:String,
    default:''
  },
  isSerial:{
    type:Boolean,
    default:false
  },
  isFavorite:{
    type:Boolean,
    default:false
  },
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'User'
  },
},{
  timestamps:true
})
FilmModel.plugin(mongoosePaginate);
// export default mongoose.model('Film',FilmModel)
module.exports=mongoose.model('Film',FilmModel)
