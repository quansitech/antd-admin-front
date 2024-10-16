import {BetaSchemaForm, ProFormColumnsType, ProFormInstance, ProSkeleton} from "@ant-design/pro-components";
import type {FormSchema} from "@ant-design/pro-form/es/components/SchemaForm/typing";
import React, {lazy, Suspense, useContext, useEffect, useRef, useState} from "react";
import upperFirst from "lodash/upperFirst";
import container from "../lib/container";
import {FormActionType} from "./Form/Action/types";
import Actions from "./Form/Actions";
import {FormContext} from "./FormContext";
import {Col, Row, Spin} from "antd";
import http from "../lib/http";
import {RuleObject} from "rc-field-form/lib/interface";
import customRule from "../lib/customRule";
import cloneDeep from "lodash/cloneDeep";
import {ModalContext} from "./ModalContext";
import {TableContext} from "./TableContext";
import {commonHandler} from "../lib/schemaHandler";

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
    submitRequest?: SubmitRequestType
}) {

    const [columns, setColumns] = useState<ProFormColumnsType[]>([])
    const formRef = useRef<ProFormInstance>()
    const [initialized, setInitialized] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setColumns((cloneDeep(props.columns)?.map((c: ProFormColumnsType & {
            formItemProps?: {
                rules?: (RuleObject & {
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
                if (rule.customType) {
                    if (customRule[rule.customType]) {
                        rule.validator = customRule[rule.customType]
                    }
                }
                return rule
            })

            // item render
            const formItemComponent = 'Column.' + upperFirst(c.valueType as string)
            if (container.check(formItemComponent)) {
                const Component = lazy(container.get(formItemComponent))
                c.renderFormItem = (schema, config, form) =>
                    <Suspense fallback={<Spin/>}>
                        <Component config={config}
                                   form={form}
                                   fieldProps={c.fieldProps}
                                   key={c.title as string}
                                   rules={c.formItemProps?.rules}
                                   dataIndex={c.dataIndex}
                        ></Component>
                    </Suspense>
            }
            // readonly render
            const readonlyComponent = 'Column.Readonly.' + upperFirst(c.valueType as string)
            if (container.check(readonlyComponent)) {
                const Component = lazy(container.get(readonlyComponent))
                c.render = (dom, entity, index, action, schema) =>
                    <Suspense fallback={<Spin/>}>
                        <Component key={c.title as string}
                                   entity={entity}
                                   index={index}
                                   action={action}
                                   schema={schema}
                                   dom={dom}
                        ></Component>
                    </Suspense>
            }

            commonHandler(c)
            if (container.schemaHandler[c.valueType as string]) {
                return container.schemaHandler[c.valueType as string](c)
            }

            return c
        }) || []) as ProFormColumnsType[])

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
                    data: Object.assign({}, props.submitRequest.data, values),
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