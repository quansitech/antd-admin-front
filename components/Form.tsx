import {BetaSchemaForm, ProFormColumnsType, ProFormInstance, ProSkeleton} from "@ant-design/pro-components";
import type {FormSchema} from "@ant-design/pro-form/es/components/SchemaForm/typing";
import React, {lazy, Suspense, useEffect, useRef, useState} from "react";
import _, {upperFirst} from "lodash";
import container from "../lib/container";
import {FormActionType} from "./Form/Action/types";
import Actions from "./Form/Actions";
import {FormContext, SubmitRequestType} from "./FormContext";
import {Col, Row, Spin} from "antd";
import http from "../lib/http";
import {Rule} from "rc-field-form/lib/interface";

export default function (props: FormSchema & {
    actions?: FormActionType[]
    metaTitle?: string,
    columns?: ProFormColumnsType[],
}) {

    const [columns, setColumns] = useState<ProFormColumnsType[]>([])
    const formRef = useRef<ProFormInstance>()
    const [initialized, setInitialized] = useState(false)
    const [submitRequest, setSubmitRequest] = useState<SubmitRequestType>({
        url: '',
        method: 'POST',
        data: {},
        afterSubmit: () => {
        }
    })

    useEffect(() => {
        setColumns((_.cloneDeep(props.columns)?.map((c: ProFormColumnsType & {
            formItemProps?: {
                rules?: Rule[]
            }
        }) => {
            // rules
            if (!c.formItemProps) {
                c.formItemProps = {}
            }
            if (!c.formItemProps?.rules) {
                c.formItemProps.rules = []
            }

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

            if (container.schemaHandler[c.valueType as string]) {
                return container.schemaHandler[c.valueType as string](c)
            }

            return c
        }) || []) as ProFormColumnsType[])

        setInitialized(true)
    }, []);

    return <>
        <Row justify={'center'}>
            <Col sm={24} md={22} lg={20}>
                <FormContext.Provider value={{
                    formRef: formRef.current,
                    setSubmitRequest,
                }}>
                    {!initialized
                        ? <ProSkeleton type={"list"} list={2}></ProSkeleton>
                        : <BetaSchemaForm columns={columns}
                                          colProps={props.colProps}
                                          readonly={props.readonly}
                                          grid={true}
                                          formRef={formRef}
                                          initialValues={props.initialValues}
                                          onFinish={async (values) => {
                                              await http({
                                                  method: submitRequest.method,
                                                  url: submitRequest.url,
                                                  data: Object.assign({}, submitRequest.data, values),
                                              })
                                              submitRequest.afterSubmit && submitRequest.afterSubmit()
                                          }}
                                          submitter={{
                                              render: () => [
                                                  <Actions key={'actions'} actions={props.actions}></Actions>
                                              ]
                                          }}
                        ></BetaSchemaForm>
                    }
                </FormContext.Provider>
            </Col>
        </Row>
    </>
}