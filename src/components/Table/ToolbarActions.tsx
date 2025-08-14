import React, {Suspense, useEffect, useState} from "react";
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
                Component: container.get('Table.Action.' + upperFirst(a.type)),
                props: {
                    ...a,
                },
            }
        }))

    }, [actions]);


    return <>
        <Space wrap={true}>
            {components.map(c => (
                <Suspense key={c.props.title}>
                    {
                        c.props.badge ?
                            <Badge count={c.props.badge} style={{zIndex: 2}}>
                                <c.Component {...c.props}></c.Component>
                            </Badge> :
                            <c.Component {...c.props}></c.Component>
                    }
                </Suspense>
            ))}
        </Space>
    </>
}