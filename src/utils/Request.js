import axios from 'axios'

import { ElLoading } from 'element-plus'
import store from "@/store"
import Message from "@/utils/Message"

const contentTypeForm = "application/x-www-form-urlencoded;charset=UTF-8";
const contentTypeJson = "application/json"

const instance = axios.create({
    baseURL: "",
    timeout: 30 * 1000,
})
//请求前过滤器
let loading = null;
instance.interceptors.request.use(
    (config) => {
        if (config.showLoading) {
            loading = ElLoading.service({
                lock: true,
                text: "加载中......",
                background: 'rgba(0,0,0,0.7)'
            })
        }
        return config;
    }, (error) => {
        if (error.config.showLoading && loading) {
            loading.close();
        }
        Message.error("请求发送失败");
        return Promise.reject("请求发送失败");
    }
);

//请求后过滤器
instance.interceptors.response.use(
    (response) => {
        const { showLoading, errorCallback, showError } = response.config;
        if (showLoading && loading) {
            loading.close();
        }
        const responseData = response.data;
        if (responseData.code == 200) {
            return responseData;
        } else if (responseData.code == 901) {
            store.commit("showLogin", true);
            store.commit("updateLoginUserInfo", null);
            return Promise.reject({ showError: false, msg: "登录超时" });
        } else {
            if (errorCallback) {
                errorCallback(responseData)
            }
            return Promise.reject({ showError: showError, msg: responseData.info });
        }


    }, (error) => {
        if (error.config.showLoading && loading) {
            loading.close();
        }
        return Promise.reject({ showError: true, msg: "网络异常" });
    }
);


const request = (config) => {
    const { url, params, dataType, showLoading = true, errorCallback, showError = true } = config
    let contentType = contentTypeForm;
    let fromData = new FormData();
    for (let key in params) {
        fromData.append(key, params[key] == undefined ? "" : params[key]);
    }
    if (dataType != null && dataType === "json") {
        contentType = contentTypeJson;
    }  
    let headers = {
        'Content-Type': contentType,
        'X-Requested-With': 'XMLHttpRequest',
    }
    return instance.post(url, fromData, {
        headers: headers,
        showLoading: showLoading,
        errorCallback: errorCallback,
        showError: showError
    }).catch(error => {
        if (error.showError) {
            Message.error(error.msg);
        }
        return null;
    })
}

export default request;



// 这段代码是一个基于 axios 封装的请求工具，它的作用是发送网络请求并提供一些附加功能，如加载动画、错误处理等。

// 让我们逐段解释：

// 导入模块：

// javascript
// Copy code
// import axios from 'axios'
// import { ElLoading } from 'element-plus'
// import store from "@/store"
// import Message from "@/utils/Message"
// axios：用于发送 HTTP 请求。
// ElLoading：来自 Element Plus 组件库，用于显示加载动画。
// store：用于在 Vuex 中管理状态。
// Message：可能是一个自定义的消息提示工具，用于显示错误信息。
// 定义常量：

// javascript
// Copy code
// const contentTypeForm = "application/x-www-form-urlencoded;charset=UTF-8";
// const contentTypeJson = "application/json"
// 这些常量定义了请求头的 Content-Type，用于指定请求的数据类型。
// 创建 Axios 实例：

// javascript
// Copy code
// const instance = axios.create({
//     baseURL: "/api",
//     timeout: 30 * 1000,
// })
// 创建了一个 Axios 实例 instance，设置了基础 URL 和超时时间。
// 请求拦截器：

// javascript
// Copy code
// instance.interceptors.request.use(...)
// 在发送请求前，执行一些预处理操作，比如显示加载动画。
// 响应拦截器：

// javascript
// Copy code
// instance.interceptors.response.use(...)
// 在接收到响应后，执行一些后续操作，比如关闭加载动画，处理错误等。
// 请求函数：

// javascript
// Copy code
// const request = (config) => { ... }
// 这是一个封装的请求函数，接收一个配置对象作为参数，包括 URL、参数、数据类型等。它会根据配置发送请求，并处理响应或错误。
// 总体来说，这段代码封装了一个请求工具，提供了发送请求、显示加载动画、处理错误等功能，使得发送请求变得更加方便和可控