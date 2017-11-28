/**
 * Created by Administrator on 2017/5/10.
 */

/*
这个文件是前台数据展示的文件*/

var express = require('express');
var router = express.Router();
var Busboy = require('busboy');
var fs = require('fs');
var url = require("url");
//用户数据表模型
var User = require('../modles/User');
//分类表模型
var Category = require('../modles/Category');
//文章表模型
var Article = require('../modles/Article');


//判断用户是否登录，未登录时判断访问路径是否存在白名单内，否则报404错误
router.use(function(req, res, next){
    var whiteList = ['/','/article/details','/search'];
    if(req.userInfo.username){
        next();
    }else{
        var isWhiteList = whiteList.some(function (t) {
            return url.parse(req.url).pathname === t;
        });
        if(isWhiteList){
            next()
        }else{
            res.render('main/404.html');
        }
    }
});

var responseMainData = {};
//查询分类的中间件
router.use(function(req, res, next){
    responseMainData = {
        userInfo:req.userInfo,
        categoryId:req.query.categoryId || ''
    };
    User.findOne({
        _id:req.userInfo._id
    }).then(function(data){
        responseMainData.imgSrc = data.imgSrc;
    });
    //查找分类表的所有分类信息
    Category.find().then(function(data){
        if(data){
            responseMainData.categories = data;
            next();
        }
    });
});

//前台首页
router.get('/',function(req ,res, next){
    //当前页
    var page = req.query.page || 1;
    var categoryId = req.query.categoryId || '';
    var where = {};
    if(categoryId){
        where.category = categoryId;
    }

    Article.where(where).count().then(function(countNum){
        //总条数
        var count = countNum;
        //每页显示数
        var pageSize = 10;
        //总页数
        var pageCount = Math.max(Math.ceil(count/pageSize),1);
        //忽略的条数
        var skip = (page-1)*pageSize;

        responseMainData.pageCount = pageCount;
        responseMainData.count = count;
        responseMainData.page = Number(page);
        Article.where(where).find().limit(pageSize).skip(skip).populate(['category','user']).sort({addTime:-1}).then(function(data){
            responseMainData.contents = data;
            res.render('main/index.html',responseMainData)
        });
    });
});

//首页搜索
router.get('/search',function(req, res){
    var name = req.query.sq || '';
    var page = 1;

    Article.where({
        $or:[
            {title:{$regex:name,$options:'$i'}},
            {mark:{$regex:name,$options:'$i'}}
        ]
    }).count().then(function(countNum){
        //总条数
        var count = countNum;
        //每页显示数
        var pageSize = 10;
        //总页数
        var pageCount = Math.max(Math.ceil(count/pageSize),1);
        //忽略的条数
        var skip = (page-1)*pageSize;

        responseMainData.pageCount = pageCount;
        responseMainData.count = count;
        responseMainData.page = Number(page);
        responseMainData.title = '搜索-'+name;
        Article.find({
            $or:[
                {title:{$regex:name,$options:'$i'}},
                {mark:{$regex:name,$options:'$i'}}
            ]
        }).limit(pageSize).skip(skip).populate(['category','user']).then(function(data){
            console.log(data)
            responseMainData.searchData = data;
            responseMainData.searchSq = name;
            res.render('main/search.html',responseMainData)
        });
    });
});

//文章编辑页
router.get('/article/add',function(req, res, next){
    res.render('main/article.html',responseMainData);
});

//个人中心页
router.get('/personal',function(req, res, next){

    //var responsePersonal = {
    //    userInfo:req.userInfo
    //};

    Article.count().then(function(countNum){
        var pageSize = 15;
        var count = countNum;
        var page =  Number(req.query.page || 1);
        var pageCount = Math.ceil(count/pageSize);
        var skip = (page-1)*pageSize;

        responseMainData.count = count;
        responseMainData.page = page;
        responseMainData.pageCount = pageCount;
        Article.find({user:req.userInfo._id}).limit(pageSize).skip(skip).populate(['category']).sort({addTime:-1}).then(function(data){
            responseMainData.articles = data;
            res.render('main/personal-index.html',responseMainData)
        });
    });
});

// 个人中心收藏页面
router.get('/personal/collection',function (req, res, next) {
    var userId = req.userInfo._id.toString();
    User.findOne({
        _id:userId
    }).then(function (doc) {
        var collectArticle = doc.collectActicle;
        var count = collectArticle.length;
        var pageSize = 5;
        var page =  Number(req.query.page || 1);
        var skip = (page-1)*pageSize;
        var pageCount = Math.ceil(count/pageSize);

        responseMainData.count = count;
        responseMainData.page = page;
        responseMainData.pageCount = pageCount;
        Article.find({
            _id:{
                $in:collectArticle
            }
        }).skip(skip).limit(pageSize).then(function (data) {
            responseMainData.articles = data;
            res.render('main/personal-collection.html',responseMainData);
        })
    });

});

router.post('/personal/cancelCollection',function (req, res, next) {
    var userId = req.userInfo._id;
    var articleId = req.body.articleId;

   User.findOne({
       _id:userId
   }).then(function (doc) {
       var index = doc.collectActicle.indexOf(articleId)
       doc.collectActicle.splice(index,1);
       doc.save(function () {

           res.json({
               status:0
           })
       })
   })
});

//头像提交
router.post('/personal/upload',function(req, res, next){
    var id = req.userInfo._id;

    //console.log(req.header)
    //通过请求头信息创建busboy对象
    var busboy = new Busboy({headers:req.headers});//必须使用头信息
    //将流链接到busboy对象，数据流写入到busboy
    req.pipe(busboy);
    //监听file事件获取文件（字段名，文件，文件名，传输编码，mime类型）
    /*
     * filedname:input的name名称
     * file：文件数据
     * filename：文件名
     * encoding：传输编码
     * mimetype：文件类型
     * */
    busboy.on('file',function(fieldname, file, filename, encoding, mimetype){
        console.log(mimetype)
        //指定文件下载写入到upload文件夹下，文件名为传入的filename；写入流
        var writeStream = fs.createWriteStream('./public/upload/images/'+ id + '/head/' +filename);

        //读取数据
        file.on('data',function(data){
            //console.log('File [ ' + fieldname + ' ] got' + data.length + 'bytes');
            writeStream.write(data);//写入数据
        });
        file.on('end',function(){
            //console.log('File [ ' + fieldname + ' ] finished');
            filenameimg = filename;
            writeStream.end();//关闭写入流
        })
    });

//监听filed事件获取字段信息（字段名称、字段值，字段名称是否截断，值是否截断，传输编码，mime类型）
    busboy.on('field',function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype){
        //console.log('Field [ ' + fieldname + ' ] :value: ' + val + ' fieldnameTruncated = ' + fieldnameTruncated + ' valTruncated = ' + valTruncated);
    });

//监听完成事件
    busboy.on('finish',function(){
        User.findOne({
            _id:id
        }).then(function(data){
            if(data){
                return User.update({
                    _id:id
                },{
                    imgSrc:'/public/upload/images/'+id+'/head/'+filenameimg
                }).then(function(data){
                    res.redirect('/personal')
                })
            }
        });
    })
});

//文章提交
router.post('/personal/article/add/takeup',function(req, res, next){
    var category = req.body.category;
    var title = req.body.title;
    var mark = req.body.mark;
    var description = req.body.description;
    var content = req.body.content;
    var markdown = req.body.markdown;

    var article = new Article({
        category:category,
        title:title,
        mark:mark,
        user:req.userInfo._id.toString(),
        description:description,
        content:content,
        markdown:markdown
    });
    article.save().then(function(data){
        res.json({
            code:1
        })
    });
});

//文章修改
router.get('/personal/article/edit',function(req, res, next){
    var id = req.query.articleId || '';
    Article.findOne({
        _id:id
    }).then(function(data){
        responseMainData.articleEdit = data;
        res.render('main/article_edit.html',responseMainData);
    });
});

//文章修改保存
router.post('/personal/article/edit',function(req, res, next){
    var id = req.body.articleId;
    var category = req.body.category;
    var title = req.body.title;
    var mark = req.body.mark;
    var description = req.body.description;
    var content = req.body.content;
    var markdown = req.body.markdown;

    Article.update({
        _id:id
    },{
        category:category,
        title:title,
        mark:mark,
        user:req.userInfo._id.toString(),
        description:description,
        content:content,
        markdown:markdown
    }).then(function(data){
        res.json({
            code:1
        })
    });
});

//article页面文章删除按钮
router.post('/personal/article/delete',function(req, res, next){
    var id = req.body.id || '';
    Article.remove({
        _id:id
    }).then(function(data){
        res.json({
            code:1,
            message:'删除成功'
        })
    })
});

//文章详情页
router.get('/article/details',function(req, res, next){
    var id = req.query.articleId || '';
    Article.findOne({
        _id:id
    }).then(function (data) {
        var num = ++data.views;//增加浏览量
        Article.update({
            _id:id
        },{
            views:num
        }).then(function (status) {
            if(status){
                Article.findOne({
                    _id:id
                }).populate(['category','user']).then(function(data){

                    responseMainData.isCollect = false;
                    data.user.collectActicle.forEach(function (t) {
                        if(id === t){
                            responseMainData.isCollect = true;
                        }
                    });
                    responseMainData.articleDetail = data;
                    res.render('main/article_details.html',responseMainData)
                });
            }
        });
    });
});

// 文章详情页收藏按钮
router.post('/article/collect',function (req, res, next) {
    var articleId = req.body.articleId;
    var userId = req.userInfo._id;

    User.findOne({
        _id:userId
    }).then(function (data) {
        data.collectActicle.push(articleId);
        data.save(function (err,doc) {
            if(!err){
                res.json({
                    status:0
                })
            }
        });
    })

});

router.post('/article/cancelCollect',function (req, res, next) {
    var articleId = req.body.articleId;
    var userId = req.userInfo._id;

    User.findOne({
        _id:userId
    }).then(function (data) {
        data.collectActicle.forEach(function (t, i) {
            if(articleId === t){
                data.collectActicle.splice(i,1);
            }
        });
        data.save(function (err,doc) {
            if(!err){
                res.json({
                    status:0
                })
            }
        });
    })

});

module.exports = router;