import {ProFormInstance} from "@ant-design/pro-components";
import {createContext} from "react";

export type DisabledSubmitType = boolean | {
    reason: string
}
export type SubmitRequestType = {
    url: string,
    method?: string,
    data?: any,
    afterSubmit?: () => void,
}

type FormContextType = {
    formRef?: ProFormInstance,

    setSubmitRequest?: (request: SubmitRequestType) => void
}

export const FormContext = createContext<FormContextType>({})