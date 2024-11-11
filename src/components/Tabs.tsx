import {Tabs} from "antd";
import React, {useEffect, useMemo, useState} from "react";
import type {Tab} from 'rc-tabs/lib/interface';
import container from "../lib/container";
import {routerNavigateTo} from "../lib/helpers";
import {upperFirst} from "es-toolkit";

type TabProps = {
    title: string,
    url?: string,
    pane?: {
        component: 'form' | 'table',
        props: any,
    }
}

export type TabsPageType = {
    tabs: Record<string, TabProps>,
    defaultActiveKey?: string,
}

export default function (props: TabsPageType) {
    const [activeKey, setActiveKey] = useState<string>();

    const items = useMemo(() => {
        return Object.keys(props.tabs).map(key => {
            const t = props.tabs[key]

            if (!t.pane) {
                return {
                    key,
                    label: t.title,
                    children: <></>
                }
            }

            const Component = container.get('Tab.Pane.' + upperFirst(t.pane?.component))

            return {
                key,
                label: t.title,
                children: <>
                    <Component {...t.pane.props}></Component>
                </>
            }
        }) as Tab[]
    }, [props.tabs])

    useEffect(() => {
        setActiveKey(props.defaultActiveKey || Object.keys(props.tabs)[0])
    }, [])
    const onChange = (key: string) => {
        setActiveKey(key)

        const tab = props.tabs[key]
        if (tab.url) {
            routerNavigateTo(tab.url, {
                preserveState: true
            })
        }
    }

    return <>
        <Tabs items={items}
              onChange={onChange}
              activeKey={activeKey}
        ></Tabs>
    </>
}