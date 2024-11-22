import {router} from "@inertiajs/react";
import {VisitOptions} from "@inertiajs/core/types/types";
import http from "./http";
import container from "./container";
import React, {Suspense} from "react";
import global from "./global";
import {ModalContext} from "../components/ModalContext";
import {ModalFuncProps} from "antd";
import {uniq} from "lodash";
import {isEqual} from "es-toolkit";

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

export async function modalShow(options: ModalOptions) {
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
    const Component = container.get('Modal.' + upperFirst(props.type))

    let afterClose = () => {
    }
    const modal = global.modal.info({
        ...options,
        closable: true,
        icon: null,
        destroyOnClose: true,
        footer: null,
        content: (
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
                <Suspense>
                    <Component {...props} />
                </Suspense>
            </ModalContext.Provider>
        ),
        afterClose: () => {
            afterClose && afterClose()
        },
    } as ModalFuncProps)
    return {
        destroy: modal.destroy,
        update: modal.update,
    }
}

export function upperFirst(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getProValueTypeMap() {
    const columnKeys = Object.keys(container.list('Column.'))
    const readonlyKeys = Object.keys(container.list('Column.Readonly.'))

    const types = uniq(columnKeys.concat(readonlyKeys))
    return types.reduce((map, type) => {
        map[type] = {
            render(text, props) {
                const renderComponent = 'Column.Readonly.' + upperFirst(type as string)
                if (container.check(renderComponent)) {
                    const Component = container.get(renderComponent)
                    return <Suspense>
                        <Component {...props} />
                    </Suspense>
                }

                return <>
                    {text}
                </>
            },
            renderFormItem(text, props) {
                const renderComponent = 'Column.' + upperFirst(type as string)
                if (container.check(renderComponent)) {
                    const Component = container.get(renderComponent)
                    return <Suspense>
                        <Component {...props} />
                    </Suspense>
                }

                return <>
                    {text}
                </>
            }
        }
        return map
    }, {} as Record<string, any>)
}

export function handleCondition(condition: Condition, data: any) {
    switch (condition.operator) {
        case 'eq':
        case '=':
            return data[condition.field] == condition.value;
        case 'neq':
        case '!=':
        case '<>':
            return data[condition.field] != condition.value;
        case 'gt':
        case '>':
            return data[condition.field] > condition.value;
        case 'gte':
        case '>=':
            return data[condition.field] >= condition.value;
        case 'lt':
        case '<':
            return data[condition.field] < condition.value;
        case 'elt':
        case '<=':
            return data[condition.field] <= condition.value;
        case 'in':
            return condition.value?.includes(data[condition.field]);
        case 'not in':
            return !condition.value?.includes(data[condition.field]);
    }
    return false
}

export function deepSet(obj: any, path: string, value: any) {
    const paths = path.split('.');
    paths.reduce((acc, key, index) => {
        if (index === paths.length - 1) {
            acc[key] = value;
        } else {
            acc[key] = acc[key] || {};
        }
        return acc[key];
    }, obj);
}

export function filterObjectKeys(obj: Record<string, any>, keysToFilter: string[]) {
    if (typeof obj !== 'object' || !obj) {
        return obj;
    }
    return Object.keys(obj)
        .filter(key => !keysToFilter.includes(key))
        .reduce((newObj, key) => {
            newObj[key] = obj[key];
            return newObj;
        }, {} as Record<string, any>);
}

export function diffTree(tree1: any[], tree2: any[], childKey: string) {
    const res = []

    for (const key in tree2) {
        const item = tree2[key]
        const found = tree1.find(i => {
            const obj1 = filterObjectKeys(i, ['children'])
            const obj2 = filterObjectKeys(item, ['children'])

            return isEqual(obj1, obj2)
        })
        if (!found) {
            res.push(filterObjectKeys(item, ['children']))
        }
        if (item[childKey]) {
            res.push(...diffTree(tree1[key][childKey], item[childKey], childKey))
        }
    }
    return res
}