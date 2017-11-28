/**
 * Created by Administrator on 2017/5/16.
 */
var mongoose = require('mongoose');

var categorySchema = require('../schemas/category');

module.exports = mongoose.model('category',categorySchema);