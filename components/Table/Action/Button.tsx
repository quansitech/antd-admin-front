import {Button, Popconfirm} from "antd";
import {useContext, useEffect, useState} from "react";
import {TableContext} from "../../TableContext";
import http from "../../../lib/http";
import {modal, routerNavigateTo} from "../../../lib/helpers";
import {TableActionProps} from "./types";

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
            const data = props.request.data || {}
            if (props.relateSelection) {
                data.selection = props.selectedRows?.map(item => item[rowKey])
                for (const key in data) {
                    if (typeof data[key] !== 'string') {
                        continue
                    }
                    const matches = data[key].match(/^__(\w+)__$/)
                    if (!matches) {
                        continue
                    }
                    data[key] = props.selectedRows?.map(item => item[matches[1]])
                }
            }
            try {
                await http({
                    url: props.request.url,
                    method: props.request.method,
                    headers: props.request.headers || {},
                    data: data,
                })
            } finally {
                setLoading(false)
            }
            return
        }

        if (props.modal) {
            await modal(props.modal)
            return
        }

        await tableContext.actionRef?.reload()
    }

    const [loading, setLoading] = useState(false)

    const [disabled, setDisabled] = useState(props.props.disabled)

    useEffect(() => {
        if (!props.relateSelection) {
            return
        }
        setDisabled(props.selectedRows?.length === 0)

    }, [props.selectedRows]);


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