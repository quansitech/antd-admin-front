import {Tabs} from "antd";
import {lazy, Suspense, useEffect, useState} from "react";
import type {Tab} from 'rc-tabs/lib/interface';
import container from "../lib/container";
import {routerNavigateTo} from "../lib/helpers";
import {upperFirst} from "lodash";
import {ProSkeleton} from "@ant-design/pro-components";

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
    const [items, setItems] = useState<Tab[]>([]);
    const [activeKey, setActiveKey] = useState<string>();

    useEffect(() => {
        setActiveKey(props.defaultActiveKey || Object.keys(props.tabs)[0])

        setItems(Object.keys(props.tabs).map(key => {
            const t = props.tabs[key]

            if (!t.pane) {
                return {
                    key,
                    label: t.title,
                    children: <>
                        <ProSkeleton list={2}></ProSkeleton>
                    </>
                }
            }

            const Component = lazy(() => container.get('Tab.Pane.' + upperFirst(t.pane?.component)))

            return {
                key,
                label: t.title,
                children: <>
                    <Suspense>
                        <Component {...t.pane.props}></Component>
                    </Suspense>
                </>
            }
        }))
    }, []);

    const onChange = (key: string) => {
        setActiveKey(key)

        const tab = props.tabs[key]
        if (tab.url) {
            routerNavigateTo(tab.url)
        }
    }

    return <>
        <Tabs items={items}
              onChange={onChange}
              activeKey={activeKey}
        ></Tabs>
    </>
}