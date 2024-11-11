import React from 'react'
import {PageContainer} from "@ant-design/pro-components";

export default ({children, pageTitle}: {
    children: React.ReactNode,
    pageTitle: string,
}) => {
    return <>
        <PageContainer title={pageTitle}>
            {children}
        </PageContainer>
    </>
}