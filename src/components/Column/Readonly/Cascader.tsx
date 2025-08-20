import {ColumnReadonlyProps} from "./types";
import React, {ReactNode, useContext, useEffect, useState} from "react";
import http from "../../../lib/http";
import {FormContext} from "../../FormContext";
import {TableContext} from "../../TableContext";
import {ItemContext} from "../../../lib/FormList";

export default function (props: ColumnReadonlyProps & {
    schema: {
        fieldProps: {
            loadDataUrl: string
        }
    }
}) {
    const [text, setText] = useState<ReactNode>('-');

    const formContext = useContext(FormContext)
    const tableContext = useContext(TableContext)
    const itemContext = useContext(ItemContext || null)

    const findValue = (options: any[], value: any): any => {
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            if (option.value === value) {
                return [option.label]
            } else if (option.children) {
                return [option.label, ...findValue(option.children, value)]
            }
        }
    }


    useEffect(() => {
        setText(props.fieldProps.value)
        const value = props.fieldProps.value

        let extraData;
        if (props.fieldProps?.extraRenderValue){
            extraData = props.fieldProps.extraRenderValue
        }
        if (props.fieldProps?.extraRenderValues){
            let index = -1;
            if (tableContext && tableContext?.dataSource){
                const key = tableContext.getTableProps().rowKey
                index = tableContext.dataSource.findIndex(item => item[key] === props.record[key])
            }
            if (itemContext && itemContext?.index !== undefined){
                index = itemContext.index
            }
            extraData = props.fieldProps.extraRenderValues[index] ?? []
        }

        if (extraData) {
            setText(findValue(extraData.options, value).join(' / '))
            return
        }

        // 远程获取数据
        if (!props.fieldProps?.loadDataUrl) {
            return
        }
        http({
            url: props.fieldProps.loadDataUrl,
            method: 'get',
            params: {
                value,
            }
        }).then(res => {
            if (!value) {
                return
            }
            setText(findValue(res.data, value).join(' / '))

        })

    }, []);

    return <div>
        {text}
    </div>
}