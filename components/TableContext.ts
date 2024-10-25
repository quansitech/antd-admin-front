import React, {createContext} from "react";
import {ActionType} from "@ant-design/pro-components";
import {TableProps} from "./Table";
import {FormInstance} from "antd/lib/form";

type TableContextValue = {
    getTableProps: () => TableProps,
    getEditedValues: () => Record<string, any>[],
    editableKeys: React.Key[],
    actionRef?: ActionType,
    formRef?: FormInstance,
    extraRenderValues?: Record<string, any>[],
}

export const TableContext = createContext({} as TableContextValue)