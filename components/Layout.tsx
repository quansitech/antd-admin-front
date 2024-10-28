import {Head, usePage} from "@inertiajs/react";
import {useEffect, useState} from "react";
import {PageProps} from "@inertiajs/core/types/types";
import New from "./Layout/New";
import {PageContainer} from "@ant-design/pro-components"
import {App} from "antd";
import global from "../lib/global";

export default function ({children}: {
    children: React.ReactNode
}) {
    const pageProps: PageProps & {
        layoutProps?: {
            metaTitle?: string,
            enableNewLayout?: boolean
            title?: string,
        }
    } = usePage().props
    const {modal, notification, message} = App.useApp()
    const [enableNewLayout, setEnableNewLayout] = useState(false)
    const [pageTitle, setPageTitle] = useState('')
    const [siteTitle, setSiteTitle] = useState('')

    useEffect(() => {
        console.log(pageProps)

        if (pageProps.layoutProps?.enableNewLayout) {
            setEnableNewLayout(true)
        }

        global.modal = modal
        global.notification = notification
        global.message = message
    }, [])

    useEffect(() => {
        setPageTitle(pageProps.layoutProps?.metaTitle || '')
        pageProps.layoutProps?.title && setSiteTitle(pageProps.layoutProps?.title + ' 后台管理')
    }, [pageProps.layoutProps]);

    return <>
        {enableNewLayout
            ? <New children={children}></New>
            : <>
                <Head title={pageTitle + ' | ' + siteTitle}></Head>
                <PageContainer title={pageTitle}>
                    {children}
                </PageContainer>
            </>
        }
    </>
}