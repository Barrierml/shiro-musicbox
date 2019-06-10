no_init = -1
init_compelet = 0
playing = 1
pausing = 2
loading = 3
erroo = 10
shiro_Musicbox = {
	"vsion" : "1.0.0",
	"Describing":"包装audio而成的播放器，目前拥有的功能：1，播放暂停，2更换封面，3进度条，缓冲条及其基本功能",
	"music_player" : null,
	"_state" : no_init, // -1是尚未初始化，0是初始化完毕,1是播放中，2是暂停,3是初始化完毕
	"now_time" : 0,
	"box_play" : null,
	"box_next" : null,
	"jindutiao" : null,
	"time":null,
	"keep_change":null,
	"song_num":0,
	"is_danqu":false,
	"is_loading":false,//防止出现尚未加载完成就操作的状态
	"list":[],
	"_PLAY" : function () {
		//暂停就播放，播放就暂停
		if (shiro_Musicbox._state === playing){
			shiro_Musicbox.music_player.pause()
			shiro_Musicbox._state = pausing
			shiro_Musicbox.box_play.classList.remove("layui-icon-pause")
			shiro_Musicbox.box_play.classList.add("layui-icon-play")
		}
		else if (shiro_Musicbox._state === init_compelet || shiro_Musicbox._state === pausing){
		shiro_Musicbox._state = playing
		shiro_Musicbox.music_player.play()
		shiro_Musicbox.box_play.classList.remove("layui-icon-play")
		shiro_Musicbox.box_play.classList.add("layui-icon-pause")
		}
	},
	"init" : function(){
		//初始化，把事件都绑定到元素上
		if (this._state != -1) {return}
		shiro_Musicbox.is_loading =true
		shiro_Musicbox.music_player = new Audio()
		shiro_Musicbox._state = init_compelet
		shiro_Musicbox.box_play = chazhao(".layui-icon-play")
		shiro_Musicbox.box_next = chazhao(".layui-icon-right")
		shiro_Musicbox.jindutiao = chazhao(".player .on")
		shiro_Musicbox.time = chazhao(".time")
		shiro_Musicbox.box_play.addEventListener("click",shiro_Musicbox._PLAY,false)
		chazhao(".player .on").addEventListener("click",shiro_Musicbox.change_jindutiao,false)
		chazhao(".player .jindutiao").addEventListener("click",shiro_Musicbox.change_jindutiao,false)
		chazhao(".player .layui-icon-right").addEventListener("click",shiro_Musicbox._next,false)
		chazhao(".player .layui-icon-left").addEventListener("click",shiro_Musicbox._upper,false)
		shiro_Musicbox.bg_change(1,"pic/tt2.jpg")
		shiro_Musicbox.keep_change = setInterval(function () {
		        shiro_Musicbox.change()
		    }, 333)
		shiro_Musicbox.is_loading =false
		shiro_Musicbox.tuodong()
		setTimeout(function(){
			shiro_Musicbox._next()
		},1000)
	},
	"value_change":function(pre,now,all,buff){
		//进度条和时间的值,还有以缓存
		shiro_Musicbox.jindutiao.style.width = pre + '%';
		shiro_Musicbox.time.innerText = now + '/' + all;
		chazhao("body > div.player > div.jindutiao > div").style.width = buff + '%';
	},
	"change":function(){
		//监控属性并改变
		var net = shiro_Musicbox.music_player.networkState
		if (net===3){
			return
		}
        var all_time = secondToDate(shiro_Musicbox.music_player.duration)
        var now_time = secondToDate(shiro_Musicbox.music_player.currentTime)
        var percentage = parseInt(shiro_Musicbox.music_player.currentTime / shiro_Musicbox.music_player.duration * 100)
		var ended = shiro_Musicbox.music_player.ended
		var is_ok = shiro_Musicbox.music_player.readyState
		if(is_ok===4){var bu = shiro_Musicbox.music_player.buffered.end(0)}//播放就绪再加载进度条
		var buffer = parseInt(bu/shiro_Musicbox.music_player.duration * 100)
		if (ended){
			if (shiro_Musicbox.is_danqu) {
				shiro_Musicbox._PLAY()
			} else{
				shiro_Musicbox._next()
			}
		}
		shiro_Musicbox.value_change(percentage, now_time, all_time,buffer);
	},
	"change_jindutiao":function(ev){
		//点击进度条调整进度
        var oEvent = ev||event;
		var x = oEvent.clientX
		var absulute_x = x - parseInt(chazhao(".player").offsetLeft)
		var _width = parseInt(chazhao(".jindutiao").clientWidth)
		var pre = parseInt(absulute_x / _width *100)
		shiro_Musicbox.music_player.currentTime = pre * shiro_Musicbox.music_player.duration/100
	},
	"add_pic":function(src){
		//加封面
		shiro_Musicbox.is_loading = true
		var ww = document.createElement('img')
		ww.src = src
		ww.classList.add("show")
		chazhao(".player .head").appendChild(ww)
		setTimeout(function(){
			shiro_Musicbox.is_loading = false
		},1500)
	},
	"del_pic":function(){
		//删封面
		if (chazhao(".player .head .show"))
		{
		shiro_Musicbox.is_loading = true
		chazhao(".player .head .show").className = "hide"
		setTimeout(function(){
			chazhao(".player .head").innerHTML = ""
			shiro_Musicbox.is_loading = false
		},1500)
		}
	},
	"_next":function(){
		//下一首，如果是最后一首就回到第一首，一首加一首
		if (shiro_Musicbox.is_loading){return}
		if (shiro_Musicbox._state === playing){
			shiro_Musicbox._PLAY()
		}
		shiro_Musicbox.del_pic()
		if (true){
			ajax({
				//请求歌曲
				method : "get",
				url : "http://127.0.0.1:8000/song",
				data:"",
				asyn : true,
				fn : function( res ){
					if (res != 0){
					var data = JSON.parse(res)
					var url = data["url"] 
					var name = data["name"]
					var singer = data["singer"]
					shiro_Musicbox.add_song(name+"--"+singer,url,"pic/2.png")
					}
					else{
						shiro_Musicbox.add_pic("pic/1.png")
					}
				}
			});
			ajax({
				//请求壁纸
				method : "get",
				url : "http://127.0.0.1:8000/pic",
				data:"",
				asyn : true,
				fn : function( res ){
					if (res != 0){
					var data = JSON.parse(res)
					var url = data["url"]
					shiro_Musicbox.bg_change(1,url)
					}
				}
			});
		}
		return
		//下面的列表循环功能，暂时不用
		var num =  shiro_Musicbox.list.length
		var now_num = shiro_Musicbox.song_num
		setTimeout(function(){
			if (now_num+1 === num){
				shiro_Musicbox.song_num = 0
				shiro_Musicbox.song_load()
			}
			else if (now_num+1 < num) {
				shiro_Musicbox.song_num = shiro_Musicbox.song_num + 1
				shiro_Musicbox.song_load()
			}
		},1500)
		},
	"_upper":function(){
		//上一首，如果是第一首就回到最后一首，一首减一首
		if (shiro_Musicbox.is_loading){return}
		if (shiro_Musicbox._state === playing){
			shiro_Musicbox._PLAY()
		}
		shiro_Musicbox.del_pic()
		var num =  shiro_Musicbox.list.length
		var now_num = shiro_Musicbox.song_num
		setTimeout(function(){
			if (now_num === 0){
				shiro_Musicbox.song_num = num - 1 
				shiro_Musicbox.song_load()
			}
			else if (now_num > 0) {
				shiro_Musicbox.song_num = shiro_Musicbox.song_num - 1
				shiro_Musicbox.song_load()
			}
		},1500)
	},
	"song_load":function(){
		//加载曲子，直接播放
		num = shiro_Musicbox.song_num
		shiro_Musicbox.music_player.src = shiro_Musicbox.list[num].src
		chazhao(".player .tit").innerText = shiro_Musicbox.list[num].name
		shiro_Musicbox.music_player.load()
		shiro_Musicbox.add_pic(shiro_Musicbox.list[num].logo)
		shiro_Musicbox._PLAY()
	},
	"bg_change":function(mode,src){
		if (mode===1){
			//加背景
			var ww = document.createElement('img')
			ww.src = src
			ww.onload = function(){
				var w = ww.naturalWidth
				var h = ww.naturalHeight
				var pic_rate = w/h
				var zongkuan = document.body.offsetWidth
				var is_small = true
				if (w>zongkuan){is_small=false}
				if(is_small){
					bianju_pre = ((zongkuan - w)/2)/zongkuan *100
				}
				if (is_small){
					ww.style = "width:100%"
					chazhao(".bg").innerHTML = ""
					chazhao(".bg").appendChild(ww)
					return
				}
				//自适应显示
				if (pic_rate >= 16/9){
					//大于16比9就铺开显示
					ww.style = "width:100%;height:100%"
				}
				if (pic_rate < 16/9 && pic_rate >= 4/3){
					//接近4/3就4/3的显示
					ww.style = "width:60%;height:100%;left:"+bianju_pre+"%"
				}
				if (pic_rate < 4/3 && pic_rate >= 1){
					//正方形的话，就正方形显示
					ww.style = "left:"+bianju_pre+"%"
				}
				if (pic_rate < 1){
					//正方形的话，就正方形显示
					ww.style = "left:"+bianju_pre+"%"
				}
				chazhao(".bg").innerHTML = ""
				chazhao(".bg").appendChild(ww)
			}
		}
		if (mode===0){
			//删除背景
			
		}
	},
	"add_song":function(song_name,song_src,song_logo,now_play){
		//新加的曲子
			shiro_Musicbox.list.push({"name":song_name,"src":song_src,"logo":song_logo})
			shiro_Musicbox.song_num = shiro_Musicbox.list.length - 1
			if (shiro_Musicbox._state === playing){
				shiro_Musicbox._PLAY()
			}
			shiro_Musicbox.del_pic()
			if (shiro_Musicbox._state ===init_compelet)
			{
			setTimeout(function(){
					shiro_Musicbox.song_load()
				},500)
			}
			else{
			setTimeout(function(){
				shiro_Musicbox.song_load()
			},1500)
			}
	},
	"tuodong":function(){
		//设置自身可以拖动
		obj = chazhao(".player")
		obj.onmousedown = function(ev){
    　　var oevent = ev || event;
    　　var distanceX = oevent.clientX - this.offsetLeft;
    　　var distanceY = oevent.clientY - this.offsetTop;
        //鼠标移动
    　　document.onmousemove = function(ev){
    　　　　var oevent = ev || event;
    　　　　obj.style.left = oevent.clientX - distanceX + 'px';
    　　　　obj.style.top = oevent.clientY - distanceY + 'px'; 
    　　};
        //鼠标放开
    　　document.onmouseup = function(){
    　　　　document.onmousemove = null;
    　　　　document.onmouseup = null;
    　　};
		};  
	}
}
function chazhao(name){
	return document.querySelector(name)
}
function secondToDate(result) {
    var m = Math.floor((result / 60 % 60)) < 10 ? '0' + Math.floor((result / 60 % 60)) : Math.floor((result / 60 % 60));
    var s = Math.floor((result % 60)) < 10 ? '0' + Math.floor((result % 60)) : Math.floor((result % 60));
    ret = m + ":" + s;
    return ret == 'NaN:NaN' ? '00:00' : ret;
}
function ajax( myJson ){
	//新建ajax对象
	var xhr = null;
	window.XMLHttpRequest?(xhr=new XMLHttpRequest()):(xhr=new ActiveXObject("Microsoft.XMLHTTP"));
	//定义数据传输方法“get”或“post”，如果没有写，那么默认的是用“get”方法！
	var method = myJson.method||"get";
	//定义数据传输的地址！
	var url = myJson.url;
	//定义数据加载方式（同步或异步），默认的情况下，使用ajax，都是异步加载！
	var asyn = myJson.asyn||true;
	//定义传输的具体数据！
	is_data = false
	if (myJson.data){
		var data = myJson.data;
	}
	//成功之后执行的方法！
	var fn = myJson.fn;
	//第一种情况：如果是用get方法，并且data是存在的，就执行：
	if (is_data){
	if(method=="get"&&data){
		xhr.open(method,url+"?"+data+"&"+Math.random(),asyn);
	}
	//第二种情况：如果是用post方法，并且data是存在的，就执行：
	if(method=="post"&&data){
		xhr.open(method,url,asyn);
		xhr.setRequestHeader("content-type","application/x-www-form-urlencoded");
		xhr.send(data);
	}else{
		xhr.send();
	}
	}
	else{
		if(method=="get"){
			xhr.open(method,url,asyn);
		}
		//第二种情况：如果是用post方法，并且data是存在的，就执行：
		if(method=="post"&&data){
			xhr.open(method,url,asyn);
			xhr.setRequestHeader("content-type","application/x-www-form-urlencoded");
			xhr.send(data);
		}else{
			xhr.send();
		}
	}
	//数据传输成功之后
	xhr.onreadystatechange=function(){
		if(xhr.readyState==4){
			if(xhr.status>=200&&xhr.status<300){
				fn(xhr.responseText);
			}else{
				console.log("请求失败")
				fn(0)
			}
		}
	}
}
shiro_Musicbox.init()