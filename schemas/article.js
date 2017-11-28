/**
 * Created by Administrator on 2017/5/17.
 */
var mongoose = require('mongoose');

//内容表结构
module.exports = new mongoose.Schema({

    //关联用户 - 用户ID
    user:{
        //类型
        type:mongoose.Schema.Types.ObjectId,
        //引用
        ref:'users'//依赖于models中User.js中的model名
    },

    //关联字段 - 内容所属分类ID
    category:{
        //类型
        type:mongoose.Schema.Types.ObjectId,
        //引用
        ref:'category'
    },
    //添加时间
    addTime:{
        type:Date,
        default:new Date()
    },

    //阅读量
    views:{
        type:Number,
        default:0
    },

    //内容标题
    title: String,

    //标签
    mark: {
        type:Array,
        default:[]
    },

    //简介
    description:{
        type:String,
        default:''
    },
    //内容
    content:{
        type:String,
        default:''
    },

    //markdown源码
    markdown:{
        type:String,
        default:''
    },

    //评论
    comments:{
        type:Array,
        default:[]
    },

    imageSrc:{
        type:String,
        default:''
    }
});