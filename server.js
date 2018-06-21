const express = require("express");
const app = express();
const server = require("http").Server(app)
var qs = require("querystring");

//兼容post请求使用的req.body方法
var bodyParser = require("body-parser")
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//定义数据库
var mongodbUrl = "mongodb://localhost:27017";
var MongoClient = require("mongodb").MongoClient;
//socket链接
var io = require("socket.io")(server)
var obj = {_id : "",user : "",info : ""};
var jilu;
var userinfo;


app.get("/login",function(req,res,next){
	res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header('Access-Control-Allow-Headers', 'Content-Type');    
	var username = req.query.username,
		password = req.query.password;
	MongoClient.connect(mongodbUrl,function(err,db){
		if (err) return err;
		var dbbase = db.db("login");
		userinfo = dbbase.collection("userinfo");
		userinfo.find({"username" : username},function(err,d){
			d.each(function(err,data){
				if (data){
					if (data.password == password){
						res.send({status : 0,message : "成功",data:{user : data.username}});
						db.close();
						return false;
					}else{
						res.send({status : 1,message : "登录失败"});
						db.close();
					}
				}
			})	
		})
	})
});

app.post("/register",function(req,res){
	res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');  
    var username = req.body.username,
    	password = req.body.password;
    MongoClient.connect(mongodbUrl,function(err,db){
		if (err) return err;
		var dbbase = db.db("login");
		userinfo = dbbase.collection("userinfo");
   		userinfo.findOne({username : username},function(err,d){
			if (d){
				res.send({status : 1 , message : "账号已注册"})
				db.close();
			}else{
				res.send({status : 0 , message : "账号未注册"})
				userinfo.insert({username: username ,password : password});
				db.close();
			}
		})
    })
		
})


	io.on("connection",function(socket){
		MongoClient.connect(mongodbUrl,function(err,db){
			if (err) return err;
			var dbbase = db.db("login");
			jilu = dbbase.collection("jilu");
			jilu.find({},function(err,data){
				if (data){
					data.forEach(data=>{
						socket.emit("news",{text:data});
					})
				}else{
					socket.emit("news",{text:obj});
				}
			})
			db.close();
		})
		socket.on("text",function(data){
			MongoClient.connect(mongodbUrl,function(err,db){
				if (err) return err;
				var dbbase = db.db("login");
				jilu = dbbase.collection("jilu");
				obj._id = new Date();
				obj.user = data.user;
				obj.info = data.info;
				jilu.insertOne(obj);		
				socket.emit("news",{text:obj})
				socket.broadcast.emit("news",{text:obj});
				db.close();
			})
			
		})
	})


server.listen(8003,function(){
	console.log(server.address().address,server.address().port)
})
