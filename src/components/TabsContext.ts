import {createContext} from "react";

export type TabsContextValue = {
    inTabs: boolean,
    propsPath: string[] | null,
}

export const TabsContext = createContext({} as TabsContextValue)