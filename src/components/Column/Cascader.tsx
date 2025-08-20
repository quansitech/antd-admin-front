import {ColumnProps} from "./types";
import {Cascader} from "antd";
import type {DefaultOptionType} from "antd/es/cascader"
import React, {useContext, useEffect, useState} from "react";
import http from "../../lib/http";
import {FormContext} from "../FormContext";
import {TableContext} from "../TableContext";
import {ItemContext} from "../../lib/FormList";

export default function (props: ColumnProps) {
    const [options, setOptions] = useState<{ value: string, label: string }[]>();
    const [values, setValues] = useState<any>()

    const formContext = useContext(FormContext)
    const tableContext = useContext(TableContext)
    const itemContext = useContext(ItemContext)

    const findValue = (options: any[], value: any): any => {
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            if (option.value === value) {
                return [option.value]
            }

            if (option.children?.length) {
                if (findValue(option.children, value).length) {
                    return [option.value, ...findValue(option.children, value)]
                }
            }
        }
        return []
    }

    useEffect(() => {
        let value = props.fieldProps.value
        setOptions(props.fieldProps.options || [] as []);

        if (value && props.fieldProps.options) {
            if (props.fieldProps.multiple) {
                const v = []
                if (!Array.isArray(value)) {
                    value = [value]
                }
                value.forEach(va => {
                    v.push(findValue(props.fieldProps.options, va))
                })
                setValues(v)
            } else {
                setValues(findValue(props.fieldProps.options, value))
            }
        }

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
            setOptions(extraData.options)
            if (value) {
                setValues(findValue(extraData.options, value))
            }
            return
        }

        // 远程获取数据
        if (props.fieldProps.loadDataUrl) {
            http({
                url: props.fieldProps.loadDataUrl,
                method: 'get',
                params: {
                    value,
                }
            }).then(res => {
                setOptions(res.data)

                if (value) {
                    setValues(findValue(res.data, value))
                }

            })
        }

    }, []);

    const loadData = async (selectedOptions: any) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        if (targetOption.children) {
            return
        }
        targetOption.loading = true;
        const res = await http(props.fieldProps.loadDataUrl, {
            params: {
                selected: targetOption.value
            }
        })
        targetOption.loading = false;
        targetOption.children = res.data;
        setOptions([...options as []]);
    }

    const onChange = (values: any[]) => {
        setValues(values)
        if (!values?.length) {
            props.fieldProps?.onChange(props.fieldProps['data-field'], undefined)
            return
        }

        if (props.fieldProps.multiple) {
            props.fieldProps?.onChange(values.map(v => v[v.length - 1]))
            return
        }

        const value = values[values.length - 1]
        props.fieldProps?.onChange(value)
    }

    const fieldProps = {...props.fieldProps}
    delete fieldProps.loadDataUrl

    return <div className={props.className}>
        <Cascader {...fieldProps}
                  options={options as DefaultOptionType[]}
                  onChange={onChange}
                  placeholder={'请选择'}
                  value={values}
                  loadData={props.fieldProps.loadDataUrl ? loadData : undefined}
        ></Cascader>
    </div>
}