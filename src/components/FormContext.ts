import {ProFormInstance} from "@ant-design/pro-components";
import {createContext, MutableRefObject} from "react";

export type FormContextProps = {
    formRef?: MutableRefObject<ProFormInstance | undefined>,
    extraRenderValues?: Record<string, any>
}

export const FormContext = createContext<FormContextProps>({})