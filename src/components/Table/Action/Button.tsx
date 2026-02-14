import {Button, Popconfirm} from "antd";
import React, {useContext, useEffect, useState} from "react";
import {TableContext} from "../../TableContext";
import http from "../../../lib/http";
import {modalShow, replaceParams, replaceUrl, routerNavigateTo, treeToList} from "../../../lib/helpers";
import {TableActionProps} from "./types";
import {cloneDeep} from "es-toolkit";
import {ModalOptions, RequestOptions} from "../../../types";

export default function (props: TableActionProps & {
    props: Record<string, any>,
    link?: {
        url: string,
    },
    request?: RequestOptions,
    saveRequest?: RequestOptions,
    modal?: ModalOptions,
}) {
    const tableContext = useContext(TableContext)

    const handleRequestDataWithSelection = (requestData: Record<string, any>)=>{
        const rowKey = tableContext.getTableProps().rowKey

        const selectRows = tableContext.getSelectedRows()
        const data = {}
        selectRows.forEach(row=>{
            Object.keys(row).forEach(key=>{
                if (!data[key]){
                    data[key] = []
                }
                data[key].push(row[key])
            })
            data['selection'] = selectRows.map(row=>row[rowKey])
        })

        return replaceParams(requestData, data)

    }

    const handleSeletionRequestUrl = (url: string)=>{
        const selectRows = tableContext.getSelectedRows()
        const data = {}
        selectRows.forEach(row=>{
            Object.keys(row).forEach(key=>{
                if (!data[key]){
                    data[key] = []
                }
                data[key].push(row[key])
            })
        })
        
        Object.keys(data).forEach(key=>{
            data[key] = data[key].join(',')
        })

        return replaceUrl(url, data)
    }


    const onClick = async () => {
        if (props.link) {
            routerNavigateTo(props.link.url)
            return
        }

        if (props.request) {
            setLoading(true)
            let data = cloneDeep(props.request.data) || {}
            if (props.relateSelection) {
                data = handleRequestDataWithSelection(data)
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

        if (props.saveRequest) {
            setLoading(true)
            let data: Record<string, any[]> | Record<string, any>[] = tableContext.getEditedValues()
            if (!data.length){
                data = treeToList(tableContext.getDataSource(), tableContext.getTableProps().expandable?.childrenColumnName || 'children')
            }

            if (props.saveRequest.data) {
                let resetData: Record<string, any> = {}
                for (const dataKey in props.saveRequest.data) {
                    resetData[dataKey] = []
                    const match = props.saveRequest.data[dataKey].match(/^__(\w+)__$/)
                    if (!match) {
                        continue
                    }
                    data.forEach(item => {
                        resetData[dataKey].push(item[match[1]])
                    })
                }
                data = resetData
            }

            try {
                await http({
                    method: props.saveRequest.method,
                    url: props.saveRequest.url,
                    data: data,
                })

                await tableContext.getActionRef()?.reload()
            } finally {
                setLoading(false)
            }
        }

        if (props.modal) {
            const modal = cloneDeep(props.modal)
            setLoading(true)

            if (props.relateSelection && modal.content.url) {
                modal.content.url = handleSeletionRequestUrl(modal.content.url)
            }

            if (props.relateSelection && modal.content.request) {
                
                modal.content.request.url = handleSeletionRequestUrl(modal.content.request.url)
                
                if (modal.content.request.data){
                    modal.content.request.data = handleRequestDataWithSelection(modal.content.request.data)
                }
            }

            try {

                await modalShow({
                    ...modal,
                    contexts: {
                        tableContext,
                    },
                })
            } finally {
                setLoading(false)
            }
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