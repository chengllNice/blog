/**
 * Created by Administrator on 2017/5/10.
 */

var mongoose = require('mongoose');

//定义用户表结构
module.exports = new mongoose.Schema({
    //用户名
    username:String,
    //密码
    password:String,
    //是否是管理员
    isAdmin:{
        type:Boolean,
        default:false//默认值false，不是管理员
    },
    //用户头像
    imgSrc:{
        type:String,
        default:'/public/images/headerimg/head1.jpg'
    },
    collectActicle:{
        type:Array,
        default:null
    }
});