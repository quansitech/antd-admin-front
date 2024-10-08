import _ from "lodash";
import {Component, lazy, useEffect, useState} from "react";
import {ReactComponentLike} from "prop-types";
import container from "../../../lib/container";
import {Space} from "antd";
import {ColumnReadonlyProps} from "./types";
import {asyncFilter, handleRules} from "../../../lib/helpers";
import {Rules} from "@rc-component/async-validator/lib/interface";

type ComponentType = {
    component: ReactComponentLike,
    props: any,
}

export default ({options, record}: ColumnReadonlyProps & {
    options?: {
        type: string,
        title: string,
        showRules?: Rules,
    }[],
}) => {

    const [Components, setComponents] = useState<ComponentType[]>([]);

    useEffect(() => {
        if (options) {
            asyncFilter(options, async (Component) => {
                if (!Component.showRules) {
                    return true
                }
                return await handleRules(Component.showRules, record)
            }).then((Components: { type: string }[]) => setComponents(Components.map(a => {
                const c = `Table.Option.${_.upperFirst(a.type)}`
                return {
                    props: {
                        ...a,
                        record,
                    },
                    component: lazy(container.get(c)),
                }
            })))
        }
    }, []);


    return <>
        {
            <Space>
                {
                    Components.map(Component => {
                        return <Component.component
                            key={Component.props.title} {...Component.props}></Component.component>
                    })
                }
            </Space>
        }
    </>
}