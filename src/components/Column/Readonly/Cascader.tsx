import {ColumnReadonlyProps} from "./types";
import React, {ReactNode, useEffect, useState} from "react";
import http from "../../../lib/http";

export default function (props: ColumnReadonlyProps & {
    schema: {
        fieldProps: {
            loadDataUrl: string
        }
    }
}) {
    const [text, setText] = useState<ReactNode>('-');

    useEffect(() => {
        setText(props.fieldProps.value)
        const value = props.fieldProps.value

        // 远程获取数据
        if (props.fieldProps?.loadDataUrl) {
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

                setText(findValue(res.data, value).join(' / '))

            })
        }

    }, []);

    return <div>
        {text}
    </div>
}