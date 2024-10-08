import {lazy, useEffect, useState} from "react";
import container from "../../lib/container";
import _ from "lodash";
import {ReactComponentLike} from "prop-types";
import {Space} from "antd";
import {TableActionProps} from "./Action/types";

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
                Component: lazy(container.get('Table.Action.' + _.upperFirst(a.type))),
                props: {
                    ...a,
                },
            }
        }))


    }, []);

    return <>
        <Space>
            {components.map(c => (
                <c.Component key={c.props.title} {...c.props} selectedRows={selectedRows}></c.Component>
            ))}
        </Space>
    </>
}