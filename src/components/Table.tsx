import React, {useContext, useEffect, useMemo, useRef, useState} from "react";
import {ActionType, FormInstance, ProColumns, ProColumnType, ProTable, ProTableProps} from "@ant-design/pro-components";
import type {SortOrder} from "antd/lib/table/interface";
import {TablePaginationConfig} from "antd/es/table";
import {cloneDeep, isArray, uniqueId} from "es-toolkit/compat"
import {TableContext, TableContextValue} from "./TableContext";
import ToolbarActions from "./Table/ToolbarActions";
import container from "../lib/container";
import {TableActionProps} from "./Table/Action/types";
import http from "../lib/http";
import "./Table.scss"
import {ModalContext} from "./ModalContext";
import {commonHandler} from "../lib/schemaHandler";
import {diffTree, getValueByPath, routerNavigateTo} from "../lib/helpers";
import qs from 'qs';
import {TabsContext} from "./TabsContext";

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
    rowSelection: boolean,
    dateFormatter: string,
}

export default function (props: TableProps) {

    const request = async (params: Record<string, any> & {
        pageSize: number,
        current: number
    }, sort: Record<string, SortOrder>, filter: Record<string, (string | number)[] | null>) => {
        const data: Record<string, any> = {
            ...params,
            ...filter,
            sort,
        }
        if (props.pagination) {
            data[props.pagination.paramName || 'page'] = params.current
            delete data.current
            delete data.pageSize
        }

        setEditableKeys([])
        setEditableValues([])
        setSelectedRows([])

        if (!modalContext.inModal) {
            // 如果不在 modal 中，则使用 routerNavigateTo

            routerNavigateTo(searchUrl, {
                method: 'get',
                data,
                preserveScroll: true,
                preserveState: true,
                onSuccess(e) {
                    let props = e.props as any | TableProps
                    if (tabsContext.inTabs) {
                        props = getValueByPath(props, tabsContext.propsPath)
                    }

                    setToolActions(props.actions)
                    setColumns(props.columns)
                    setLastQuery(data)
                    setDataSource(postData(props.dataSource))
                    setExtraRenderValues(props.extraRenderValues)
                    setPagination(props.pagination)
                },
                onFinish: () => {
                    setLoading(false)
                }
            })

            return
        }

        try {
            const res = await http.get(searchUrl, {
                params: data,
                headers: {
                    'X-Table-Search': '1'
                }
            } as any)

            const props = res.data as TableProps
            setToolActions(props.actions)
            setColumns(props.columns)
            setLastQuery(data)
            setDataSource(postData(props.dataSource))
            setExtraRenderValues(props.extraRenderValues)
            setPagination(props.pagination)
            return {
                data: res.data.dataSource || [],
                success: true,
            }
        } finally {
            setLoading(false)
        }
    }

    const postData = (data: any[]) => {
        if (!isArray(data)) {
            return data
        }

        realColumns?.map((column: ProColumnType & {
            valueType?: string,
            dataIndex: string,
        }) => {
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

    const [searchUrl, setSearchUrl] = useState(props.searchUrl)
    const formRef = useRef<FormInstance>()
    const actionRef = useRef<ActionType>()
    const [lastQuery, setLastQuery] = useState<Record<string, any>>({})
    const [editableKeys, setEditableKeys] = useState<React.Key[]>(() => [])
    const [selectedRows, setSelectedRows] = useState<any[]>([])
    const [editableValues, setEditableValues] = useState<Record<string, any>[]>([])
    const [loading, setLoading] = useState(false)
    // @ts-ignore
    const [pagination, setPagination] = useState<TablePaginationConfig>(props.pagination as TablePaginationConfig)
    const [dataSource, setDataSource] = useState<any[]>(postData(props.dataSource))
    const [sticky, setSticky] = useState<TableProps['sticky']>(true)
    const [extraRenderValues, setExtraRenderValues] = useState(props.extraRenderValues)
    const [toolActions, setToolActions] = useState<TableActionProps[]>(props.actions)
    const [columns, setColumns] = useState(props.columns)

    const realColumns = useMemo(() => {
        return cloneDeep(columns)?.map((c: ProColumnType & {
            key: string,
            dataIndex: string,
            valueType?: string,
            formItemProps?: {},
            initialValue: any,
        }) => {
            c.key = c.dataIndex as string

            commonHandler(c)
            if (container.schemaHandler[c.valueType as string]) {
                c = container.schemaHandler[c.valueType as string](c) as any
            }

            return c
        })
    }, [columns])

    const modalContext = useContext(ModalContext)
    const tabsContext = useContext(TabsContext)


    useEffect(() => {

        setLoading(false)

        if (!modalContext.inModal) {
            setSticky({
                offsetHeader: document.querySelector('.ant-layout-header')?.clientHeight || 56,
            })
        }

        // 搜索
        if (!searchUrl) {
            let s = window.location.href
            s = s.replace(/page=\d+&?/, '')
            realColumns.filter(c => c.search !== false).map(c => {
                s = s.replace(new RegExp(`${c.dataIndex}=[^&]*&?`), '')
            })
            setSearchUrl(s)
        }


        setLastQuery(props.defaultSearchValue || {})
        setDataSource(postData(props.dataSource || []))

        if (!modalContext.inModal) {
            const query = qs.parse(window.location.search.replace(/^\?/, ''))
            if (query && Object.keys(query).length) {
                Object.keys(query).forEach(key => {
                    if (typeof query[key] === 'string') {
                        /^\d+$/.test(query[key]) && (query[key] = parseInt(query[key]))
                    }
                })

                formRef.current?.setFieldsValue(query)
                setLastQuery(query)
            }
        }


    }, []);

    return <>
        <TableContext.Provider value={{
            getTableProps: () => props,
            getEditedValues: () => editableValues,
            editableKeys: editableKeys,
            getActionRef: () => actionRef.current,
            getFormRef: () => formRef.current,
            extraRenderValues: extraRenderValues,
            dataSource: dataSource,
            getSelectedRows: () => selectedRows,
        } as TableContextValue}>
            <ProTable rowKey={props.rowKey}
                      tableClassName={'qs-antd-table'}
                      columns={realColumns as ProColumns[]}
                      onDataSourceChange={setDataSource}
                      dataSource={dataSource}
                      pagination={pagination}
                      loading={loading}
                      scroll={{x: true}}
                      postData={postData}
                      sticky={sticky}
                      expandable={props.expandable}
                      options={{
                        setting: false,
                        density: false,
                        reload: true,
                      }}
                      form={{
                          initialValues: props.defaultSearchValue,
                          onValuesChange(changedValues: Record<string, any>, allValues) {
                              let submit = realColumns.filter((c: any) => {
                                  if (!c.searchOnChange) {
                                      return false
                                  }
                                  return lastQuery[c.dataIndex] !== allValues[c.dataIndex]
                              }).length

                              if (!submit) {
                                  return
                              }
                              // 是否立即搜索
                              formRef.current?.submit()
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
                          <ToolbarActions key={'actions'} actions={toolActions}></ToolbarActions>
                      ]}
                      editable={{
                          type: 'multiple',
                          editableKeys: editableKeys,
                          onChange: setEditableKeys,
                          onValuesChange(record, newDataSource) {
                              setEditableValues(diffTree(dataSource, newDataSource, props.expandable?.childrenColumnName || 'children'))
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

