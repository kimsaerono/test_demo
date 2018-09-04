window.onload = function(){
    waterFull('main','box');
}

function waterFull(parent,children){
    var oParent = document.getElementById(parent);
    //var oBoxs = parent.querySelectorAll(".box");

     var oBoxs = getByClass(oParent,children);

    //计算整个页面显示的列数

    var oBoxW = oBoxs[0].offsetWidth;

    var cols = Math.floor(document.documentElement.clientWidth/oBoxW);

    //设置main的宽度，并且居中

    oParent.style.cssText = 'width:'+oBoxW * cols +'px; margin: 0 auto';

    //找出高度最小的图片，将下一个图片放在下面

    //定义一个数组，存放每一列的高度，初始化存的是第一行的所有列的高度

    var arrH = [];

    for(var i = 0; i< oBoxs.length ; i++){
        if(i < cols){
            arrH.push(oBoxs[i].offsetHeight);
        }
        else{
            var minH = Math.min.apply(null,arrH);

            var minIndex = getMinhIndex(arrH,minH);

            oBoxs[i].style.position = 'absolute';
            oBoxs[i].style.top= minH + 'px';
            oBoxs[i].style.left = minIndex * oBoxW + 'px'; 
        //  oBoxs[i].style.left = arrH[minIndex].;

            arrH[minIndex] += oBoxs[i].offsetHeight; 
        }
    }


}
function getByClass(parent,className){

    var boxArr = new Array();//用来获取所有class为box的元素

    oElement = parent.getElementsByTagName('*');

    for (var i = 0; i <oElement.length; i++) {

        if(oElement[i].className == className){

            boxArr.push(oElement[i]);

        }
    };
    return boxArr;
}


//获取当前最小值得下标
function getMinhIndex(array,min){

    for(var i in array){

        if(array[i] == min)

            return i;
    }
}






