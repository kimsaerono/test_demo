/**
 * 商户资质信息模块js
 *
 * 涉及页面组件 {
 *      上传组件（UploadFileComponent）
 * }    
 *
 *
 * 初始化工具（init）
 *
 * @Author:Waver
 */
var qualificationInfoModule = (function() {

    // 上传文件类型
    var UPLOAD_FILE_TYPE = {
        BUSSINESS_LICENSE: 'BUSSINESS_LICENSE'
    }

    var fileTypeMap = new Map([
        [UPLOAD_FILE_TYPE.BUSSINESS_LICENSE , 'imgBusinessLicense']
    ]);

    var uploadFileComponentMap = new Map();
    // 申请表资质上传组件列表
    var applyUploadFileComponent = new Array();
    // 其他资质上传组件列表
    var optionalUploadFileComponent = new Array();

    //ajaxuploadfile插件input[type='file']对应的id属性的number
    var uploadFileNum = 0
    function UploadFileComponent(uploadFileDiv) {

        var uploadFileObj = null;
        // 上传文件类型
        var uploadFileType = null;
        // 文件上传后对应路径的隐藏域ID
        var filePathHiddenId = null;

        +function(uploadFileDiv) {
            uploadFileObj = $(uploadFileDiv);
            uploadFileType = uploadFileObj.attr('file-type');
        }(uploadFileDiv);

        // 为上传组件添加表单
        var addForm = function() {
            uploadFileNum ++
            var text = '<form id="' + uploadFileObj.attr('file-type') + 'FORM" action="/app/yqt/op/chain/register/upload" enctype="multipart/form-data" method="post">'
                + '<input type="file" class="upload-file-input" id="uploadFile_'+uploadFileNum+'" name="uploadFile" aria-invalid="false">'
                + '<img src="" class="upload-img-file upload-file-show" data-src="" style="z-index: 999; display: none;">'
                + '<a class="delete-image-btn" style="display: none;"></a>'// 删除按钮
                + '<a class="change-image-btn" style="display: none;"></a>'// 点击查看放大图片
                + '<p class="validation-error"><p/>'
                + '</form>';
            uploadFileObj.find('.upload-photo-name').after(text);

            bind_change_event_for_file_input();

            // 添加点击删除事件
            bind_click_event_for_delete_btn();


            return uploadFileNum
        }

        var bind_change_event_for_file_input = function() {
            uploadFileObj.find('.upload-file-input').change(function() {
                uploadFile(this);
            });


            //  点击按钮重新上传文件（优化点3）
            uploadFileObj.find('.change-image-btn').click(function(){
                $(this).parent().find(".upload-file-input").attr("disabled",false)
                $(this).parent().find(".upload-file-input").eq(0).trigger("click")
                uploadFile(this.previousSibling.previousSibling.previousSibling);

            });

        }

        //    上传文件
        var uploadFile = function(inputFileObj) {
            console.log(inputFileObj.files[0].name.split(".")[inputFileObj.files[0].name.split(".").length-1])
            if(inputFileObj.files[0] == undefined){
                return;
            }
            // 只允许上传jpg  jpeg   gif  png类型的图片
            var pattern=/\.(pdf|jpg|jpeg|gif|png)$/;
            //上传 pdf，zip，rar
            var patternTwo = /\.(pdf|zip|rar)$/
            // 只允许上传zip pdf文件
            var patternThree = /\.(zip|rar)$/
            if($(inputFileObj).next().attr("src") == "" || $(inputFileObj).next().attr("src") == "undefined"){
                console.log($(inputFileObj).next().attr("src") == "")
            }else{
                console.log($(inputFileObj).next().attr("src") == "undefined")
            }
            if(pattern.test(inputFileObj.files[0].name) == false && patternTwo.test(inputFileObj.files[0].name) == false){// 上传了非制定类型的图片
                $.alert({
                    title:"",
                    content:"文件格式错误,请重新选择",
                    buttons:{
                        '确定':function(){
                            $("body").mLoading("hide");
                        }
                    }
                });
                return;
            }

                //lrz实现本地压缩后上传图片
                lrz(inputFileObj.files[0], {width: 1024, quality: 0.8}).then(function (rst) {
                    sourceSize = toFixed2(inputFileObj.files[0].size / 1024);
                    resultSize = toFixed2(rst.fileLen / 1024);// fielLen返回的是文件的长度
                    scale = parseInt(100 - (resultSize / sourceSize * 100));
                    //alert(sourceSize+"->"+resultSize+",scale:"+scale);
                    var form = $(inputFileObj).parent();
                    //资质文件类型
                    var qualificationType = uploadFileObj.attr('file-type');
                    //上传文件类型
                    var fileType = inputFileObj.files[0].name.split(".")[inputFileObj.files[0].name.split(".").length - 1]
                    // 上传文件前，禁用提交按钮
                    // if('CHAIN_HEAD_REGISTER' == opType) {
                    //     $('#submit_test').attr('disabled', true);
                    // } else {
                    //     $('#registerSubmit').attr('disabled', true);
                    // }
                    uploadFileObj.find('.upload-img-file').attr("src", rst.base64);//这里显示的就是缩略图

                    Common.ajax(contextPath + '/app/yqt/op/chain/register/uploadImg', 'POST',
                        {
                            fileData: rst.base64,
                            fileType: fileType,
                            qualificationType: qualificationType || ""
                        }, function (response) {
                            console.log(response)
                            removeUploadFile()

                            //显示缩略图 换路径
                            uploadFileObj.find('.upload-img-file').attr("src", rst.base64);//这里显示的就是缩略图
                            //显示图片  显示button
                            uploadFileObj.find('.upload-img-file').show();
                            uploadFileObj.find('.delete-image-btn').show();
                            uploadFileObj.find('.change-image-btn').show();
                            // 这个是显示大图的
                            uploadFileObj.find('.upload-img-file').click(function () {

                                //改进的照片查看方式
                                var url = GV.ctxPath + "/app/yqt/merchant/manage/merchant/preview/qualification?filePath=" + response.filepath;
                                openNewJsp(url);
                                function openNewJsp(url) {
                                    var width = 800;
                                    var height = 500;
                                    var vW = window.innerWidth;
                                    var vH = window.innerHeight;
                                    var left = (vW - width) / 2;
                                    var top = (vH - height) / 2;
                                    window.open(url, "_blank", "left=" + left + ", top=" + top + ",width=" + width + ",height=" + height)
                                }
                            });

                            // 添加图片路径隐藏域(后台需要)
                            $('#opRegisterForm').append('<input type="hidden" id="' + getFilePathHiddenId() + '" name="' + fileTypeMap.get(qualificationType) + '" value="' + response.filepath + '" />');

                            // 禁用上传功能(每次点击都会调用这个方法，所以下次就仍旧可以上传)
                            uploadFileObj.find('.upload-file-input').attr('disabled', true); // 点击切换图片

                            // 上传文件成功后，恢复提交按钮
                            if('CHAIN_HEAD_REGISTER' == opType) {
                                $('#submit_test').attr('disabled', false);
                            } else {
                                $('#registerSubmit').attr('disabled', false);
                            }
                        }, function () {
                            uploadFileObj.find('.upload-file-input').val('');
                            // 上传文件失败后，恢复提交按钮
                            if('CHAIN_HEAD_REGISTER' == opType) {
                                $('#submit_test').attr('disabled', false);
                            } else {
                                $('#registerSubmit').attr('disabled', false);
                            }

                            $.alert({
                                title: "",
                                content: "图片上传失败或超时,请重试",
                                buttons: {
                                    '确定': function () {
                                        $("body").mLoading("hide");
                                    }
                                }
                            });
                        }, {
                            timeout: 180000,
                            async: true
                        });

                    return rst;
                }).catch(function (err) {
                    // 处理失败会执行
                }).always(function () {
                    // 不管是成功失败，都会执行
                });
        }

        var openNewJsp = function(url){
            var width = 800;
            var height = 500;
            var vW = window.innerWidth;
            var vH = window.innerHeight;
            var left = (vW - width) / 2;
            var top = (vH - height) / 2;
            window.open(url , "_blank" , "left="+ left +", top="+ top +",width="+ width +",height=" +height);
        }

        var toFixed2 = function(num) {
            return parseFloat(+num.toFixed(2));
        }



        var getUploadFileType = function() {
            return uploadFileType;
        }

        var setImage = function(imageFilePath) {

            var uploadFileType = getOrigUploadFileType(imageFilePath);

            if(!uploadFileType) {
                return;
            }

            //  先删除了一个，又添加了一个img
            uploadFileObj.find('.upload-img-file').remove();
            uploadFileObj.find('.upload-file-input').after('<img src="' + imageFilePath + '" class="upload-img-file upload-file-show" style="z-index: 999;">');
            // 显示删除按钮
            uploadFileObj.find('.delete-image-btn').show();
            uploadFileObj.find('.change-image-btn').show();
        }

        // 获取上传文件类型
        var getOrigUploadFileType = function(imageFilePath) {
            console.log(imageFilePath)
            if(!imageFilePath || imageFilePath.length == 0) {
                return null;
            }
            var fileTypePos = imageFilePath.lastIndexOf('.');
            if(fileTypePos > -1) {
                return imageFilePath.substring(fileTypePos + 1);
            } else {
                return null;
            }
        }

        var disableUploading = function() {
            uploadFileObj.find('.upload-file-input').attr('disabled', true);
        }
        //使用上传功能
        var enableUploading = function() {
            //控制disable属性
            uploadFileObj.find('.upload-file-input').attr('disabled', false);
            uploadFileObj.find('.upload-file-input').val('');
        }

        // 为删除按钮绑定click事件
        var bind_click_event_for_delete_btn = function() {
            uploadFileObj.find('.delete-image-btn').click(function() {
                removeUploadFile();
            });
        }

        // 删除已经上传的图片
        var removeUploadFile = function() {

            var uploadFileHidden = $('#opRegisterForm').find('input[id="' + getFilePathHiddenId() + '"]');
            var uploadFilePath;
            if(uploadFileHidden) {
                //获取上传文件路径
                uploadFilePath = uploadFileHidden.val();
                // 删除增加上传文件路径对应的hidden
                uploadFileHidden.remove();
            }

            if(uploadFilePath) {
                // 增加待删除文件路径对应的hidden
                $('#opRegisterForm').append('<input type="hidden" name="delete_op_img" value="' + uploadFilePath + '">');
            }
            // 移除图片显示
            removeImage();
            // 启用上传功能
            enableUploading();
        }

        var removeImage = function() {
            uploadFileObj.find('.upload-img-file').hide();
            uploadFileObj.find('.delete-image-btn').hide();
            uploadFileObj.find('.change-image-btn').hide();
            uploadFileObj.find('.upload-img-file').off('click',null)
        }


        var getFilePathHiddenId = function() {
            return filePathHiddenId;
        }

        var setFilePathHiddenId = function(hiddenId) {
            filePathHiddenId = hiddenId;
        }

        var getUploadFileObj = function() {
            return uploadFileObj;
        }


        return {
            addForm : addForm,
            getUploadFileType : getUploadFileType,
            setImage : setImage,
            disableUploading : disableUploading,
            getFilePathHiddenId : getFilePathHiddenId,
            setFilePathHiddenId : setFilePathHiddenId,
            getUploadFileObj : getUploadFileObj,
            removeUploadFile : removeUploadFile,
            getOrigUploadFileType : getOrigUploadFileType,
            isDownload : isDownload,
            openNewJsp : openNewJsp
        }
    }

    var getUploadFileComponentMap = function() {
        return uploadFileComponentMap;
    }


    var _validate = function(uploadFileType) {

        var result = true; // 校验结果

        if(UPLOAD_FILE_TYPE.APPLY == uploadFileType) {// 上传文件类型

            var flag = true;

            $.each(applyUploadFileComponent, function (index, component) {
                var inputFileObj = component.getUploadFileObj().find('input[type=file]');

                if($('#opRegisterForm').find('input[id=' + uploadFileType + '_' + (index + 1) +']')[0]) {
                    flag = false;
                }
            });

            if(flag) {
                applyUploadFileComponent[0].getUploadFileObj().find('.validation-error').text('请上传文件!');
                result = false;
            } else {
                applyUploadFileComponent[0].getUploadFileObj().find('.validation-error').text('');
            }
        } else if(UPLOAD_FILE_TYPE.OPTIONAL == uploadFileType) {

        } else if(UPLOAD_FILE_TYPE.ID_CARD_FRONT == uploadFileType || UPLOAD_FILE_TYPE.ID_CARD_BACK == uploadFileType) {

            var uploadFileComponent = uploadFileComponentMap.get(UPLOAD_FILE_TYPE.ID_CARD_FRONT);

            if($('#opRegisterForm').find('input[id='+ UPLOAD_FILE_TYPE.ID_CARD_FRONT + ']')[0] || $('#opRegisterForm').find('input[id='+ UPLOAD_FILE_TYPE.ID_CARD_BACK + ']')[0]) {
                // 清除校验信息
                uploadFileComponent.getUploadFileObj().find('.validation-error').text('');
            } else {
                // 提示校验信息
                uploadFileComponent.getUploadFileObj().find('.validation-error').text('请上传文件!');
                result = false;
            }
        }else {
            var uploadFileComponent = uploadFileComponentMap.get(uploadFileType);

            if($('#opRegisterForm').find('input[id='+ uploadFileType + ']')[0]) {
                // 清除校验信息
                uploadFileComponent.getUploadFileObj().find('.validation-error').text('');
            } else {
                // 提示校验信息
                uploadFileComponent.getUploadFileObj().find('.validation-error').text('请上传文件!');
                result = false;
            }
        }

        return result;
    }

    // 初始化组件
    var init = (function() {
        return {
            initialize : function() {

                uploadFileComponentMap.set(UPLOAD_FILE_TYPE.APPLY, applyUploadFileComponent);
                uploadFileComponentMap.set(UPLOAD_FILE_TYPE.OPTIONAL, optionalUploadFileComponent);

                $('.pic-module .upload-photo').each(function(index, uploadPhotoDiv) {
                    var uploadFileComponent = new UploadFileComponent(uploadPhotoDiv);
                    uploadFileComponent.addForm();

                    // 将上传组件添加到map中
                    if(UPLOAD_FILE_TYPE.APPLY == uploadFileComponent.getUploadFileType()) {
                        applyUploadFileComponent.push(uploadFileComponent);
                        uploadFileComponent.setFilePathHiddenId(UPLOAD_FILE_TYPE.APPLY + '_' + applyUploadFileComponent.length);
                    } else if(UPLOAD_FILE_TYPE.OPTIONAL == uploadFileComponent.getUploadFileType()) {
                        optionalUploadFileComponent.push(uploadFileComponent);
                        uploadFileComponent.setFilePathHiddenId(UPLOAD_FILE_TYPE.OPTIONAL + '_' + optionalUploadFileComponent.length);
                    } else {
                        uploadFileComponentMap.set(uploadFileComponent.getUploadFileType(), uploadFileComponent);
                        uploadFileComponent.setFilePathHiddenId(uploadFileComponent.getUploadFileType());
                    }
                });

                // 添加按钮绑定事件
                $('.pic-module .add-upload-photo').each(function(index, addUploadPhotoLi) {
                    var fileType = $(addUploadPhotoLi).attr('file-type');
                    // 申请表资质信息添加按钮事件
                    if(UPLOAD_FILE_TYPE.APPLY == fileType) {
                        $(addUploadPhotoLi).click(function() {
                            if(applyUploadFileComponent.length < 2) {
                                var text = '<li class="upload-photo" file-type="APPLY"><div class="upload-block">'
                                    + '<div class="upload-photo-name">'
                                    + '<span class="iconfont icon-tianjiatupian"></span>'
                                    + '<p>申请表</p></div></div></li>';

                                $(addUploadPhotoLi).before(text);

                                var uploadPhotoLi = $('.pic-module .apply-frame').find('.upload-photo:last');

                                var uploadFileComponent = new UploadFileComponent(uploadPhotoLi);
                                uploadFileComponent.addForm();

                                applyUploadFileComponent.push(uploadFileComponent);

                                uploadFileComponent.setFilePathHiddenId(UPLOAD_FILE_TYPE.APPLY + '_' + applyUploadFileComponent.length);
                            }
                            if (applyUploadFileComponent.length == 2) {
                                $(addUploadPhotoLi).hide();
                            }
                        });
                        // 其他资质信息添加按钮事件
                    } else if(UPLOAD_FILE_TYPE.OPTIONAL == fileType) {
                        $(addUploadPhotoLi).click(function () {
                            if (optionalUploadFileComponent.length < 10) {
                                var text = '<li class="upload-photo" file-type="OPTIONAL"><div class="upload-block">'
                                    + '<div class="upload-photo-name">'
                                    + '<span class="iconfont icon-tianjiatupian"></span>'
                                    + '<p>其他</p></div></div></li>';

                                $(addUploadPhotoLi).before(text);

                                var uploadPhotoLi = $('.pic-module .optional-frame').find('.upload-photo:last');

                                var uploadFileComponent = new UploadFileComponent(uploadPhotoLi);
                                uploadFileComponent.addForm();

                                optionalUploadFileComponent.push(uploadFileComponent);

                                uploadFileComponent.setFilePathHiddenId(UPLOAD_FILE_TYPE.OPTIONAL + '_' + optionalUploadFileComponent.length);
                            }
                            if (optionalUploadFileComponent.length == 10) {
                                $(addUploadPhotoLi).hide();
                            }
                        });
                    }
                });

                ////加载已经上传的资质图片
                if(initData.qualification) {

                    $.each(UPLOAD_FILE_TYPE, function(key, value) {

                        if(initData.qualification[value]) {

                            if (UPLOAD_FILE_TYPE.APPLY == value) { // 这个的应用信息
                                $.each(applyUploadFileComponent, function (index, component) {
                                    if(initData.qualification[value][index]) {
                                        component.setImage('/yqt-portal-app/app/yqt/merchant/manage/showImage?filePath=' + initData.qualification[value][index]);
                                        component.disableUploading();

                                        var uploadFileObj = component.getUploadFileObj();

                                        if(component.isDownload(initData.qualification[value][index])) {

                                            uploadFileObj.find('.upload-img-file').click(function () {
                                                window.location.href = contextPath + '/app/yqt/op/chain/register/download?fileRelativePath=' + initData.qualification[value][index];
                                            });
                                        } else {

                                            uploadFileObj.find('.upload-img-file').on('click',function(){
                                                var src = $(this).attr("src");
                                                var filePath = src.substring(src.indexOf("=") + 1 , src.length);
                                                var url = GV.ctxPath + "/app/yqt/merchant/manage/merchant/preview/qualification?filePath=" + filePath;
                                                component.openNewJsp(url);
                                            });

                                        }

                                        // 添加图片路径隐藏域
                                        $('#opRegisterForm').append('<input type="hidden" id="' + component.getFilePathHiddenId() + '" name="' + fileTypeMap.get(value)  + '" value="' + initData.qualification[value][index] + '" />');
                                    }
                                });
                            } else if (UPLOAD_FILE_TYPE.OPTIONAL == value) {//  这个是资质信息
                                $.each(optionalUploadFileComponent, function (index, component) {
                                    if(initData.qualification[value][index]) {
                                        component.setImage('/yqt-portal-app/app/yqt/merchant/manage/showImage?filePath=' + initData.qualification[value][index]);
                                        component.disableUploading();


                                        //$('.upload-file-show').click(function(){
                                        //    window.open('/yqt-portal-app/app/yqt/merchant/manage/showImage?filePath=' + initData.qualification[value][index], '_blank',"scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes,height=600,width=800");
                                        //
                                        //})

                                        var uploadFileObj = component.getUploadFileObj();

                                        if(component.isDownload(initData.qualification[value][index])) {

                                            uploadFileObj.find('.upload-img-file').click(function () {
                                                window.location.href = contextPath + '/app/yqt/op/chain/register/download?fileRelativePath=' + initData.qualification[value][index];
                                            });
                                        } else {

                                            uploadFileObj.find('.upload-img-file').click(function(){
                                                var src = $(this).attr("src");
                                                var filePath = src.substring(src.indexOf("=") + 1 , src.length);
                                                var url = GV.ctxPath + "/app/yqt/merchant/manage/merchant/preview/qualification?filePath=" + filePath;
                                                component.openNewJsp(url);
                                            });

                                        }

                                        // 添加图片路径隐藏域
                                        $('#opRegisterForm').append('<input type="hidden" id="' + component.getFilePathHiddenId() + '" name="' + fileTypeMap.get(value) + '" value="' + initData.qualification[value][index] + '" />');
                                    }
                                });
                            } else {
                                // 得到对应的hidden的name值
                                //var hidden =  fileTypeMap.get(fileType)
                                var uploadFileComponent = uploadFileComponentMap.get(value);
                                uploadFileComponent.setImage('/yqt-portal-app/app/yqt/merchant/manage/showImage?filePath=' + initData.qualification[value]);
                                uploadFileComponent.disableUploading();

                                // 添加图片路径隐藏域
                                $('#opRegisterForm').append('<input type="hidden" id="' + uploadFileComponent.getFilePathHiddenId() + '" name="' + fileTypeMap.get(value) + '" value="' + initData.qualification[value] + '" />');
                                var uploadFileObj = uploadFileComponent.getUploadFileObj();

                                if(uploadFileComponent.isDownload(initData.qualification[value])) {

                                    uploadFileObj.find('.upload-img-file').click(function () {
                                        window.location.href = contextPath + '/app/yqt/op/chain/register/download?fileRelativePath=' + initData.qualification[value];
                                    });
                                } else {

                                    uploadFileObj.find('.upload-img-file').click(function(){
                                        var src = $(this).attr("src");
                                        var filePath = src.substring(src.indexOf("=") + 1 , src.length);
                                        var url = GV.ctxPath + "/app/yqt/merchant/manage/merchant/preview/qualification?filePath=" + initData.qualification[value];
                                        uploadFileComponent.openNewJsp(url);
                                    });
                                }

                            }
                        }

                    });
                }
            }
        }
    })();

    +function () {
        init.initialize();
    }();

    return {
        UPLOAD_FILE_TYPE : UPLOAD_FILE_TYPE,
        getUploadFileComponentMap : getUploadFileComponentMap
    }
})();
