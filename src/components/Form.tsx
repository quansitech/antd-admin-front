import {BetaSchemaForm, ProFormColumnsType, ProFormInstance, ProSkeleton} from "@ant-design/pro-components";
import type {FormSchema} from "@ant-design/pro-form/es/components/SchemaForm/typing";
import React, {lazy, Suspense, useContext, useEffect, useRef, useState} from "react";
import {cloneDeep, upperFirst} from "es-toolkit";
import container from "../lib/container";
import {FormActionType} from "./Form/Action/types";
import Actions from "./Form/Actions";
import {FormContext} from "./FormContext";
import {Col, Row, Spin} from "antd";
import http from "../lib/http";
import customRule from "../lib/customRule";
import {ModalContext} from "./ModalContext";
import {TableContext} from "./TableContext";
import {commonHandler} from "../lib/schemaHandler";
import {Rule} from "antd/es/form";

type SubmitRequestType = {
    url: string,
    method?: string,
    data?: any,
    afterSubmit?: () => void,
    headers?: Record<string, string>
    afterAction?: string[],
}


export default function (props: FormSchema & {
    actions?: FormActionType[]
    metaTitle?: string,
    columns?: ProFormColumnsType[],
    submitRequest?: SubmitRequestType,
    extraRenderValues?: Record<string, any>,
}) {

    const [columns, setColumns] = useState<ProFormColumnsType[]>([])
    const formRef = useRef<ProFormInstance>()
    const [initialized, setInitialized] = useState(false)
    const [loading, setLoading] = useState(false)
    const hiddenField = useRef<Record<string, any>>({})

    useEffect(() => {
        setColumns((cloneDeep(props.columns)?.map((c: ProFormColumnsType & {
            formItemProps?: {
                rules?: (Rule & {
                    customType?: string
                })[]
            }
        }) => {
            // rules
            if (!c.formItemProps) {
                c.formItemProps = {}
            }
            if (!c.formItemProps?.rules) {
                c.formItemProps.rules = []
            }
            c.formItemProps.rules = c.formItemProps.rules.map(rule => {
                // @ts-ignore
                if (rule.customType && customRule[rule.customType]) {
                    // @ts-ignore
                    rule.validator = customRule[rule.customType]
                }
                return rule
            })

            // hideInForm时增加
            if (c.hideInForm) {
                hiddenField.current[c.dataIndex as string] = props.initialValues?.[c.dataIndex as string]
                return null
            }

            // item render
            const formItemComponent = 'Column.' + upperFirst(c.valueType as string)
            if (container.check(formItemComponent)) {
                const Component = container.get(formItemComponent)
                c.renderFormItem = (schema, config, form) =>
                    <Component config={config}
                               form={form}
                               fieldProps={c.fieldProps}
                               key={c.title as string}
                               rules={c.formItemProps?.rules}
                               dataIndex={c.dataIndex}
                    ></Component>
            }
            // readonly render
            const readonlyComponent = 'Column.Readonly.' + upperFirst(c.valueType as string)
            if (container.check(readonlyComponent)) {
                const Component = container.get(readonlyComponent)
                c.render = (dom, entity, index, action, schema) =>
                    <Component key={c.title as string}
                               entity={entity}
                               index={index}
                               action={action}
                               schema={schema}
                               dom={dom}
                    ></Component>
            }

            commonHandler(c)
            if (container.schemaHandler[c.valueType as string]) {
                return container.schemaHandler[c.valueType as string](c)
            }

            return c
        }).filter(c => !!c) || []) as ProFormColumnsType[])

        setInitialized(true)
    }, []);

    const modalContext = useContext(ModalContext)
    const tableContext = useContext(TableContext)

    const handleAfterAction = async (req?: SubmitRequestType) => {
        if (req?.afterAction?.includes('tableReload')) {
            if (modalContext.contexts) {
                modalContext.setAfterClose(() => {
                    modalContext.contexts?.tableContext?.actionRef.reload()
                })
            }
            if (tableContext.actionRef) {
                await tableContext.actionRef.reload()
            }
        }
        if (req?.afterAction?.includes('closeModal') && modalContext.inModal) {
            modalContext.closeModal()
        }
    }

    const onFinish = async (values: any) => {
        if (props.submitRequest) {
            setLoading(true)
            try {
                await http({
                    method: props.submitRequest.method,
                    url: props.submitRequest.url,
                    data: Object.assign({}, hiddenField.current, props.submitRequest.data, values),
                    headers: props.submitRequest.headers,
                })

                handleAfterAction(props.submitRequest)
            } finally {
                setLoading(false)
            }
        }
    }

    return <>
        <Row justify={'center'}>
            <Col sm={24} md={22} lg={20}>
                <FormContext.Provider value={{
                    formRef: formRef,
                    extraRenderValues: props.extraRenderValues,
                }}>
                    {!initialized
                        ? <ProSkeleton type={"list"} list={2}></ProSkeleton>
                        : <BetaSchemaForm columns={columns}
                                          colProps={props.colProps}
                                          readonly={props.readonly}
                                          grid={true}
                                          loading={loading}
                                          formRef={formRef}
                                          initialValues={props.initialValues}
                                          onFinish={onFinish}
                                          submitter={{
                                              render: () => [
                                                  <Actions key={'actions'} loading={loading}
                                                           actions={props.actions}></Actions>
                                              ]
                                          }}
                        ></BetaSchemaForm>
                    }
                </FormContext.Provider>
            </Col>
        </Row>
    </>
}