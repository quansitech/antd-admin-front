import React, {useEffect, useState} from "react";
import {GlobalEvent} from "@inertiajs/core/types/types";
import New from "./Layout/New";
import {App, App as AntdApp} from "antd";
import global from "../lib/global";
import Blank from "./Layout/Blank";
import {Head, usePage} from "@inertiajs/react";
import {ProConfigProvider} from "@ant-design/pro-components";
import {getProValueTypeMap} from "../lib/helpers";
import type {LayoutProps} from "./LayoutContext";
import {LayoutContext} from "./LayoutContext";

function ChildApp(props: any) {
    const {modal, notification, message} = App.useApp()

    useEffect(() => {

        global.modal = modal
        global.notification = notification
        global.message = message
    }, [])

    return <>
        {props.enableNewLayout
            ? <New {...props}></New>
            : <Blank {...props}></Blank>
        }
    </>
}

export default function (props: any) {

    const [darkMode, setDarkMode] = useState(false)
    const [enableNewLayout, setEnableNewLayout] = useState(false)

    const pageProps = usePage<any>().props

    const [layoutProps, setLayoutProps] = useState<LayoutProps>({
        title: pageProps.layoutProps?.title || '',
        metaTitle: '',
        topMenuActiveKey: pageProps.layoutProps?.topMenuActiveKey,
        menuActiveKey: pageProps.layoutProps?.menuActiveKey,
        loading: false,
        topMenu: pageProps.layoutProps?.topMenu,
        menuList: pageProps.layoutProps?.menuList,
        logo: pageProps.layoutProps?.logo,
        userMenu: pageProps.layoutProps?.userMenu,
    })

    const assignProps = (newProps: LayoutProps) => {
        setLayoutProps(Object.assign(layoutProps, newProps))
    }

    useEffect(() => {
        console.log('props=>', pageProps)

        if (pageProps.layoutProps?.enableNewLayout) {
            setEnableNewLayout(true)
        }

        const listener = (e: GlobalEvent<'navigate'>) => {
            const layoutProps = e.detail.page.props.layoutProps as LayoutProps

            assignProps({
                metaTitle: layoutProps?.metaTitle || '',
            })
            if (layoutProps?.title) {
                assignProps({
                    title: layoutProps?.title
                })
            }
            if (layoutProps?.menuActiveKey) {
                assignProps({
                    menuActiveKey: layoutProps?.menuActiveKey
                })
            }
        }

        document.addEventListener('inertia:navigate', listener)

        return () => {
            document.removeEventListener('inertia:navigate', listener)
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
                    <ChildApp {...props}
                              setDarkMode={setDarkMode}
                              pageTitle={layoutProps.metaTitle}
                              enableNewLayout={enableNewLayout}></ChildApp>
                </AntdApp>
            </ProConfigProvider>
        </LayoutContext.Provider>
    </>
}