
function transform(el,attr,val){
	if(!el.transform){
		el.transform = {
		};
	}
	if(val === undefined){
		return el.transform[attr];
	}
	el.transform[attr] = val;
	let str = "";
	for(let s in el.transform){
		switch(s){
			case "rotate":
			case "rotateX":
			case "rotateY":
			case "rotateZ":
			case "skewX":
			case "skewY":
				str += s +"("+el.transform[s]+"deg) ";
				break;
			case "scale":
			case "scaleX":
			case "scaleY":
				str += s +"("+el.transform[s]+") ";
				break;
			case "translateX":
			case "translateY":
			case "translateZ":
				str += s +"("+el.transform[s]+"px) ";
				break;
		}
	}
	el.style.WebkitTransform = el.style.transform = str;
}
function tap(el,fn){
	let startPoint = {};
	el.addEventListener('touchstart', function(e) {
		startPoint = {
			x: e.changedTouches[0].pageX,
			y: e.changedTouches[0].pageY
		}
	});
	el.addEventListener('touchend', function(e) {
		let nowPoint = {
			x: e.changedTouches[0].pageX,
			y: e.changedTouches[0].pageY
		}
		if(Math.abs(nowPoint.x - startPoint.x) < 5
		&&Math.abs(nowPoint.y - startPoint.y) < 5){
			fn&&fn.call(el,e);
		}
	});
}
function css(el,attr,val){
	let transformAttr = ["rotate","rotateX","rotateY","rotateZ","skewX","skewY","scale","scaleX","scaleY","translateX","translateY","translateZ"];
	for(let i = 0; i < transformAttr.length; i++){
		if(attr == transformAttr[i]){
			return transform(el,attr,val);
		}
	}
	if(val === undefined){
		val = getComputedStyle(el)[attr];
		//console.log(val);
		val = parseFloat(val);
		return val;
	}
	if(attr == "opacity"){
		el.style[attr] = val;
	} else {
		el.style[attr] = val + "px";
	}
}

/*滑屏的函数 */
/*
配置参数
init: {
    wrap: wrap,
    dir: "x"||"y", 要滑动的方向
    start: function(){}, 手指摁下时的回调
    end: function(){} 手指抬起之后的回调
}
*/

function swiper(init){
    let wrap = init.wrap;//滑屏元素的父级
    let scroll = wrap.children[0];//滑动的元素
    let startPonit = {};//手指的初始位置
    let startEl = {};// 元素的初始位置
    let dir = init.dir;
    let isFirst = true; //判断用户是否 是第一次执行move;
    let isDir = { //判断用户在对哪个方向进行滑屏
        x: false,
        y: false
    };
    let dirTranslate = {
        x: "translateX",
        y: "translateY"
    };
    let lastPoint = {}; //上一次的手指坐标

    css(scroll,"translateX",0);
    css(scroll,"translateY",0);
    css(scroll,"translateZ",0);
    //安卓下大面积触摸会引发touchmove的问题
    wrap.addEventListener('touchstart', function(e) {
        init.start&&init.start.call(wrap,e);
        let touch = e.changedTouches[0];
        startPonit = {
            x: touch.pageX,
            y: touch.pageY
        };
        lastPoint = {
            x: touch.pageX,
            y: touch.pageY
        }
        startEl = {
            x: css(scroll,"translateX"),
            y: css(scroll,"translateY")
        };
    });
    wrap.addEventListener('touchmove', function(e) {
        let touch = e.changedTouches[0];
        let nowPonit = {
            x: touch.pageX,
            y: touch.pageY
        };
        if(lastPoint.x == nowPonit.x
            &&lastPoint.y == nowPonit.y){//上一次坐标和这次坐标完全一致，不做任何处理
            return;
        }
        /* 手指当前值和初始值的一个差值 */
        let dis = {
            x: nowPonit.x - startPonit.x,
            y: nowPonit.y - startPonit.y
        };
        console.log(isFirst);
        if(isFirst){
            if(Math.abs(dis.x) > Math.abs(dis.y)) {
                isDir.x = true;
                isFirst = false;
            } else {
                isDir.y = true;
                isFirst = false;
            }
        }
        console.log(isDir);
        /* 元素应在要在的一个位置 */
        let target = {
            x: startEl.x + dis.x,
            y: startEl.y + dis.y
        };
        /* 设置样式 */
        if(isDir[dir]){ //用户如果滑屏方向和我们要求一致的时候
            css(scroll,dirTranslate[dir],target[dir]);
            e.preventDefault();
        }
        lastPoint.x = nowPonit.x;
        lastPoint.y = nowPonit.y;
    });
    wrap.addEventListener('touchend', function(e) {
        init.end&&init.end.call(wrap,e);
        isFirst = true;
        isDir = {
            x: false,
            y: false
        }
    });
}

/*
	init:{
		el: 要添加事件的元素,
		start: 摁下时 要操作的事情(gesturestart),
		change: 手指移动时的回调(gesturechange)function(e){
			e.scale//在change时，手指之间的距离 和 start时手指之间距离的比值
			e.rotation//在change时和start时 手指旋转角度的差值
		},
		end: 多指触碰结束的回调(gestureend)
	}
*/

function gesture(init){
	let isGesture = false;
	let el = init.el;
	let startDis = 0;
	let startDeg = 0;
	//console.log(getDeg({pageX:0,pageY:0},{pageX:-100,pageY:100}));
	el.addEventListener('touchstart', function(e) {
		let touch = e.touches;//当前屏幕上的手指列表
		if(touch.length >= 2){//当前屏幕有两根以上的手指
			isGesture = true;
			startDis = getDis(touch[0],touch[1]);//start时两根手指之间的距离
			startDeg = getDeg(touch[0],touch[1]);//start时，两根手指形成的直线 和 x轴形成一个逆时针的夹角
			init.start&&init.start.call(el,e);
			//this.innerHTML = startDis;
		}
	});
	el.addEventListener('touchmove', function(e) {
		let touch = e.touches;//当前屏幕上的手指列表
		if(touch.length >= 2&&isGesture){//当前屏幕有两根以上的手指
			let nowDis = getDis(touch[0],touch[1]);// move时两根手指之间的距离
			let nowDeg = getDeg(touch[0],touch[1]);//move时，两根手指形成的直线 和 轴形成一个逆时针的夹角
			e.scale = nowDis/startDis;
			e.rotation = nowDeg - startDeg;
			init.change&&init.change.call(el,e);
		}
	});
	el.addEventListener('touchend', function(e) {
		if(isGesture){
			init.end&&init.end.call(el,e);
		}
		isGesture = false;
	});
	function getDis(point,point2){
		let x = point2.pageX - point.pageX;
		let y = point2.pageY - point.pageY;
		return Math.sqrt(x*x + y*y);
	}
	function getDeg(point,point2){
		let x = point2.pageX - point.pageX;
		let y = point2.pageY - point.pageY;
		return Math.atan2(y,x)*180/Math.PI;
	}
}
