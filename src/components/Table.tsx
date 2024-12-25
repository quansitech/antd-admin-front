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
import {diffTree, getValueByPath} from "../lib/helpers";
import {router} from "@inertiajs/react";
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

    let {searchUrl} = props

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

        if (!modalContext.inModal) {
            const only = ['dataSource', 'pagination', 'extraRenderValues']
            if (tabsContext.inTabs) {
                only.push('tabs')
            }

            router.get(searchUrl, data, {
                preserveScroll: true,
                preserveState: true,
                only: only,
                onSuccess(e) {
                    let props = e.props as any | TableProps
                    if (tabsContext.inTabs) {
                        props = getValueByPath(props, tabsContext.propsPath)
                    }

                    setDataSource(postData(props.dataSource))
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

            if (res.data.pagination) {
                setPagination({
                    ...res.data.pagination,
                    current: params.current,
                })
            }
            if (res.data.extraRenderValues) {
                setExtraRenderValues(res.data.extraRenderValues)
            }
            return {
                data: res.data.dataSource || [],
                success: true,
            }
        } finally {
            setLoading(false)
        }
    }

    const columns = useMemo(() => {
        return cloneDeep(props.columns)?.map((c: ProColumnType & {
            key: string,
            dataIndex: string,
            valueType?: string,
            formItemProps?: {},
            initialValue: any,
        }) => {
            c.key = c.dataIndex as string

            commonHandler(c)
            if (container.schemaHandler[c.valueType as string]) {
                return container.schemaHandler[c.valueType as string](c) as ProColumnType
            }

            return c
        })
    }, [props.columns])


    const postData = (data: any[]) => {
        if (!isArray(data)) {
            return data
        }

        columns.map((column: ProColumnType & {
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


    const formRef = useRef<FormInstance>()
    const actionRef = useRef<ActionType>()
    const [editableKeys, setEditableKeys] = useState<React.Key[]>(() => [])
    const [selectedRows, setSelectedRows] = useState<any[]>([])
    const [editableValues, setEditableValues] = useState<Record<string, any>[]>([])
    const [loading, setLoading] = useState(false)
    // @ts-ignore
    const [pagination, setPagination] = useState<TablePaginationConfig>(props.pagination as TablePaginationConfig)
    const [dataSource, setDataSource] = useState<any[]>(postData(props.dataSource))
    const [sticky, setSticky] = useState<TableProps['sticky']>(true)
    const [extraRenderValues, setExtraRenderValues] = useState(props.extraRenderValues)

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
            searchUrl = window.location.href
        }

        if (props.defaultSearchValue !== undefined) {
            formRef.current?.setFieldsValue(props.defaultSearchValue)
        }

        if (!modalContext.inModal) {
            const query = qs.parse(window.location.search.replace(/^\?/, ''))
            if (query && Object.keys(query).length) {
                Object.keys(query).forEach(key => {
                    if (typeof query[key] === 'string') {
                        /^\d+$/.test(query[key]) && (query[key] = parseInt(query[key]))
                    }
                })

                formRef.current?.setFieldsValue(query)
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
        } as TableContextValue}>
            <ProTable rowKey={props.rowKey}
                      tableClassName={'qs-antd-table'}
                      columns={columns as ProColumns[]}
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
                                  // @ts-ignore
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

