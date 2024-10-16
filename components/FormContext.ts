import {ProFormInstance} from "@ant-design/pro-components";
import {createContext, MutableRefObject} from "react";

type FormContextType = {
    formRef?: MutableRefObject<ProFormInstance | undefined>,
}

export const FormContext = createContext<FormContextType>({})