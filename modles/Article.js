/**
 * Created by Administrator on 2017/5/17.
 */
//通过模型类操作表
var mongoose = require('mongoose');
//引入表
var articleSchema = require('../schemas/article.js');
//创建模型类
module.exports = mongoose.model('article',articleSchema);