import {TableContextValue} from "./components/TableContext";

type RequestOptions = {
    url: string,
    method: string,
    data?: Record<string, any>,
    confirm?: string | boolean,
    afterAction?: string[],
    headers?: Record<string, string>,
}

type Condition = {
    field: string,
    operator: string,
    value: any
}

type ModalOptions = {
    tableContext: TableContextValue,
    contexts?: Record<string, any>
    title?: string,
    content: {
        type: 'form' | 'table',
        props?: any,
        url?: string,
    },
}