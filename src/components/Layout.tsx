import React, {useEffect, useState} from "react";
import {GlobalEvent} from "@inertiajs/core/types/types";
import New from "./Layout/New";
import {App, App as AntdApp} from "antd";
import global from "../lib/global";
import Blank from "./Layout/Blank";
import {Head, router, usePage} from "@inertiajs/react";
import {ProConfigProvider} from "@ant-design/pro-components";
import {getProValueTypeMap} from "../lib/helpers";
import type {LayoutProps} from "./LayoutContext";
import {LayoutContext} from "./LayoutContext";
import _ from "lodash";

function ChildApp(props: {
    enableNewLayout: boolean,
    pageTitle: string,
    siteTitle: string,
    setDarkMode: (boolean) => void,
    children: React.ReactNode,
}) {
    const {modal, notification, message} = App.useApp()

    useEffect(() => {
        global.modal = modal
        global.notification = notification
        global.message = message
    }, [])

    return <>
        {props.enableNewLayout
            ? <New pageTitle={props.pageTitle}
                   siteTitle={props.siteTitle}
                   setDarkMode={props.setDarkMode}>{props.children}</New>
            : <Blank pageTitle={props.pageTitle}>{props.children}</Blank>
        }
    </>
}

type ExportLayoutProps = {
    footer?: React.ReactNode
}

export default function (props: Record<string, any> & React.PropsWithChildren<ExportLayoutProps>) {

    const [darkMode, setDarkMode] = useState(false)
    const [enableNewLayout, setEnableNewLayout] = useState(false)

    const pageProps = usePage<any>().props

    const [layoutProps, setLayoutProps] = useState<LayoutProps>({
        title: pageProps.layoutProps?.title || '',
        metaTitle: pageProps.layoutProps?.metaTitle || '',
        topMenuActiveKey: pageProps.layoutProps?.topMenuActiveKey,
        menuActiveKey: pageProps.layoutProps?.menuActiveKey,
        loading: false,
        topMenu: pageProps.layoutProps?.topMenu,
        menuList: pageProps.layoutProps?.menuList,
        logo: pageProps.layoutProps?.logo,
        userMenu: pageProps.layoutProps?.userMenu,
        userName: pageProps.layoutProps?.userName,
        footer: props.footer,
        headerActions: props.headerActions,
    })

    const assignProps = (newProps: LayoutProps) => {
        setLayoutProps((prev)=>{
            return _.cloneDeep(Object.assign(prev, newProps))
        })
    }

    useEffect(() => {
        console.log('props=>', pageProps)

        if (pageProps.layoutProps?.enableNewLayout) {
            setEnableNewLayout(true)
        }

        const listener = (e: GlobalEvent<'navigate'>) => {
            const layoutProps = e.detail.page.props.layoutProps as LayoutProps

            assignProps({
                ...layoutProps,
                metaTitle: layoutProps?.metaTitle || '',
            })
        }

        document.addEventListener('inertia:navigate', listener)

        return () => {
            document.removeEventListener('inertia:navigate', listener)
        }
    }, []);

    useEffect(() => {
        const listener = (e: GlobalEvent<'invalid'>) => {
            if (!e.detail.response.headers['content-type'].includes('json')) {
                return
            }
            e.preventDefault()
            const {data} = e.detail.response

            const goto = () => {
                if (!data.url) {
                    return
                }
                window.location.href = data.url as string
            }

            if (data.info) {
                global.notification.warning({message: data.info})
                setTimeout(() => {
                    goto()
                })
            } else {
                goto()
            }

        }

        document.addEventListener('inertia:invalid', listener)
        return () => {
            document.removeEventListener('inertia:invalid', listener)
        }
    }, []);

    return <>
        <Head title={layoutProps.metaTitle + ' | ' + layoutProps.title + ' 后台管理'}></Head>

        <LayoutContext.Provider value={{
            assignProps,
            props: layoutProps,
        }}>
            <ProConfigProvider valueTypeMap={getProValueTypeMap()} dark={darkMode}>
                <AntdApp>
                    <ChildApp setDarkMode={setDarkMode}
                              siteTitle={pageProps.layoutProps?.siteTitle}
                              pageTitle={layoutProps.metaTitle}
                              enableNewLayout={enableNewLayout}>
                        {props.children}
                    </ChildApp>
                </AntdApp>
            </ProConfigProvider>
        </LayoutContext.Provider>
    </>
}