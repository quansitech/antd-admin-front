import {Head} from "@inertiajs/react";
import React, {useEffect, useState} from "react";
import {GlobalEvent} from "@inertiajs/core/types/types";
import New from "./Layout/New";
import {PageContainer} from "@ant-design/pro-components"
import {App} from "antd";
import global from "../lib/global";

export default function ({children}: {
    children: React.ReactNode
}) {
    const {modal, notification, message} = App.useApp()
    const [enableNewLayout, setEnableNewLayout] = useState(false)
    const [pageTitle, setPageTitle] = useState('')
    const [siteTitle, setSiteTitle] = useState('')
    const [pageProps, setPageProps] = useState({} as any)

    useEffect(() => {

        global.modal = modal
        global.notification = notification
        global.message = message

        const listener = (e: GlobalEvent<'navigate'>)=>{
            setPageProps(e.detail.page.props)
            // @ts-ignore
            if (e.detail.page.props.layoutProps?.enableNewLayout) {
                setEnableNewLayout(true)
            }

            // @ts-ignore
            setPageTitle(e.detail.page.props.layoutProps?.metaTitle || '')
            // @ts-ignore
            e.detail.page.props.layoutProps?.title && setSiteTitle(e.detail.page.props.layoutProps?.title + '')
        }

        document.addEventListener('inertia:navigate', listener)

        return ()=>{
            document.removeEventListener('inertia:navigate', listener)
        }
    }, [])

    return <>
        {enableNewLayout
            ? <New pageProps={pageProps} pageTitle={pageTitle} siteTitle={siteTitle} children={children}></New>
            : <>
                <Head title={pageTitle + ' | ' + siteTitle + ' 后台管理'}></Head>
                <PageContainer title={pageTitle}>
                    {children}
                </PageContainer>
            </>
        }
    </>
}