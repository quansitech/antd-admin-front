import React, {Component, lazy, useEffect, useState} from "react";
import {ReactComponentLike} from "prop-types";
import container from "../../../lib/container";
import {Badge, Flex} from "antd";
import {ColumnReadonlyProps} from "./types";
import {asyncFilter, handleRules} from "../../../lib/helpers";
import {Rules} from "@rc-component/async-validator/lib/interface";
import {upperFirst} from "es-toolkit";
import {TableColumnActionProps} from "./Action/types";

type ComponentType = {
    component: ReactComponentLike,
    props: any,
}

export default ({actions, record}: ColumnReadonlyProps & {
    actions?: {
        type: string,
        title: string,
        showRules?: Rules,
        badge?: any,
    }[],
}) => {

    const [Components, setComponents] = useState<ComponentType[]>([]);

    useEffect(() => {
        if (actions) {
            asyncFilter(actions, async (Component) => {
                if (!Component.showRules) {
                    return true
                }
                return await handleRules(Component.showRules, record)
            }).then((Components: TableColumnActionProps[]) => setComponents(Components.map(a => {
                let badge = a.badge
                const matches = (badge + '').match(/^__(\w+)__$/)
                if (matches) {
                    badge = record[matches[1]]
                }

                const c = `Column.Readonly.Action.${upperFirst(a.type)}`
                return {
                    props: {
                        ...a,
                        record,
                        badge,
                    },
                    component: container.get(c),
                }
            })))
        }
    }, []);


    return <>
        {
            <Flex wrap={true}>
                {
                    Components.map(Component => (
                        Component.props.badge ?
                            <Badge key={Component.props.title}
                                   count={Component.props.badge}
                                   offset={[-12, 6]}
                                   size={'small'}
                                   styles={{
                                       indicator: {
                                           zIndex: 100,
                                           padding: '0 4px',
                                       }
                                   }}>
                                <Component.component
                                    key={Component.props.title} {...Component.props}></Component.component>
                            </Badge> :
                            <Component.component key={Component.props.title} {...Component.props}></Component.component>
                    ))
                }
            </Flex>
        }
    </>
}