import React, {Component, useMemo} from "react";
import {ReactComponentLike} from "prop-types";
import container from "../../../lib/container";
import {Badge, Flex} from "antd";
import {ColumnReadonlyProps} from "./types";
import {handleCondition} from "../../../lib/helpers";
import {upperFirst} from "es-toolkit";

type ComponentType = {
    component: ReactComponentLike,
    props: any,
}

export default (props: ColumnReadonlyProps & {
    actions?: {
        type: string,
        title: string,
        showCondition?: Condition,
        badge?: any,
    }[],
}) => {
    const actions = props.fieldProps.actions
    const record = props.record

    const Components = useMemo(() => {
        if (!actions?.length) {
            return []
        }
        return actions.filter(Component => {
            if (!Component.showCondition) {
                return true
            }

            return handleCondition(Component.showCondition, record)
        }).map(a => {
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
        })
    }, [actions, record])

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