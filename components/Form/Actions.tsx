import {FormActionType} from "./Action/types";
import {lazy, useEffect, useState} from "react";
import {ReactComponentLike} from "prop-types";
import {Badge, Space} from "antd";
import container from "../../lib/container";
import {upperFirst} from "lodash";

export default function (props: {
    actions?: FormActionType[]
    loading?: boolean
}) {
    const [components, setComponents] = useState<{
        Component: ReactComponentLike,
        props: FormActionType,
    }[]>([])

    useEffect(() => {
        setComponents(props.actions?.map(a => {
            return {
                Component: lazy(container.get('Form.Action.' + upperFirst(a.type))),
                props: {
                    ...a,
                },
            }
        }) || [])
    }, []);

    return <>
        <Space>
            {components.map(item => (
                item.props.badge ?
                    <Badge key={item.props.title} count={item.props.badge} style={{zIndex: 100}}>
                        <item.Component loading={props.loading} {...item.props}></item.Component>
                    </Badge> :
                    <item.Component key={item.props.title} loading={props.loading} {...item.props}></item.Component>
            ))}
        </Space>
    </>
}