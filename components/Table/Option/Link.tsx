import React, {useContext, useState} from "react";
import {modal, replaceParams, replaceUrl, routerNavigateTo} from "../../../lib/helpers";
import {Popconfirm, Spin} from "antd";
import {TableContext} from "../../TableContext";
import http from "../../../lib/http";
import {TableColumnOptionProps} from "./types";
import {ModalOptions, RequestOptions} from "../../../types";

type Props = TableColumnOptionProps & {
    href?: string,
    request?: RequestOptions,
    modal?: ModalOptions,
}

export default function (props: Props) {

    const [loading, setLoading] = useState(false)
    const tableContext = useContext(TableContext)

    const onClick = async (e: any) => {
        setLoading(true)
        try {
            if (props.href) {
                routerNavigateTo(replaceUrl(props.href, props.record))
                return
            }
            if (props.request) {
                await http({
                    method: props.request.method,
                    url: replaceUrl(props.request.url, props.record),
                    data: props.request.data ? replaceParams(props.request.data, props.record) : null,
                })

                await tableContext.actionRef?.reload()
            }
            if (props.modal) {
                let url
                if (props.modal.content.url) {
                    url = replaceUrl(props.modal.content.url, props.record)
                }
                await modal({
                    ...props.modal,
                    contexts: {
                        tableContext,
                    },
                    content: {
                        ...props.modal.content,
                        url,
                    },
                })
            }
        } finally {
            setLoading(false)
        }
    }

    return <>
        <Spin spinning={loading}>
            {props.request?.confirm
                ? <Popconfirm title={props.request?.confirm} onConfirm={onClick}>
                    <a onClick={() => {
                    }}>{props.title}</a>
                </Popconfirm> : ''
            }
            <a onClick={onClick}>{props.title}</a>
        </Spin>
    </>
}