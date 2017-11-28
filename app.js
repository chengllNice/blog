/**
 * Created by Administrator on 2017/5/10.
 */

/*
应用程序入口文件
程序运行首先进入app.js*/

//引入express
var express = require("express");
//加载swig模板文件
var swig = require("swig");
//加载mongoose数据库中间件
var mongoose = require("mongoose");
//加载cookies中间件
var cookies = require("cookies");
//加载body-pareser中间件，用于处理post请求
var bodyParser = require("body-parser");
/*//加载cookie-parser中间件
var cookieParser = require('cookie-parser');*/
//加载busboy中间价
var Busboy = require('busboy');
var fs = require('fs');
var path = require('path');
var url = require("url");

var User = require('./modles/User');

//创建APP应用,相当于nodejs http.createServer();
var app = express();

//使用cookieParser中间件
//app.use(cookieParser());

//设置静态托管文件路径，当用户以"/public"开始的路径访问时，能够直接定位到该路径下的静态资源文件
app.use("/public",express.static(__dirname + "/public"));

//配置模板文件，定义模板引擎
//第一个参数模板引擎的名称，第二个参数解析模板内容的方法
app.engine('html',swig.renderFile);
//设置模板文件存放的路径,第一个参数必须是"views",第二个参数是模板文件的存放路径
app.set('views','./views');
//注册模板引擎，第一个参数必须是"view engine",第二个参数和engine定义的名称一致
app.set('view engine','html');
//开发过程中需要取消模板缓存，这样就不需要每次都重新启动服务了
swig.setDefaults({cache:false});

//设置body-Parser，这样就会在发送数据的时候在req上添加属性body
app.use(bodyParser.urlencoded({extended:true}));

app.use(function(req, res, next){
    req.cookies = new cookies(req,res);
    req.userInfo = {};
    req.managerInfo = {};
    if(req.cookies.get('userInfo')){
        req.userInfo = JSON.parse(req.cookies.get('userInfo'));
    }
    if(req.userInfo.isAdmin){
        req.managerInfo = req.userInfo;
    }
    if(req.cookies.get('managerInfo')){
        req.managerInfo = JSON.parse(req.cookies.get('managerInfo'));
    }
    next();
});


/*根据不同功能划分不同模块
    1.admin 后台数据处理模块
    2.api ajax提交模块
    3.main 前台页面处理模块
    4.article 文章提交*/
app.use('/admin',require('./routers/admin'));
//app.use('/article',require('./routers/article'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));

//链接数据库
mongoose.connect('mongodb://localhost:27018/myblog',function(err){
    if(err){
        console.log("数据库链接失败！！！")
    }else{
        console.log("数据库链接成功！！！");

        app.listen(8084);
        console.log("监听建立在8084端口！！！");
    }
});

