import {Button, Popconfirm} from "antd";
import React, {useContext, useEffect, useState} from "react";
import {TableContext} from "../../TableContext";
import http from "../../../lib/http";
import {modalShow, routerNavigateTo} from "../../../lib/helpers";
import {TableActionProps} from "./types";
import {cloneDeep} from "es-toolkit";

export default function (props: TableActionProps & {
    props: Record<string, any>,
    link?: {
        url: string,
    },
    request?: RequestOptions,
    modal?: ModalOptions,
}) {
    const tableContext = useContext(TableContext)

    const onClick = async () => {
        const rowKey = tableContext.getTableProps().rowKey
        if (props.link) {
            routerNavigateTo(props.link.url)
            return
        }

        if (props.request) {
            setLoading(true)
            const data = cloneDeep(props.request.data) || {}
            if (props.relateSelection) {
                const selectedRows = tableContext.getSelectedRows()

                data.selection = selectedRows?.map(item => item[rowKey])
                for (const key in data) {
                    if (typeof data[key] !== 'string') {
                        continue
                    }
                    const matches = data[key].match(/^__(\w+)__$/)
                    if (!matches) {
                        continue
                    }
                    data[key] = selectedRows?.map(item => item[matches[1]])
                }
            }
            try {
                await http({
                    url: props.request.url,
                    method: props.request.method,
                    headers: props.request.headers || {},
                    data: data,
                })

                await tableContext.getActionRef()?.reload()
                if (props.relateSelection) {
                    tableContext.getActionRef().clearSelected()
                }
            } finally {
                setLoading(false)
            }
            return
        }

        if (props.modal) {
            setLoading(true)
            await modalShow({
                ...props.modal,
                contexts: {
                    tableContext,
                },
            })
            setLoading(false)
            return
        }

    }

    const [loading, setLoading] = useState(false)

    const [disabled, setDisabled] = useState(props.props.disabled)

    useEffect(() => {
        if (!props.relateSelection) {
            return
        }
        setDisabled(tableContext.getSelectedRows()?.length === 0)

    }, [tableContext.getSelectedRows()]);


    const ButtonComponent = () => {
        if (props.request?.confirm) {
            return <Popconfirm title={props.request.confirm} onConfirm={onClick}>
                <Button loading={loading} {...props.props} disabled={disabled}>{props.title}</Button>
            </Popconfirm>
        } else {
            return <Button loading={loading} onClick={onClick} {...props.props}
                           disabled={disabled}>{props.title}</Button>
        }
    }

    return <>
        <ButtonComponent></ButtonComponent>
    </>
}