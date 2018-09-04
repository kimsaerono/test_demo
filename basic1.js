/**
 * 商户基本信息模块js
 *
 * 涉及页面组件 {
 *      省份选择器（provinceSelector）,
 *      城市选择器（citySelector）,
 *      商品经营分类一级分类选择器（businessCategoryFirstLevelSelector）,
 *      商品经营分类二级分类选择器（businessCategorySecondLevelSelector）
 * }
 *
 * 初始化工具（init）
 *
 * @Author:Waver
 */

var basicInfoModule = (function () {

    // 省份选择器
    var provinceSelector = (function () {

        var province = $('#province');

        // 省份选择器change事件绑定
        var bind_change_event = function () {

            if (province) {

                province.change(function () {
                    if (province.val()) {
                        getCityByProvinceCode(province.find("option:selected").attr('data-value'));
                    } else {
                        // 省份未选择时，清空城市选择器
                        citySelector.setCityOption({});
                    }
                });
            }
        }

        // 省份选择器初始化
        var init = function (initData) {

            if (initData) {
                if (initData.province) {
                    province.val(initData.province);
                    getCityByProvinceCode(province.find("option:selected").attr('data-value'), initData.city);
                }
            }

            bind_change_event();
        }

        // 获取省份对应的城市信息
        var getCityByProvinceCode = function (provinceCode, selectedCity) {
            Common.ajax(contextPath + '/app/yqt/merchant/manage/getCityMap', 'GET', {province: provinceCode}, function (response) {
                citySelector.setCityOption(response);
                citySelector.setCitySelected(selectedCity);
            });
        }

        return {
            init: init
        }
    })();

    // 城市选择器
    var citySelector = (function () {

        var city = $('#city');

        // 设置城市选择器中选项
        var setCityOption = function (cityMap) {

            var text = '';

            if (city) {

                text += '<option value="" selected>选择城市</option>';
                for (var key in cityMap) {
                    text += '<option value="' + cityMap[key] + '" data-value="' + key + '">' + cityMap[key] + '</option>';
                }

                city.html(text);
            } else {
                console.log("City selector is not initialized");
            }
            return text;
        }

        // 设置城市选择器中选中项
        var setCitySelected = function (selectedCity) {
            if (city) {
                city.val(selectedCity);
            }
        }

        return {
            // 改变城市选项
            setCityOption: setCityOption,
            setCitySelected: setCitySelected
        }
    })();


    //添加经营类目对应关系
    // 商品经营分类一级分类选择器
    var businessCategoryFirstLevelSelector = (function () {

        var firstLevelSelector = $('#business1');

        // 商品经营分类一级分类初始化
        var init = function (initData) {

            if (firstLevelSelector) {

                if (initData) {
                    if (initData.categoryOne) {
                        getFirstCategory(initData.categoryOne);

                        if (initData.categoryTwo) {
                            businessCategorySecondLevelSelector.getSecondCategory(initData.categoryOne, initData.categoryTwo);
                        }
                    } else {
                        getFirstCategory();
                    }
                } else {
                    getFirstCategory();
                }

                // 绑定change事件
                bind_change_event();
            }

        }


        //  when change the radio ,do the common.ajax and leading by the key word
        var getFirstCategory = function (selectedFirstCategoryCode) {
            Common.ajax(contextPath + '/app/yqt/common/queryCategory', 'GET', null, function (response) {
                setFirstCategoryOption(response);
                firstLevelSelector.val(selectedFirstCategoryCode);
            });
        }

        // 设置一级分类选项
        var setFirstCategoryOption = function (categoryMap) {
            var text = '';
            text += '<option value="">请选择</option>';
            for (var key in categoryMap) {
                text += "<option value=" + key + ">" + categoryMap[key] + "</option>";
            }
            firstLevelSelector.html(text);
        }

        var bind_change_event = function (customerStyle) {
            var that = this;
            that.customerStyle = customerStyle
            firstLevelSelector.unbind("change").change(function () {
                var self = that;
                var customerStyle = self.customerStyle || "";
                if (firstLevelSelector.val()) {
                    businessCategorySecondLevelSelector.getSecondCategory(firstLevelSelector.find("option:selected").attr('value'), null, customerStyle);
                } else {
                    // 一级分类未选择时，清空二级分类选择器
                    businessCategorySecondLevelSelector.setSecondCategoryOption({});
                }
            });
        }


        //商户主体类型和经营类目进行联动
        $('input[name="oPOperatorParam[\'customerStyle\']"]').click(function () {
            var customerStyle = $(this).attr("value");
            Common.ajax(contextPath + '/app/yqt/common/queryCategory?customerStyle=' + customerStyle, 'GET', null, function (response) {
                setFirstCategoryOption(response);
                firstLevelSelector.val();
                bind_change_event(customerStyle);
            });
        });

        $('input[name="customerStyle"]').click(function () {
            var customerStyle = $(this).attr("value");
            Common.ajax(contextPath + '/app/yqt/common/queryCategory?customerStyle=' + customerStyle, 'GET', null, function (response) {
                setFirstCategoryOption(response);
                firstLevelSelector.val();
                bind_change_event(customerStyle);
            });
        });

        return {
            init: init
        }

    })();

    // 商品经营分类二级分类选择器
    var businessCategorySecondLevelSelector = (function () {

        var secondLevelSelector = $('#business2');

        var setSecondCategoryOption = function (categoryList) {
            var text = '';
            if (secondLevelSelector) {
                text += '<option value="">请选择</option>';

                $.each(categoryList, function (i, categoryItem) {
                    text += "<option categoryType=" + categoryItem.categoryType + " value=" + categoryItem.categoryCode + ">" + categoryItem.categoryName + "</option>";
                });

                secondLevelSelector.html(text);
            } else {
                console.log("Second level category selector is not initialized");
            }
            return text;
        }

        // 获取二级分类信息
        var getSecondCategory = function (firstCategoryCode, selectedSecondCategoryCode, customerStyle) {
            var isFilter = false;
            if ('AGENT_MERCHANT_REGISTER' == opType) {
                isFilter = true;
            }
            Common.ajax(contextPath + '/app/yqt/common/queryCategoryList?customerStyle=' + customerStyle, 'GET', {
                code: firstCategoryCode,
                notPublicWelfare: isFilter
            }, function (response) {
                setSecondCategoryOption(response);
                secondLevelSelector.val(selectedSecondCategoryCode);
                // 绑定change事件
                bind_change_event_for_second_selector();
            });
        }

        var getSelectedCategoryType = function () {
            return secondLevelSelector.find("option:selected").attr('categoryType');
        }

        // 绑定change事件
        var bind_change_event_for_second_selector = function () {
            secondLevelSelector.change(function () {
                // 根据行业大类改变支付产品的交互行为
                if (paymentInfoModule) {
                    paymentInfoModule.productCheckbox.handleCorrelation();
                }
            });
        }

        return {
            getSecondCategory: getSecondCategory,
            setSecondCategoryOption: setSecondCategoryOption,
            getSelectedCategoryType: getSelectedCategoryType
        }

    })();


    // 初始化组件
    var init = (function () {
        return {
            initialize: function () {
                provinceSelector.init(initData);
                businessCategoryFirstLevelSelector.init(initData);
            }
        }
    })();

    +function () {
        init.initialize();
    }();

    return {
        businessCategorySecondLevelSelector: businessCategorySecondLevelSelector
    }

})();