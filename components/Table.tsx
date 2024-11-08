import React, {lazy, Suspense, useContext, useEffect, useRef, useState} from "react";
import {
    ActionType,
    FormInstance,
    ProColumnType,
    ProSkeleton,
    ProTable,
    ProTableProps
} from "@ant-design/pro-components";
import type {SortOrder} from "antd/lib/table/interface";
import {TablePaginationConfig} from "antd/es/table";
import {cloneDeep, isArray, uniqueId, upperFirst} from "lodash"
import {TableContext} from "./TableContext";
import ToolbarActions from "./Table/ToolbarActions";
import container from "../lib/container";
import {TableActionProps} from "./Table/Action/types";
import http from "../lib/http";
import {Spin} from "antd";
import "./Table.scss"
import {ModalContext} from "./ModalContext";
import {commonHandler} from "../lib/schemaHandler";

export type TableProps = ProTableProps<any, any> & {
    columns: ProColumnType[],
    dataSource: any[],
    pagination: TablePaginationConfig & {
        paramName?: string,
    },
    rowKey: string,
    defaultSearchValue?: Record<string, any>,
    actions: TableActionProps[],
    searchUrl: string,
    search?: boolean,
    extraRenderValues?: Record<string, any>[],
}

export default function (props: TableProps) {

    const request = async (params: Record<string, any> & {
        pageSize: number,
        current: number
    }, sort: Record<string, SortOrder>, filter: Record<string, (string | number)[] | null>) => {
        setLoading(true)
        const data: Record<string, any> = {
            ...params,
            ...filter,
            sort,
        }
        if (props.pagination) {
            data[props.pagination.paramName || 'page'] = data.current
            delete data.current
            delete data.pageSize
        }

        setEditableKeys([])
        setEditableValues([])

        try {
            const res = await http.get(props.searchUrl, {
                params: data,
                headers: {
                    'X-Table-Search': '1'
                }
            })

            if (res.data.pagination) {
                setPagination({
                    ...res.data.pagination,
                    current: params.current,
                })
            }
            return {
                data: res.data.dataSource || [],
                success: true,
            }
        } finally {
            setLoading(false)
        }
    }

    const formRef = useRef<FormInstance>()
    const actionRef = useRef<ActionType>()
    const [editableKeys, setEditableKeys] = useState<React.Key[]>(() => [])
    const [columns, setColumns] = useState<ProColumnType[]>([])
    const [selectedRows, setSelectedRows] = useState<any[]>([])
    const [editableValues, setEditableValues] = useState<Record<string, any>[]>([])
    const [loading, setLoading] = useState(false)
    const [initialized, setInitialized] = useState(false)
    const [pagination, setPagination] = useState<TablePaginationConfig>()
    const [dataSource, setDataSource] = useState<any[]>([])
    const [sticky, setSticky] = useState<TableProps['sticky']>(true)

    const modalContext = useContext(ModalContext)

    useEffect(() => {
        setPagination(props.pagination as TablePaginationConfig || false)
        setDataSource(postData(props.dataSource))

        // 重新定义列
        setColumns(cloneDeep(props.columns)?.map((c: ProColumnType) => {
            c.key = c.dataIndex as string

            // 列render
            const renderComponent = 'Column.Readonly.' + upperFirst(c.valueType as string)
            if (container.check(renderComponent)) {
                const Component = lazy(container.get(renderComponent))
                c.render = (dom, record, index, action) =>
                    <Suspense fallback={<Spin/>}>
                        <Component {...c}
                                   schema={c}
                                   key={c.title as string}
                                   index={index}
                                   record={record}
                        ></Component>
                    </Suspense>
            }

            // 列查询及编辑render
            const formItemComponent = 'Column.' + upperFirst(c.valueType as string)
            if (container.check(formItemComponent)) {
                const Component = lazy(container.get(formItemComponent))
                c.renderFormItem = (schema, config, form) => (
                    <Suspense fallback={<Spin/>}>
                        <Component config={config}
                                   form={form}
                                   index={schema.index}
                                   schema={schema}
                                   fieldProps={c.fieldProps}
                                   key={c.title as string}
                        ></Component>
                    </Suspense>
                )
            }

            if (props.defaultSearchValue?.[c.dataIndex as string] !== undefined) {
                c.initialValue = props.defaultSearchValue[c.dataIndex as string]
            }

            commonHandler(c)
            if (container.schemaHandler[c.valueType as string]) {
                return container.schemaHandler[c.valueType as string](c) as ProColumnType
            }

            return c
        }))

        setLoading(false)
        setInitialized(true)

        if (!modalContext.inModal) {
            setSticky({
                offsetHeader: document.querySelector('.ant-layout-header')?.clientHeight || 56,
            })
        }

    }, []);

    const postData = (data: any[]) => {
        if (!isArray(data)) {
            return data
        }

        props.columns.map(column => {
            switch (column.valueType) {
                case 'dateTime':
                    data = data.map(row => {
                        const v = row[column.dataIndex]
                        if (parseInt(v) == v && v < 4102444800) {
                            row[column.dataIndex] *= 1000
                        }
                        return row
                    })
                    break;
            }
        })

        return data.map(row => {
            if (typeof row[props.rowKey] === 'undefined') {
                row[props.rowKey] = uniqueId('row_')
            }
            return row
        })
    }


    return <>
        <TableContext.Provider value={{
            getTableProps: () => props,
            getEditedValues: () => editableValues,
            editableKeys: editableKeys,
            actionRef: actionRef.current,
            formRef: formRef.current,
            extraRenderValues: props.extraRenderValues,
        }}>
            {!initialized && <ProSkeleton type={"list"} list={2}></ProSkeleton>}
            <ProTable rowKey={props.rowKey}
                      style={{display: initialized ? 'block' : 'none'}}
                      tableClassName={'qs-antd-table'}
                      columns={columns}
                      onDataSourceChange={setDataSource}
                      dataSource={dataSource}
                      pagination={pagination}
                      loading={loading}
                      scroll={{x: true}}
                      postData={postData}
                      sticky={sticky}
                      form={{
                          onValuesChange(changedValues) {
                              const key = Object.keys(changedValues)[0]
                              const c = columns.find(c => c.dataIndex === key) as ProColumnType & {
                                  searchOnChange: boolean
                              }
                              if (!c) {
                                  return
                              }
                              // 是否立即搜索
                              if (c.searchOnChange) {
                                  formRef.current?.submit()
                              }
                          }
                      }}
                      rowSelection={props.rowSelection && {
                          alwaysShowAlert: false,
                          selectedRowKeys: selectedRows.map(item => item[props.rowKey]),
                          onSelect(record, selected) {
                              if (selected) {
                                  setSelectedRows([...selectedRows, record])
                              } else {
                                  setSelectedRows(selectedRows.filter(item => item[props.rowKey] !== record[props.rowKey]))
                              }
                          },
                          onChange(selectedRowKeys, newSelectedRows, info) {
                              switch (info.type) {
                                  case 'all':
                                      if (newSelectedRows.length) {
                                          setSelectedRows([
                                              ...selectedRows,
                                              ...newSelectedRows.filter(item => !selectedRows.find(s => s[props.rowKey] == item[props.rowKey]))
                                          ])
                                      } else {
                                          setSelectedRows(selectedRows.filter(item => !dataSource.find(dr => dr[props.rowKey] == item[props.rowKey])))
                                      }
                                      break;
                                  case 'none':
                                      setSelectedRows([])
                                      break;
                              }
                          },
                      }}
                      toolbar={{
                          filter: true,
                      }}
                      toolBarRender={(action) => [
                          <ToolbarActions key={'actions'} actions={props.actions}
                                          selectedRows={selectedRows}></ToolbarActions>
                      ]}
                      editable={{
                          type: 'multiple',
                          editableKeys: editableKeys,
                          onChange: setEditableKeys,
                          onValuesChange(record) {
                              setEditableValues([
                                  ...editableValues.filter(item => item[props.rowKey] !== record[props.rowKey]),
                                  record
                              ])
                          }
                      }}
                      cardBordered
                      manualRequest={true}
                      request={request}
                      formRef={formRef}
                      actionRef={actionRef}
                      search={props.search}
                      dateFormatter={props.dateFormatter}
            ></ProTable>

        </TableContext.Provider>
    </>
}

