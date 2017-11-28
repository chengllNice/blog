/**
 * Created by Administrator on 2017/5/10.
 */

//定义模型类操作表
var mongoose = require('mongoose');

//引入表结构模块
var userSchema = require('../schemas/users');

//创建模型类
module.exports = mongoose.model('users',userSchema);