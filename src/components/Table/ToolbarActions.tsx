import React, {lazy, useEffect, useState} from "react";
import container from "../../lib/container";
import {ReactComponentLike} from "prop-types";
import {Badge, Space} from "antd";
import {TableActionProps} from "./Action/types";
import {upperFirst} from "es-toolkit";

export default function ({
                             actions,
                             selectedRows,
                         }: {
    actions: TableActionProps[],
    selectedRows?: any[]
}) {
    const [components, setComponents] = useState<{
        Component: ReactComponentLike,
        props: TableActionProps,
    }[]>([])

    useEffect(() => {
        setComponents(actions.map(a => {
            return {
                Component: lazy(() => container.get('Table.Action.' + upperFirst(a.type))),
                props: {
                    ...a,
                },
            }
        }))

    }, []);


    return <>
        <Space wrap={true}>
            {components.map(c => (
                c.props.badge ?
                    <Badge key={c.props.title} count={c.props.badge} style={{zIndex: 100}}>
                        <c.Component {...c.props} selectedRows={selectedRows}></c.Component>
                    </Badge> :
                    <c.Component key={c.props.title} {...c.props} selectedRows={selectedRows}></c.Component>
            ))}
        </Space>
    </>
}