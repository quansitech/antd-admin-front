import {usePage} from "@inertiajs/react";
import {useEffect, useState} from "react";
import {PageProps} from "@inertiajs/core/types/types";
import New from "./Layout/New";
import {PageContainer} from "@ant-design/pro-components"

export default function ({children}: {
    children: React.ReactNode
}) {
    const pageProps: PageProps & {
        layoutProps?: {
            metaTitle?: string,
            enableNewLayout?: boolean
        }
    } = usePage().props
    const [enableNewLayout, setEnableNewLayout] = useState(false)
    const [pageTitle, setPageTitle] = useState('')

    useEffect(() => {
        if (pageProps.layoutProps?.enableNewLayout) {
            setEnableNewLayout(true)
        }
    }, [])

    useEffect(() => {
        setPageTitle(pageProps.layoutProps?.metaTitle as string)
    }, [pageProps.layoutProps]);

    return <>
        {enableNewLayout
            ? <New children={children}></New>
            : <>
                <PageContainer title={pageTitle}>
                    {children}
                </PageContainer>
            </>
        }
    </>
}