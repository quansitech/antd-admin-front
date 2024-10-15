import {lazy, useEffect, useState} from "react";
import container from "../../lib/container";
import {ReactComponentLike} from "prop-types";
import {Space} from "antd";
import {TableActionProps} from "./Action/types";
import upperFirst from "lodash/upperFirst";

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
                Component: lazy(container.get('Table.Action.' + upperFirst(a.type))),
                props: {
                    ...a,
                },
            }
        }))

    }, []);

    return <>
        <Space wrap={true}>
            {components.map(c => (
                <c.Component key={c.props.title} {...c.props} selectedRows={selectedRows}></c.Component>
            ))}
        </Space>
    </>
}