/**
 * Created by Administrator on 2017/5/10.
 */

/*
 这个文件是后台数据处理的文件*/

var express = require('express');
var router = express.Router();
var url = require('url');
var User = require('../modles/User');
var Category = require('../modles/Category');
//文章表模型
var Article = require('../modles/Article');

//后台登录
router.post('/manager/login',function(req, res, next){
    var mana_username = req.body.username;
    var mana_password = req.body.password;

    var responseData = {
        code:0,
        message:''
    };

    User.findOne({
        username:mana_username,
        password:mana_password
    }).then(function(data){
        if(!data){
            responseData.code = 1;
            responseData.message = '用户名或密码错误'
            res.json(responseData);
            return;
        }else if(!data.isAdmin){
            responseData.code = 2;
            responseData.message = '对不起，你不是管理员';
            res.json(responseData);
            return;
        }else{
            responseData.message = '登录成功';
            responseData.managerInfo = {
                _id:data._id,
                username:data.username
            };
            req.cookies.set('managerInfo',JSON.stringify({
                _id:data._id,
                username:data.username
            }));
            res.json(responseData);
            return;
        }
    })
});

//这个中间件判断是否是管理员
router.use(function(req, res, next){
    //判断是否登录

    if(req.userInfo.isAdmin || JSON.stringify(req.managerInfo) != '{}'){
        next();
    }else{
        res.render('admin/login.html');
        return;
    }
});

var imgSrc = '';

router.use(function (req, res, next) {
    User.find({
        _id:req.managerInfo._id
    }).then(function (data) {
        imgSrc = data[0].imgSrc;
        next()
    })
});

//登录页面的路由
router.get('/login',function(req, res, next){
   res.render('admin/login.html');
});

//后台管理首页
router.get('/',function(req, res, next){

    res.render('admin/index.html',{
        managerInfo:req.managerInfo,
        imgSrc:imgSrc
    });
});

//退出后台管理
router.get('/qiut',function(req, res, next){
    req.cookies.set('managerInfo',null);
    res.render('admin/index.html');
    return;
});

/*----------------------用户管理----------------------*/
//用户管理首页
router.get('/user',function(req, res, next){
    //获取当前页的路由，用于分页
    var urlRouter = url.parse(req.url).pathname;

    //每页限制显示数
    var pageSize = 10;
    //当前页
    var page = Number(req.query.page || 1);
    //总页数
    var pageCount = 0;
    //总用户数
    var count = 0;

    User.count().then(function(countNum){
        count = countNum;//用户总数
        pageCount = Math.ceil(count/pageSize);//总页数

        //忽略的条目数，即跳过的条目数
        var skip = (page - 1)*pageSize;

        User.find().limit(pageSize).skip(skip).then(function(data){
            res.render('admin/user_index.html',{
                managerInfo:req.managerInfo,
                userLists:data,
                urlRouter:urlRouter,
                count:count,
                pageSize:pageSize,
                pageCount:pageCount,
                page:page,
                imgSrc:imgSrc
            });
        });
    });

});

//用户权限修改
router.get('/user/editpower',function(req, res, next){
    var id = req.query.id || '';
    var isAdmin = req.query.isAdmin || '';
    User.findOne({
        _id:id
    }).then(function(data){
        if(data){
            User.update({
                _id:id
            },{
                isAdmin:isAdmin
            }).then(function(data){
                res.json({
                    code:1,
                    imgSrc:imgSrc
                })
            });
        }
    });
});

//用户删除
router.get('/user/delete',function(req,res,next){
    var id = req.query.id || '';
    User.remove({
        _id:id
    }).then(function(data){
        res.json({
            code:1,
            message:'用户删除成功',
            imgSrc:imgSrc
        })
    })
});

//管理员添加首页
router.get('/user/add',function(req, res){
    res.render('admin/user_add.html',{
        managerInfo:req.managerInfo,
        imgSrc:imgSrc
    })
});

//管理员添加提交
router.post('/user/add',function(req, res){
    var username = req.body.username;
    var password = req.body.password;

    User.findOne({
        username:username
    }).then(function(data){
        if(data){
            res.json({
                code:0,
                message:'该用户名已经存在',
                imgSrc:imgSrc
            });
            return;
        }else{
            var user = new User({
                username:username,
                password:password,
                isAdmin:true
            });
            return user.save();
        }
    }).then(function(data){
        if(data){
            res.json({
                code:1,
                message:'用户信息保存成功',
                imgSrc:imgSrc
            })
        }
    });
});


/*---------------------分类管理----------------------*/
//分类管理首页
router.get('/category',function(req, res, next){

    //获取当前页的路由，用于分页
    var urlRouter = url.parse(req.url).pathname;

    //每页限制显示数
    var pageSize = 10;
    //当前页
    var page = Number(req.query.page || 1);
    //总页数
    var pageCount = 0;
    //总分类数
    var count = 0;

    Category.count().then(function(countNum){
        count = countNum;//分类总数
        pageCount = Math.ceil(count/pageSize);//总页数

        //忽略的条目数，即跳过的条目数
        var skip = (page - 1)*pageSize;

        //查询数据库中分类的信息
        Category.find().limit(pageSize).skip(skip).then(function(data){
            res.render('admin/category_index.html',{
                categories:data,
                managerInfo:req.managerInfo,
                urlRouter:urlRouter,
                count:count,
                pageSize:pageSize,
                pageCount:pageCount,
                page:page,
                imgSrc:imgSrc
            })
        });
    });


});

//分类添加
router.get('/category/add',function(req, res, next){

    res.render('admin/category_add.html',{
        managerInfo:req.managerInfo,
        imgSrc:imgSrc
    });
});

//分类保存
router.post('/category/add',function(req, res, next){
    var name = req.body.name;
    var responseCategory = {
        code:0,
        message:'',
        imgSrc:imgSrc
    }
    //分类数据表中查询
    Category.findOne({
        name:name
    }).then(function(data){
        if(data){
            responseCategory.code = 1;
            responseCategory.message = '分类已经存在';
            res.json(responseCategory);
            return;
        }else{
            var category = new Category({
                name:name
            });
            category.save();
            responseCategory.message = '分类保存成功';
            res.json(responseCategory);
            return;
        }
    });
});

//分类修改保存
router.post('/category/edit',function(req, res, next){
    var id = req.body.id || '';
    //提交过来的修改名称
    var name = req.body.name || '';

    //在数据库中查找当前分类名称是否存在
    Category.findOne({
        name:name
    }).then(function(data){
        //如果data存在，即分类已存在
        if(data){
            //判断是否是当前id分类
            if(data._id == id){
                return data;
            }
            res.json({
                code:0,
                message:'该分类名称已经存在',
                imgSrc:imgSrc
            })
        }else{
            //更新数据库信息
            return Category.update({
                _id:id
            },{
                name:name
            });
        }
        return Promise.reject();
    }).then(function(data){
        res.json({
            code:1,
            message:'修改成功',
            imgSrc:imgSrc
        })
    })
});

//分类删除
router.get('/category/delete',function(req, res, next){
    var id = req.query.id || '';
    Category.remove({
        _id:id
    }).then(function(data){
        res.json({
            code:1,
            imgSrc:imgSrc
        });
    })
});

// 搜索
router.get('/search',function (req, res, next) {
    var search_val = req.query.sq;

    //获取当前页的路由，用于分页
    var urlRouter = url.parse(req.url).pathname;

    //每页限制显示数
    var pageSize = 10;
    //当前页
    var page = Number(req.query.page || 1);
    //总页数
    var pageCount = 0;
    //总用户数
    var count = 0;


    User.find({username:{$regex:search_val,$options:'$i'}}).count().then(function (countNum) {

        if(countNum>0){

            count = countNum;//用户总数
            pageCount = Math.ceil(count/pageSize);//总页数

            //忽略的条目数，即跳过的条目数
            var skip = (page - 1)*pageSize;

            User.find({username:{$regex:search_val,$options:'$i'}}).skip(skip).limit(pageSize).then(function (data) {
                console.log(data)
                res.render('admin/user_index.html',{
                    managerInfo:req.managerInfo,
                    userLists:data,
                    urlRouter:urlRouter,
                    count:count,
                    pageSize:pageSize,
                    pageCount:pageCount,
                    page:page,
                    imgSrc:imgSrc
                })
            });
        }else{
            res.render('admin/user_index.html',{
                managerInfo:req.managerInfo,
                err:1,
                message:'无查询数据',
                count:0,
                pageSize:0,
                pageCount:0,
                page:0,
                imgSrc:imgSrc
            })
        }
    });

});

module.exports = router;