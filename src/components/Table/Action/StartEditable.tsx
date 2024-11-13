import {Button, ButtonProps, Space} from "antd";
import {TableContext} from "../../TableContext";
import React, {useContext, useState} from "react";
import http from "../../../lib/http";
import {TableActionProps} from "./types";

export default function (props: TableActionProps & {
    props: ButtonProps,
    saveRequest: {
        url: string,
        method: string,
        data?: Record<string, any>,
    },
}) {
    const tableContext = useContext(TableContext)

    const onStartClick = () => {
        const rowKey = tableContext.getTableProps().rowKey
        tableContext.getTableProps().dataSource.map(item => {
            tableContext.actionRef?.startEditable(item[rowKey], item)
        })
    }

    const onCancelClick = () => {
        const rowKey = tableContext.getTableProps().rowKey
        tableContext.getTableProps().dataSource.map(item => {
            tableContext.actionRef?.cancelEditable(item[rowKey])
        })
    }

    const [loading, setLoading] = useState(false)

    const onSaveClick = async () => {
        setLoading(true)
        let data: Record<string, any[]> | Record<string, any>[] = tableContext.getEditedValues()
        if (props.saveRequest.data) {
            data = {}
            for (const dataKey in props.saveRequest.data) {
                data[dataKey] = []
                const match = props.saveRequest.data[dataKey].match(/^__(\w+)__$/)
                if (!match) {
                    continue
                }
                tableContext.getEditedValues().forEach(item => {
                    data[dataKey].push(item[match[1]])
                })
            }
        }

        try {
            await http({
                method: props.saveRequest.method,
                url: props.saveRequest.url,
                data: data,
            })

            await tableContext.actionRef?.reload()
        } finally {
            setLoading(false)
        }
        onCancelClick()
    }

    return <>
        {tableContext.editableKeys.length > 0
            ?
            <Space>
                <Button loading={loading} type={'primary'} onClick={onSaveClick}>保存</Button>
                <Button danger={true} onClick={onCancelClick}>取消</Button>
            </Space>
            : <Button {...props.props} onClick={onStartClick}>{props.title}</Button>
        }
    </>
}