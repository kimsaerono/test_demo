
$('#reportOpButton').click(function() {
    // 需要添加数据验证   
    var registerID = $("#registerID").val();
    var merchantOpNo = $("#opNo").val();
    $.ajax({
        url: GV.ctxPath + '/app/yqt/op/report/reportMerchantNo',
        type: "POST",
        data: {
            "registerID": registerID,
            "opNo": merchantOpNo
        },
        dataType: "JSON",
        async: false,
        success: function (data) {
            $('#submintId').attr("disabled", false);
            if (typeof(data) != 'undefined' && data != null) {
                if(data.status == "success") {
                    YEEPAY.toast({
                        msg: "报备成功",
                        callback:function () {
                            window.location.href = GV.ctxPath + '/app/yqt/op/report/reportList';
                        }
                    });
                } else {
                    YEEPAY.pop({
                        icon: "fail",
                        msg: '报备失败，请联系运营人员处理！',
                        mask: "hide"
                    });
                }
            } else {
                YEEPAY.pop({
                    icon: "fail",
                    msg: '报备失败，请联系运营人员处理！',
                    mask: "hide"
                });
            }
        }, error: function (data) {
            $('#submintId').attr("disabled", false);
            if (typeof(data) != 'undefined' && data != null && data.msg != null) {
                popAlert("报备：" + data.msg);
            } else {
                popAlert("报备异常，请稍后重试！");
            }
            return false;
        }
    });
});

function popAlert(msg) {
    YEEPAY.popTosure({
        icon : "warning",
        msg :msg
    });
}