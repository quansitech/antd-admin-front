import React, {createContext} from "react";
import {ActionType} from "@ant-design/pro-components";
import {TableProps} from "./Table";
import {FormInstance} from "antd/lib/form";

export type TableContextValue = {
    getTableProps: () => TableProps,
    getEditedValues: () => Record<string, any>[],
    editableKeys: React.Key[],
    getActionRef: () => ActionType & {
        startEditable: (key: React.Key, row?: any) => boolean,
        cancelEditable: (key: React.Key) => void,
    },
    getFormRef: () => FormInstance,
    extraRenderValues?: Record<string, any>[],
    getSelectedRows: () => any[],
    dataSource: any[],
    getDataSource: () => any[],
}

export const TableContext = createContext({} as TableContextValue)