import {FormActionType} from "./Action/types";
import React, {Suspense, useMemo} from "react";
import {Badge, Space} from "antd";
import container from "../../lib/container";
import {upperFirst} from "es-toolkit";

export default function (props: {
    actions?: FormActionType[]
    loading?: boolean
}) {

    const components = useMemo(() => {
        return props.actions?.map(a => {
            return {
                Component: container.get('Form.Action.' + upperFirst(a.type)),
                props: {
                    ...a,
                },
            }
        }) || []
    }, [props.actions])

    return <>
        <Space>
            {components.map(item => (
                <Suspense key={item.props.title}>
                    {
                        item.props.badge ?
                            <Badge count={item.props.badge} style={{zIndex: 100}}>
                                <item.Component loading={props.loading} {...item.props}></item.Component>
                            </Badge> :
                            <item.Component
                                loading={props.loading} {...item.props}></item.Component>
                    }
                </Suspense>
            ))}
        </Space>
    </>
}