/**
 * Created by Administrator on 2017/5/10.
 */

$(function(){
    getUlW();

    //点击导航
    $('.nav_con').delegate('a','click',function(){
        $(this).parent().siblings().children().removeClass('nav_active');
        $(this).addClass('nav_active');
    });

    //切换登录和注册
    $('.go_login').delegate('a','click',function(){
        $('.login_box').show();
        $('.register_box').hide();
    });
    $('.go_register').delegate('a','click',function(){
        $('.login_box').hide();
        $('.register_box').show();
    });

    //点击注册按钮
    $('.registerbtn').on('click',function(){
        var regUsername = $('#reg_username').val();//用户名
        var regPassword = $('#reg_password').val();//密码
        var regRePassword = $('#reg_repassword').val();//确认密码

        if(!regUsername){
            $('.register_prompt_info').html('请输入用户名！！！');
        }else if(!regPassword){
            $('.register_prompt_info').html('请输入密码！！！');
        }else if(regRePassword != regPassword){
            $('.register_prompt_info').html('两次输入的密码不一致！！！');
        }else{
            $.ajax({
                url:'/api/user/register',
                type:'post',
                data:{
                    username:regUsername,
                    password:regPassword,
                    repassword:regRePassword
                },
                dataType:'json',
                success:function(data){
                    $('.register_prompt_info').html(data.message);
                    //判断注册成功，切换到登录页面
                    if(!data.code){
                        setTimeout(function(){
                            $('.register_box').hide();
                            $('.login_box').show();
                            $('#reg_username').val('');
                            $('#reg_password').val('');
                            $('#reg_repassword').val('');
                            $('.register_prompt_info').html('');
                        },1000)
                    }
                },
                error:function(err){

                }
            })
        }
    });

    //点击登录
    $('.loginbtn').on('click',function(){
        //获取输入的用户名和密码
        var username = $('#username').val();
        var password = $('#password').val();
        if(!username){
            $('.login_prompt_info').html('请输入用户名！！！');
        }else if(!password){
            $('.login_prompt_info').html('请输入密码！！！');
        }else{
            $.ajax({
                url:'/api/user/login',
                type:'post',
                data:{
                    username:username,
                    password:password
                },
                dataType:'json',
                success:function(data){
                    console.log(data)
                    $('.login_prompt_info').html(data.message);
                    //判断登录成功
                    if(!data.code){
                        setTimeout(function(){
                            //$('.login_box').hide();
                            //$('.register_box').hide();
                            //$('.user_info').show();
                            window.location.reload();
                        },1000)
                    }
                },
                error:function(){

                }
            })
        }

    });

    //点击退出
    $('.quit').on('click',function(){
        $.ajax({
            url:'/api/user/quit',
            type:'get',
            success:function(data){
                if(data){
                    window.location.reload();
                }
            }
        })
    });

    //按下enter键登录和注册
    $('.login_box').delegate('input','keyup',function(e){
        if(e.keyCode == 13){
            $('.loginbtn').trigger('click');
        }
    });
    $('.register_box').delegate('input','keyup',function(e){
        if(e.keyCode == 13){
            $('.registerbtn').trigger('click');
        }
    });


    /*--------------personal.html---------*/
    $('.abs_add').on('click',function(){
        $(this).parent().hide();
        $('.abs_edit').show();
    });
    $('.abs_cancel').on('click',function(){
        $(this).parent().hide();
        $('.abs_prompt').show();
    });

    $('.personal_content_nav').delegate('a','click',function(){
        $(this).parent().siblings().children().removeClass('active');
        $(this).addClass('active');
    });
    //头像上传
    $('.upload_user_imgBtn').on('click',function(){
        //弹出模态框
        $('#uploadImgModal').modal();
        //选择文件并预览
        $('.file>input').on('change',function(e){
            e.preventDefault();
            var fileDiv = document.getElementsByClassName('file')[0];
            var inputFile = fileDiv.getElementsByTagName('input')[0];
            var file = inputFile.files[0];
            if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
                alert('不是有效的图片文件!');
                return;
            }else{
                var reader = new FileReader();
                reader.onload = function (event) {
                    data = event.target.result;
                    $('.file_box').css({'backgroundImage':'url(' + data + ')'});
                };
                reader.readAsDataURL(file);
                return false;
            }
        });
    });





    /*---------------article.html--------------*/
    //提交按钮
    $('.articleBtn').on('click',function(){
        var category = $('#article_category').val();
        var title = $('#acticle_title').val();
        var mark = $('#tab_mark').val();
        var description = $('#article_description').val();
        var content = testEditor.getPreviewedHTML();
        var markdown = testEditor.getMarkdown();
        var markO = mark.split('-');
        console.log(markdown)

        if(!category || !title || !mark || !description || !content){
            alert('请输入完整的信息')
        }else{
            $.ajax({
                url:'/personal/article/add/takeup',
                type:'post',
                data:{
                    category:category,
                    title:title,
                    mark:markO,
                    description:description,
                    content:content,
                    markdown:markdown
                },
                dataType:'json',
                success:function(data){
                    if(data.code){
                        alert('保存成功');
                    }
                }
            })
        }
    });


    /*---------------------首页搜索---------------------*/
    $('.search_icon').on('click',function(){
        var name = $('.search_input').val();
        $.ajax({
            url:'/search?sq='+name,
            type:'get',
            success:function(data){
                console.log(data)
                window.location.href = '/search?sq='+name;
            }
        })
    });

    $('.search_input').on('keyup',function(e){
        var keycode = e.keyCode || e.which;
        if(keycode == 13){
            $('.search_icon').trigger('click');
        }
    });
    //搜索页大的搜索框
    $('.search_lg_input').on('keyup',function(e){
        var keycode = e.keyCode || e.which;
        if(keycode == 13){
            var name = $('.search_lg_input').val();
            console.log(name)
            $.ajax({
                url:'/search?sq='+name,
                type:'get',
                success:function(data){
                    console.log(data)
                    window.location.href = '/search?sq='+name;
                }
            })
        }
    })

});
//判断分类导航的长度
function getUlW(){
    var ulWidth = $('.nav_con>ul').width();
    if(ulWidth>740){
        $('.nav_con>ul').width('740');
    }
}

//personal页面文章操作的删除按钮
function articleDelete(id){
    $('#deleteModal').modal();
    $('.articleDeleteModalBtn').on('click',function(){
        $.ajax({
            url:'/personal/article/delete',
            type:'post',
            data:{
                id:id
            },
            dataType:'json',
            success:function(data){
                if(data.code){
                    window.location.reload();
                }
            }
        })
    });
}

//personal修改文章article_edit页面提交按钮
function articleEdit(id){
    var category = $('#article_category').val();
    var title = $('#acticle_title').val();
    var mark = $('#tab_mark').val();
    var description = $('#article_description').val();
    var content = testEditor.getMarkdown();

    if(!category || !title || !mark || !description || !content){
        alert('请输入完整的信息')
    }else{
        $.ajax({
            url:'/personal/article/edit',
            type:'post',
            data:{
                articleId:id,
                category:category,
                title:title,
                mark:mark,
                description:description,
                content:content
            },
            dataType:'json',
            success:function(data){
                if(data.code){
                    alert('保存成功');
                }
            }
        })
    }
}

/*---------------article_detail.html收藏按钮--------------*/
function collectArticle(articleId) {
    $.ajax({
        url:'/article/collect',
        type:'post',
        data:{
            articleId:articleId
        },
        dataType:'json',
        success:function (data) {
            if(data.status === 0){
                window.location.reload()
            }
        }
    })
}

/*---------------article_detail.html取消收藏按钮--------------*/
function cancelCollectArticle(articleId) {
    $.ajax({
        url:'/article/cancelCollect',
        type:'post',
        data:{
            articleId:articleId
        },
        dataType:'json',
        success:function (data) {
            if(data.status === 0){
                window.location.reload()
            }
        }
    })
};

function cancelCollection(id) {
    $.ajax({
        url:'/personal/cancelCollection',
        type:'post',
        data:{
            articleId:id
        },
        dataType:'json',
        success:function (response) {
            if(response.status === 0){
                window.location.reload();
            }
        }
    })
}
