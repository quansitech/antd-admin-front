import {ColumnProps} from "./types";
import {Cascader} from "antd";
import React, {useEffect, useState} from "react";
import http from "../../lib/http";

export default function (props: ColumnProps) {
    const [options, setOptions] = useState<{ value: string, label: string }[]>();
    const [values, setValues] = useState<any>()

    useEffect(() => {
        const value = props.config.value
        setOptions(props.config.options as []);

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
                    const findValue = (options: any[], value: any): any => {
                        for (let i = 0; i < options.length; i++) {
                            const option = options[i];
                            if (option.value === value) {
                                return [option.value]
                            } else if (option.children) {
                                return [option.value, ...findValue(option.children, value)]
                            }
                        }
                    }

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
            props.form.setFieldValue(props.dataIndex, undefined)
            return
        }
        const value = values[values.length - 1]
        props.form.setFieldValue(props.dataIndex, value)
    }

    return <div className={props.className}>
        <Cascader options={options}
                  onChange={onChange}
                  placeholder={'请选择'}
                  value={values}
                  loadData={props.fieldProps.loadDataUrl ? loadData : undefined}
        ></Cascader>
    </div>
}