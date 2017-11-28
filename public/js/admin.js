/**
 * Created by Administrator on 2017/5/17.
 */
$(function(){
    //退出后台管理
    $('.mana_qiut').on('click',function(){
        console.log(1)
        $.ajax({
            url:'/admin/qiut',
            type:'get',
            success:function(data){
                window.location.pathname = '/admin/login';
            }
        })
    });

    //分类添加提交
    $('.categoryAddBtn').on('click',function(){
        var categoryName = $('#categoryName').val();
        if(!categoryName){
            $('.category_prompt_info').html('分类名称不能为空');
        }else{
            $('.category_prompt_info').html('');
            $.ajax({
                url:'/admin/category/add',
                type:'post',
                data:{
                    name:categoryName
                },
                dataType:'json',
                success:function(data){
                    $('.category_prompt_info').html(data.message);
                }
            })
        }
    });

    //管理员添加
    $('.userAddBtn').on('click',function(){
        //初始时清空提示框
        $('.userAdd_prompt_info').html('');

        var username = $('#usernameAdd').val();
        var password = $('#passwordAdd').val();
        var repassword = $('#repasswordAdd').val();

        if(!username){
            $('.userAdd_prompt_info').html('用户名不能为空')
        }else if(!password){
            $('.userAdd_prompt_info').html('密码不能为空')
        }else if(password != repassword){
            $('.userAdd_prompt_info').html('两次输入密码不一致')
        }else{
            $.ajax({
                url:'/admin/user/add',
                type:'post',
                data:{
                    username:username,
                    password:password
                },
                dataType:'json',
                success:function(data){
                    $('.userAdd_prompt_info').html(data.message);
                }
            })
        }
    });

    // 后台管理——搜索
    $('.search_btn').on('click',function () {
        var val = $('.search_input').val();
        $.ajax({
            url:'/admin/search?sq='+val,
            type:'get',
            success:function (data) {
                if(data){
                    window.location.href='/admin/search?sq='+val
                }
            },
            error:function (err) {
                console.log(err)
            }
        })
    });
    // 后天管理——搜索-输入框按下enter的事件
    $('.search_input').on('keyup',function (e) {
        if(e.keyCode === 13){
            $('.search_btn').trigger('click');
        }
    })
});

//用户修改权限
function editPower(id){
    $('#editPowerModal').modal();
    $('.editPowerBtn').on('click',function(){
        var val = $('#power').val();
        $.ajax({
            url:'/admin/user/editpower',
            type:'get',
            data:{
                id:id,
                isAdmin:val
            },
            success:function(data){
                if(data.code){
                    window.location.reload();
                }
            }
        })
    })
}
//用户删除
function userDelete(id){
    $('#deleteModal').modal();
    //模态框确定按钮
    $('.deleteModalBtn').on('click',function(){
        $.ajax({
            url:'/admin/user/delete?id='+id,
            type:'get',
            success:function(data){
                if(data.code){
                    window.location.reload();
                }
            }
        })
    });
}
//分类删除
function categoryDelete(id){
    $('#deleteModal').modal();
    $('.deleteModalBtn').on('click',function(){
        $.ajax({
            url:'/admin/category/delete?id='+id,
            type:'get',
            success:function(data){
                if(data.code){
                    window.location.reload();
                }
            }
        })
    });
}
//分类修改
function editCategory(id,name){
    //清空提示修改状态的框
    $('.editCategoryPrompt').html('');
    //给修改名称的输入框赋初始值，即原本的值
    $('#category').val(name);
    //显示模态框
    $('#editCategoryModal').modal();
    //模态框确定修改的按钮
    $('.editCategoryBtn').on('click',function(){
        //获取输入的值
        var val = $('#category').val();
        if(!val){
            $('.editCategoryPrompt').html('分类名称不能为空');
        }else{
            $.ajax({
                url:'/admin/category/edit',
                type:'post',
                data:{
                    id:id,
                    name:val
                },
                dataType:'json',
                success:function(data){
                    $('.editCategoryPrompt').html(data.message);
                    if(data.code){
                        $('#editCategoryModal').modal('hide');
                        window.location.reload();
                    }
                }
            })
        }
    })
}
