(function($) {
	var gameWrap = $('#game-wrap'); //游戏容器
	var canvas = $('#game').get(0); //游戏canvas容器
	var c = canvas.getContext('2d'); //画布操作对象
	var c_w = canvas.width,
		c_h = canvas.height; //画布的宽高
	var config = {}; //游戏配置
	var resources = { //游戏资源
		'imgPath': './images/',
		'imgs': ['buttlet1.png', 'bg.jpg', 'target1.png', 'target2.png','catapult.png'
			//, '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg', '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg', '17.jpg', '18.jpg'
		]
	};

	$(window).on('resize', setCanvas);
	//阻止滚动
	document.body.addEventListener('touchmove', function(event) { 
		event.preventDefault(); 
	}, false);

	setCanvas(); //初始容器设置
	loadGame(); //游戏预加载
	function setCanvas() {
		var width = 640,
			height = 1010,
			w_w = $(window).width(),
			w_h = $(window).height();
		gameWrap.css({
			'opsition': 'absolute',
			'width': w_w > width ? width : w_w,
			'height': w_h,
			'margin': '0 auto',
			'background': 'black'
		});
		c_w = canvas.width = gameWrap.offset().width;
		c_h = canvas.height = gameWrap.offset().height - 2;
	}

	//创建图片函数
	function creatImg(path) {
		// var imgPath = 'images/'+path;
		var imgPath = resources.imgPath + path;
		var img = new Image();
		img.src = imgPath;
		//$(img).attr('alt','');
		return img;

	}
	//随机函数
	function rd(n, m) {
		var c = m - n + 1;
		return Math.floor(Math.random() * c + n);
	}
	//数组删除函数扩展
	Array.prototype.remove = function(dx) {
		if (isNaN(dx) || dx > this.length) {
			return false;
		}
		for (var i = 0, n = 0; i < this.length; i++) {
			if (this[i] != this[dx]) {
				this[n++] = this[i]
			}
		}
		this.length -= 1
	}

	//加载游戏
	function loadGame() {
		var imgPaths = []; //所有图片路径
		for (var i = 0; i < resources.imgs.length; i++) {
			imgPaths.push(resources.imgPath + resources.imgs[i]);
		}
		var images = []; //所有图片元素
		var imgSum = 0; //图片元素个数
		var loadedImg = 0; //已加载个数
		var progress = 0; //加载进度
		for (i = 0; i < imgPaths.length; i++) {
			var img = new Image();
			img.src = imgPaths[i];
			images.push(img);
			imgSum++;
		}

		//加载图片
		for (i = 0; i < images.length; i++) {
			images[i].onload = function() {
				loadedImg++;
				progress = (loadedImg * 100 / imgSum).toFixed(2);
				loadEvent(progress);
				if (progress == 100) {
					console.log('图片加载完成!');
					gameStart();
				}
			}
		}
		//加载事件
		function loadEvent(progress) {
			console.log(progress);
		}

	}

	function gameStart() {

		var game = {
				score: 0,
				time: 3000,
				frames: 10, //游戏帧数
				bulletsNum: 30, //子弹个数
				bullets: [], //子弹对象集合
				targetNum: 0, //目标个数
				targets: {}, //目标集合
				targetsCreartTime: 2, //目标出现间隔
				clientX: c_w / 2, //玩家触碰x轴
				clientY: (4 * c_h) / 5, //玩家触碰y轴
				reloadTime: 12, //填弹时间
				isReload: false,
				gameTime: 0,
				init: function() {
					var $this = this;
					$this.bgx1 = 0;
					$this.bgx2 = c_w-1;
					$this.drawBg(); //设置背景
					catapult.init(); //弹弓初始化
					$this.creatBullet(); //创建子弹
					$this.getPoint(); //屏幕事件
					$this.interval(); //游戏计时器
				},
				interval: function() {
					var $this = this;
					var reloadTime = this.reloadTime;
					$this.timer = setInterval(function() {
						$this.gameTime++;
						$this.drawBg(); //设置背景
						catapult.drawBg(); //画弹弓
						catapult.draw2Line(); //画弹弓线
						if ($this.gameTime % $this.targetsCreartTime == 0) {
							$this.creatTarget(1, rd(1, 2)); //创建目标
						}
						if ($this.gameTime % ($this.targetsCreartTime * 2) == 0) {
							$this.creatTarget(2, rd(1, 2)); //创建目标
						}
						for (var i = 0; i < $this.bullets.length; i++) {
							$this.bullets[i].drawBg(); //画子弹
						}
						for (var i in $this.targets) {
							$this.targets[i].draw(); //画目标
						}

						$this.drawInfo(); //画说明

						//填弹动作
						if ($this.isReload) {
							$this.reloadTime--;

						}
						if ($this.reloadTime <= 0) {
							$this.isReload = false;
							$this.reloadTime = reloadTime;
						}
						//集合控制
						//删除越界目标
						for (var i in game.targets) {
							if (game.targets[i].isDie) {
								delete game.targets[i];
							}
						}
						//删除越界子弹
						for (var i = 0; i < game.bullets.length; i++) {
							if (game.bullets[i].isDie) {
								game.bullets[i] = null;
								game.bullets.remove(i);
							}
						}
					}, game.frames);
				},
				reloadBullet: function() {
					var $this = this;
					$this.isReload = true;
					for (var i = 0; i < $this.bullets.length; i++) {
						$this.bullets[i].selected = false;
						$this.bullets[i].setV();
					}

					$this.initPosition();
					$this.creatBullet();

				},
				creatBullet: function() {
					this.bullets.push(new Bullet('buttlet1.png'));
					this.bulletsNum--;
					
				},
				creatTarget: function(type, dir) {
					//this.targetNum++;
					this.targets[++this.targetNum] = new Target(type, dir);
					console.log(this.targets);
					//this.targets.push(target);
					//this.targetsNum--;
				},
				initPosition: function() {
					this.clientX = c_w / 2; //玩家触碰x轴
					this.clientY = (4 * c_h) / 5 //玩家触碰y轴
				},
				getPoint: function() {
					var $this = this;

					gameWrap.on('touchstart', function(ev) {
						var e = ev.event || window.event;
						if (!$this.isReload) {
							var clientX = e.touches[0].clientX - gameWrap.offset().left;
							var clientY = e.touches[0].clientY;
						}
						if ((clientX > 0) && (clientX < c_w) && (clientY > c_h - catapult.height - 50) && (clientY < c_h)) {
							//先取消事件绑定
							gameWrap.unbind('touchmove');
							gameWrap.unbind('touchend');
							//拖拽事件
							$this.clientX = clientX;
							$this.clientY = clientY;
							gameWrap.on('touchmove', function(ev) {
								var e = ev.event || window.event;
								var clientX = e.touches[0].clientX - gameWrap.offset().left;
								var clientY = e.touches[0].clientY;
								if (!$this.isReload) {
									if (clientX < 0) {
										$this.clientX = 0;
									} else if (clientX > catapult.width) {
										$this.clientX = catapult.width;
									} else {
										$this.clientX = clientX;
									}
									if (clientY > c_h) {
										$this.clientY = c_h;
									} else if (clientY < c_h - catapult.height) {
										$this.clientY = c_h - catapult.height;
									} else {
										$this.clientY = clientY;
									}
								}
							});
							//发射事件
							gameWrap.on('touchend', function(ev) {
								var e = ev.event || window.event;
								$this.reloadBullet();

							});
						} else {
							gameWrap.unbind('touchmove');
							gameWrap.unbind('touchend');
						};
					});



				},
				drawBg: function(bgPath) {
					var $this = this;
					$this.bgImg = bgPath ? creatImg(bgPath) : creatImg('bg.jpg');
					$this.bgx1-=3;
					$this.bgx2-=3;
					if($this.bgx1<=-c_w){$this.bgx1 = c_w-10};
					if($this.bgx2<=-c_w){$this.bgx2 = c_w-10}
					

					c.drawImage($this.bgImg, $this.bgx1, 0, c_w, c_h );
					c.drawImage($this.bgImg, $this.bgx2, 0, c_w, c_h );
				},
				drawInfo: function() {
					c.save();
					c.font = "18px Verdana";
					// 创建渐变
					c.textAlign = "start";
					// 用渐变填色
					c.fillStyle = 'white';
					c.fillText('score:' + game.score, 10, 30);
					c.fillText('time:' + Math.floor(game.gameTime / 50) + 's', 10, 60);
					c.restore();
				}
			}
			//弹弓
		var catapult = {
				width: c_w, //控制区宽度
				height: c_h / 5, //控制区高度
				x: c_w / 2, //触碰点x轴
				y: (4 * c_h) / 5, //触碰点y轴
				intensity: 0, //力度
				img: creatImg('catapult.png'),
				line: {
					color: '#190800',
					width: 13,
					offsetWidth: 0
				},
				init: function() {
					this.line.offsetWidth = this.line.width;
					this.draw2Line();
					this.drawBg();
					this.interval();

				},
				interval: function() {
					var $this = this;
					this.timer = setInterval(function() {
						if (!game.isReload) {
							$this.getPosition(); //弹弓位置设定

						} else {
							$this.gotoPosition(game.clientX, game.clientY);
						}
					}, game.frames);
				},
				getPosition: function() {
					var $this = this;
					this.x = game.clientX;
					this.y = game.clientY + 22; //！！！！！！
					this.intensity = ((this.y - (4 * c_h) / 5 - 22) / 20).toFixed(2) + 1;
					this.line.width = $this.line.offsetWidth - this.intensity * 1.2;
					//console.log($this.line.offsetWidth);
				},
				gotoPosition: function(endx, endy) {
					var $this = this;
					var vx = (endx - this.x) / 3;
					var vy = ((4 * c_h) / 5.05 - this.y) / 3;
					this.x += vx;
					this.y += vy;
					this.intensity = ((this.y - (4 * c_h) / 5 - 22) / 20).toFixed(2) + 1;
					this.line.width = $this.line.offsetWidth - this.intensity * 1.2;
				},
				draw2Line: function() {
					var $this = this;
					c.beginPath();
					c.lineJoin = 'round';
					c.lineCap = 'round';
					c.moveTo(c_w*.35, c_h - $this.height);
					c.lineTo($this.x, $this.y);
					c.lineTo(c_w*.64, c_h - $this.height);
					c.lineWidth = $this.line.width;
					c.strokeStyle = $this.line.color;
					c.stroke();
				},
				drawBg:function(){
					c.drawImage(this.img, c_w*.25,  c_h - this.height-40, c_w*.45, this.img.height*2);
				}
			}
			//子弹
		function Bullet(bg, type) {
			this.x = c_w / 2;
			this.y = c_h - catapult.height;
			this.img = creatImg(bg);
			this.height = 0;
			this.width = 0;
			this.type = type || 'type_1';
			this.selected = true;
			this.creatTime = game.reloadTime;
			this.g = .3; //重力
			//this.f = .001;//阻力
			this.state = false; //是否飞行中
			return this.init();
		}
		Bullet.prototype = {
				init: function() {
					this.drawBg();
					this.getPosition();
					this.interval();
					this.creat();
					this.height = 0;
					this.width = 0;
					this.y = c_h - catapult.height - this.creatTime * 3;
					this.x = c_w / 2 - this.img.width / 2 + this.creatTime * 2;
					this.zoomWidth = this.img.width / this.creatTime;
					this.zoomHeight = this.img.height / this.creatTime;
					this.r = this.img.width;
					this.angle = 0;
					this.vangle = rd(-3, 3);
					this.angleDir =1;
				},
				interval: function() {
					var $this = this;
					this.timer = setInterval(function() {
						$this.status();
						

					}, game.frames);
				},
				status:function(){
					if (this.selected) {
							this.creat();
							this.getPosition();
							this.shake(.5);
						} else {
							this.launch();
							this.beat();
						}
					if(this.y>c_h){
						this.die();
					}
				},
				creat: function() {
					if (this.creatTime >= 0) {
						this.y += 2;
						this.x -= 2;
						this.width += this.zoomWidth;
						this.height += this.zoomHeight;
						this.creatTime--;
					} else {
						this.height = this.img.height;
						this.width = this.img.width;
						this.x = c_w / 2 - this.img.width / 2;
						this.y = c_h - catapult.height - this.img.height / 2;
					}
					
				},
				shake:function(intensity){
					this.angle +=intensity*this.angleDir;
					if(this.angle>15){
						this.angleDir=-1;
					}else if(this.angle<-15){
						this.angleDir=1;
					}
				
				},
				drawBg: function() {
					var $this = this;
					if (this.selected) {
						c.save();
						c.translate($this.cx, $this.cy);
						c.rotate($this.angle * Math.PI / 180);
						c.translate(-$this.cx, -$this.cy);
						c.drawImage($this.img, $this.x, $this.y, $this.width, $this.height);
						c.rotate(0);
						c.restore();
					} else {
						c.save();
						c.translate($this.cx, $this.cy);
						c.rotate($this.angle * Math.PI / 180);
						c.translate(-$this.cx, -$this.cy);
						c.drawImage($this.img, $this.x, $this.y, $this.width, $this.height);
						c.rotate(0);
						c.restore();
					}
				},
				getPosition: function(x, y) {
					if (this.selected && this.creatTime <= 0) {
						this.x = game.clientX - this.img.width / 2;
						this.y = game.clientY - this.img.height / 2;
					} 
					this.cx = this.x + this.width / 2;
					this.cy = this.y + this.height / 2;
				},
				setV: function() { 
					if (!this.state) {
						this.sx = game.clientX - c_w / 2;
						this.sy = game.clientY - (4 * c_h) / 5;
						this.sxy = this.sx / this.sy,
							this.vy = catapult.intensity * 4;
						this.vx = (this.vy * this.sxy) * 0.3;
						this.state = true
					}
				},
				launch: function() {
					this.vy -= this.g;
					this.x -= this.vx;
					this.y -= this.vy;
					this.width -= .1;
					this.height -= .1;
					this.angle += this.vangle;
					this.cx = this.x + this.width / 2;
					this.cy = this.y + this.height / 2;
					this.r = this.width / 2;
				},
				beat: function() {
					var $this = this;

					var s = 0;
					for (var i = 0; i < game.targets.length; i++) {
						s = Math.sqrt(Math.pow((this.cx - game.targets[i].cx), 2) + Math.pow((this.cy - game.targets[i].cy), 2));
						c.rect($this.cx, $this.cy, $this.r, $this.r);

						if ((s <= (this.r + game.targets[i].r))) {
							game.targets[i].byAttack();

							continue;
						}

					}
				},
				die:function(){
					this.isDie = true;
				}
			}
			//靶子
		function Target(type, dir) {
			this.x = 0;
			this.y = c_h / 3 + rd(-100, 50);
			this.type = type || 1;
			this.g = rd(1, 3) * 0.002;
			this.vx = 0;
			this.vy = rd(1, 3) * 0.3;
			this.score = 0;
			this.dir = dir || 2;
			return this.init();
		}
		Target.prototype = {
			init: function() {
				switch (this.type) {
					case 1:
						this.img = creatImg('target1.png');
						this.vx = 2;
						this.score = 5;
						this.hp = 1;
						break;
					case 2:
						this.img = creatImg('target2.png');
						this.vx = 4;
						this.score = 10;
						this.hp = 2;
						break;

				}
				this.width = this.img.width;
				this.height = this.img.height;
				if (this.dir == 2) {
					this.x = -50;

				} else {
					this.x = c_w + 50;
				}
				this.interval();
			},
			interval: function() {
				var $this = this;
				this.timer = setInterval(function() {
					//移动
					$this.move();
					//状态
					$this.status();
				}, game.frames);
			},
			status:function(){
				//生命判断
				if ((this.hp <= 0||this.y > c_h) && !this.isDie) {
						this.die();
					}
			},
			move: function() {
				var $this = this;
				if ($this.dir == 1) {
					$this.x -= $this.vx;

				} else {
					$this.x += $this.vx;
				}
				$this.vy -= $this.g;
				$this.y -= $this.vy;

				$this.cx = $this.x + $this.width / 2;
				$this.cy = $this.y + $this.height / 2;
				$this.r = $this.width / 2;
			},
			draw: function() {
				var $this = this;
				c.drawImage($this.img, $this.x, $this.y, $this.width, $this.height);
			},
			byAttack: function() {
				this.hp--;
			},
			die: function() {
				game.score += this.score;
				this.isDie = true;
				
			}
		}


		game.init(); //游戏初始化

	}

})(Zepto)