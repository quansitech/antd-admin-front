import React, { useEffect, useState } from 'react'
import {Input, Select, Space} from 'antd'
import { ColumnProps } from './types';

export default function (props: ColumnProps & {
    valueEnum?: Map<string|number, string>,
    fieldProps?: {
        placeholder?: string,
    },
    text: [string, string|number],
}) {
    const options = [];
    
    (props.valueEnum || []).forEach((value, key) => {
        options.push({
            label: value,
            value: key,
        })
    })
    
    const [value, setValue] = useState(['', ''])
    useEffect(()=>{
        setValue([props.text[0] || options[0].value, props.text[1]])
    }, [props.text])

    const onChange = (value: any) => {
        setValue(value)
        props.fieldProps?.onChange(value)
    }

    return <>
        <Space.Compact>
            <Select onChange={v=>onChange([v, value[1]])} value={value[0]} options={options} />
            <Input placeholder={props.fieldProps?.placeholder} onChange={e=>onChange([value[0], e.target.value])} value={value[1]} />
        </Space.Compact>
    </>
}