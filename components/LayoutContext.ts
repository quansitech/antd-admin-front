import {createContext} from "react";
import {MenuDataItem} from "@ant-design/pro-components";

declare type LayoutContextValue = {
    assignProps: (props: LayoutProps) => void,
    props: LayoutProps,
}

export declare type LayoutProps = {
    title?: string,
    metaTitle?: string,
    topMenuActiveKey?: string,
    menuActiveKey?: string,
    loading?: boolean,
    topMenu?: { name: string, key: string }[],
    menuList?: MenuDataItem[],
    logo?: string,
    userMenu?: {
        title: string,
        url: string,
        type: string,

    }[]
}

export const LayoutContext = createContext<LayoutContextValue>({} as LayoutContextValue)