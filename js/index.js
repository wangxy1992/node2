$(function(){
	var user;
	var socket;
	$("#btn").on("click",function(){
			var text = $("#user").val();
			$("#user").val("");
			socket.emit("text",{user:user,info : text})
	})
	$("#login").on("click",function(){
		$.ajax({
			type:"get",
			url:"http://localhost:8003/login",
			data : {username : $("#username").val(),password : $("#password").val()},
			success : function(data){
				if (data.status == 0){
					$("#box").hide();
					$("#maxbox").show();
					user = data.data.user;
					socket = io.connect("http://localhost:8003");
					socket.on("news",function(data){
						data = data.text;
						var id = data._id.split("T")[1].slice(0,8);
						var html = `<li>
									<p><span>时间:${id}</span><span>用户:user${data.user}</span></p>
									<div>${data.info}</div>
								</li>`
						$("#info").append(html)
						setTimeout(function(){
							$("#box2").animate({scrollTop: $('#info').height()}, 1500)
						},300)
						
					})
				}else{
					alert(data.messge)
				}
			}
		});
	})
	$("#register").on("click",function(){
		$.ajax({
			type:"post",
			url:"http://localhost:8003/register",
			data : {username : $("#username").val(),password : $("#password").val()},
			success : function(data){
				alert(data.message)
			}
		});
	})
})