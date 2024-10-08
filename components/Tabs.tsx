import {Tabs} from "antd";
import {lazy, Suspense, useEffect, useState} from "react";
import type {Tab} from 'rc-tabs/lib/interface';
import _ from "lodash";
import container from "../lib/container";

type TabProps = {
    title: string,
    pane: {
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

    useEffect(() => {
        setItems(Object.keys(props.tabs).map(key => {
            const t = props.tabs[key]
            const Component = lazy(() => container.get('Tab.Pane.' + _.upperFirst(t.pane.component)))

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

    return <>
        <Tabs items={items} defaultActiveKey={props.defaultActiveKey}></Tabs>
    </>
}