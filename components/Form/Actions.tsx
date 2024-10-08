import {FormActionType} from "./Action/types";
import {lazy, useEffect, useState} from "react";
import {ReactComponentLike} from "prop-types";
import {Space} from "antd";
import container from "../../lib/container";
import _ from "lodash";

export default function (props: {
    actions?: FormActionType[]
}) {
    const [components, setComponents] = useState<{
        Component: ReactComponentLike,
        props: FormActionType,
    }[]>([])

    useEffect(() => {
        setComponents(props.actions?.map(a => {
            return {
                Component: lazy(container.get('Form.Action.' + _.upperFirst(a.type))),
                props: {
                    ...a,
                },
            }
        }) || [])
    }, []);

    return <>
        <Space>
            {components.map(item => (
                <item.Component key={item.props.title} {...item.props}></item.Component>
            ))}
        </Space>
    </>
}