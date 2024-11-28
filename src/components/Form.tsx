import {BetaSchemaForm, ProFormColumnsType, ProFormInstance} from "@ant-design/pro-components";
import type {FormSchema} from "@ant-design/pro-form/es/components/SchemaForm/typing";
import React, {useContext, useMemo, useRef, useState} from "react";
import {cloneDeep} from "es-toolkit";
import container from "../lib/container";
import {FormActionType} from "./Form/Action/types";
import Actions from "./Form/Actions";
import {FormContext} from "./FormContext";
import {Col, Row} from "antd";
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
    readonly?: boolean,
    initialValues?: any,
    colProps?: any,
}) {
    const formRef = useRef<ProFormInstance>()
    const [loading, setLoading] = useState(false)
    const hiddenField = useRef<Record<string, any>>({})

    const columns = useMemo(() => {
        return (cloneDeep<ProFormColumnsType[]>(props.columns)?.map((c: ProFormColumnsType & {
            hideInForm: boolean,
            dataIndex: string,
            valueType?: string,
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

            commonHandler(c)
            if (container.schemaHandler[c.valueType as string]) {
                return container.schemaHandler[c.valueType as string](c)
            }

            return c
        }).filter(c => !!c) || []) as ProFormColumnsType[]
    }, [props.columns])

    const modalContext = useContext(ModalContext)
    const tableContext = useContext(TableContext)

    const handleAfterAction = async (req?: SubmitRequestType) => {
        if (req?.afterAction?.includes('tableReload')) {
            if (modalContext.contexts) {
                modalContext.setAfterClose(() => {
                    modalContext.contexts?.tableContext?.getActionRef().reload()
                })
            }
            if (tableContext.getActionRef) {
                // @ts-ignore
                await tableContext.getActionRef().reload()
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
                    getFormRef: () => formRef.current,
                    extraRenderValues: props.extraRenderValues,
                }}>
                    <BetaSchemaForm columns={columns}
                                    colProps={props.colProps}
                                    readonly={props.readonly}
                                    grid={true}
                                    loading={loading}
                                    formRef={formRef}
                                    initialValues={props.initialValues}
                                    scrollToFirstError={{
                                        block: 'center',
                                        behavior: 'smooth'
                                    }}
                                    onFinish={onFinish}
                                    submitter={{
                                        render: () => [
                                            <Actions key={'actions'} loading={loading}
                                                     actions={props.actions}></Actions>
                                        ]
                                    }}
                    ></BetaSchemaForm>
                </FormContext.Provider>
            </Col>
        </Row>
    </>
}