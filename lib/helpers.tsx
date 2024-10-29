import {router} from "@inertiajs/react";
import {VisitOptions} from "@inertiajs/core/types/types";
import Schema from '@rc-component/async-validator';
import {Rules, ValidateError, ValidateFieldsError, Values} from "@rc-component/async-validator/lib/interface";
import {Spin} from "antd";
import http from "./http";
import container from "./container";
import upperFirst from "lodash/upperFirst";
import {lazy, Suspense} from "react";
import global from "./global";
import {ModalContext} from "../components/ModalContext";

export function replaceUrl(url: string, params: any) {
    return url.replace(/__([\w]+)__/g, (match, key) => {
        return params[key] || match;
    })
}

export function replaceParams(params: Record<string, any>, data: Record<string, any>) {
    if (typeof params !== 'object') {
        return params;
    }
    const res = Object.assign({}, params);
    Object.keys(params).forEach(key => {
        if (typeof params[key] === 'string') {
            const m = params[key].match(/^__(\w+)__$/)
            if (m) {
                res[key] = data[m[1]];
            }
        }
    })
    return res;
}

export function routerNavigateTo(url: string, config?: VisitOptions) {
    return router.visit(url, {
        ...config,
    })
}

export function handleRules(dataRules: Rules, data: any) {
    return new Promise(resolve => {
        const validator = new Schema(dataRules);
        validator.validate(data, (errors: ValidateError[] | null, fields: ValidateFieldsError | Values) => {
            if (errors) {
                resolve(false);
                return;
            }
            resolve(true);
        })

    })

}

export async function asyncFilter(arr: any[], predicate: (item: any) => PromiseLike<any>) {
    return await Promise.all(arr.map(predicate))
        .then((results) => arr.filter((_v, index) => results[index]))
}

export function filterObjectKeys(obj: Record<string, any>, keysToKeep: string[]) {
    if (typeof obj !== 'object' || !obj) {
        return obj;
    }
    return Object.keys(obj)
        .filter(key => !keysToKeep.includes(key))
        .reduce((newObj, key) => {
            newObj[key] = obj[key];
            return newObj;
        }, {} as Record<string, any>);
}


export function createScript(url: string) {
    let scriptTags = window.document.querySelectorAll('script')
    let len = scriptTags.length
    let i = 0
    let _url = window.location.origin + url
    return new Promise((resolve, reject) => {
        for (i = 0; i < len; i++) {
            var src = scriptTags[i].src
            if (src && src === _url) {
                scriptTags[i].parentElement?.removeChild(scriptTags[i])
            }
        }

        let node = document.createElement('script')
        node.src = url
        node.onload = resolve
        document.body.appendChild(node)
    })
}

export async function modal(options: ModalOptions) {
    let props = options.content.props
    if (options.content.url) {
        const res = await http({
            method: 'get',
            url: options.content.url,
            headers: {
                'X-Modal': '1',
            }
        })
        if (typeof res.data === 'string') {
            throw new Error('modal response is not vail')
        }
        props = res.data
    }
    if (!props) {
        throw new Error('modal props is empty')
    }
    const Component = lazy(() => container.get('Modal.' + upperFirst(props.type)))

    let afterClose = () => {
    }
    const modal = global.modal.info({
        ...options,
        closable: true,
        icon: null,
        destroyOnClose: true,
        footer: null,
        content: (
            <Suspense fallback={<Spin/>}>
                <ModalContext.Provider value={{
                    inModal: true,
                    closeModal: () => {
                        modal?.destroy()
                    },
                    contexts: options.contexts,
                    setAfterClose(callback: () => void) {
                        afterClose = callback
                    }
                }}>
                    <Component {...props} />
                </ModalContext.Provider>
            </Suspense>
        ),
        afterClose: () => {
            afterClose && afterClose()
        },
    })
    return {
        destroy: modal.destroy,
        update: modal.update,
    }
}