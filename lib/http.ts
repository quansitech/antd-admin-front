import axios, {AxiosError} from "axios";
import {routerNavigateTo} from "./helpers";
import global from "./global";

const http = axios.create({})

http.interceptors.request.use(config => {
    config.headers['Accept'] = 'application/json'
    // 设置异步模式
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
    return config
})

http.interceptors.response.use(response => {
    const checkInfo = (data: { status?: number, info?: string }) => {
        if (!data?.info) {
            return false
        }
        switch (data.status) {
            case 0:
                global.notification.warning({
                    message: data.info
                })
                break
            default:
                global.notification.success({
                    message: data.info
                })
        }
        return true
    }

    const showInfo = checkInfo(response.data)

    if (response.data.url) {
        setTimeout(() => {
            routerNavigateTo(response.data.url)
        }, showInfo ? 2000 : 0)
    }
    if (response.data.status == 0) {
        return Promise.reject(response.data.info)
    }
    return response
}, error => {
    if (error instanceof AxiosError) {
        if (error.response?.headers['content-type'].includes('application/json')) {
            global.notification.error({
                message: error.response?.data?.info || '请求错误，请稍候重试'
            })
        } else if (error.response?.headers['content-type'].includes('text/html')) {
            const parser = new DOMParser;
            const doc = parser.parseFromString(error.response?.data, 'text/html');
            const title = doc.querySelector('title')?.textContent;

            global.notification.error({
                message: title || '请求错误，请稍候重试'
            })
        }
    } else {
        global.notification.error({
            message: '请求错误，请稍候重试'
        })
    }
    return Promise.reject(error)
})

export default http