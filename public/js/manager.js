/**
 * Created by Administrator on 2017/5/12.
 */

$(function(){
   //后台登录
    $('.manager_login').on('click',function(){
        var username = $('#mana_username').val();
        var password = $('#mana_password').val();

        if(!username){
            $('.mana_prompt_info').html('请输入用户名');
        }else if(!password){
            $('.mana_prompt_info').html('请输入密码');
        }else{
            $.ajax({
                url:'/admin/manager/login',
                type:'post',
                data:{
                    username:username,
                    password:password
                },
                dataType:'json',
                success:function(data){
                    $('.mana_prompt_info').html(data.message);
                    if(!data.code){
                        setTimeout(function(){
                            window.location.href = '/admin';
                        },1000)
                    }
                }
            })
        }
    });

    $('.user_login').delegate('input','keyup',function(e){
        if(e.keyCode == 13){
            $('.manager_login').trigger('click');
        }
    });

});