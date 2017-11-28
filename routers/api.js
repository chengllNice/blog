/**
 * Created by Administrator on 2017/5/10.
 */

/*
这个文件是前台ajax提交数据的处理文件*/

var express = require('express');
var router = express.Router();
var fs = require('fs');
//引入用户表
var User = require('../modles/User');

//公用中间件，所有路由都要通过，声明一个对象存放放回给前端的信息
router.use(function(req, res, next){
    responseData = {};
    next();
});

//用户注册
router.post('/user/register',function(req, res){
    //获取前端传输过来的用户数据信息
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    //判断用户名是否已经注册过
    User.findOne({
        username:username
    }).then(function(data){
        //如果可以查找到用户信息，说明已经注册过
        if(data){
            responseData.code = 1;//表示已经注册过
            responseData.message = '该用户名已经被注册！！！';
            res.json(responseData);
            return;
        }

        //注册用户信息
        var user = new User({
            username:username,
            password:password
        });
        return user.save();
    }).then(function(data){
        var id = data._id;
        fs.mkdir('./public/upload/images/'+id,function(err){
            if(!err){
                fs.mkdir('./public/upload/images/'+id+'/head');
            }
        });
        responseData.message = '注册成功！！！';
        res.json(responseData);
    })
});

//用户登录
router.post('/user/login',function(req, res){
    //获取前端传输过来的用户名和密码
    var username = req.body.username;
    var password = req.body.password;

    //在用户表中核查用户的输入信息
    User.findOne({
        username:username,
        password:password
    }).then(function(data){
        //判断是否查询到了用户数据
        if(!data){
            responseData.code = 1;
            responseData.message = '用户名或密码错误！！！';
            res.json(responseData);
            return;
        }else{
            responseData.message = '登录成功！！！';
            responseData.userInfo = {
                _id:data._id,
                username:data.username
            };
            //设置cookie信息
            req.cookies.set('userInfo',JSON.stringify({
                _id:data._id,
                username:data.username,
                isAdmin:data.isAdmin
            }));
            res.json(responseData);
            return;
        }
    });
});

//退出登录
router.get('/user/quit',function(req, res, next){
    req.cookies.set('userInfo',null);
    res.json(responseData);
});


module.exports = router;