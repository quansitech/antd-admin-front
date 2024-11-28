import {ProFormInstance} from "@ant-design/pro-components";
import {createContext} from "react";

export type FormContextProps = {
    getFormRef: () => ProFormInstance,
    extraRenderValues?: Record<string, any>
}

export const FormContext = createContext({} as FormContextProps)